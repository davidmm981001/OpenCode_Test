## ADDED Requirements

### Requirement: calculadora básica
El sistema MUST permitir ejecutar suma, resta, multiplicación y división.

#### Scenario: suma exitosa
- **GIVEN** operandos numéricos válidos
- **WHEN** el usuario solicita una suma
- **THEN** el sistema devuelve el resultado correcto

#### Scenario: resta exitosa
- **GIVEN** operandos numéricos válidos
- **WHEN** el usuario solicita una resta
- **THEN** el sistema devuelve el resultado correcto

#### Scenario: multiplicación exitosa
- **GIVEN** operandos numéricos válidos
- **WHEN** el usuario solicita una multiplicación
- **THEN** el sistema devuelve el resultado correcto

#### Scenario: división exitosa
- **GIVEN** operandos numéricos válidos y divisor distinto de cero
- **WHEN** el usuario solicita una división
- **THEN** el sistema devuelve el resultado correcto

#### Scenario: división por cero
- **GIVEN** un divisor igual a cero
- **WHEN** el usuario solicita una división
- **THEN** el sistema responde con un error verificable

### Requirement: interfaz React básica
El sistema MUST mostrar una interfaz React básica para ingresar operandos, seleccionar una operación y ver el resultado.

#### Scenario: cálculo desde la interfaz
- **GIVEN** la interfaz React está visible
- **WHEN** el usuario ingresa valores y ejecuta una operación
- **THEN** el resultado se muestra en pantalla

### Requirement: pruebas mínimas
El sistema MUST incluir pruebas mínimas que validen las operaciones de la calculadora.

#### Scenario: validación automática
- **GIVEN** el código fuente de backend y frontend
- **WHEN** se ejecutan las pruebas automatizadas
- **THEN** se validan al menos una operación correcta y un caso de error
