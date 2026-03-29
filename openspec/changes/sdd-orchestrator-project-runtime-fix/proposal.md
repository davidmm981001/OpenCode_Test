## Why

`sdd-orchestrator` is generating projects, but the per-project OpenCode runtime is not consistently visible in the UI and the generated project workspace is not always configured tightly enough for a real SDD flow. The system needs a reliable, per-project execution model so each generated project can run, reconnect, and report progress deterministically.

## What Changes

- Make each generated project own a single isolated OpenCode runtime with its own session, port, event stream, and reconnect behavior.
- Ensure the frontend always follows the selected project and shows live execution state from the same project session.
- Generate project workspaces with OpenCode and OpenSpec configuration that matches the official documentation and keeps user stories as persistent context.
- Convert long-running generation/completion interactions into status-driven flows so the UI can poll state while WebSocket remains the live event channel.
- Add explicit completion confirmation before packaging and enforce valid state transitions for generate, reconnect, input, and complete.
- Improve diagnostics and recovery for startup failures, reconnects, and server restarts.

## Capabilities

### New Capabilities
- `sdd-project-runtime`: per-project OpenCode process lifecycle, session persistence, event streaming, user input, reconnect, and concurrency limits.
- `sdd-project-workspace`: project-local OpenSpec/OpenCode workspace generation, context persistence, validation, and path management.
- `sdd-project-ui-jobs`: UI state tracking, project-follow behavior, polling for long-running job status, and explicit completion confirmation.

### Modified Capabilities
- None.

## Impact

- Backend runtime supervision, WebSocket handling, project lifecycle routes, and workspace generation.
- Frontend project selection, console/tab state management, and long-running action handling.
- Project-local files under `sdd-orchestrator/projects/{project-id}/` and packaged ZIP output under `sdd-orchestrator/completed-projects/{project-id}.zip`.
- Tests for runtime state, workspace generation, reconnect behavior, and completion flow.
