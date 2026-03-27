## Why

La plataforma base ya corre, pero no tiene gestión de proyectos ni persistencia de fuentes originales. Sin esta capacidad no existe baseline trazable por snapshot para iniciar corridas de modernización en HU siguientes.

## What Changes

- Se incorpora CRUD básico de proyectos en backend y UI.
- Se habilita carga de fuentes (`.cob`, `.cbl`, `.cpy`, `.bms`, `.jcl`, `.zip`) con validación de formato, encoding y tamaño.
- Se implementa persistencia de fuentes por `source_snapshot_version` en base de datos.
- Se agrega pestaña de archivos (Tab Files) para visualizar fuentes persistidas por snapshot.
- Se garantiza independencia de la persistencia respecto del workspace efímero de workers.

## Capabilities

### New Capabilities
- `gestion-proyectos`: Alta, listado, detalle, actualización y baja lógica de proyectos para organizar corridas.
- `ingesta-fuentes-snapshot`: Ingesta, normalización y almacenamiento versionado de fuentes originales por snapshot.
- `files-tab-visualizacion`: Visualización en UI de archivos persistidos por proyecto/snapshot.

### Modified Capabilities
- Ninguna.

## Impact

- Backend FastAPI: modelos de dominio, endpoints de proyectos y endpoints de upload/listado de fuentes.
- PostgreSQL: tablas para proyectos, snapshots y archivos fuente versionados.
- Frontend React: pantalla para CRUD de proyectos, upload y listado de archivos.
- Configuración: límites de carga y parámetros de validación por `.env`.
