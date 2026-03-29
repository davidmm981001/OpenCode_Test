## ADDED Requirements

### Requirement: cross-app navigation
The system MUST provide visible navigation links to RagApp, Manager, and SDD Orchestrator.

#### Scenario: show app links
- **WHEN** the user opens any SDD Orchestrator page
- **THEN** the UI shows links to the three monorepo applications

### Requirement: active app indicator
The system MUST visually indicate which application is currently active.

#### Scenario: mark active app
- **WHEN** the user is on the SDD Orchestrator
- **THEN** the SDD Orchestrator link is shown as active

### Requirement: environment-configured URLs
The system MUST resolve app URLs from environment variables with sensible local defaults.

#### Scenario: use local defaults
- **WHEN** no custom URL variables are set
- **THEN** the app links default to the local monorepo ports
