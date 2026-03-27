## MODIFIED Requirements

### Requirement: Persistencia versionada por snapshot
El sistema MUST persistir fuentes originales por `source_snapshot_version` con independencia del workspace efímero y habilitar su análisis relacional determinístico posterior.

#### Scenario: Snapshot persistente independiente
- **WHEN** una corrida o proceso limpia workspaces efímeros de worker
- **THEN** las fuentes originales cargadas permanecen disponibles en almacenamiento persistente
- **AND** pueden ser consultadas por proyecto y versión de snapshot

#### Scenario: Snapshot utilizable para análisis relacional
- **WHEN** una persona usuaria ejecuta análisis relacional sobre un snapshot existente
- **THEN** el sistema utiliza únicamente las fuentes persistidas del snapshot indicado
- **AND** genera una corrida de análisis trazable sin depender del workspace efímero
