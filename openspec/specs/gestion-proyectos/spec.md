# gestion-proyectos Specification

## Purpose
TBD - created by archiving change hu-02-gestion-proyectos-carga-fuentes. Update Purpose after archive.
## Requirements
### Requirement: CRUD básico de proyectos
El sistema SHALL permitir crear, listar, consultar, actualizar y desactivar proyectos para organizar fuentes y corridas.

#### Scenario: Crear proyecto
- **WHEN** una persona usuaria envía nombre y descripción válidos
- **THEN** el sistema crea el proyecto con identificador único
- **AND** retorna el proyecto creado con su estado activo

#### Scenario: Listar proyectos
- **WHEN** una persona usuaria consulta el listado de proyectos
- **THEN** el sistema retorna proyectos activos ordenados por fecha de actualización

#### Scenario: Actualizar proyecto
- **WHEN** una persona usuaria actualiza metadatos de un proyecto existente
- **THEN** el sistema persiste cambios de forma consistente
- **AND** retorna el proyecto actualizado

#### Scenario: Desactivar proyecto
- **WHEN** una persona usuaria elimina lógicamente un proyecto
- **THEN** el sistema marca el proyecto como inactivo
- **AND** conserva su historial asociado

