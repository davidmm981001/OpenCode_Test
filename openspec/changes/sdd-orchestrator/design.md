## Context

This change adds a third standalone app to the monorepo: `sdd-orchestrator`. It manages project records in PostgreSQL, launches and monitors one isolated `opencode` process per project, persists project workspaces on disk, and streams logs bidirectionally to the browser.

The change is intentionally cross-cutting: it introduces a new backend, a new frontend, process supervision, WebSocket streaming, ZIP packaging, environment-based navigation across apps, and an LLM monitoring loop.

## Goals / Non-Goals

**Goals:**
- Create and manage generation projects with clear lifecycle states.
- Launch one isolated generation process per project and cap total concurrency at five.
- Stream stdout/stderr to the UI with reconnect support and user input back to stdin.
- Persist generated workspaces, embed user stories into the project OpenSpec context, and package completed output into a downloadable ZIP.
- Use environment variables for all app URLs and the fixed `gpt-5.4-mini` model.

**Non-Goals:**
- Auth, multi-user permissions, or role-based access.
- Cloud deployment, CI/CD, or reuse of RagApp/Admin APIs.
- Editing generated code from the UI.
- Resuming interrupted processes after server restart.

## Decisions

1. **Express + Prisma + PostgreSQL for the backend**
   - Chosen for a small, explicit service surface with straightforward schema ownership and migrations.
   - Alternative considered: NestJS. Rejected because the user explicitly requested Express and the orchestration layer benefits from direct process control.

2. **Vite + React + TypeScript for the frontend**
   - Chosen for fast iteration and a clean SPA model with a terminal-like detail screen.
   - Alternative considered: Next.js. Rejected because the app is a self-contained dashboard and Vite is lighter for a dedicated tool.

3. **WebSocket for project execution streaming**
   - Chosen because the channel must be bidirectional: the server streams logs, and the user can send console input back to the running process.
   - SSE alone would not satisfy the stdin interaction requirement.

4. **Per-project process supervisor with in-memory log ring buffer**
   - Each project gets one supervisor instance that tracks process state, inactivity, and a bounded log buffer for reconnect.
   - A ring buffer avoids unbounded memory growth during long runs.

5. **Workspace-scoped OpenSpec config generation**
   - The generated project gets its own `.openspec` context under `projects/<id>/` and the user stories are injected there as persistent context.
   - This keeps the generation anchored even when the process is long-running.

6. **LLM monitor as a separate periodic evaluator**
   - Every 30 seconds, the latest output snapshot is sent to `gpt-5.4-mini` to determine completion and suggest next actions.
   - The user must still confirm final completion before packaging.

## Risks / Trade-offs

- [Process supervision complexity] → Keep the supervisor per project isolated with explicit state transitions and a maximum concurrency guard.
- [WebSocket reconnect edge cases] → Send a full buffer snapshot on connect, then continue live streaming with sequence markers.
- [Memory growth from logs] → Use a fixed-size ring buffer and cap retained lines at 50,000 per project.
- [OpenSpec/opencode drift] → Treat workspace config generation as a first-class step and store the user stories in the project workspace as source of truth.
- [Long-running process failures] → Enforce a hard 90-minute timeout and mark the project as error on exceeded time.

## Migration Plan

1. Add the new `sdd-orchestrator` workspace and its environment files.
2. Create the database schema and Prisma migrations.
3. Implement project CRUD before process orchestration.
4. Add the process supervisor and WebSocket streaming.
5. Add completion monitoring, packaging, and download endpoints.
6. Wire the frontend navigation and detail tabs.

Rollback: remove the new app directory, revert the Prisma schema/migrations, and delete the new project rows and workspace directories.

## Open Questions

- Whether `opencode` runs best via PTY or plain pipes in the target environment.
- The exact OpenSpec config fields for workspace-scoped user-story context injection.
- Whether the project ZIP should include hidden workspace files by default or only the generated source tree.
