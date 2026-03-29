import { ProjectStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { canCompleteProject, canStartProjectGeneration, isActiveRuntimePhase } from "../src/lib/project-runtime-policy.js";

describe("runtime policy", () => {
  it("identifies active phases", () => {
    expect(isActiveRuntimePhase("running")).toBe(true);
    expect(isActiveRuntimePhase("idle")).toBe(false);
    expect(isActiveRuntimePhase("completed")).toBe(false);
  });

  it("allows generation only when the project is idle", () => {
    expect(canStartProjectGeneration(ProjectStatus.idle, "idle")).toBe(true);
    expect(canStartProjectGeneration(ProjectStatus.running, "idle")).toBe(false);
    expect(canStartProjectGeneration(ProjectStatus.idle, "running")).toBe(false);
  });

  it("allows completion only in running-like states", () => {
    expect(canCompleteProject(ProjectStatus.running, "running")).toBe(true);
    expect(canCompleteProject(ProjectStatus.running, "waiting_input")).toBe(true);
    expect(canCompleteProject(ProjectStatus.idle, "running")).toBe(false);
  });
});
