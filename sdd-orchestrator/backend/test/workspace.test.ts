import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createOpenCodeConfig, createOpenSpecWorkspace } from "../src/lib/openSpec.js";

describe("workspace generation", () => {
  it("creates OpenSpec and opencode config files", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-orchestrator-"));
    createOpenSpecWorkspace(tmp, "demo", "As a user, I want tests.");
    createOpenCodeConfig(tmp, "As a user, I want tests.");

    expect(fs.existsSync(path.join(tmp, ".openspec", "config.yaml"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, "opencode.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, "user-stories.md"))).toBe(true);
  });
});
