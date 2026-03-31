import { ChildProcessWithoutNullStreams, spawnSync } from "node:child_process";
import fs from "node:fs";

import { ProjectStatus } from "@prisma/client";

import { env } from "../env.js";
import { getPrisma } from "../prisma.js";
import {
  createSession,
  getFreePort,
  getSessionMessages,
  parseSseLineBuffer,
  sendPrompt,
  spawnOpenCodeServe,
  waitForHealth,
} from "./opencode-client.js";
import { countFilesRecursive, getProjectZipPath, removePathIfExists } from "./workspace.js";
import { createOpenCodeConfig, createOpenSpecWorkspace, normalizeProjectWorkspace } from "./openSpec.js";
import { isActiveRuntimePhase } from "./project-runtime-policy.js";
import { zipDirectory } from "./zip.js";

export type RuntimePhase = "idle" | "preparing" | "starting" | "running" | "waiting_input" | "monitoring" | "packaging" | "stopping" | "completed" | "error";

export type ProcessEvent =
  | { type: "snapshot"; projectId: string; phase: RuntimePhase; status: ProjectStatus; lines: string[]; inputEnabled: boolean; sessionId: string | null; lastError: string | null; message: string | null }
  | { type: "line"; line: string; stream: "stdout" | "stderr" | "system" }
  | { type: "status"; status: ProjectStatus; phase: RuntimePhase; message?: string | null }
  | { type: "phase"; phase: RuntimePhase; message?: string | null }
  | { type: "input_enabled"; inputEnabled: boolean }
  | { type: "error"; message: string }
  | { type: "completion_ready"; message: string }
  | { type: "completion_confirmed"; zipPath: string; zipSizeBytes: number; fileCount: number };

type RuntimeListener = (event: ProcessEvent) => void;

type ProjectExecutionSnapshot = {
  projectId: string;
  phase: RuntimePhase;
  status: ProjectStatus;
  lines: string[];
  inputEnabled: boolean;
  sessionId: string | null;
  port: number | null;
  lastError: string | null;
  message: string | null;
  lastOutputAt: number | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
    reasoningTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    estimatedCostUsd: number | null;
  };
};

type ProjectRuntime = {
  projectId: string;
  port: number;
  child: ChildProcessWithoutNullStreams;
  baseUrl: string;
  sessionId: string | null;
  phase: RuntimePhase;
  status: ProjectStatus;
  lines: string[];
  lastOutputAt: number;
  listeners: Set<RuntimeListener>;
  inputEnabled: boolean;
  transcriptSyncTimer?: NodeJS.Timeout;
  timeoutTimer?: NodeJS.Timeout;
  stopRequested: boolean;
  lastError: string | null;
  usage: ProjectExecutionSnapshot["usage"];
  seenSessionMessageSignatures: Map<string, string>;
};

const runtimes = new Map<string, ProjectRuntime>();
const listenersByProject = new Map<string, Set<RuntimeListener>>();
const snapshotsByProject = new Map<string, ProjectExecutionSnapshot>();
const pendingGenerations = new Set<string>();
const reservedPorts = new Set<number>();
let portReservationQueue = Promise.resolve();

function phaseToStatus(phase: RuntimePhase): ProjectStatus {
  if (phase === "completed") return ProjectStatus.completed;
  if (phase === "error") return ProjectStatus.error;
  if (phase === "idle") return ProjectStatus.idle;
  return ProjectStatus.running;
}

function ensureListeners(projectId: string) {
  let listeners = listenersByProject.get(projectId);
  if (!listeners) {
    listeners = new Set<RuntimeListener>();
    listenersByProject.set(projectId, listeners);
  }
  return listeners;
}

function defaultSnapshot(projectId: string): ProjectExecutionSnapshot {
  return {
    projectId,
    phase: "idle",
    status: ProjectStatus.idle,
    lines: [],
    inputEnabled: false,
    sessionId: null,
    port: null,
    lastError: null,
    message: null,
    lastOutputAt: null,
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      estimatedCostUsd: null,
    },
  };
}

