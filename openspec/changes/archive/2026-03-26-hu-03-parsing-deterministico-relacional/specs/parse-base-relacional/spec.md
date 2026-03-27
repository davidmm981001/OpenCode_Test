## ADDED Requirements

### Requirement: Parse base multiarchivo unificado
El sistema SHALL ejecutar un parse base determinístico sobre archivos COBOL/BMS/CPY/JCL de un snapshot para producir un modelo relacional unificado.

#### Scenario: Ejecución de parse base por snapshot
- **WHEN** una persona usuaria solicita análisis relacional de un snapshot existente
- **THEN** el sistema analiza todas las fuentes del snapshot como sistema único
- **AND** genera un resultado relacional consolidado en una sola corrida

### Requirement: Soporte base de constructos mainframe
El sistema MUST identificar constructos base de programa, copybooks, llamadas y jobs para habilitar trazabilidad inter-archivo.

#### Scenario: Identificación de entidades núcleo
- **WHEN** el parser procesa fuentes válidas
- **THEN** detecta entidades de programas COBOL, copybooks, mapas BMS y pasos JCL
- **AND** expone estas entidades en el artefacto relacional resultante
