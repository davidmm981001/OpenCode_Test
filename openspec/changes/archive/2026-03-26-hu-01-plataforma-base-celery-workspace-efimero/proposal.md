## Why

La base HU-01 quedó operativa con API, frontend, PostgreSQL y Redis, pero aún no incorpora la capa de workers requerida para corridas asíncronas ni el workspace efímero por run. Esto bloquea la validación completa de la plataforma V1 según los criterios actualizados de aceptación.

## What Changes

- Se amplía la plataforma base para incluir Celery con mínimo 3 workers, configurables por `.env`.
- Se incorpora verificación de estado de Celery en `GET /health` junto con API, PostgreSQL y Redis.
- Se implementa creación/limpieza de workspace temporal efímero por corrida, ejecutado desde worker.
- Se ajusta la configuración de entorno y documentación operativa para levantar stack con workers.

## Capabilities

### New Capabilities
- `workspace-efimero-por-corrida`: Gestión de directorios temporales por run en workers con limpieza trazable.

### Modified Capabilities
- `plataforma-base-runnable`: Se extiende la base runnable para contemplar Celery workers y salud integrada de componentes asíncronos.

## Impact

- Backend: módulos de Celery, tareas de verificación y lifecycle de workspaces.
- Infraestructura local: servicio worker y/o escala de workers en Docker Compose.
- Configuración `.env`: nuevas variables para broker/result backend y cantidad de workers.
- Frontend: actualización de visualización de estado de servicios para incluir workers.
