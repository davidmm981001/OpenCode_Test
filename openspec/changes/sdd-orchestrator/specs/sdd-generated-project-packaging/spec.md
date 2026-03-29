## ADDED Requirements

### Requirement: workspace preparation
The system MUST create a dedicated workspace directory for each project.

#### Scenario: create workspace
- **WHEN** a project is created
- **THEN** the system creates `projects/<project-id>/` for that project

### Requirement: persistent user stories
The system MUST store the user stories in the project workspace.

#### Scenario: save user stories
- **WHEN** the user submits project stories
- **THEN** the system writes them to `user-stories.md` in the workspace root

### Requirement: generated OpenSpec context
The system MUST generate project-local OpenSpec configuration that includes the user stories as persistent context.

#### Scenario: generate OpenSpec config
- **WHEN** the project workspace is prepared
- **THEN** the system writes a project-local `.openspec` configuration with the user stories embedded

### Requirement: completion packaging
The system MUST package completed projects as ZIP files and expose them for download.

#### Scenario: package completed project
- **WHEN** the project is confirmed complete
- **THEN** the system creates `completed-projects/<project-id>.zip`
- **AND** stores the zip metadata in the database
