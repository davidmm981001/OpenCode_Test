import { ProjectStatus } from "@prisma/client";

import type { RuntimePhase } from "./process-supervisor.js";

export function isActiveRuntimePhase(phase: RuntimePhase) {
  return phase !== "idle" && phase !== "completed" && phase !== "error";
}

export function canStartProjectGeneration(status: ProjectStatus, phase: RuntimePhase) {
  return status !== ProjectStatus.running && status !== ProjectStatus.completed && !isActiveRuntimePhase(phase);
}

export function canCompleteProject(status: ProjectStatus, phase: RuntimePhase) {
  return status === ProjectStatus.running && (phase === "running" || phase === "monitoring" || phase === "waiting_input");
}
