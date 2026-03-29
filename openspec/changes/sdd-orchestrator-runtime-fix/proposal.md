## Why

El flujo de generación por proyecto no mantiene una vinculación confiable entre el proyecto seleccionado, su runtime real y la Tab 2. Esto rompe la trazabilidad de la ejecución, dificulta la reconexión y deja al usuario sin visibilidad del estado real mientras OpenCode trabaja.

## What Changes

- Separar de forma explícita el runtime por proyecto para que cada proyecto tenga una sesión persistente, un stream de eventos propio y un estado sincronizable desde backend y frontend.
- Corregir el flujo de selección y suscripción para que la Tab 2 siga siempre al proyecto activo aunque la conexión exista antes de que arranque el runtime.
- Convertir los endpoints largos de generación y finalización en operaciones rápidas con estado consultable por polling, dejando WebSocket solo para eventos en tiempo real.
- Reforzar la configuración local del proyecto generado para mantener OpenCode y OpenSpec separados, con contexto persistente de historias de usuario y aislamiento por proyecto.
- Endurecer validaciones y transiciones de estado para evitar arranques duplicados, completados inválidos, reinicios inconsistentes y sobrecarga global de procesos.

## Capabilities

### New Capabilities
- `runtime-por-proyecto`: gestión de un runtime aislado por proyecto con sesión persistente, reconexión y stream sincronizado.
- `ui-seguimiento-proyecto`: Tab 2 ligada al proyecto seleccionado, con estados reales, autoscroll y reanudación visual tras reconexión.
- `flujo-asincrono-generacion`: endpoints de generación y finalización con respuesta rápida, estado consultable y polling compatible.
- `configuracion-sdd-generado`: workspace generado con OpenCode y OpenSpec correctamente separados, persistentes y trazables según documentación oficial.

### Modified Capabilities
- None.

## Impact

- Backend Express y supervisor de procesos por proyecto.
- WebSocket de ejecución y contrato de estado expuesto al frontend.
- Pantalla de detalle del proyecto en React/Vite.
- Escritura de workspace generado: `opencode.json`, `.openspec/*`, `user-stories.md` y metadatos asociados.
- Validaciones de concurrencia, reinicio y empaquetado del proyecto generado.