function estimateCostUsd(usage: ProjectExecutionSnapshot["usage"]) {
  const modelName = "gpt-5.4-mini";
  const rates: Record<string, { input: number; output: number; reasoning: number }> = {
    "gpt-5.4-mini": { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000, reasoning: 0.30 / 1_000_000 },
  };
  const rate = rates[modelName];
  if (!rate) return null;
  return Number((usage.inputTokens * rate.input + usage.outputTokens * rate.output + usage.reasoningTokens * rate.reasoning).toFixed(6));
}

function updateUsage(runtime: ProjectRuntime, nextUsage: Partial<ProjectExecutionSnapshot["usage"]>) {
  const current = runtime.usage ?? defaultSnapshot(runtime.projectId).usage;
  runtime.usage = {
    inputTokens: nextUsage.inputTokens ?? current.inputTokens,
    outputTokens: nextUsage.outputTokens ?? current.outputTokens,
    reasoningTokens: nextUsage.reasoningTokens ?? current.reasoningTokens,
    cacheReadTokens: nextUsage.cacheReadTokens ?? current.cacheReadTokens,
    cacheWriteTokens: nextUsage.cacheWriteTokens ?? current.cacheWriteTokens,
    estimatedCostUsd: nextUsage.estimatedCostUsd ?? estimateCostUsd({
      inputTokens: nextUsage.inputTokens ?? current.inputTokens,
      outputTokens: nextUsage.outputTokens ?? current.outputTokens,
      reasoningTokens: nextUsage.reasoningTokens ?? current.reasoningTokens,
      cacheReadTokens: nextUsage.cacheReadTokens ?? current.cacheReadTokens,
      cacheWriteTokens: nextUsage.cacheWriteTokens ?? current.cacheWriteTokens,
      estimatedCostUsd: current.estimatedCostUsd,
    }),
  };
}

function snapshotFromRuntime(runtime: ProjectRuntime): ProjectExecutionSnapshot {
  return {
    projectId: runtime.projectId,
    phase: runtime.phase,
    status: runtime.status,
    lines: runtime.lines.slice(-50000),
    inputEnabled: runtime.inputEnabled,
    sessionId: runtime.sessionId,
    port: runtime.port,
    lastError: runtime.lastError,
    message: runtime.lines[runtime.lines.length - 1] ?? null,
    lastOutputAt: runtime.lastOutputAt,
    usage: runtime.usage ?? defaultSnapshot(runtime.projectId).usage,
  };
}

function persistSnapshot(runtime: ProjectRuntime) {
  const snapshot = snapshotFromRuntime(runtime);
  snapshotsByProject.set(runtime.projectId, snapshot);
  return snapshot;
}

function terminateChildProcess(child: ChildProcessWithoutNullStreams) {
  if (process.platform === "win32" && child.pid) {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true });
    return;
  }
  child.kill("SIGTERM");
}

function broadcast(projectId: string, event: ProcessEvent) {
  for (const listener of ensureListeners(projectId)) {
    try {
      listener(event);
    } catch {
      // keep the remaining listeners alive
    }
  }
}

function setRuntimePhase(runtime: ProjectRuntime, phase: RuntimePhase, message?: string | null) {
  runtime.phase = phase;
  runtime.status = phaseToStatus(phase);
  persistSnapshot(runtime);
  broadcast(runtime.projectId, { type: "phase", phase, message: message ?? null });
  broadcast(runtime.projectId, { type: "status", status: runtime.status, phase, message: message ?? null });
}

function addLine(runtime: ProjectRuntime, line: string, stream: "stdout" | "stderr" | "system") {
  const cleanLine = line.trimEnd();
  if (!cleanLine) return;
  runtime.lines.push(cleanLine);
  if (runtime.lines.length > 50000) runtime.lines.splice(0, runtime.lines.length - 50000);
  runtime.lastOutputAt = Date.now();
  persistSnapshot(runtime);
  broadcast(runtime.projectId, { type: "line", line: cleanLine, stream });
}

