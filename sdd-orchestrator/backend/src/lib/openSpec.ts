import fs from "node:fs";
import path from "node:path";

import { ensureDirSync } from "../env.js";

function removePathIfExists(targetPath: string) {
  if (!fs.existsSync(targetPath)) return;
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function writeFileIfMissing(filePath: string, content: string) {
  if (fs.existsSync(filePath)) return;
  ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

export function normalizeProjectWorkspace(projectDir: string) {
  const legacyOpenSpecDir = path.join(projectDir, ".openspec");
  const currentOpenSpecDir = path.join(projectDir, "openspec");
  if (fs.existsSync(legacyOpenSpecDir) && !fs.existsSync(currentOpenSpecDir)) {
    fs.renameSync(legacyOpenSpecDir, currentOpenSpecDir);
  }

  const legacyOpenCodeDir = path.join(projectDir, ".opencode");
  const legacyOpenCodeRootJson = path.join(projectDir, "opencode.json");
  const legacyOpenCodeRootJsonc = path.join(projectDir, "opencode.jsonc");
  const currentOpenCodeConfig = path.join(projectDir, "opencode.json");
  const legacyDotOpenCodeConfig = path.join(projectDir, ".opencode.json");
  const legacyOpenCodeDirConfig = path.join(legacyOpenCodeDir, "opencode.jsonc");
  const legacyOpenCodeDirJson = path.join(legacyOpenCodeDir, "opencode.json");

  if (!fs.existsSync(currentOpenCodeConfig)) {
    if (fs.existsSync(legacyOpenCodeDirConfig)) {
      fs.copyFileSync(legacyOpenCodeDirConfig, currentOpenCodeConfig);
    } else if (fs.existsSync(legacyOpenCodeDirJson)) {
      fs.copyFileSync(legacyOpenCodeDirJson, currentOpenCodeConfig);
    } else if (fs.existsSync(legacyDotOpenCodeConfig)) {
      fs.copyFileSync(legacyDotOpenCodeConfig, currentOpenCodeConfig);
    } else if (fs.existsSync(legacyOpenCodeRootJson)) {
      fs.copyFileSync(legacyOpenCodeRootJson, currentOpenCodeConfig);
    } else if (fs.existsSync(legacyOpenCodeRootJsonc)) {
      fs.copyFileSync(legacyOpenCodeRootJsonc, currentOpenCodeConfig);
    }
  }

  removePathIfExists(path.join(legacyOpenCodeDir, "package.json"));
  removePathIfExists(path.join(legacyOpenCodeDir, "package-lock.json"));
  removePathIfExists(path.join(legacyOpenCodeDir, "bun.lock"));
  removePathIfExists(path.join(legacyOpenCodeDir, "node_modules"));

  if (fs.existsSync(currentOpenCodeConfig)) {
    removePathIfExists(legacyOpenCodeRootJsonc);
    removePathIfExists(legacyDotOpenCodeConfig);
    removePathIfExists(legacyOpenCodeDirConfig);
    removePathIfExists(legacyOpenCodeDirJson);
  }

  if (fs.existsSync(legacyOpenCodeDir)) {
    // Keep .opencode for valid project-level commands/plugins, but remove runtime junk.
    const remainingEntries = fs.readdirSync(legacyOpenCodeDir);
    if (remainingEntries.length === 0) {
      fs.rmSync(legacyOpenCodeDir, { recursive: true, force: true });
    }
  }
}

function seedOpenCodeProjectFiles(projectDir: string, projectName: string, projectId: string, userStories: string) {
  const opencodeDir = path.join(projectDir, ".opencode");
  const opencodeAgentsDir = path.join(opencodeDir, "agents");
  const commandsDir = path.join(opencodeDir, "commands");
  const instructionsDir = path.join(opencodeDir, "instructions");
  const backendDir = path.join(projectDir, "backend");
  const backendSrcDir = path.join(backendDir, "src");
  const backendSrcLibDir = path.join(backendSrcDir, "lib");
  const backendCompatLibDir = path.join(backendDir, "lib");
  const openspecSpecsDir = path.join(projectDir, "openspec", "specs", "project-scope");
  const changeDir = path.join(projectDir, "openspec", "changes", projectId);
  const changeSpecsDir = path.join(changeDir, "specs", "project-scope");

  ensureDirSync(opencodeDir);
  ensureDirSync(opencodeAgentsDir);
  ensureDirSync(commandsDir);
  ensureDirSync(instructionsDir);
  ensureDirSync(backendSrcLibDir);
  ensureDirSync(openspecSpecsDir);
  ensureDirSync(changeSpecsDir);

  if (!fs.existsSync(backendCompatLibDir)) {
    try {
      fs.symlinkSync(path.relative(backendDir, backendSrcLibDir) || "src/lib", backendCompatLibDir, "dir");
    } catch {
      ensureDirSync(backendCompatLibDir);
    }
  }

  writeFileIfMissing(
    path.join(projectDir, "AGENTS.md"),
    `# ${projectName}

## Purpose
This repository is a generated project driven by OpenSpec and OpenCode.

## Working rules
- Treat "openspec/config.yaml", "openspec/specs/project-scope/spec.md", and "openspec/changes/${projectId}" as the source of truth for scope.
- Read the full user stories before making changes.
- Use OpenSpec artifacts to plan the work before coding.
- Create the missing app scaffold, dependencies, scripts, and build files when the implementation needs them.
- Install dependencies from inside the project when the implementation needs them.
- Keep the result runnable and verify it before finishing.
- Prefer focused changes that satisfy the stories end to end.

## User stories
${userStories}
`,
  );

  writeFileIfMissing(
    path.join(opencodeAgentsDir, "build.md"),
    `---
description: Implements generated projects from OpenSpec context
mode: primary
model: openai/gpt-5.4-mini
---
Read "AGENTS.md", "openspec/config.yaml", "openspec/specs/project-scope/spec.md", and the current OpenSpec change files before coding.
Implement the full application requested by the user stories.
Create any missing project files, scripts, and dependencies only when they are needed to complete the implementation.
Do not stop at a stub. Keep going until the project is runnable and validated.
`,
  );

  writeFileIfMissing(
    path.join(commandsDir, "implement.md"),
    `---
description: Implement the requested application
agent: build
model: openai/gpt-5.4-mini
---
Read "AGENTS.md", "openspec/config.yaml", "openspec/specs/project-scope/spec.md", and the current OpenSpec change files before coding.
Implement the full application requested by the user stories.
Create any missing project files, scripts, and dependencies only when they are needed to complete the implementation.
Do not stop at a stub. Keep going until the project is runnable and validated.
`,
  );

  writeFileIfMissing(
    path.join(instructionsDir, "openspec-sdd.md"),
    `# OpenSpec SDD Instructions

These rules are mandatory for generated projects:

1. Create OpenSpec artifacts first.
   - proposal.md
   - specs/ as delta specs
   - design.md
   - tasks.md

2. Do not create application code until the artifacts are ready.

3. Implement by task, progressively.
   - Complete one task before starting the next.
   - Keep changes small and aligned to the current task.

4. Consult official documentation before using main libraries.
   - Before coding or running commands that depend on a main library, read its current official documentation first.

5. Sync delta specs at the end.
   - Merge openspec/changes/<change>/specs/ into openspec/specs/.
   - Archive only after that.

6. If a technical or design doubt appears, pause and update artifacts.
`,
  );

  writeFileIfMissing(
    path.join(openspecSpecsDir, "spec.md"),
    `# Project Scope

## Purpose
This project must implement the user stories in a runnable application.

## Requirements
### Requirement: preserved project scope
The system MUST preserve the provided user stories as the initial project scope.

#### Scenario: scope is loaded
- **WHEN** a new project is generated
- **THEN** the user stories are stored in the project workspace
- **AND** the agent can read them from OpenCode and OpenSpec context files

### Requirement: runnable project
The system MUST produce a runnable application that can be developed locally.

#### Scenario: implementation starts
- **WHEN** OpenCode begins implementation
- **THEN** it has access to the project scaffold, OpenSpec config, and source-of-truth specs
- **AND** it can install missing dependencies as part of the implementation work
`,
  );

  writeFileIfMissing(
    path.join(changeDir, ".openspec.yaml"),
    `schema: spec-driven
name: ${projectName}
`,
  );
}

export function createOpenSpecWorkspace(projectDir: string, projectId: string, projectName: string, userStories: string) {
  normalizeProjectWorkspace(projectDir);
  const openspecDir = path.join(projectDir, "openspec");
  const changeDir = path.join(openspecDir, "changes", projectId);
  const specsDir = path.join(changeDir, "specs", "project-scope");
  ensureDirSync(openspecDir);
  ensureDirSync(path.join(openspecDir, "changes"));
  ensureDirSync(path.join(openspecDir, "specs", "project-scope"));
  ensureDirSync(changeDir);
  ensureDirSync(specsDir);

  const configYaml = [
    "schema: spec-driven",
    "context: |",
    `  Project: ${projectName}`,
    "  Source of truth: openspec/specs/project-scope/spec.md",
    `  User stories:`,
    ...userStories.split(/\r?\n/).map((line) => `    ${line}`),
    "  Guidelines:",
    "  - Keep OpenCode and OpenSpec responsibilities separate.",
    "  - Use the spec files to drive implementation decisions.",
    "  - Preserve the current target stack unless the user stories explicitly require a change.",
    "rules:",
    "  proposal:",
    "    - Capture the intended app and any stack assumptions clearly.",
    "    - Keep the user stories intact and visible.",
    "  specs:",
    "    - Express requirements as MUST/SHALL statements with concrete scenarios.",
    "  design:",
    "    - Explain how OpenCode should implement the requested app without collapsing scope.",
    "  tasks:",
    "    - Include validation steps and local verification before completion.",
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
    "- Drive the workspace toward a complete, runnable app with dependencies and validation.",
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
    "- Make the first generation pass deterministic, reconnectable, and complete enough to run locally.",
    "",
    "**Non-Goals:**",
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
    "- [ ] 1.2 Install or create the project dependencies, scripts, and build tooling needed to run locally.",
    "",
    "## 2. Implementation",
    "",
    "- [ ] 2.1 Build the full application requested by the user stories.",
    "- [ ] 2.2 Wire the UI, data flow, and any required state or services.",
    "- [ ] 2.3 Validate the project with tests and build before packaging.",
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

  const baseSpec = [
    "## ADDED Requirements",
    "",
    "### Requirement: generated project scope",
    "The system MUST implement the user stories in a runnable application.",
    "",
    "#### Scenario: project is generated",
    "- **WHEN** the workspace is initialized",
    "- **THEN** the project contains OpenSpec and OpenCode configuration files",
    "- **AND** the project scope is captured in `openspec/specs/project-scope/spec.md`",
  ].join("\n");

  const deltaSpec = [
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
    "### Requirement: runnable application",
    "The system MUST drive the generated project toward a runnable application with dependencies, scripts, and validation steps in place.",
    "",
    "#### Scenario: project is generated",
    "- **WHEN** the workspace is initialized",
    "- **THEN** the project includes the files and scripts required to build and run locally",
    "- **AND** the agent is instructed to install any missing dependencies and verify the build",
    "",
    "#### Scenario: configuration files are written",
    "- **WHEN** the workspace is generated",
    "- **THEN** the OpenCode config file lives at `opencode.json` in the project root",
    "- **AND** the OpenSpec files live under the project-local OpenSpec directory",
  ].join("\n");

  fs.writeFileSync(path.join(openspecDir, "config.yaml"), configYaml, "utf8");
  fs.writeFileSync(path.join(openspecDir, "context.md"), contextMd, "utf8");
  fs.writeFileSync(path.join(openspecDir, "specs", "project-scope", "spec.md"), baseSpec, "utf8");
  fs.writeFileSync(path.join(changeDir, "proposal.md"), proposal, "utf8");
  fs.writeFileSync(path.join(changeDir, "design.md"), design, "utf8");
  fs.writeFileSync(path.join(changeDir, "tasks.md"), tasks, "utf8");
  fs.writeFileSync(path.join(specsDir, "spec.md"), deltaSpec, "utf8");
}

export function createOpenCodeConfig(projectDir: string, projectId: string, projectName: string, userStories: string) {
  normalizeProjectWorkspace(projectDir);
  seedOpenCodeProjectFiles(projectDir, projectName, projectId, userStories);
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
    agent: {
      build: {
        mode: "primary",
        description: "Implements generated projects from OpenSpec context",
        model: "openai/gpt-5.4-mini",
        prompt: "{file:AGENTS.md}",
      },
    },
    instructions: [
      "AGENTS.md",
      ".opencode/instructions/openspec-sdd.md",
      "openspec/config.yaml",
      "openspec/specs/**/*.md",
      "user-stories.md",
      "openspec/context.md",
      ".opencode/commands/**/*.md",
      ".opencode/agents/**/*.md",
      `openspec/changes/${projectId}/proposal.md`,
      `openspec/changes/${projectId}/design.md`,
      `openspec/changes/${projectId}/tasks.md`,
      `openspec/changes/${projectId}/specs/**/*.md`,
    ],
    permission: {
      bash: "allow",
      edit: "allow",
      external_directory: "deny",
    },
    watcher: {
      ignore: [
        "node_modules/**",
        "dist/**",
        "target/**",
        "build/**",
        "coverage/**",
        ".idea/**",
        ".git/**",
        "completed-projects/**",
        "openspec/changes/archive/**",
      ],
    },
  };

  fs.writeFileSync(path.join(projectDir, "opencode.json"), JSON.stringify(config, null, 2), "utf8");
  fs.writeFileSync(path.join(projectDir, "user-stories.md"), userStories, "utf8");
}
