## ADDED Requirements

### Requirement: project workspace roots
The system MUST create a dedicated workspace directory for each generated project and a dedicated archive path for completed projects.

#### Scenario: create project workspace
- **WHEN** a project is created
- **THEN** the system creates `sdd-orchestrator/projects/{project-id}/` for that project

#### Scenario: package completed project
- **WHEN** a project is completed
- **THEN** the system creates `sdd-orchestrator/completed-projects/{project-id}.zip`

### Requirement: documented OpenCode and OpenSpec configuration
The system MUST generate project-local OpenCode and OpenSpec artifacts only in formats and locations supported by the official documentation.

#### Scenario: generate workspace configuration
- **WHEN** the workspace is prepared for generation
- **THEN** the system writes the required OpenCode configuration in the project root
- **AND** the system writes the required OpenSpec artifacts and/or configuration files using documented file names and structure
- **AND** it does not invent unsupported schemas or ad hoc concatenated config blobs

### Requirement: persistent user story context
The system MUST persist the full user story block in the project workspace and make it available as stable context for generation.

#### Scenario: store user stories
- **WHEN** the user creates or updates a project with user stories
- **THEN** the system writes the full user story block to a workspace file
- **AND** the OpenCode/OpenSpec setup references that file or its documented equivalent so the same context is used throughout the session

### Requirement: workspace validation before launch
The system MUST validate that the project workspace is ready before starting OpenCode.

#### Scenario: block invalid workspace
- **WHEN** the workspace is missing required OpenCode/OpenSpec artifacts or the config is invalid
- **THEN** the system refuses to start generation
- **AND** it reports a clear server-side error for the UI
