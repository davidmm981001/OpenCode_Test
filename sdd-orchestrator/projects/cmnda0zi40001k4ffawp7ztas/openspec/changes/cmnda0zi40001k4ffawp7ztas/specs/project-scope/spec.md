## ADDED Requirements

### Requirement: basic arithmetic calculator
The system MUST allow the user to enter a numeric expression and obtain a result for basic arithmetic operations.

#### Scenario: valid arithmetic expression
- **GIVEN** the calculator is open
- **WHEN** the user enters `2+3` and requests a calculation
- **THEN** the result displayed is `5`

#### Scenario: invalid arithmetic expression
- **GIVEN** the calculator is open
- **WHEN** the user enters an invalid expression
- **THEN** the system displays an error state instead of a numeric result

### Requirement: mass unit conversion
The system MUST convert numeric values between mass units including mg, g, kg, and t.

#### Scenario: kilogram to gram conversion
- **GIVEN** the converter is open
- **WHEN** the user enters `2` and selects kg to g
- **THEN** the result displayed is `2000 g`

#### Scenario: swapped units
- **GIVEN** the converter has a value and two selected mass units
- **WHEN** the user swaps the origin and destination units
- **THEN** the displayed conversion updates to the reversed units

### Requirement: responsive single-page experience
The system MUST present the calculator and converter in a responsive layout.

#### Scenario: narrow viewport
- **GIVEN** the page is opened on a narrow viewport
- **WHEN** the content is rendered
- **THEN** the calculator and converter stack vertically without losing access to controls
