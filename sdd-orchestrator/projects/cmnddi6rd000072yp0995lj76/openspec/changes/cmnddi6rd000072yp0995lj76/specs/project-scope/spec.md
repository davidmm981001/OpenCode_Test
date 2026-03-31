## ADDED Requirements

### Requirement: live world clock
The system MUST show the current time for a curated set of time zones and refresh automatically.

#### Scenario: clock updates every second
- **GIVEN** the clock page is open
- **WHEN** one second passes
- **THEN** the displayed time changes to reflect the new current second

### Requirement: selectable zone
The system MUST let the user choose which time zone is emphasized.

#### Scenario: user switches the active zone
- **GIVEN** the clock page is open and a default zone is selected
- **WHEN** the user selects a different time zone from the provided list
- **THEN** the highlighted clock updates to the newly selected zone
- **AND** the displayed time for that zone is formatted in 24-hour time

### Requirement: curated zone list
The system MUST expose a fixed, simple set of time zones suitable for a small world clock.

#### Scenario: zone list is rendered
- **GIVEN** the app has loaded successfully
- **THEN** the user can see at least three predefined time zones
- **AND** no custom zone entry field is shown
