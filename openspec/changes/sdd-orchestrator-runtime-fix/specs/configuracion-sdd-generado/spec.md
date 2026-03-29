## ADDED Requirements

### Requirement: OpenCode por proyecto con configuración separada
El sistema MUST crear en cada proyecto generado una configuración local de OpenCode independiente de la configuración OpenSpec.

#### Scenario: el workspace se inicializa
- **WHEN** se crea un proyecto nuevo
- **THEN** el workspace contiene el archivo de configuración de OpenCode en la raíz del proyecto
- **AND** esa configuración no mezcla el contenido de OpenSpec

### Requirement: OpenSpec por proyecto con contexto persistente
El sistema MUST crear en cada proyecto generado una configuración local de OpenSpec con el contexto de historias de usuario persistido en archivos del workspace.

#### Scenario: el proyecto se prepara para SDD
- **WHEN** se genera el workspace del proyecto
- **THEN** el sistema guarda las historias de usuario en un archivo persistente dentro del proyecto
- **AND** la configuración de OpenSpec referencia ese contexto por ruta de archivo

### Requirement: formato documentado y aislado
El sistema MUST usar únicamente formatos y ubicaciones documentados para OpenCode y OpenSpec, manteniéndolos separados por proyecto.

#### Scenario: el backend regenera la configuración
- **WHEN** el proyecto se renombra o se actualizan las historias
- **THEN** se regeneran los artefactos locales del proyecto sin tocar la configuración del nivel 1 del monorepo
- **AND** cada proyecto conserva sus propios archivos de contexto y cambio

### Requirement: trazabilidad del contexto generado
El sistema MUST dejar trazable qué historias de usuario se usaron para inicializar el proyecto generado.

#### Scenario: un proyecto ya fue creado
- **WHEN** se inspecciona su workspace
- **THEN** existe una referencia persistente al bloque de historias de usuario original
- **AND** esa referencia puede usarse para reconstruir el contexto del proyecto