function addSystemLine(runtime: ProjectRuntime, line: string) {
  addLine(runtime, line, "system");
}

function buildInitialPrompt(userStories: string) {
  return [
    "Construye la aplicación completa usando el proyecto local y sus artefactos OpenSpec como punto de partida.",
    "Antes de terminar, verifica el scaffold necesario, instala o completa dependencias faltantes, y deja el proyecto runnable.",
    "No te detengas en un stub: implementa la funcionalidad completa, corrige errores y confirma build.",
    "Si necesitas más contexto, usa los archivos OpenSpec del proyecto como fuente de verdad.",
    "",
    userStories.trim(),
  ].join("\n");
}

function buildInitialSystemPrompt(projectName: string) {
  return [
    `Eres la instancia OpenCode del proyecto ${projectName}.`,
    "Trabaja con SDD estricto usando el workspace local como fuente de verdad.",
    "Usa opencode.json, AGENTS.md, .opencode/instructions/openspec-sdd.md, openspec/config.yaml, openspec/specs/* y openspec/changes/* para mantener el alcance estable.",
    "Tu tarea es producir una aplicacion completa y funcional para las historias de usuario, no solo un stub o una pantalla minima.",
    "Si faltan dependencias, scripts, archivos base o configuracion de build, crealos e instalalos antes de terminar.",
    "Implementa, ejecuta y corrige hasta que el proyecto quede runnable y verificable localmente.",
    "Si falta informacion critica, pregunta solo lo minimo necesario.",
  ].join("\n");
}

function applyUsageFromEvent(runtime: ProjectRuntime, event: string, data: string) {
  try {
    const parsed = JSON.parse(data) as {
      properties?: {
        info?: {
          tokens?: { input?: number; output?: number; reasoning?: number; cache?: { read?: number; write?: number } };
          summary?: { tokens?: { input?: number; output?: number; reasoning?: number; cache?: { read?: number; write?: number } } };
        };
      };
    };

    const tokens = parsed.properties?.info?.tokens ?? parsed.properties?.info?.summary?.tokens;
    if (!tokens) return;

    updateUsage(runtime, {
      inputTokens: tokens.input,
      outputTokens: tokens.output,
      reasoningTokens: tokens.reasoning,
      cacheReadTokens: tokens.cache?.read,
      cacheWriteTokens: tokens.cache?.write,
    });
    persistSnapshot(runtime);
    broadcast(runtime.projectId, { type: "snapshot", ...snapshotFromRuntime(runtime) });
  } catch {
    // Ignore non-JSON usage events.
  }
}

function formatOpenCodeSpawnError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code ?? "") : "";
  if (code === "ENOENT") {
    if (env.opencodeUseNpx) {
      return `No se encontró "npx" (Node.js). Instala Node o desactiva OPENCODE_USE_NPX y define OPENCODE_COMMAND con la ruta al binario opencode.`;
    }
    return `No se encontró el comando ${JSON.stringify(env.opencodeCommand)}. Instala OpenCode (p. ej. \`npm i -g opencode-ai\` o \`curl -fsSL https://opencode.ai/install | bash\`), o en backend/.env pon OPENCODE_USE_NPX=true, o ajusta OPENCODE_COMMAND.`;
  }
  return message;
}

function clearRuntimeTimers(runtime: ProjectRuntime) {
  if (runtime.transcriptSyncTimer) clearInterval(runtime.transcriptSyncTimer);
  if (runtime.timeoutTimer) clearTimeout(runtime.timeoutTimer);
}

async function reserveProjectPort() {
  const previous = portReservationQueue;
  let releaseQueue: (() => void) | undefined;
  portReservationQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });
  await previous;

  try {
    const port = await getFreePort(env.opencodeServerPortBase, reservedPorts);
    reservedPorts.add(port);
    return port;
  } finally {
    releaseQueue?.();
  }
}

function releaseProjectPort(port: number) {
  reservedPorts.delete(port);
}

