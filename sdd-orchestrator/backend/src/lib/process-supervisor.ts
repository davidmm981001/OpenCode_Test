import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { ProjectStatus } from "@prisma/client";

import { env } from "../env.js";
import { getPrisma } from "../prisma.js";
import { judgeCompletion } from "./llm.js";
import {
  createSession,
  getFreePort,
  parseSseLineBuffer,
  sendMessage,
  sendPrompt,
  spawnOpenCodeServe,
  waitForHealth,
} from "./opencode-client.js";
import { countFilesRecursive, getProjectZipPath, removePathIfExists } from "./workspace.js";
import { zipDirectory } from "./zip.js";

type ProjectRuntime = {
  projectId: string;
  port: number;
  child: ChildProcessWithoutNullStreams;
  baseUrl: string;
  sessionId: string | null;
  lines: string[];
  listeners: Set<(event: ProcessEvent) => void>;
  lastOutputAt: number;
  inputEnabled: boolean;
  monitorCycles: number;
  monitorTimer?: NodeJS.Timeout;
  idleTimer?: NodeJS.Timeout;
  timeoutTimer?: NodeJS.Timeout;
  stopRequested: boolean;
  eventBuffer: string;
};

export type ProcessEvent =
  | { type: "line"; line: string; stream: "stdout" | "stderr" | "system" }
  | { type: "status"; status: ProjectStatus }
  | { type: "input_enabled"; inputEnabled: boolean }
  | { type: "error"; message: string }
  | { type: "completion_ready"; message: string }
  | { type: "completion_confirmed"; zipPath: string; zipSizeBytes: number; fileCount: number };

const runtimes = new Map<string, ProjectRuntime>();

export function getRuntime(projectId: string) {
  return runtimes.get(projectId);
}

export function getRunningCount() {
  return [...runtimes.values()].filter((runtime) => !runtime.stopRequested).length;
}

export function getRuntimeSnapshot(projectId: string) {
  const runtime = runtimes.get(projectId);
  if (!runtime) return null;
  return {
    projectId,
    lines: runtime.lines.slice(-50000),
    status: runtime.stopRequested ? ("error" as const) : ("running" as const),
    inputEnabled: runtime.inputEnabled,
  };
}

export async function stopProjectRuntime(projectId: string) {
  const runtime = runtimes.get(projectId);
  if (!runtime) return false;
  runtime.stopRequested = true;
  clearRuntimeTimers(runtime);
  const exitPromise = new Promise<void>((resolve) => {
    runtime.child.once("exit", () => resolve());
  });
  runtime.child.kill();
  await Promise.race([exitPromise, new Promise((resolve) => setTimeout(resolve, 3000))]);
  runtimes.delete(projectId);
  return true;
}

export function subscribe(projectId: string, listener: (event: ProcessEvent) => void) {
  const runtime = runtimes.get(projectId);
  if (!runtime) throw new Error("Project process is not running");
  runtime.listeners.add(listener);
  return () => runtime.listeners.delete(listener);
}

function emit(runtime: ProjectRuntime, event: ProcessEvent) {
  for (const listener of runtime.listeners) listener(event);
}

function addLine(runtime: ProjectRuntime, line: string, stream: "stdout" | "stderr" | "system") {
  runtime.lines.push(line);
  if (runtime.lines.length > 50000) runtime.lines.splice(0, runtime.lines.length - 50000);
  runtime.lastOutputAt = Date.now();
  emit(runtime, { type: "line", line, stream });
}

async function updateStatus(projectId: string, status: ProjectStatus, patch: Record<string, unknown> = {}) {
  const prisma = getPrisma();
  await prisma.project.update({ where: { id: projectId }, data: { status, ...patch } });
  const runtime = runtimes.get(projectId);
  if (runtime) emit(runtime, { type: "status", status });
}

async function startMonitor(runtime: ProjectRuntime) {
  runtime.monitorTimer = setInterval(async () => {
    if (runtime.stopRequested) return;
    const idleMs = Date.now() - runtime.lastOutputAt;
    if (idleMs >= 10_000 && !runtime.inputEnabled) {
      runtime.inputEnabled = true;
      emit(runtime, { type: "input_enabled", inputEnabled: true });
    }

    if (runtime.lines.length === 0 || Date.now() - runtime.lastOutputAt < 30_000) return;
    if (runtime.monitorCycles >= 100) {
      addLine(runtime, "[monitor] Se alcanzó el límite de ciclos; espera confirmación manual.", "system");
      return;
    }

    runtime.monitorCycles += 1;
    try {
      const decision = await judgeCompletion(runtime.lines.slice(-200));
      if (decision.finished) {
        emit(runtime, { type: "completion_ready", message: decision.message || "El sistema detecta que el proyecto finalizó." });
        runtime.inputEnabled = false;
      } else if (decision.message.trim()) {
        if (runtime.sessionId) {
          await sendPrompt(runtime.baseUrl, runtime.sessionId, decision.message);
          addLine(runtime, `[monitor] ${decision.message}`, "system");
        }
      }
    } catch (error) {
      addLine(runtime, `[monitor error] ${(error as Error).message}`, "stderr");
    }
  }, 30_000);
}

