## Context

`sdd-orchestrator` already persists projects and launches a headless OpenCode server per project, but the current flow is fragile in three places: the selected-project UI can connect before the runtime exists, generated project workspaces are not strict enough about OpenCode/OpenSpec separation, and long-running actions do not expose a clean status model for the frontend.

The OpenCode server documentation shows a project/session API and a server-sent events stream, so the backend must treat OpenCode as the source of truth for execution state while the browser stays attached through the orchestrator. OpenSpec is also spec-driven and workspace-based, so generated projects need documented artifacts and configuration instead of ad hoc context handling.

## Goals / Non-Goals

**Goals:**
- Make project execution truly isolated per project.
- Keep a browser connection attached even when the runtime starts after the socket connection.
- Separate durable project lifecycle state from transient execution phases.
- Ensure generated project workspaces contain valid OpenCode/OpenSpec artifacts and persistent HUs context.
- Make long-running actions observable through status + polling while keeping live execution over WebSocket.
- Require explicit user confirmation before packaging.

**Non-Goals:**
- Change the SDD level 1 workflow for the monorepo root.
- Add authentication, roles, or multi-user coordination.
- Rebuild the whole OpenCode integration from scratch if the current server API already supports the required flow.
- Change the target app stack for generated projects.

## Decisions

1. **Project-scoped runtime registry with late attachment**
   - Keep one runtime record per project and one browser stream registry per project.
   - If a browser socket connects before the runtime exists, keep that socket subscribed to the project and emit a snapshot once the runtime comes online.
   - This directly fixes the Tab 2 issue where a pre-opened UI connection misses the runtime start.
   - Alternative considered: force the frontend to reconnect repeatedly. Rejected because the backend should own project attachment and the UI should not have to race startup.

2. **Durable lifecycle state plus transient execution phases**
   - Keep the persisted project status small and durable (`idle`, `running`, `completed`, `error`).
   - Expose transient phases such as `preparing`, `starting`, `waiting_input`, `monitoring`, and `packaging` from the runtime stream and status endpoints.
   - This avoids overloading the DB enum with short-lived states while still giving the UI precise feedback.
   - Alternative considered: expand the DB enum with every runtime phase. Rejected because those states are operational, not lifecycle truth.

3. **OpenCode session as execution source of truth**
   - Use the documented OpenCode session/message/event APIs for actual execution state.
   - Treat child-process stdout/stderr as server diagnostics only.
   - The backend should forward OpenCode session events to the project stream and use the session ID to preserve continuity.
   - Alternative considered: rely on stdout/stderr as the transcript. Rejected because it conflates server boot logs with agent execution.

4. **Project-local workspace generation with documented config boundaries**
   - Generate OpenCode configuration in the project root using documented OpenCode config formats.
   - Generate OpenSpec artifacts only in layouts and file types supported by OpenSpec’s documented workflow.
   - Store user stories in a persistent workspace file and reference that file from config/instructions when possible instead of copying large raw text everywhere.
   - Alternative considered: continue writing ad hoc YAML blobs. Rejected because config/schema drift is a likely source of current failures.

5. **Status-first long-running operations**
   - Generate and complete should return quickly with a status payload or accepted job state.
   - The frontend should poll the status endpoint for progress and keep WebSocket for live updates.
   - This makes the UI predictable even when OpenCode or packaging takes time.

6. **Two-step completion**
   - Completion should be an explicit confirm-then-package flow.
   - The backend should reject completion unless the project is in a valid state and the user has confirmed.

## Risks / Trade-offs

- [Late socket attachment may hide startup failures] → Send an immediate project snapshot and explicit error phases so the UI can show whether the runtime is missing, starting, or failed.
- [More status states can drift from DB state] → Keep transient phases derived from runtime events and persist only durable lifecycle states.
- [OpenCode/OpenSpec docs may evolve] → Keep file generation strict to documented formats and validate generated workspace files before launch.
- [Polling adds extra requests] → Use polling only for long-running actions; keep live runtime updates on WebSocket.
- [Packaging after confirmation can race with shutdown] → Transition to a packaging phase, stop the runtime cleanly, then archive only after the runtime is quiescent.
