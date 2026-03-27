## Why

Con HU-02 ya existen snapshots persistidos de fuentes, pero aún no hay análisis relacional multiarchivo que reconstruya lógica dispersa como sistema unificado. Sin esta base determinística no se puede avanzar de forma confiable hacia Graph + IR de las HUs siguientes.

## What Changes

- Se incorpora `PARSE_BASE` determinístico para COBOL/BMS/CPY/JCL con base ANTLR4 y postproceso de relaciones cruzadas.
- Se implementa resolución de referencias `COPY/REPLACE`, `CALL`, y vínculos BMS↔COBOL↔CPY↔JCL/CICS/IMS.
- Se genera artefacto relacional unificado por corrida, no por archivo aislado.
- Se añade reporte de cobertura por constructo y registro persistente de `unsupported_constructs`.
- Se expone ejecución de análisis relacional desde backend y visualización resumida en la UI.

## Capabilities

### New Capabilities
- `parse-base-relacional`: Parsing base multiarchivo con salida relacional unificada.
- `resolucion-referencias-cruzadas`: Resolución determinística de símbolos y relaciones entre tipos de fuente.
- `cobertura-y-no-soportados`: Métricas de cobertura por constructo y persistencia de constructos no soportados.

### Modified Capabilities
- `ingesta-fuentes-snapshot`: Se amplía para habilitar ejecución de análisis relacional sobre snapshots persistidos.

## Impact

- Backend: motor de parsing, resolución relacional, endpoints de análisis y persistencia de resultados.
- PostgreSQL: nuevas tablas para corridas de análisis y no soportados.
- Frontend: sección de ejecución/visualización del análisis relacional.
- Dependencias: runtime ANTLR4 para base de parsing.
