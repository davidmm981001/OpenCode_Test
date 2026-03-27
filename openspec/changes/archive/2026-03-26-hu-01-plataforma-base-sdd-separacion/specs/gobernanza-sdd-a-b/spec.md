## ADDED Requirements

### Requirement: Separacion formal entre SDD A y SDD B
La documentación MUST definir sin ambigüedad la separación entre SDD A (plataforma operativa V1) y SDD B (proyectos generados preconfigurados en V1).

#### Scenario: Delimitación de alcance de plataforma
- **WHEN** se revisa la documentación de arquitectura y gobernanza
- **THEN** se identifica que SDD A cubre infraestructura y capacidades operativas de la plataforma base
- **AND** se explicita que la conversacionalidad operativa de proyectos generados no forma parte de V1

#### Scenario: Delimitación de alcance de proyectos generados
- **WHEN** se revisa la documentación de arquitectura y gobernanza
- **THEN** se identifica que SDD B define estructura y preconfiguración de proyectos generados
- **AND** se evita mezclar responsabilidades con componentes runtime de la plataforma
