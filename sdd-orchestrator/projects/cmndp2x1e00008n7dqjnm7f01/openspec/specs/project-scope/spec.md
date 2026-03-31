## ADDED Requirements

### Requirement: generated project scope
The system MUST implement the user stories in a runnable application.

#### Scenario: project is generated
- **WHEN** the workspace is initialized
- **THEN** the project contains OpenSpec and OpenCode configuration files
- **AND** the project scope is captured in `openspec/specs/project-scope/spec.md`