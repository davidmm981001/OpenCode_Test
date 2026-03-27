## ADDED Requirements

### Requirement: Upload de fuentes permitidas
El sistema MUST aceptar carga de archivos con extensiones `.cob`, `.cbl`, `.cpy`, `.bms`, `.jcl` y paquetes `.zip`.

#### Scenario: Carga directa de archivo permitido
- **WHEN** una persona usuaria carga un archivo con extensión permitida
- **THEN** el sistema valida formato, encoding y tamaño
- **AND** persiste el archivo en el snapshot activo del proyecto

#### Scenario: Carga de paquete zip
- **WHEN** una persona usuaria carga un archivo `.zip`
- **THEN** el sistema expande entradas soportadas de forma segura
- **AND** persiste cada archivo válido dentro del mismo snapshot

### Requirement: Validación determinística de carga
El sistema SHALL aplicar validaciones determinísticas de tamaño máximo, extensión permitida y decodificación de texto antes de persistir.

#### Scenario: Archivo inválido por tamaño o formato
- **WHEN** un archivo excede el límite permitido o tiene extensión no soportada
- **THEN** el sistema rechaza el archivo con mensaje explícito
- **AND** no genera persistencia parcial

#### Scenario: Archivo inválido por encoding
- **WHEN** un archivo de texto no puede decodificarse con la política de encoding configurada
- **THEN** el sistema rechaza la entrada con detalle de error
- **AND** mantiene consistencia del snapshot

### Requirement: Persistencia versionada por snapshot
El sistema MUST persistir fuentes originales por `source_snapshot_version` con independencia del workspace efímero.

#### Scenario: Snapshot persistente independiente
- **WHEN** una corrida o proceso limpia workspaces efímeros de worker
- **THEN** las fuentes originales cargadas permanecen disponibles en almacenamiento persistente
- **AND** pueden ser consultadas por proyecto y versión de snapshot
