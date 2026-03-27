## ADDED Requirements

### Requirement: Generacion de historias y criterios en etapa STORIES
El sistema MUST convertir `contexto_unificado.json` en `historias_usuario.md` y `criterios_aceptacion.md`, incluyendo historias funcionales y de UI modernizada con trazabilidad por historia.

#### Scenario: Historias descriptivas basadas en evidencia RAG
- **WHEN** el sistema genera historias en `STORIES`
- **THEN** cada historia incluye descripcion funcional detallada, pasos de flujo, impacto UI y referencias de evidencia RAG para evitar inferencias sin soporte

#### Scenario: Historias disponibles antes del fin total de pipeline
- **WHEN** finaliza la etapa `STORIES`
- **THEN** el tab `User Stories` muestra markdown renderizado de historias y criterios sin esperar `DEPLOY_RAILWAY`

### Requirement: Generacion de codigo objetivo en CODEGEN
El sistema MUST generar aplicacion objetivo en `generated/backend`, `generated/frontend` y `generated/db`.

#### Scenario: Estructura generada
- **WHEN** finaliza `CODEGEN`
- **THEN** existen directorios de backend, frontend y migraciones con artefactos iniciales compilables

### Requirement: Quality gate minimo obligatorio
El sistema MUST ejecutar `TEST_GATE` con validaciones minimas: build backend OK, build frontend OK, migraciones aplicables y endpoint `/health` con estado 200.

#### Scenario: Gate en verde
- **WHEN** todas las validaciones tecnicas pasan
- **THEN** `TEST_GATE` queda en success y se habilitan `PUBLISH_GITHUB` y `DEPLOY_RAILWAY`

#### Scenario: Gate en rojo
- **WHEN** alguna validacion falla
- **THEN** la corrida termina en `PARTIAL`, se bloquea publish/deploy y se registran causas en `run_report.json`

### Requirement: Estado global de corrida
El sistema MUST manejar estados globales `RUNNING`, `READY`, `PARTIAL`, `FAILED` y persistir estado/tiempos por etapa.

#### Scenario: Falla en etapa critica
- **WHEN** ocurre error no recuperable en una etapa critica
- **THEN** la corrida cambia a `FAILED` o `PARTIAL` con causa trazable y resumen de logs