function formatSessionEntry(entry: { info?: { role?: string; id?: string }; parts?: Array<{ type?: string; text?: string }> }) {
  const role = entry.info?.role ?? "message";
  const lines: string[] = [];
  for (const part of entry.parts ?? []) {
    if (part.type === "text" && typeof part.text === "string") {
      for (const line of part.text.split(/\r?\n/)) {
        if (line.trim()) lines.push(`[${role}] ${line}`);
      }
      continue;
    }
    lines.push(`[${role}] ${JSON.stringify(part)}`);
  }
  return lines.length > 0 ? lines : [`[${role}]`];
}

function getSessionEntryId(entry: { info?: { id?: string }; parts?: Array<{ id?: string; type?: string; text?: string }> }) {
  return entry.info?.id ?? entry.parts?.[0]?.id ?? null;
}

function getSessionEntrySignature(entry: { info?: { role?: string; id?: string }; parts?: Array<{ type?: string; text?: string }>; }) {
  return JSON.stringify({ role: entry.info?.role ?? "message", parts: entry.parts ?? [] });
}

function appendTranscriptLines(runtime: ProjectRuntime, entries: Array<{ info?: { role?: string; id?: string }; parts?: Array<{ type?: string; text?: string }> }>) {
  let appended = false;
  for (const entry of entries) {
    const entryId = getSessionEntryId(entry);
    const signature = getSessionEntrySignature(entry);
    if (entryId) {
      const previousSignature = runtime.seenSessionMessageSignatures.get(entryId);
      if (previousSignature === signature) continue;
      runtime.seenSessionMessageSignatures.set(entryId, signature);
    }
    const lines = formatSessionEntry(entry);
    for (const line of lines) {
      addSystemLine(runtime, line);
      appended = true;
    }
  }
  return appended;
}

async function syncSessionTranscript(runtime: ProjectRuntime) {
  if (!runtime.sessionId) return;
  const entries = await getSessionMessages(runtime.baseUrl, runtime.sessionId, 500);
  appendTranscriptLines(runtime, entries);
}

