## 1. Modelo de dominio de proyecto/corrida

- [x] 1.1 Crear entidades y tablas para proyectos, corridas, etapas, snapshots y artefactos.
- [x] 1.2 Implementar estados globales de corrida (`RUNNING|READY|PARTIAL|FAILED`) y timestamps por etapa.
- [x] 1.3 Implementar generacion de `run_id` con formato `run_<yyyyMMdd_HHmmss>_<8hex>`.

## 2. INGEST y validaciones de entrada

- [x] 2.1 Implementar validacion de extensiones permitidas (`.cbl/.cob/.bms/.cpy`).
- [x] 2.2 Implementar reglas minimas de entrada (>=1 COBOL y >=1 BMS) y limite `MAX_RUN_FILES`.
- [x] 2.3 Implementar validacion de tamano por archivo con `MAX_SOURCE_FILE_MB` y errores por archivo.
- [x] 2.4 Implementar deteccion de duplicados por checksum en corrida.
- [x] 2.5 Implementar normalizacion automatica de encoding a UTF-8 y warnings en `run_report.json`.
- [x] 2.6 Persistir `source_snapshot_version` con fuentes normalizadas.

## 3. Modulo RAG COBOL/BMS

- [x] 3.1 Implementar modulo `rag/` embebido con ChromaDB y persistencia en `RAG_INDEX_PATH`.
- [x] 3.2 Implementar pipeline de bootstrap de RAG cuando no exista indice previo.
- [x] 3.3 Implementar chunking (512/64), embeddings y metadatos de fuente/version.
- [x] 3.4 Implementar `query(text, top_k)` con `top_k >= 8` y filtro `RAG_MIN_SCORE`.
- [x] 3.5 Implementar manejo de evidencia insuficiente (`low_confidence`, `unsupported_or_uncertain`).
- [x] 3.6 Implementar endpoint/UI para cargar fuentes RAG manualmente antes de corrida.

## 4. ANALYZE (A1) y contexto unificado

- [x] 4.1 Integrar skill COBOL obligatoria y skills complementarias en contexto de A1.
- [x] 4.2 Implementar analisis relacional multiarchivo (`.cbl/.cob/.bms/.cpy`) con extracción de relaciones.
- [x] 4.3 Generar `contexto_unificado.json` con contrato completo de campos obligatorios.

## 5. STORIES (A2)

- [x] 5.1 Integrar skill COBOL + contexto RAG para A2.
- [x] 5.2 Generar `historias_usuario.md` con historias funcionales y de UI modernizada.
- [x] 5.3 Generar `criterios_aceptacion.md` verificables por historia.
- [x] 5.4 Exponer historias en UI (`User Stories`) apenas termine la etapa STORIES.

## 6. CODEGEN y TEST_GATE

- [x] 6.1 Implementar generacion de `generated/backend` (Spring Boot).
- [x] 6.2 Implementar generacion de `generated/frontend` (React + Vite).
- [x] 6.3 Implementar generacion de `generated/db` (migraciones PostgreSQL).
- [x] 6.4 Implementar quality gate: build backend, build frontend, migraciones aplicables y `/health` 200.
- [x] 6.5 Bloquear `PUBLISH_GITHUB` y `DEPLOY_RAILWAY` cuando gate falle.

## 7. Publicacion GitHub y deploy Railway

- [x] 7.1 Implementar `PUBLISH_GITHUB` con `GITHUB_TOKEN`, `GITHUB_OWNER`, repo `modernized-<project-slug>` y push a `main`.
- [x] 7.2 Persistir `github_repo_url`, `github_branch`, `github_commit_sha`.
- [x] 7.3 Implementar `DEPLOY_RAILWAY` con `RAILWAY_TOKEN`, `RAILWAY_PROJECT_ID`, `RAILWAY_ENVIRONMENT_ID`.
- [x] 7.4 Persistir `preview_url_public` y metadatos de fallo (`preview_failure_reason`, `logs_summary`) cuando aplique.
- [x] 7.5 Implementar modo `preview local` cuando `PREVIEW_ENABLED=false` o `PREVIEW_MODE=local`, saltando publish/deploy remotos.

## 8. UI/UX obligatoria

- [x] 8.1 Implementar tabs obligatorios de proyecto (`Overview`, `Files`, `Context`, `User Stories`, `Build & Tests`, `Test Preview`, `GitHub`, `Re-modernize`).
- [x] 8.2 Mostrar estado global siempre visible en header y timeline por etapa con estado visual consistente.
- [x] 8.3 Implementar `Test Preview` con iframe Railway, barra superior, fallback "Open in new tab" y enlace a GitHub.
- [x] 8.7 Mejorar UI/UX con layout de mayor calidad y lista navegable de proyectos.
- [x] 8.6 Mostrar en UI el tipo de preview activo (`local` o `public`) con mensaje explicito.
- [x] 8.4 Implementar mensajes de error especificos por etapa y estados de carga explicitos (sin pantalla en blanco).
- [x] 8.5 Validar accesibilidad minima (contraste, foco visible, labels) y responsive desktop/mobile.

## 9. Re-modernizacion y comparacion

- [x] 9.1 Implementar flujo de re-modernizacion desde `source_snapshot_version` con comentario minimo de 10 caracteres.
- [x] 9.2 Normalizar comentario a `funcional`, `tecnico`, `prioridades`, `exclusiones`.
- [x] 9.3 Implementar comparador corrida actual vs anterior (historias, warnings/unsupported, gate/tests, GitHub/preview).

## 10. Operacion, configuracion y DoD

- [x] 10.1 Actualizar `.env.example` con todas las variables obligatorias de modelos, RAG, GitHub, Railway, DB, worker y preview.
- [x] 10.2 Implementar control de costo por corrida (`RUN_COST_LIMIT_USD`, `RUN_STOP_ON_COST_LIMIT`).
- [x] 10.3 Completar `run_report.json` con estado por etapa, gate, costos, warnings y fallos.
- [x] 10.4 Ejecutar pruebas E2E minimas para validar flujo completo `INGEST` a `PREVIEW_READY`.
- [x] 10.5 Ejecutar pruebas de integracion para modo `preview local` y compatibilidad de flags de preview.
