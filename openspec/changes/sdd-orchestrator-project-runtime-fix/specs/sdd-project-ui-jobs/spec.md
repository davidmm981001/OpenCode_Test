## ADDED Requirements

### Requirement: selected project follows the execution stream
The system MUST keep the console tab bound to the selected project and display the execution stream for that same project.

#### Scenario: open the console before generation starts
- **WHEN** the user opens the console tab while the project is still idle
- **THEN** the UI remains attached to that project
- **AND** when generation starts it shows the same project's runtime events without requiring the user to reconnect manually

### Requirement: explicit execution states
The system MUST show clear execution states for project generation, including connecting, preparing, running, waiting input, monitoring, packaging, completed, and error.

#### Scenario: show runtime state transitions
- **WHEN** the runtime changes phase
- **THEN** the UI updates the visible state for the selected project
- **AND** the state text matches the current execution phase

### Requirement: status-first long-running actions
The system MUST return a status-oriented response immediately for long-running generation and packaging actions, and the UI MUST poll the project status endpoint until the operation completes or fails.

#### Scenario: generate returns immediately
- **WHEN** the user starts generation
- **THEN** the backend returns a status response without waiting for the entire OpenCode run to finish
- **AND** the UI continues to refresh the project status until the runtime updates arrive

### Requirement: confirm before packaging
The system MUST require explicit user confirmation before completing and packaging a project.

#### Scenario: package only after confirmation
- **WHEN** the user requests completion
- **THEN** the system only packages the project after the confirmation step is accepted
- **AND** it refuses completion if the project is not in a valid state
