## ADDED Requirements

### Requirement: preserved project scope
The system MUST preserve the provided user stories as the initial project scope for the generated project.

#### Scenario: user stories are available
- **WHEN** the generated project workspace is prepared
- **THEN** the full user story block is stored in the workspace
- **AND** the OpenCode/OpenSpec instructions reference that persisted context

### Requirement: strict SDD seed
The system MUST seed the generated project with OpenSpec change artifacts that can be refined before implementation.

#### Scenario: change artifacts are created
- **WHEN** the workspace is initialized
- **THEN** the project contains proposal, design, tasks, and spec files for the initial SDD loop

### Requirement: isolated configuration boundaries
The system MUST keep OpenCode configuration separate from OpenSpec configuration.

#### Scenario: configuration files are written
- **WHEN** the workspace is generated
- **THEN** the OpenCode config file lives at `opencode.json` in the project root
- **AND** the OpenSpec files live under the project-local OpenSpec directory