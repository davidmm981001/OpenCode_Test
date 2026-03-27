## Context

HU-01 dejó la plataforma runnable con backend, frontend, PostgreSQL, Redis y Celery. HU-02 necesita introducir el baseline funcional para modernización: proyecto como unidad de trabajo y fuentes originales persistidas por snapshot, sin depender del workspace efímero de workers.

## Goals / Non-Goals

**Goals:**
- Exponer CRUD básico de proyectos.
- Habilitar upload validado de fuentes y zip.
- Persistir archivos por `source_snapshot_version` en almacenamiento persistente.
- Mostrar archivos persistidos en Tab Files de la UI.

**Non-Goals:**
- Parsear o transformar fuentes COBOL/JCL en esta HU.
- Implementar control de versiones avanzado con branching.
- Integrar object storage externo en esta etapa.

## Decisions

- Persistencia de fuentes en PostgreSQL (`bytea`) con metadatos por snapshot para simplificar despliegue V1.
  - Alternativa: object storage + metadatos en DB.
  - Descarte en HU-02: mayor complejidad operativa para baseline.
- Snapshot incremental por proyecto (`source_snapshot_version` entero) generado por backend.
  - Alternativa: usar timestamp como versión.
  - Descarte: menor legibilidad y riesgo de colisiones conceptuales.
- Upload zip con extracción en memoria y filtrado por extensiones soportadas.
  - Alternativa: extracción en filesystem temporal.
  - Descarte: más superficie de seguridad y limpieza.
- Validación de texto con fallback de encoding determinístico (`utf-8`, luego `latin-1`).
  - Alternativa: detección heurística compleja.
  - Descarte: no determinista y fuera del alcance.

## Risks / Trade-offs

- [Riesgo] Crecimiento de tamaño en DB por `bytea` -> Mitigación: límite de tamaño por archivo y snapshot.
- [Riesgo] Zip con rutas maliciosas -> Mitigación: ignorar rutas absolutas/parent traversal y normalizar nombres.
- [Trade-off] CRUD básico sin autorización avanzada -> Mitigación: mantener interfaces claras para hardening futuro.

## Migration Plan

1. Crear tablas de proyecto/snapshot/archivo y asegurar inicialización idempotente.
2. Implementar endpoints de proyectos y carga/listado de fuentes.
3. Incorporar validaciones de formato, encoding y tamaño.
4. Construir UI de proyectos + tab Files con upload.
5. Validar HU-02 con pruebas funcionales de proyecto, snapshot y persistencia.

## Open Questions

- En HU futura se evaluará mover payload binario a object storage manteniendo metadatos en PostgreSQL.
