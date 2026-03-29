## Why

We need a third app in the monorepo that turns a free-form set of user stories into a controlled SDD/OpenSpec-driven code generation workflow. This gives the team a visible, resumable, and auditable way to generate new Spring Boot + React + PostgreSQL projects without hand-running the agent loop.

## What Changes

- Add a new `sdd-orchestrator` app with its own backend, frontend, storage, and Docker setup.
- Provide CRUD project management with project creation, rename, deletion, and status tracking.
- Add real-time orchestration of a per-project `opencode` process with bidirectional console streaming, reconnectable logs, and manual user input.
- Generate a per-project OpenSpec/OpenCode workspace that embeds the user stories into the generated project context.
- Add LLM-based completion monitoring using `gpt-5.4-mini`, manual completion confirmation, and ZIP packaging on finish.
- Keep the new app isolated from `ragapp` and `admin` while still providing navigation links across all three apps.

## Capabilities

### New Capabilities
- `sdd-project-management`: create, update, list, and delete generation projects; persist metadata and lifecycle state.
- `sdd-generation-orchestration`: launch, monitor, reconnect to, and interact with a per-project `opencode` process.
- `sdd-generated-project-packaging`: prepare project workspaces, embed OpenSpec context, package completed output, and expose downloads.
- `monorepo-app-navigation`: show clear navigation between RagApp, Manager, and SDD Orchestrator using environment-configured base URLs.

### Modified Capabilities
- None.

## Impact

- New Node.js/Express backend with Prisma and PostgreSQL schema for project metadata.
- New React/Vite frontend with terminal-style streaming UI and project detail tabs.
- New workspace management under `sdd-orchestrator/projects/` and `sdd-orchestrator/completed-projects/`.
- New runtime dependencies for WebSocket streaming, process management, ZIP creation, and OpenAI monitoring.