function clearRuntimeTimers(runtime: ProjectRuntime) {
  if (runtime.monitorTimer) clearInterval(runtime.monitorTimer);
  if (runtime.idleTimer) clearInterval(runtime.idleTimer);
  if (runtime.timeoutTimer) clearTimeout(runtime.timeoutTimer);
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
    buffer = parseSseLineBuffer(buffer, (_event, data) => {
      if (!data) return;
      addLine(runtime, data, "system");
    });
  }
}

export async function startProjectGeneration(projectId: string, projectName: string, userStories: string, workspacePath: string) {
  if (runtimes.has(projectId)) throw new Error("Ya existe un proceso activo para este proyecto");
  if (getRunningCount() >= env.maxConcurrentProcesses) throw new Error("Se alcanzó el límite máximo de 5 procesos simultáneos. Espera a que termine alguno.");

  const port = await getFreePort(env.opencodeServerPortBase + getRunningCount());
  const child = spawnOpenCodeServe(port, workspacePath);
  const baseUrl = `http://${env.opencodeServerHost}:${port}`;

  const runtime: ProjectRuntime = {
    projectId,
    port,
    child,
    baseUrl,
    sessionId: null,
    lines: [],
    listeners: new Set(),
    lastOutputAt: Date.now(),
    inputEnabled: false,
    monitorCycles: 0,
    stopRequested: false,
    eventBuffer: "",
  };
  runtimes.set(projectId, runtime);
  runtime.timeoutTimer = setTimeout(async () => {
    if (runtime.stopRequested) return;
    runtime.stopRequested = true;
    runtime.child.kill("SIGTERM");
    clearRuntimeTimers(runtime);
    runtimes.delete(projectId);
    await updateStatus(projectId, ProjectStatus.error, {
      lastError: "Se excedió el tiempo máximo de 90 minutos.",
    });
    emit(runtime, {
      type: "error",
      message: "Se excedió el tiempo máximo de 90 minutos.",
    });
  }, env.processTimeoutMinutes * 60 * 1000);

  child.stdout.on("data", (chunk) => addLine(runtime, chunk.toString("utf8").trimEnd(), "stdout"));
  child.stderr.on("data", (chunk) => addLine(runtime, chunk.toString("utf8").trimEnd(), "stderr"));
  child.on("error", async (error) => {
    runtime.stopRequested = true;
    clearRuntimeTimers(runtime);
    await updateStatus(projectId, ProjectStatus.error, { lastError: error.message });
    emit(runtime, { type: "error", message: error.message });
  });
  child.on("exit", async (code) => {
    clearRuntimeTimers(runtime);
    if (runtime.stopRequested) return;
    runtime.stopRequested = true;
    runtimes.delete(projectId);
    if (code && code !== 0) {
      await updateStatus(projectId, ProjectStatus.error, { lastError: `OpenCode exited with code ${code}` });
      emit(runtime, { type: "error", message: `OpenCode exited with code ${code}` });
    }
  });

  try {
    await waitForHealth(baseUrl);
    const session = await createSession(baseUrl, projectName);
    runtime.sessionId = session.id;
    await updateStatus(projectId, ProjectStatus.running);
    await sendPrompt(baseUrl, session.id, userStories);
    void startSseBridge(runtime).catch(async (error) => {
      addLine(runtime, `[stream error] ${(error as Error).message}`, "stderr");
    });
    void startMonitor(runtime);
    return getRuntimeSnapshot(projectId);
  } catch (error) {
    runtime.stopRequested = true;
    clearRuntimeTimers(runtime);
    child.kill();
    runtimes.delete(projectId);
    await updateStatus(projectId, ProjectStatus.error, { lastError: (error as Error).message });
    throw error;
  }
}

export async function sendProjectInput(projectId: string, message: string) {
  const runtime = runtimes.get(projectId);
  if (!runtime?.sessionId) throw new Error("El proyecto no está listo para recibir entrada");
  if (!runtime.inputEnabled) throw new Error("OpenCode todavía está ejecutando; espera a que se habilite la entrada");
  runtime.inputEnabled = false;
  emit(runtime, { type: "input_enabled", inputEnabled: false });
  await sendMessage(runtime.baseUrl, runtime.sessionId, message);
  addLine(runtime, `[user] ${message}`, "system");
}

export async function markProjectComplete(projectId: string, workspacePath: string) {
  const prisma = getPrisma();
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
    },
  });
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
  }
}
