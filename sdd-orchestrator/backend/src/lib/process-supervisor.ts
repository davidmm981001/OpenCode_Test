import { ChildProcessWithoutNullStreams, spawnSync } from "node:child_process";
import fs from "node:fs";

import { ProjectStatus } from "@prisma/client";

import { env } from "../env.js";
import { getPrisma } from "../prisma.js";
import { judgeCompletion } from "./llm.js";
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
import { normalizeProjectWorkspace } from "./openSpec.js";
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
  monitorCycles: number;
  monitorTimer?: NodeJS.Timeout;
  timeoutTimer?: NodeJS.Timeout;
  stopRequested: boolean;
  lastMonitorMessage: string | null;
  pendingCompletionMessage: string | null;
  lastError: string | null;
  usage: ProjectExecutionSnapshot["usage"];
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
    message: runtime.pendingCompletionMessage ?? runtime.lastMonitorMessage,
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
    return `No se encontró el comando ${JSON.stringify(env.opencodeCommand)}. Instala OpenCode o ajusta OPENCODE_COMMAND.`;
  }
  return message;
}

function clearRuntimeTimers(runtime: ProjectRuntime) {
  if (runtime.monitorTimer) clearInterval(runtime.monitorTimer);
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

function formatSessionEntry(entry: { info?: { role?: string }; parts?: Array<{ type?: string; text?: string }> }) {
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

function eventMatchesSession(data: string, sessionId: string | null) {
  if (!sessionId) return true;
  try {
    const parsed = JSON.parse(data) as { sessionID?: string; sessionId?: string; id?: string; session?: { id?: string } };
    const ids = [parsed.sessionID, parsed.sessionId, parsed.id, parsed.session?.id].filter((value): value is string => Boolean(value));
    return ids.length === 0 || ids.includes(sessionId);
  } catch {
    return true;
  }
}

function formatSseLine(event: string, data: string) {
  if (event === "server.connected" || event === "server.heartbeat" || event === "session.updated" || event === "session.diff") {
    return null;
  }
  try {
    const parsed = JSON.parse(data) as {
      message?: string;
      text?: string;
      content?: string;
      type?: string;
      properties?: {
        message?: string;
        text?: string;
        content?: string;
        status?: { type?: string };
        phase?: string;
        info?: { role?: string };
        part?: { type?: string; text?: string; delta?: string };
      };
    };
    const props = parsed.properties;
    const payload = props?.message ?? props?.text ?? props?.content ?? parsed.message ?? parsed.text ?? parsed.content;

    if (event === "message.part.delta") {
      const delta = props?.part?.delta;
      return delta ? delta : null;
    }

    if (event === "message.part.updated") {
      const text = props?.part?.text;
      return text ? text : null;
    }

    if (event === "session.status") {
      const status = props?.status?.type;
      return status ? `[session] ${status}` : null;
    }

    if (event === "message.updated") {
      const role = props?.info?.role;
      return role ? `[${role}]` : null;
    }

    return typeof payload === "string" && payload.trim() ? `[${event}] ${payload}` : null;
  } catch {
    return data.trim() ? `[${event}] ${data}` : null;
  }
}

async function hydrateSessionTranscript(runtime: ProjectRuntime) {
  if (!runtime.sessionId) return;
  const entries = await getSessionMessages(runtime.baseUrl, runtime.sessionId, 200);
  const lines = entries.flatMap((entry) => formatSessionEntry(entry));
  runtime.lines = lines.slice(-50000);
  runtime.lastOutputAt = Date.now();
  persistSnapshot(runtime);
  broadcast(runtime.projectId, { type: "snapshot", ...snapshotFromRuntime(runtime) });
}

async function startMonitor(runtime: ProjectRuntime) {
  runtime.monitorTimer = setInterval(async () => {
    if (runtime.stopRequested || !runtime.sessionId) return;

    const idleMs = Date.now() - runtime.lastOutputAt;
    if (idleMs >= 10_000 && !runtime.inputEnabled) {
      runtime.inputEnabled = true;
      runtime.phase = "waiting_input";
      persistSnapshot(runtime);
      broadcast(runtime.projectId, { type: "input_enabled", inputEnabled: true });
      broadcast(runtime.projectId, { type: "phase", phase: "waiting_input", message: "OpenCode está esperando entrada" });
    }

    if (runtime.lines.length === 0 || Date.now() - runtime.lastOutputAt < 30_000) return;
    if (runtime.monitorCycles >= 100) {
      addSystemLine(runtime, "[monitor] Se alcanzó el límite de ciclos; espera confirmación manual.");
      return;
    }

    runtime.monitorCycles += 1;
    try {
      const decision = await judgeCompletion(runtime.lines.slice(-200));
      if (runtime.stopRequested) return;

      if (decision.finished) {
        runtime.pendingCompletionMessage = decision.message || "El sistema detecta que el proyecto finalizó.";
        runtime.phase = "waiting_input";
        runtime.inputEnabled = false;
        persistSnapshot(runtime);
        broadcast(runtime.projectId, { type: "completion_ready", message: runtime.pendingCompletionMessage });
        broadcast(runtime.projectId, { type: "phase", phase: "waiting_input", message: runtime.pendingCompletionMessage });
        return;
      }

      if (decision.message.trim() && decision.message !== runtime.lastMonitorMessage) {
        runtime.lastMonitorMessage = decision.message;
        runtime.phase = "monitoring";
        persistSnapshot(runtime);
        await sendPrompt(runtime.baseUrl, runtime.sessionId, decision.message);
        addSystemLine(runtime, `[monitor] ${decision.message}`);
      }
    } catch (error) {
      const message = (error as Error).message;
      runtime.lastError = message;
      persistSnapshot(runtime);
      addSystemLine(runtime, `[monitor error] ${message}`);
    }
  }, 30_000);
}

async function startSseBridge(runtime: ProjectRuntime) {
  const response = await fetch(`${runtime.baseUrl}/event`);
  if (!response.body) throw new Error("OpenCode event stream unavailable");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (!runtime.stopRequested) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    buffer = parseSseLineBuffer(buffer, (event, data) => {
      if (!data || event === "server.connected" || event === "server.heartbeat") return;
      applyUsageFromEvent(runtime, event, data);
      if (!eventMatchesSession(data, runtime.sessionId)) return;
      const line = formatSseLine(event, data);
      if (line) addSystemLine(runtime, line);
    });
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
  runtime.pendingCompletionMessage = null;
  runtime.lastMonitorMessage = null;
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
      monitorCycles: 0,
      stopRequested: false,
      lastMonitorMessage: null,
      pendingCompletionMessage: null,
      lastError: null,
      usage: defaultSnapshot(projectId).usage,
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
    await sendPrompt(baseUrl, session.id, userStories);
    await hydrateSessionTranscript(runtime);
    void startSseBridge(runtime).catch((error) => {
      addSystemLine(runtime, `[stream error] ${(error as Error).message}`);
    });
    void startMonitor(runtime);
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
  if (!runtime.inputEnabled) throw new Error("OpenCode todavía está ejecutando; espera a que se habilite la entrada");
  runtime.inputEnabled = false;
  runtime.phase = "running";
  persistSnapshot(runtime);
  broadcast(projectId, { type: "input_enabled", inputEnabled: false });
  broadcast(projectId, { type: "phase", phase: "running", message: "Entrada enviada a la sesión activa" });
  await sendPrompt(runtime.baseUrl, runtime.sessionId, message);
  addSystemLine(runtime, `[user] ${message}`);
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
