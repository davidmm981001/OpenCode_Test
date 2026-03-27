## Context

HU-01 ya dispone de plataforma runnable con FastAPI, React, PostgreSQL y Redis. El alcance actualizado exige sumar ejecución asíncrona con Celery y manejo de workspace efímero por corrida para sentar base de procesamiento batch sin contaminar el sistema de archivos.

## Goals / Non-Goals

**Goals:**
- Integrar Celery con broker Redis en la plataforma base.
- Exponer salud integrada que incluya estado de workers Celery.
- Implementar workspace efímero por corrida en worker con limpieza automática.
- Mantener configuración por `.env` y arranque local reproducible.

**Non-Goals:**
- Implementar lógica de modernización COBOL/JCL o parser multiarchivo avanzado.
- Construir scheduler complejo de colas o autoscaling dinámico.
- Persistir artefactos finales de corrida fuera del scope HU-01.

## Decisions

- Se usa Celery con Redis como broker y backend de resultados para minimizar complejidad de infraestructura en V1.
  - Alternativa: RabbitMQ + Redis.
  - Descarte: agrega superficie operativa no necesaria para HU-01.
- El estado de Celery se verifica con `inspect ping` del app Celery desde backend.
  - Alternativa: health endpoint separado en worker.
  - Descarte: duplica rutas y complica observabilidad inicial.
- El workspace efímero se crea bajo un directorio raíz configurable (`RUN_WORKSPACE_ROOT`) usando `run_id`.
  - Alternativa: usar `/tmp` no configurable.
  - Descarte: dificulta trazabilidad y control entre entornos.
- Se agrega servicio de worker en `docker-compose.yml` con escala configurable por variable de entorno.
  - Alternativa: procesos locales manuales.
  - Descarte: menor reproducibilidad para validación de aceptación.

## Risks / Trade-offs

- [Riesgo] Inspección de workers puede fallar por latencia de arranque -> Mitigación: timeout acotado y estado degradado explícito.
- [Riesgo] Residuos de archivos por errores no controlados -> Mitigación: bloque `try/finally` obligatorio en tarea de worker.
- [Trade-off] Redis concentra broker y result backend -> Mitigación: configuración abierta para separar en HUs futuras.

## Migration Plan

1. Extender configuración backend con variables de Celery y workspace.
2. Implementar app Celery, tarea base de corrida y limpieza efímera.
3. Ampliar `/health` para reportar estado de Celery.
4. Ajustar frontend, `.env.example`, `docker-compose` y documentación.
5. Validar estrictamente OpenSpec, levantar stack y ejecutar pruebas de integración HU-01.

## Open Questions

- Ninguna bloqueante para esta sub-HU.
