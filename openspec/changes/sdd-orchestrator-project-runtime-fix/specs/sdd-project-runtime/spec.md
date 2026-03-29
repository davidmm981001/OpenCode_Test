## ADDED Requirements

### Requirement: isolated per-project OpenCode runtime
The system MUST start and manage exactly one active headless OpenCode runtime per project, with a project-specific port and session.

#### Scenario: start a project runtime
- **WHEN** the user requests generation for an idle project
- **THEN** the system starts a dedicated OpenCode runtime for that project only
- **AND** the runtime uses its own port and session identifiers

### Requirement: reconnectable project event stream
The system MUST keep a project-scoped event stream available to connected clients even if they connect before the runtime starts.

#### Scenario: connect before runtime starts
- **WHEN** the UI connects to a project while it is still idle
- **THEN** the system keeps the project stream attachment active
- **AND** once the runtime starts the UI receives a snapshot and live events for the same project without opening a new browser connection

### Requirement: bidirectional project input
The system MUST route user input only to the active OpenCode session for the selected project.

#### Scenario: send input to the active session
- **WHEN** the project is running and waiting for user input
- **THEN** the system sends the message to that project's active OpenCode session
- **AND** it rejects the input if the project is not in a state that can accept it

### Requirement: runtime safety and restart recovery
The system MUST enforce one active runtime per project, a global maximum of five concurrent runtimes, and mark interrupted running projects as error after a server restart.

#### Scenario: reject excess concurrency
- **WHEN** five project runtimes are already active and a sixth generation request arrives
- **THEN** the system rejects the request with a concurrency error

#### Scenario: recover after server restart
- **WHEN** the backend restarts while a project was marked running
- **THEN** the system marks that project as error and exposes a recoverable failure message
