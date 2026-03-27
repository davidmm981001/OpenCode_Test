## ADDED Requirements

### Requirement: Re-modernizacion desde snapshot original
El sistema MUST iniciar toda re-modernizacion desde `source_snapshot_version` persistido de la corrida base y requerir comentario minimo de 10 caracteres.

#### Scenario: Solicitud valida de re-modernizacion
- **WHEN** el usuario ingresa comentario valido y confirma re-modernizacion
- **THEN** el sistema crea nueva corrida ligada a la corrida anterior reutilizando snapshot original

### Requirement: Normalizacion de comentario de re-modernizacion
El sistema MUST normalizar el comentario en secciones `funcional`, `tecnico`, `prioridades`, `exclusiones` para alimentar la nueva corrida.

#### Scenario: Comentario libre del usuario
- **WHEN** se recibe comentario de re-modernizacion
- **THEN** el sistema genera payload normalizado para A2/A3 y lo persiste en metadatos de corrida

### Requirement: Comparacion entre corridas
El sistema MUST generar comparacion corrida nueva vs corrida previa incluyendo diferencias de historias, cambios de warnings/unsupported, cambios de gate/tests y enlaces actualizados de GitHub/preview.

#### Scenario: Corrida re-modernizada finalizada
- **WHEN** termina la nueva corrida
- **THEN** la UI presenta diff estructurado y trazable entre ambas corridas
