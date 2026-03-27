## Why

La plataforma no cuenta con una base técnica ejecutable para iniciar la modernización multiarchivo por etapas. Se requiere una fundación runnable que permita validar integración de frontend, backend, PostgreSQL y Redis desde el primer incremento.

## What Changes

- Se crea una plataforma base V1 con React + Vite para frontend y FastAPI para backend.
- Se incorpora PostgreSQL y Redis como dependencias de infraestructura de ejecución local.
- Se define un endpoint de salud que valida estado de API y conectividad con PostgreSQL/Redis.
- Se establece configuración `.env` base para orquestar servicios locales.
- Se documenta separación explícita entre SDD A (plataforma) y SDD B (proyectos generados), evitando ambigüedad de alcance.

## Capabilities

### New Capabilities
- `plataforma-base-runnable`: Plataforma mínima operativa local con chequeos de salud e integración de servicios base.
- `gobernanza-sdd-a-b`: Marco documental de separación y gobierno entre la plataforma y los proyectos generados.

### Modified Capabilities
- Ninguna.

## Impact

- Código nuevo en frontend, backend y archivos de infraestructura local.
- Introducción de dependencias de runtime para FastAPI, React/Vite, PostgreSQL y Redis.
- Base preparada para ejecutar siguientes sub-HUs sin mezclar alcance funcional.
