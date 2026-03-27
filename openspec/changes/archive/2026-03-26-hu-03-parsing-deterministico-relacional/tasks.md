## 1. Artefactos SDD del cambio

- [x] 1.1 Completar proposal, specs, design y tasks del delta change HU-03
- [x] 1.2 Ejecutar validación estricta previa del cambio

## 2. Motor de parseo relacional

- [x] 2.1 Implementar módulo PARSE_BASE multiarchivo con base ANTLR4 y extracción determinística de constructos clave
- [x] 2.2 Implementar postproceso de resolución `COPY/REPLACE`, `CALL` y vínculos BMS↔COBOL↔CPY↔JCL/CICS/IMS
- [x] 2.3 Generar artefacto relacional unificado por corrida (entidades + relaciones)

## 3. Persistencia y observabilidad

- [x] 3.1 Crear persistencia de corridas de análisis relacional sobre snapshot
- [x] 3.2 Registrar `unsupported_constructs` con archivo/línea/detalle
- [x] 3.3 Generar y exponer métricas de cobertura por constructo

## 4. API y UI de ejecución

- [x] 4.1 Implementar endpoint para ejecutar análisis relacional por proyecto/snapshot
- [x] 4.2 Implementar endpoint de consulta de resultado relacional y cobertura
- [x] 4.3 Integrar UI mínima para lanzar corrida y visualizar resumen de relaciones/cobertura/no soportados

## 5. Validación funcional y cierre

- [x] 5.1 Ejecutar corrida relacional de extremo a extremo sobre snapshot persistido
- [x] 5.2 Ejecutar validación estricta final del cambio
- [x] 5.3 Archivar HU-03 con criterios de aceptación + DoD cumplidos
