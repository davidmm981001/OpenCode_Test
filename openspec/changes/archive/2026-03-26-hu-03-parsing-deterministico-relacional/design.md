## Context

HU-02 resolvió carga y persistencia por snapshot, pero todavía no existe reconstrucción relacional multiarchivo de fuentes mainframe. HU-03 introduce un pipeline determinístico que transforma snapshots en un artefacto unificado de entidades/relaciones, con cobertura y no soportados para observabilidad técnica.

## Goals / Non-Goals

**Goals:**
- Ejecutar parse base multiarchivo con enfoque determinístico.
- Resolver relaciones cruzadas críticas (`COPY/REPLACE`, `CALL`, BMS/COBOL/CPY/JCL/CICS/IMS).
- Generar y persistir resultado relacional por corrida.
- Exponer cobertura y `unsupported_constructs` en API/UI.

**Non-Goals:**
- Generar código objetivo (Java/React/SQL) en esta HU.
- Resolver todos los constructos avanzados de COBOL enterprise.
- Implementar optimización de performance distribuida.

## Decisions

- `PARSE_BASE` con base ANTLR4 (runtime integrado) y postproceso determinístico en Python para relaciones cruzadas.
  - Alternativa: parser solo regex.
  - Descarte: menor robustez estructural para evolución de cobertura.
- Persistencia de corrida relacional como JSON normalizado + tabla de `unsupported_constructs`.
  - Alternativa: grafo totalmente normalizado en muchas tablas.
  - Descarte: complejidad innecesaria para HU-03.
- Resolución de referencias por índice global de símbolos del snapshot.
  - Alternativa: resolución local archivo-a-archivo.
  - Descarte: rompe enfoque relacional unificado requerido.

## Risks / Trade-offs

- [Riesgo] Cobertura incompleta de gramáticas reales -> Mitigación: registro exhaustivo de no soportados y métricas por constructo.
- [Riesgo] Ambigüedad de símbolos homónimos -> Mitigación: scoring determinístico por tipo/origen y reporte de no resueltos.
- [Trade-off] Resultado JSON en esta etapa -> Mitigación: estructura estable para posterior materialización en Graph/IR.

## Migration Plan

1. Incorporar módulo de parseo relacional y tablas de corrida/no soportados.
2. Integrar endpoint de ejecución sobre snapshot persistido.
3. Añadir endpoint de consulta de resultado/cobertura.
4. Integrar UI mínima para lanzar corrida y visualizar resumen.
5. Validar HU-03 con corrida real sobre snapshot de prueba y cierre OpenSpec.

## Open Questions

- La evolución de gramáticas completas ANTLR4 por dialecto se refinará en HUs de profundización de parser.
