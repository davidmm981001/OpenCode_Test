## ADDED Requirements

### Requirement: generación no bloqueante
El sistema MUST iniciar la generación de un proyecto mediante una operación rápida que devuelva estado inicial sin esperar a que OpenCode termine todo el trabajo.

#### Scenario: se presiona Generar Aplicación
- **WHEN** el usuario lanza la generación desde la UI
- **THEN** el backend responde con estado aceptado o en curso
- **AND** el trabajo sigue ejecutándose en background

### Requirement: finalización no bloqueante
El sistema MUST procesar `/complete` como una transición asíncrona hacia empaquetado, sin bloquear hasta que el ZIP quede listo.

#### Scenario: el usuario confirma empaquetado
- **WHEN** el usuario confirma que el proyecto está listo
- **THEN** el backend cambia el estado a empaquetando y responde rápido
- **AND** el empaquetado continúa hasta completar el ZIP

### Requirement: estado consultable por polling
El sistema MUST exponer un estado consultable por polling para generación, ejecución y empaquetado.

#### Scenario: la UI refresca el estado
- **WHEN** la UI consulta el endpoint de estado del proyecto
- **THEN** recibe el estado persistido del proyecto y el snapshot actual del runtime

### Requirement: validaciones y errores explícitos
El sistema MUST rechazar nombres vacíos, historias vacías y confirmaciones inválidas con errores 4xx; los fallos internos deben devolver 5xx.

#### Scenario: el usuario crea o edita un proyecto inválido
- **WHEN** el nombre o las historias llegan vacías
- **THEN** el backend responde con error de validación
- **AND** no persiste un proyecto incompleto

#### Scenario: el usuario intenta completar en un estado inválido
- **WHEN** `/complete` se llama fuera de un estado permitido
- **THEN** el backend responde con conflicto o validación fallida
- **AND** no inicia el empaquetado
