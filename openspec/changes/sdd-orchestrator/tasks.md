## 1. Foundation

- [x] 1.1 Create `sdd-orchestrator/backend` and `sdd-orchestrator/frontend` app skeletons.
- [x] 1.2 Add environment files, base scripts, and local port configuration for both apps.
- [x] 1.3 Add Prisma schema and initial migration for project metadata.

## 2. Project Management API

- [x] 2.1 Implement project CRUD endpoints backed by PostgreSQL.
- [x] 2.2 Implement workspace creation, rename, and delete flows on disk.
- [x] 2.3 Implement delete confirmation flow by exact project-name match.

## 3. Process Supervision

- [x] 3.1 Implement per-project process supervisor with one active process per project.
- [x] 3.2 Implement global concurrency guard with a maximum of five running processes.
- [x] 3.3 Implement process timeout, restart cleanup, and error-state transitions.

## 4. OpenSpec/OpenCode Workspace Generation

- [x] 4.1 Generate per-project `.openspec` configuration from the user stories.
- [x] 4.2 Persist `user-stories.md` and other workspace metadata in the project directory.
- [x] 4.3 Validate that the generated workspace is ready before process launch.

## 5. WebSocket Console Streaming

- [x] 5.1 Implement live stdout/stderr streaming to the frontend over WebSocket.
- [x] 5.2 Implement reconnect support with a bounded in-memory log buffer.
- [x] 5.3 Implement user input from the UI back to the process stdin.

## 6. Completion Monitoring and Packaging

- [x] 6.1 Implement LLM monitoring using `gpt-5.4-mini` to detect completion.
- [x] 6.2 Implement manual completion confirmation and ZIP packaging.
- [x] 6.3 Implement download endpoint for completed project archives and summary metadata.

## 7. Frontend Experience

- [x] 7.1 Build project list, create/edit/delete flows, and status badges.
- [x] 7.2 Build project detail tabs for stories, terminal execution, and results.
- [x] 7.3 Add cross-app navigation links and active app highlighting.

## 8. Quality and Delivery

- [x] 8.1 Add unit and integration tests for CRUD, process orchestration, and packaging.
- [x] 8.2 Add Dockerfile and compose support for local development.
- [x] 8.3 Verify dev/prod startup paths and document installation/run steps.
