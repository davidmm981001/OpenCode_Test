## ADDED Requirements

### Requirement: project lifecycle management
The system MUST allow the user to create, list, rename, and delete generation projects.

#### Scenario: create project
- **WHEN** the user creates a project with a name and user stories
- **THEN** the system creates a persisted project record in PostgreSQL
- **AND** assigns the project an `idle` state

#### Scenario: rename project
- **WHEN** the user edits the project name
- **THEN** the system updates the stored name without changing the project identifier

#### Scenario: delete project
- **WHEN** the user confirms deletion by typing the exact project name
- **THEN** the system deletes the project record and its workspace directory

### Requirement: project state visibility
The system MUST expose each project's current state as `idle`, `running`, `completed`, or `error`.

#### Scenario: list project states
- **WHEN** the user opens the project list
- **THEN** each row shows the current state and creation timestamp
