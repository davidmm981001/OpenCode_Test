## ADDED Requirements

### Requirement: Gestion de proyectos y corridas
El sistema MUST permitir crear y gestionar proyectos de modernizacion, y dentro de cada proyecto ejecutar corridas versionadas con identificador `run_id` con formato `run_<yyyyMMdd_HHmmss>_<8hex>`.

#### Scenario: Creacion de corrida valida
- **WHEN** un usuario inicia una corrida sobre un proyecto con snapshot valido
- **THEN** el sistema crea `run_id`, registra estado `RUNNING` y persiste la corrida con timestamps por etapa

#### Scenario: Navegacion por lista de proyectos
- **WHEN** el usuario selecciona un proyecto desde la lista de proyectos en la UI
- **THEN** la plataforma cambia el contexto al proyecto seleccionado y muestra sus corridas asociadas

### Requirement: Validacion de entradas por corrida
El sistema MUST exigir por corrida al menos 1 archivo `.cbl` o `.cob` y al menos 1 archivo `.bms`, admitir `.cpy` opcional, validar extensiones permitidas, aplicar limites configurables y rechazar duplicados por checksum.

#### Scenario: Corrida rechazada por archivos insuficientes
- **WHEN** el usuario intenta iniciar corrida sin al menos un COBOL y un BMS
- **THEN** el sistema no inicia la corrida y devuelve error de validacion explicito

#### Scenario: Rechazo por maximo de archivos excedido
- **WHEN** la carga supera `MAX_RUN_FILES`
- **THEN** el sistema cancela inicio de corrida e informa cantidad intentada y limite vigente

### Requirement: Normalizacion de encoding en INGEST
El sistema MUST normalizar automaticamente a UTF-8 cualquier archivo con encoding legacy incompatible antes de continuar el pipeline y registrar warning informativo por archivo convertido en `run_report.json`.

#### Scenario: Archivo con encoding legacy
- **WHEN** INGEST detecta un archivo no UTF-8
- **THEN** convierte a UTF-8, persiste fuente normalizada en snapshot y registra warning sin detener el pipeline

### Requirement: Manejo de validacion por archivo
El sistema MUST registrar errores de validacion por archivo y evitar iniciar corrida si la validacion critica global no se cumple.

#### Scenario: Archivo excede tamano maximo
- **WHEN** un archivo supera `MAX_SOURCE_FILE_MB`
- **THEN** el sistema rechaza ese archivo con mensaje de tamano real vs limite y no inicia corrida si invalida los minimos requeridos
