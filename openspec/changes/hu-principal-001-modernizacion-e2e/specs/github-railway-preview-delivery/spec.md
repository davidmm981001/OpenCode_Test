## ADDED Requirements

### Requirement: Publicacion automatica en GitHub
Si `TEST_GATE` es verde, el sistema MUST crear un repositorio nuevo `modernized-<project-slug>` usando `GITHUB_TOKEN` y `GITHUB_OWNER`, inicializar rama `main` y hacer commit/push directo a `main`.

#### Scenario: Publicacion exitosa
- **WHEN** inicia `PUBLISH_GITHUB` con credenciales validas
- **THEN** el sistema persiste `github_repo_url`, `github_branch=main` y `github_commit_sha`

### Requirement: Despliegue automatico en Railway
Si `PUBLISH_GITHUB` finaliza con exito, el sistema MUST desplegar a Railway con `RAILWAY_TOKEN`, `RAILWAY_PROJECT_ID` y `RAILWAY_ENVIRONMENT_ID`, y persistir `preview_url_public` HTTPS.

#### Scenario: Deploy listo
- **WHEN** Railway reporta estado listo
- **THEN** `railway_deploy_status=ready` y `preview_url_public` queda disponible para UI

#### Scenario: Deploy fallido
- **WHEN** Railway falla en despliegue
- **THEN** `railway_deploy_status=failed`, se persiste `preview_failure_reason` y `logs_summary`

### Requirement: Preview publico embebible con fallback
El sistema MUST exponer preview publico en iframe dentro del tab `Test Preview`, mostrar fallback "Open in new tab" y detectar bloqueos de framing por politicas de seguridad.

#### Scenario: Iframe bloqueado por headers
- **WHEN** la URL publica no permite `frame-ancestors` del dominio de plataforma
- **THEN** la UI informa la causa y mantiene fallback a nueva pestana

### Requirement: Visibilidad permanente de enlace GitHub
La UI MUST mostrar `github_repo_url` como enlace clickeable en tab `GitHub` y en seccion de preview.

#### Scenario: Repositorio publicado
- **WHEN** la corrida tiene metadatos de publicacion
- **THEN** el usuario puede abrir el repositorio generado desde UI sin pasos adicionales

### Requirement: Modo preview local controlado por configuracion
El sistema MUST soportar modo de preview local cuando `PREVIEW_ENABLED=false` o `PREVIEW_MODE=local`, sin ejecutar `PUBLISH_GITHUB` ni `DEPLOY_RAILWAY`, y exponer una URL local embebible en iframe para validar la corrida.

#### Scenario: Preview local habilitado por flag
- **WHEN** una corrida finaliza `TEST_GATE` con modo local activo
- **THEN** el sistema marca `preview_mode=local`, publica `preview_url_public` local, habilita iframe y deja `PUBLISH_GITHUB/DEPLOY_RAILWAY` en `skipped`

### Requirement: Preview local debe mostrar la app generada
En modo local, el iframe MUST renderizar la aplicacion generada de la corrida (frontend generado y referencias al backend/db generados), no solo un panel de estado.

#### Scenario: Render de app generada en iframe local
- **WHEN** `preview_mode=local` y `PREVIEW_READY=success`
- **THEN** el iframe usa una URL de app generada de la corrida y permite abrirla en nueva pestana

### Requirement: Semantica clara de configuracion de preview
El sistema MUST documentar una semantica explicita para preview: `PREVIEW_MODE=public|local`, manteniendo compatibilidad con `PREVIEW_ENABLED` para no romper entornos existentes.

#### Scenario: Compatibilidad retroactiva
- **WHEN** existe `PREVIEW_ENABLED=false` y no existe `PREVIEW_MODE`
- **THEN** el sistema opera en modo local y lo refleja en metadatos de corrida
