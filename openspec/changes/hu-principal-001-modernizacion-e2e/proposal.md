Seguir estrictamente OpenSpec para implementar esta HU con delta changes siguiendo SDD, generando artefactos OpenSpec concretos (proposal.md, design.md, tasks.md) listos para implementación.

## Why

Necesitamos una plataforma de modernizacion legacy orientada a fidelidad funcional que procese sistemas COBOL/BMS como un todo relacional, no como archivos aislados. El objetivo es transformar fuentes legacy en una app Java Spring Boot + React + PostgreSQL verificable, publicable en GitHub, desplegable en Railway y validable desde la misma plataforma con trazabilidad completa y capacidad de re-modernizacion iterativa.

## What Changes

- Incorporar gestion por proyectos y corridas con snapshot persistido de fuentes normalizadas.
- Implementar ingesta multiarchivo para `.cbl/.cob/.bms/.cpy` con validaciones estrictas, conversion de encoding a UTF-8 y limites configurables.
- Construir analisis relacional multiarchivo obligatorio soportado por RAG COBOL/BMS + skills especializadas.
- Definir pipeline ejecutable de 8 etapas: `INGEST`, `ANALYZE`, `STORIES`, `CODEGEN`, `TEST_GATE`, `PUBLISH_GITHUB`, `DEPLOY_RAILWAY`, `PREVIEW_READY`.
- Generar artefactos por corrida: `contexto_unificado.json`, `historias_usuario.md`, `criterios_aceptacion.md`, `run_report.json`.
- Generar aplicacion objetivo en `generated/backend`, `generated/frontend`, `generated/db` y ejecutar quality gate minimo.
- Publicar en GitHub con `GITHUB_TOKEN`, creando repositorio nuevo `modernized-<project-slug>` y push directo a `main`.
- Desplegar en Railway con `RAILWAY_TOKEN` y habilitar preview publico embebible en iframe con fallback a nueva pestana.
- Habilitar re-modernizacion desde `source_snapshot_version` con comentario normalizado y diff entre corridas.

## Capabilities

### New Capabilities
- `legacy-project-run-management`: Gestion de proyectos/corridas/snapshots y validaciones de entrada.
- `unified-legacy-analysis-rag`: Analisis relacional multiarchivo con RAG COBOL/BMS, skills y control anti-hallucination.
- `modernization-generation-gate`: Generacion de historias/codigo/migraciones y quality gate obligatorio.
- `github-railway-preview-delivery`: Publicacion en GitHub, deploy en Railway y entrega de preview publico embebible.
- `remodernization-and-diff`: Re-modernizacion iterativa con comparacion entre corridas.

### Modified Capabilities
- Ninguna en V1 (no existen capacidades base previas en `openspec/specs`).

## Impact

- Backend: orquestador de corridas, modulo RAG embebido (ChromaDB), integradores GitHub/Railway y persistencia de trazabilidad.
- Frontend: tabs obligatorios (`Overview`, `Files`, `Context`, `User Stories`, `Build & Tests`, `Test Preview`, `GitHub`, `Re-modernize`) con estado global visible y feedback inmediato.
- Datos: entidades para proyectos/corridas/etapas/artifactos, metadatos de trazabilidad y snapshot de fuentes.
- Operacion: variables de entorno obligatorias para modelos, RAG, costos, GitHub, Railway, DB, worker e iframe.
