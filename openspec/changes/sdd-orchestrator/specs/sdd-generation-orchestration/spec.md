## ADDED Requirements

### Requirement: per-project process orchestration
The system MUST start exactly one `opencode` process per project and stream its output in real time.

#### Scenario: start generation
- **WHEN** the user clicks "Generar Aplicación" for an idle project
- **THEN** the system launches a dedicated process for that project
- **AND** streams stdout and stderr to the UI

### Requirement: bidirectional console input
The system MUST allow the user to send input to the running process through the project console.

#### Scenario: send user input
- **WHEN** the process is waiting for input
- **THEN** the user can type a message and send it to the process stdin

### Requirement: reconnectable logs
The system MUST retain a bounded in-memory buffer of recent output so the UI can reconnect to an active process.

#### Scenario: reconnect after browser close
- **WHEN** the user reconnects while a process is still running
- **THEN** the system sends the buffered log history before resuming live streaming

### Requirement: process safety limits
The system MUST prevent more than one active process per project and more than five concurrent processes globally.

#### Scenario: reject sixth process
- **WHEN** five processes are already running and a sixth is requested
- **THEN** the system rejects the request with a clear concurrency error

### Requirement: timeout and restart handling
The system MUST stop a generation process after 90 minutes and mark interrupted running projects as `error` on server startup.

#### Scenario: timeout reached
- **WHEN** a process exceeds 90 minutes
- **THEN** the system stops the process and marks the project as `error`
