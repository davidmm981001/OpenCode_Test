## 1. Workspace and configuration contract

- [ ] 1.1 Review the OpenCode/OpenSpec docs used by the generated projects and align the workspace layout with the documented file formats.
- [ ] 1.2 Make project workspace generation write valid, project-local OpenCode and OpenSpec artifacts that preserve the full user stories as stable context.
- [ ] 1.3 Add validation so generation cannot start when the workspace config or context files are missing or invalid.

## 2. Project runtime orchestration

- [ ] 2.1 Add a per-project subscriber registry so sockets that connect before runtime startup remain attached to the same project.
- [ ] 2.2 Emit OpenCode session events as the project transcript and keep child-process stdout/stderr only for server diagnostics.
- [ ] 2.3 Enforce one active runtime per project, the global concurrency limit, and restart recovery for interrupted running projects.
- [ ] 2.4 Route user input only to the active session for the selected project and reject input when the runtime is not ready.

## 3. Project API and status model

- [ ] 3.1 Make long-running generate and complete actions return a fast status-oriented response instead of waiting for full completion.
- [ ] 3.2 Add or tighten a project status endpoint so the frontend can poll execution state while the runtime is running.
- [ ] 3.3 Add an explicit completion confirmation flow and ensure packaging only happens from a valid state.

## 4. Frontend execution experience

- [ ] 4.1 Keep the console tab bound to the selected project and restore the same project stream after reconnect.
- [ ] 4.2 Display clear runtime states for connecting, preparing, running, waiting input, monitoring, packaging, completed, and error.
- [ ] 4.3 Add terminal-style auto-scroll and useful error messages when OpenCode or the workspace configuration fails.
- [ ] 4.4 Update the completion UI so packaging requires explicit confirmation.

## 5. Verification

- [ ] 5.1 Add or update tests for workspace generation, runtime reconnect behavior, polling/status handling, and completion confirmation.
- [ ] 5.2 Run backend and frontend test suites.
- [ ] 5.3 Run the full build and confirm the generated-project flow works end to end.
