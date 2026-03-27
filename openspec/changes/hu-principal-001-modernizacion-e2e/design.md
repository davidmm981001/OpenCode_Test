## Context

La HU-PRINCIPAL-001 define una modernizacion E2E de sistemas COBOL/BMS con foco en fidelidad funcional y trazabilidad. La solucion debe operar por proyecto y corrida, construir contexto relacional multiarchivo, generar historias y codigo objetivo, y entregar publish/deploy/preview verificable.

Restricciones tecnicas relevantes:
- V1 sin ANTLR4 ni parser formal completo.
- Anti-hallucination obligatorio: evidencia RAG + skills especializadas antes y durante el analisis.
- Arquitectura simple y modular, sin microservicios extra para RAG.
- Publicacion directa a rama `main` en repositorio nuevo por corrida.
- Preview exclusivo en Railway (sin preview local efimero en V1).

## Goals / Non-Goals

**Goals:**
- Ejecutar pipeline determinista por etapas con estados y trazabilidad persistente.
- Garantizar validaciones de entrada, normalizacion UTF-8 y manejo de errores por archivo.
- Construir analisis unificado multiarchivo (`.cbl/.cob/.bms/.cpy`) con RAG y skills.
- Generar app objetivo (Spring + React + PostgreSQL) y gate tecnico minimo.
- Publicar a GitHub y desplegar a Railway automaticamente cuando gate sea verde.
- Exponer preview publico en iframe y soportar re-modernizacion con diff entre corridas.

**Non-Goals:**
- Cobertura total de todos los dialectos legacy en V1.
- Parser formal ANTLR4 en V1.
- Edicion conversacional automatica del repo generado en V1.

## Decisions

### 1) Orquestacion por estado de corrida
Se implementa una maquina de estados de corrida con etapas fijas:
`INGEST -> ANALYZE -> STORIES -> CODEGEN -> TEST_GATE -> PUBLISH_GITHUB -> DEPLOY_RAILWAY -> PREVIEW_READY`.

Razon:
- Evita pasos implícitos y simplifica reintentos parciales.
- Permite observabilidad clara en UI (timeline y estado global).

Alternativas consideradas:
- Orquestacion ad-hoc por scripts encadenados: descartada por baja trazabilidad y mayor fragilidad.

### 2) Snapshot persistido como fuente unica de verdad
Cada corrida persiste archivos normalizados UTF-8 y metadatos (`source_snapshot_version`). Todas las etapas consumen ese snapshot.

Razon:
- Re-modernizacion confiable desde origen inmutable.
- Comparacion corrida-vs-corrida sin depender de estado externo.

Alternativas:
- Leer archivos temporales de upload en cada etapa: descartado por riesgo de inconsistencia.

### 3) Modulo RAG embebido con ChromaDB
Se implementa `rag/` embebido en el backend/worker, persistiendo indice en `RAG_INDEX_PATH`. Se usa `OPENAI_EMBEDDING_MODEL` para indexacion y consulta.

Razon:
- Cumple requisito de simplicidad (sin servicio adicional).
- Permite reutilizacion del indice entre corridas.

Alternativas:
- Vector DB externo administrado: descartado para V1 por complejidad operativa.

### 4) Contrato estricto de evidencia para A1 y A2
Antes de ANALYZE y STORIES se consulta RAG con `top_k >= 8`. Si evidencia insuficiente, se marca `low_confidence` y se registra en `unsupported_or_uncertain`.

Razon:
- Reduce inferencias no sustentadas.
- Alinea anti-hallucination con trazabilidad verificable.

Alternativas:
- Analisis puramente por prompt sin RAG: descartado por riesgo funcional.

### 5) Publicacion y despliegue condicionados por gate
`PUBLISH_GITHUB` y `DEPLOY_RAILWAY` solo ejecutan si `TEST_GATE` es verde.

Razon:
- Evita publicar/desplegar artefactos no validos.
- Mantiene semantica clara de estado `PARTIAL`.

### 6) UI por tabs con contratos de estado y feedback
La UI muestra tabs obligatorios, estado global permanente, timeline por etapa y markdown renderizado para historias.

Razon:
- Trazabilidad operativa y validacion funcional del flujo.
- Reduce ambiguedad para lider tecnico/QA.

### 7) Trazabilidad minima canonica
Se adopta contrato: `source_ref -> context_ref -> story_ref -> target_ref` en todos los artefactos.

Razon:
- Permite auditoria funcional de origen a destino.

## Risks / Trade-offs

- [Cobertura de dialectos legacy incompleta en V1] -> Mitigar con RAG extensivo, skills COBOL y registro explicito de incertidumbre.
- [Costo/latencia por RAG inicial extenso] -> Mitigar con construccion una sola vez y reutilizacion persistida.
- [Fallos de encoding en fuentes heterogeneas] -> Mitigar con normalizacion previa obligatoria y warnings por archivo.
- [Bloqueo iframe por headers de seguridad] -> Mitigar con fallback "Open in new tab" y mensaje de causa.
- [Fallo en APIs externas GitHub/Railway] -> Mitigar con manejo de error por etapa, estado `PARTIAL/FAILED` y logs resumidos.

## Migration Plan

1. Crear modelos y tablas para proyecto/corrida/etapas/artifactos/snapshots.
2. Implementar modulo INGEST con validaciones, checksum, limites y normalizacion UTF-8.
3. Implementar modulo `rag/` (bootstrap + query) y adaptadores para A1/A2.
4. Implementar generadores de `contexto_unificado.json`, `historias_usuario.md`, `criterios_aceptacion.md`.
5. Implementar CODEGEN base y TEST_GATE (backend build, frontend build, migraciones, `/health`).
6. Integrar publish GitHub a `main` y deploy Railway con persistencia de metadatos.
7. Implementar tabs UI obligatorios, timeline, preview iframe y fallback.
8. Implementar re-modernizacion y diff entre corridas.
9. Activar controles de costo (`RUN_COST_LIMIT_USD`, `RUN_STOP_ON_COST_LIMIT`) y observabilidad de warnings/fallos.

Rollback:
- Feature flag por etapa para desactivar publish/deploy si hay incidentes.
- Mantener corrida en `PARTIAL/FAILED` sin borrar artefactos para diagnostico.

## Open Questions

- Estrategia exacta de particion de fuentes para construir RAG extensivo (pipeline batch local o job dedicado de inicializacion).
- Nivel de paralelismo permitido para corridas concurrentes con limites de costo activos.
- Politica de retencion para snapshots y artefactos de corridas historicas.
