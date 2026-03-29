import fs from "node:fs";
import path from "node:path";

import { ensureDirSync } from "../env.js";

export function normalizeProjectWorkspace(projectDir: string) {
  const legacyOpenSpecDir = path.join(projectDir, ".openspec");
  const currentOpenSpecDir = path.join(projectDir, "openspec");
  if (fs.existsSync(legacyOpenSpecDir) && !fs.existsSync(currentOpenSpecDir)) {
    fs.renameSync(legacyOpenSpecDir, currentOpenSpecDir);
  }

  const legacyOpenCodeDir = path.join(projectDir, ".opencode");
  const legacyOpenCodeConfig = path.join(projectDir, "opencode.jsonc");
  const currentOpenCodeConfig = path.join(projectDir, "opencode.json");
  const legacyOpenCodeDirConfig = path.join(legacyOpenCodeDir, "opencode.jsonc");
  const legacyOpenCodeDirJson = path.join(legacyOpenCodeDir, "opencode.json");
  if (!fs.existsSync(currentOpenCodeConfig)) {
    if (fs.existsSync(legacyOpenCodeDirConfig)) {
      fs.renameSync(legacyOpenCodeDirConfig, currentOpenCodeConfig);
    } else if (fs.existsSync(legacyOpenCodeDirJson)) {
      fs.renameSync(legacyOpenCodeDirJson, currentOpenCodeConfig);
    } else if (fs.existsSync(legacyOpenCodeConfig)) {
      fs.renameSync(legacyOpenCodeConfig, currentOpenCodeConfig);
    }
  }

  if (fs.existsSync(legacyOpenCodeDir)) {
    try {
      fs.rmSync(legacyOpenCodeDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup failures
    }
  }
}

export function createOpenSpecWorkspace(projectDir: string, projectId: string, projectName: string, userStories: string) {
  normalizeProjectWorkspace(projectDir);
  const openspecDir = path.join(projectDir, "openspec");
  const changeDir = path.join(openspecDir, "changes", projectId);
  const specsDir = path.join(changeDir, "specs", "project-scope");
  ensureDirSync(openspecDir);
  ensureDirSync(path.join(openspecDir, "changes"));
  ensureDirSync(changeDir);
  ensureDirSync(specsDir);

  const configYaml = [
    "version: 1",
    `project_name: ${JSON.stringify(projectName)}`,
    "model: gpt-5.4-mini",
    "context:",
    `  user_stories_file: ${JSON.stringify(path.posix.join("user-stories.md"))}`,
    `  change_dir: ${JSON.stringify(path.posix.join("openspec", "changes", projectId))}`,
    `  context_file: ${JSON.stringify(path.posix.join("openspec", "context.md"))}`,
    "guardrails:",
    "  - Keep the scope anchored to the provided user stories.",
    "  - Prefer small, testable deltas.",
    "  - Keep OpenCode and OpenSpec configuration separate.",
    "  - Do not change the target stack.",
  ].join("\n");

  const proposal = [
    "## Why",
    "",
    `We need to generate a new project for ${projectName} from the provided user stories and keep the initial scope stable for OpenCode and OpenSpec.`,
    "",
    "## What Changes",
    "",
    "- Seed the project workspace with OpenSpec change artifacts.",
    "- Preserve the full user story block as persistent context.",
    "- Keep OpenCode configuration isolated from OpenSpec configuration.",
    "",
    "## Capabilities",
    "",
    "### New Capabilities",
    "- `project-scope`: the generated project context, requirements, and task seed for the initial SDD loop.",
    "",
    "### Modified Capabilities",
    "- None.",
    "",
    "## Impact",
    "",
    "- Project-local OpenSpec artifacts and OpenCode instructions.",
    "- The initial execution context sent to OpenCode.",
  ].join("\n");

  const design = [
    "## Context",
    "",
    "This generated project starts from user stories and must keep a strict SDD boundary so OpenCode can work from stable OpenSpec artifacts rather than loose chat text.",
    "",
    "## Goals / Non-Goals",
    "",
    "**Goals:**",
    "- Preserve the full story block in the workspace.",
    "- Keep OpenSpec and OpenCode artifacts isolated and referenced by file path.",
    "- Make the first generation pass deterministic and reconnectable.",
    "",
    "**Non-Goals:**",
    "- Implementing the final application features in this workspace seed.",
    "- Changing the target stack.",
    "",
    "## Decisions",
    "",
    "- Use project-local OpenSpec change artifacts as the primary planning context.",
    "- Keep the raw user stories in a dedicated workspace file for traceability.",
    "- Reference files from OpenCode instructions instead of concatenating a single giant prompt.",
    "",
    "## Risks / Trade-offs",
    "",
    "- The initial scaffold is generic, so later refinement may still be needed.",
    "- Keeping too much context inline can reduce signal; file references help reduce that risk.",
  ].join("\n");

  const tasks = [
    "## 1. Setup",
    "",
    "- [ ] 1.1 Review the provided user stories and confirm the intended scope.",
    "- [ ] 1.2 Refine the project context and initial requirements if the scope changes.",
    "",
    "## 2. Implementation",
    "",
    "- [ ] 2.1 Build the backend flow and data model for the requested project.",
    "- [ ] 2.2 Build the frontend flow and wire it to the backend.",
    "- [ ] 2.3 Validate the project with tests before packaging.",
  ].join("\n");

  const spec = [
    "## ADDED Requirements",
    "",
    "### Requirement: preserved project scope",
    "The system MUST preserve the provided user stories as the initial project scope for the generated project.",
    "",
    "#### Scenario: user stories are available",
    "- **WHEN** the generated project workspace is prepared",
    "- **THEN** the full user story block is stored in the workspace",
    "- **AND** the OpenCode/OpenSpec instructions reference that persisted context",
    "",
    "### Requirement: strict SDD seed",
    "The system MUST seed the generated project with OpenSpec change artifacts that can be refined before implementation.",
    "",
    "#### Scenario: change artifacts are created",
    "- **WHEN** the workspace is initialized",
    "- **THEN** the project contains proposal, design, tasks, and spec files for the initial SDD loop",
    "",
    "### Requirement: isolated configuration boundaries",
    "The system MUST keep OpenCode configuration separate from OpenSpec configuration.",
    "",
    "#### Scenario: configuration files are written",
    "- **WHEN** the workspace is generated",
    "- **THEN** the OpenCode config file lives in the project root",
    "- **AND** the OpenSpec files live under the project-local OpenSpec directory",
  ].join("\n");

  const contextMd = [
    "# Project Context",
    "",
    `## Project`,
    projectName,
    "",
    "## User Stories",
    userStories,
    "",
    "## OpenSpec Change",
    projectId,
  ].join("\n");

  fs.writeFileSync(path.join(openspecDir, "config.yaml"), configYaml, "utf8");
  fs.writeFileSync(path.join(openspecDir, "context.md"), contextMd, "utf8");
  fs.writeFileSync(path.join(changeDir, "proposal.md"), proposal, "utf8");
  fs.writeFileSync(path.join(changeDir, "design.md"), design, "utf8");
  fs.writeFileSync(path.join(changeDir, "tasks.md"), tasks, "utf8");
  fs.writeFileSync(path.join(specsDir, "spec.md"), spec, "utf8");
}

export function createOpenCodeConfig(projectDir: string, projectId: string, userStories: string) {
  normalizeProjectWorkspace(projectDir);
  const config = {
    $schema: "https://opencode.ai/config.json",
    model: "openai/gpt-5.4-mini",
    small_model: "openai/gpt-5.4-mini",
    default_agent: "build",
    autoupdate: false,
    snapshot: true,
    enabled_providers: ["openai"],
    provider: {
      openai: {
        options: {
          apiKey: "{env:OPENAI_API_KEY}",
        },
      },
    },
    instructions: [
      "openspec/config.yaml",
      "user-stories.md",
      "openspec/context.md",
      `openspec/changes/${projectId}/proposal.md`,
      `openspec/changes/${projectId}/design.md`,
      `openspec/changes/${projectId}/tasks.md`,
      `openspec/changes/${projectId}/specs/**/*.md`,
    ],
    permission: {
      bash: "allow",
      edit: "allow",
    },
    watcher: {
      ignore: ["node_modules/**", "dist/**", ".git/**", "completed-projects/**", "openspec/changes/archive/**"],
    },
  };

  fs.writeFileSync(path.join(projectDir, "opencode.json"), JSON.stringify(config, null, 2), "utf8");
  fs.writeFileSync(path.join(projectDir, "user-stories.md"), userStories, "utf8");
}
