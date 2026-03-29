import fs from "node:fs";
import path from "node:path";

import { ensureDirSync } from "../env.js";

export function createOpenSpecWorkspace(projectDir: string, projectName: string, userStories: string) {
  const openspecDir = path.join(projectDir, ".openspec");
  ensureDirSync(openspecDir);

  const configYaml = [
    "version: 1",
    `project_name: ${JSON.stringify(projectName)}`,
    "model: gpt-5.4-mini",
    "stack:",
    "  backend: Java Spring Boot",
    "  frontend: React",
    "  database: PostgreSQL",
    "context:",
    "  user_stories: |",
    ...userStories.split(/\r?\n/).map((line) => `    ${line}`),
    "  guardrails:",
    "    - Keep the scope anchored to the provided user stories.",
    "    - Prefer small, testable deltas.",
    "    - Do not change the stack.",
  ].join("\n");

  fs.writeFileSync(path.join(openspecDir, "config.yaml"), configYaml, "utf8");
  const contextMd = [`# Project Context`, "", `## Project`, projectName, "", "## User Stories", userStories, ""].join("\n");
  fs.writeFileSync(path.join(openspecDir, "CONTEXT.md"), contextMd, "utf8");
  fs.writeFileSync(path.join(openspecDir, "context.md"), contextMd, "utf8");
}

export function createOpenCodeConfig(projectDir: string, userStories: string) {
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
    instructions: [".openspec/CONTEXT.md"],
    permission: {
      bash: "ask",
      edit: "ask",
    },
    watcher: {
      ignore: ["node_modules/**", "dist/**", ".git/**", "completed-projects/**"],
    },
  };

  fs.writeFileSync(path.join(projectDir, "opencode.json"), JSON.stringify(config, null, 2), "utf8");
  fs.writeFileSync(path.join(projectDir, "user-stories.md"), userStories, "utf8");
}
