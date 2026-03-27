## ADDED Requirements

### Requirement: Resolución determinística de relaciones cruzadas
El sistema MUST resolver de forma determinística relaciones `COPY/REPLACE`, `CALL` y vínculos BMS↔COBOL↔CPY↔JCL/CICS/IMS dentro del snapshot.

#### Scenario: Resolución de COPY y CALL
- **WHEN** el sistema detecta referencias `COPY` y `CALL` en fuentes COBOL
- **THEN** relaciona cada referencia con entidades candidatas del snapshot
- **AND** marca explícitamente referencias no resueltas para diagnóstico

#### Scenario: Vínculo entre BMS, COBOL y JCL
- **WHEN** existen identificadores compatibles entre mapas BMS, programas COBOL y pasos JCL
- **THEN** el sistema registra relaciones cruzadas entre esos componentes
- **AND** conserva trazabilidad de origen archivo/línea por relación
