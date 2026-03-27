## ADDED Requirements

### Requirement: Tab Files por proyecto y snapshot
La interfaz MUST mostrar una pestaña Files que liste las fuentes persistidas por proyecto y snapshot.

#### Scenario: Visualización de archivos del snapshot
- **WHEN** una persona usuaria selecciona un proyecto con snapshot disponible
- **THEN** la pestaña Files muestra nombre, tipo, tamaño y versión de snapshot de cada archivo

#### Scenario: Refresco tras upload
- **WHEN** una persona usuaria completa una carga válida de fuentes
- **THEN** la pestaña Files se actualiza para reflejar los archivos recién persistidos