async function startSseBridge(runtime: ProjectRuntime) {
  let reconnectDelayMs = 1000;

  while (!runtime.stopRequested) {
    try {
      const response = await fetch(`${runtime.baseUrl}/event`, { headers: { Accept: "text/event-stream" } });
      if (!response.body) throw new Error("OpenCode event stream unavailable");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      reconnectDelayMs = 1000;
      while (!runtime.stopRequested) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseLineBuffer(buffer, (event, data) => {
          if (!data || event === "server.connected" || event === "server.heartbeat") return;
          applyUsageFromEvent(runtime, event, data);
        });
      }
    } catch (error) {
      if (runtime.stopRequested) return;
      addSystemLine(runtime, `[stream] ${(error as Error).message}`);
    }

    if (runtime.stopRequested) return;

    try {
      await syncSessionTranscript(runtime);
    } catch (error) {
      addSystemLine(runtime, `[stream] Sync fallido: ${(error as Error).message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, reconnectDelayMs));
    reconnectDelayMs = Math.min(reconnectDelayMs * 2, 10000);
  }
}

async function updateProjectStatus(projectId: string, status: ProjectStatus, patch: Record<string, unknown> = {}) {
  const prisma = getPrisma();
  await prisma.project.update({ where: { id: projectId }, data: { status, ...patch } });
  const runtime = runtimes.get(projectId);
  if (runtime) {
    runtime.status = status;
    persistSnapshot(runtime);
    broadcast(projectId, { type: "status", status, phase: runtime.phase });
  }
}

function isActiveRuntime(projectId: string) {
  const runtime = runtimes.get(projectId);
  return Boolean(pendingGenerations.has(projectId) || (runtime && !runtime.stopRequested && isActiveRuntimePhase(runtime.phase)));
}

export function getRuntime(projectId: string) {
  return runtimes.get(projectId) ?? null;
}

export function getRunningCount() {
  return pendingGenerations.size + [...runtimes.values()].filter((runtime) => !runtime.stopRequested && isActiveRuntimePhase(runtime.phase)).length;
}

export function getRuntimeSnapshot(projectId: string): ProjectExecutionSnapshot {
  return snapshotsByProject.get(projectId) ?? defaultSnapshot(projectId);
}

export async function stopProjectRuntime(projectId: string) {
  const runtime = runtimes.get(projectId);
  if (!runtime) {
    pendingGenerations.delete(projectId);
    snapshotsByProject.set(projectId, defaultSnapshot(projectId));
    await updateProjectStatus(projectId, ProjectStatus.idle, { lastError: null });
    return false;
  }

  runtime.stopRequested = true;
  clearRuntimeTimers(runtime);
  runtime.inputEnabled = false;
  runtime.phase = "stopping";
  runtime.status = ProjectStatus.running;
  runtime.lastError = null;
  snapshotsByProject.set(projectId, {
    ...snapshotFromRuntime(runtime),
    phase: "stopping",
    status: ProjectStatus.running,
    message: "Deteniendo proceso",
  });
  broadcast(projectId, { type: "phase", phase: "stopping", message: "Deteniendo proceso" });
  broadcast(projectId, { type: "status", status: ProjectStatus.running, phase: "stopping", message: "Deteniendo proceso" });
  persistSnapshot(runtime);
  void updateProjectStatus(projectId, ProjectStatus.idle, { lastError: null });

  terminateChildProcess(runtime.child);
  await new Promise((resolve) => setTimeout(resolve, 250));
  releaseProjectPort(runtime.port);
  runtimes.delete(projectId);
  snapshotsByProject.set(projectId, {
    ...defaultSnapshot(projectId),
    message: "Proceso detenido",
  });
  broadcast(projectId, { type: "status", status: ProjectStatus.idle, phase: "idle", message: "Proceso detenido" });
  broadcast(projectId, { type: "snapshot", ...getRuntimeSnapshot(projectId) });
  return true;
}

export function subscribe(projectId: string, listener: RuntimeListener) {
  const listeners = ensureListeners(projectId);
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function startProjectGeneration(projectId: string, projectName: string, userStories: string, workspacePath: string) {
  if (isActiveRuntime(projectId)) throw new Error("Ya existe un proceso activo para este proyecto");
  if (getRunningCount() >= env.maxConcurrentProcesses) throw new Error("Se alcanzó el límite máximo de 5 procesos simultáneos. Espera a que termine alguno.");

  normalizeProjectWorkspace(workspacePath);

  pendingGenerations.add(projectId);
  createOpenSpecWorkspace(workspacePath, projectId, projectName, userStories);
  createOpenCodeConfig(workspacePath, projectId, projectName, userStories);
  snapshotsByProject.set(projectId, {
    ...defaultSnapshot(projectId),
    phase: "preparing",
    status: ProjectStatus.running,
    message: "Preparando el runtime de OpenCode",
  });
  broadcast(projectId, { type: "phase", phase: "preparing", message: "Preparando el runtime de OpenCode" });
  broadcast(projectId, { type: "status", status: ProjectStatus.running, phase: "preparing", message: "Preparando el runtime de OpenCode" });
  let allocatedPort: number | null = null;
  try {
    await updateProjectStatus(projectId, ProjectStatus.running, { lastError: null });
    const port = await reserveProjectPort();
    allocatedPort = port;
    const child = spawnOpenCodeServe(port, workspacePath);
    const baseUrl = `http://${env.opencodeServerHost}:${port}`;

    const runtime: ProjectRuntime = {
      projectId,
      port,
      child,
      baseUrl,
      sessionId: null,
      phase: "preparing",
      status: ProjectStatus.running,
      lines: [],
      lastOutputAt: Date.now(),
      listeners: ensureListeners(projectId),
      inputEnabled: false,
      stopRequested: false,
      lastError: null,
      usage: defaultSnapshot(projectId).usage,
      seenSessionMessageSignatures: new Map<string, string>(),
    };

    pendingGenerations.delete(projectId);
    runtimes.set(projectId, runtime);
    persistSnapshot(runtime);
    broadcast(projectId, { type: "snapshot", ...snapshotFromRuntime(runtime) });

    runtime.timeoutTimer = setTimeout(async () => {
      if (runtime.stopRequested) return;
      runtime.stopRequested = true;
      runtime.lastError = "Se excedió el tiempo máximo de 90 minutos.";
      runtime.phase = "error";
      runtime.status = ProjectStatus.error;
      persistSnapshot(runtime);
      broadcast(projectId, { type: "error", message: runtime.lastError });
      broadcast(projectId, { type: "status", status: ProjectStatus.error, phase: "error", message: runtime.lastError });
      clearRuntimeTimers(runtime);
      runtime.child.kill("SIGTERM");
      runtimes.delete(projectId);
      await updateProjectStatus(projectId, ProjectStatus.error, { lastError: runtime.lastError });
    }, env.processTimeoutMinutes * 60 * 1000);

    runtime.child.stdout.on("data", (chunk) => {
      addLine(runtime, chunk.toString("utf8"), "stdout");
    });
    runtime.child.stderr.on("data", (chunk) => {
      addLine(runtime, chunk.toString("utf8"), "stderr");
    });
    runtime.child.on("error", async (error) => {
      if (runtime.stopRequested) return;
      runtime.stopRequested = true;
      runtime.lastError = formatOpenCodeSpawnError(error);
      runtime.phase = "error";
      runtime.status = ProjectStatus.error;
      persistSnapshot(runtime);
      broadcast(projectId, { type: "error", message: runtime.lastError });
      broadcast(projectId, { type: "status", status: ProjectStatus.error, phase: "error", message: runtime.lastError });
      clearRuntimeTimers(runtime);
      await updateProjectStatus(projectId, ProjectStatus.error, { lastError: runtime.lastError });
    });
    runtime.child.on("exit", async (code) => {
      clearRuntimeTimers(runtime);
      if (runtime.stopRequested) return;
      runtime.stopRequested = true;
      runtime.phase = "error";
      runtime.status = ProjectStatus.error;
      runtime.lastError = code && code !== 0 ? `OpenCode exited with code ${code}` : "OpenCode exited unexpectedly";
      persistSnapshot(runtime);
      broadcast(projectId, { type: "error", message: runtime.lastError });
      broadcast(projectId, { type: "status", status: ProjectStatus.error, phase: "error", message: runtime.lastError });
      await updateProjectStatus(projectId, ProjectStatus.error, { lastError: runtime.lastError });
      runtimes.delete(projectId);
    });

    setRuntimePhase(runtime, "starting", "Esperando a que OpenCode acepte conexiones");
    await waitForHealth(baseUrl);
    const session = await createSession(baseUrl, projectName);
    runtime.sessionId = session.id;
    runtime.phase = "running";
    runtime.status = ProjectStatus.running;
    persistSnapshot(runtime);
    broadcast(projectId, { type: "status", status: ProjectStatus.running, phase: "running", message: "Sesión de OpenCode creada" });
    void startSseBridge(runtime).catch((error) => {
      addSystemLine(runtime, `[stream error] ${(error as Error).message}`);
    });
    await sendPrompt(baseUrl, session.id, buildInitialPrompt(userStories), { system: buildInitialSystemPrompt(projectName) });
    void syncSessionTranscript(runtime).catch((error) => {
      addSystemLine(runtime, `[sync error] ${(error as Error).message}`);
    });
    runtime.transcriptSyncTimer = setInterval(() => {
      void syncSessionTranscript(runtime).catch((error) => {
        addSystemLine(runtime, `[sync error] ${(error as Error).message}`);
      });
    }, 1500);
    return getRuntimeSnapshot(projectId);
  } catch (error) {
    pendingGenerations.delete(projectId);
    const message = formatOpenCodeSpawnError(error);
    const runtime = runtimes.get(projectId);
    if (runtime) {
      runtime.stopRequested = true;
      runtime.lastError = message;
      runtime.phase = "error";
      runtime.status = ProjectStatus.error;
      releaseProjectPort(runtime.port);
      persistSnapshot(runtime);
      broadcast(projectId, { type: "error", message: runtime.lastError });
      broadcast(projectId, { type: "status", status: ProjectStatus.error, phase: "error", message: runtime.lastError });
      clearRuntimeTimers(runtime);
      runtime.child.kill();
      runtimes.delete(projectId);
    } else {
      if (allocatedPort != null) releaseProjectPort(allocatedPort);
      snapshotsByProject.set(projectId, {
        ...defaultSnapshot(projectId),
        phase: "error",
        status: ProjectStatus.error,
        lastError: message,
        message,
      });
      broadcast(projectId, { type: "error", message });
      broadcast(projectId, { type: "status", status: ProjectStatus.error, phase: "error", message });
    }
    await updateProjectStatus(projectId, ProjectStatus.error, { lastError: message });
    throw error;
  }
}

export async function sendProjectInput(projectId: string, message: string) {
  const runtime = runtimes.get(projectId);
  if (!runtime?.sessionId) throw new Error("El proyecto no está listo para recibir entrada");
  persistSnapshot(runtime);
  broadcast(projectId, { type: "phase", phase: runtime.phase === "idle" ? "running" : runtime.phase, message: "Entrada enviada a la sesión activa" });
  await sendPrompt(runtime.baseUrl, runtime.sessionId, message);
  void syncSessionTranscript(runtime).catch((error) => {
    addSystemLine(runtime, `[sync error] ${(error as Error).message}`);
  });
}

export async function markProjectComplete(projectId: string, workspacePath: string) {
  const prisma = getPrisma();
  const runtime = runtimes.get(projectId);
  const snapshotBeforePackaging = getRuntimeSnapshot(projectId);

  if (runtime) {
    runtime.phase = "packaging";
    runtime.inputEnabled = false;
    persistSnapshot(runtime);
    broadcast(projectId, { type: "phase", phase: "packaging", message: "Empaquetando proyecto" });
  } else {
    snapshotsByProject.set(projectId, { ...snapshotBeforePackaging, phase: "packaging", status: ProjectStatus.running, inputEnabled: false, message: "Empaquetando proyecto" });
    broadcast(projectId, { type: "phase", phase: "packaging", message: "Empaquetando proyecto" });
  }

  await stopProjectRuntime(projectId);

  const zipPath = getProjectZipPath(projectId);
  removePathIfExists(zipPath);
  await zipDirectory(workspacePath, zipPath);
  const stats = fs.statSync(zipPath);
  const fileCount = countFilesRecursive(workspacePath);

  await prisma.project.update({
    where: { id: projectId },
    data: {
      status: ProjectStatus.completed,
      zipPath,
      zipSizeBytes: BigInt(stats.size),
      fileCount,
      completedAt: new Date(),
      lastError: null,
    },
  });

  snapshotsByProject.set(projectId, {
    ...snapshotBeforePackaging,
    phase: "completed",
    status: ProjectStatus.completed,
    inputEnabled: false,
    lastError: null,
    message: "Proyecto empaquetado correctamente",
  });
  broadcast(projectId, { type: "completion_confirmed", zipPath, zipSizeBytes: stats.size, fileCount });
  broadcast(projectId, { type: "status", status: ProjectStatus.completed, phase: "completed", message: "Proyecto empaquetado correctamente" });
  return { zipPath, zipSizeBytes: stats.size, fileCount };
}

export async function cleanupRunningProjectsOnBoot() {
  const prisma = getPrisma();
  const running = await prisma.project.findMany({ where: { status: ProjectStatus.running } });
  for (const project of running) {
    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: ProjectStatus.error,
        lastError: "El proceso fue interrumpido por un reinicio del servidor. Puedes crear un nuevo proyecto para regenerar.",
      },
    });
    snapshotsByProject.set(project.id, {
      ...defaultSnapshot(project.id),
      phase: "error",
      status: ProjectStatus.error,
      lastError: "El proceso fue interrumpido por un reinicio del servidor. Puedes crear un nuevo proyecto para regenerar.",
    });
  }
}
