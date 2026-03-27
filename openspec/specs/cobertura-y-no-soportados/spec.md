# cobertura-y-no-soportados Specification

## Purpose
TBD - created by archiving change hu-03-parsing-deterministico-relacional. Update Purpose after archive.
## Requirements
### Requirement: Cobertura por constructo
El sistema SHALL generar reporte de cobertura por constructo analizado para cada corrida relacional.

#### Scenario: Reporte de cobertura disponible
- **WHEN** finaliza una corrida de análisis relacional
- **THEN** el sistema produce métricas por tipo de constructo detectado y resuelto
- **AND** deja el reporte disponible para consulta en API/UI

### Requirement: Registro de no soportados
El sistema MUST persistir `unsupported_constructs` detectados durante el parseo y postproceso.

#### Scenario: Persistencia de constructo no soportado
- **WHEN** el parser encuentra un constructo fuera del soporte actual
- **THEN** registra archivo, línea, tipo de constructo y detalle contextual
- **AND** asocia el registro a la corrida de análisis correspondiente

