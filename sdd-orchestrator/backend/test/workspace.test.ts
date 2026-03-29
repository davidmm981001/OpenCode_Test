import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createOpenCodeConfig, createOpenSpecWorkspace, normalizeProjectWorkspace } from "../src/lib/openSpec.js";

describe("workspace generation", () => {
  it("creates OpenSpec and opencode config files", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-orchestrator-"));
    createOpenSpecWorkspace(tmp, "demo", "Demo Project", "As a user, I want tests.");
    createOpenCodeConfig(tmp, "demo", "As a user, I want tests.");

    expect(fs.existsSync(path.join(tmp, "openspec", "config.yaml"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, "openspec", "context.md"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, "openspec", "changes", "demo", "proposal.md"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, "openspec", "changes", "demo", "design.md"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, "openspec", "changes", "demo", "tasks.md"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, "openspec", "changes", "demo", "specs", "project-scope", "spec.md"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, "opencode.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, "user-stories.md"))).toBe(true);

    const opencodeConfig = JSON.parse(fs.readFileSync(path.join(tmp, "opencode.json"), "utf8")) as { instructions?: string[] };
    expect((opencodeConfig as { permission?: { bash?: string; edit?: string } }).permission).toEqual({ bash: "allow", edit: "allow" });
    expect(opencodeConfig.instructions).toEqual(
      expect.arrayContaining([
        "openspec/config.yaml",
        "user-stories.md",
        "openspec/context.md",
        "openspec/changes/demo/proposal.md",
        "openspec/changes/demo/design.md",
        "openspec/changes/demo/tasks.md",
      ]),
    );
  });

  it("migrates legacy workspace folders to the documented layout", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-orchestrator-"));
    fs.mkdirSync(path.join(tmp, ".openspec"), { recursive: true });
    fs.mkdirSync(path.join(tmp, ".opencode"), { recursive: true });
    fs.writeFileSync(path.join(tmp, ".opencode", "opencode.jsonc"), "{}", "utf8");

    normalizeProjectWorkspace(tmp);

    expect(fs.existsSync(path.join(tmp, "openspec"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, ".openspec"))).toBe(false);
    expect(fs.existsSync(path.join(tmp, "opencode.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, ".opencode"))).toBe(false);
  });
});
