# workspace-efimero-por-corrida Specification

## Purpose
TBD - created by archiving change hu-01-plataforma-base-celery-workspace-efimero. Update Purpose after archive.
## Requirements
### Requirement: Creación de workspace temporal por run
El sistema SHALL crear un workspace temporal único por corrida cuando un worker inicia una tarea de procesamiento.

#### Scenario: Creación de workspace aislado
- **WHEN** una corrida es aceptada por el worker
- **THEN** se crea un directorio temporal con identificador único de run
- **AND** el procesamiento de la corrida utiliza únicamente ese workspace

### Requirement: Limpieza automática de workspace temporal
El sistema MUST limpiar el workspace temporal al finalizar una corrida, tanto en éxito como en error controlado.

#### Scenario: Limpieza en finalización exitosa
- **WHEN** una corrida finaliza en estado exitoso
- **THEN** el workspace temporal asociado es eliminado
- **AND** se registra evidencia mínima de cierre de workspace

#### Scenario: Limpieza en finalización con error
- **WHEN** una corrida finaliza con error de procesamiento
- **THEN** el workspace temporal asociado es eliminado
- **AND** se conserva trazabilidad del error sin mantener residuos de archivos

