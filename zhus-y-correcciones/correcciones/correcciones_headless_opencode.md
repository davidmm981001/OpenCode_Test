PROMPT: Corrección profunda del SDD interno de OpenCode por proyecto en SDD Orchestrator
ROL
Eres un arquitecto senior full-stack especializado en:
OpenCode headless/server, sesiones persistentes y eventos en tiempo real
OpenSpec estricto y generación correcta de artefactos SDD
Node.js, child_process, WebSockets y SSE
React + Vite + TypeScript para UIs operativas y responsivas
Prisma, PostgreSQL y robustez de backend
Orquestación de procesos por proyecto con aislamiento real
Forma de trabajar:
No asumes información; la verificas en la documentación oficial y en el código
Explicas decisiones cuando afectan arquitectura o comportamiento
Trabajas paso a paso cuando la corrección cruza varios módulos
Priorizas claridad, precisión, estabilidad y observabilidad
Si algo no está definido, lo declaras explícitamente y eliges la opción más segura
CONTEXTO
Existe un monorepo con tres apps:
- `ragapp` en `http://localhost:3000`
- `admin` en `http://localhost:3001`
- `sdd-orchestrator` en `http://localhost:3002` frontend y `http://localhost:8003` backend
Este cambio se refiere exclusivamente al nivel 2 de SDD:
- el OpenSpec/OpenCode interno de cada proyecto generado dentro de `sdd-orchestrator`
No se debe confundir con el nivel 1:
- la forma en que `sdd-orchestrator` fue construido como app de plataforma
La fuente de contexto y alcance del producto es:
- `HU-main-orquestador.md`
La guía adicional que sirve como referencia de arquitectura es:
- un servidor OpenCode por proyecto
- una sola sesión persistente por proyecto
- un registry central `projectId -> { serverHandle, client, sessionId, logBuffer, status }`
La documentación oficial de OpenCode es la fuente de verdad técnica:
- `opencode serve` es el modo headless correcto para integración por HTTP
- la configuración de OpenCode es `opencode.json` o `opencode.jsonc`, ubicada en la raíz del proyecto
- `config.yaml` pertenece a OpenSpec, no a OpenCode
- el stream documentado es `GET /event`
- la interacción con sesiones se hace con `POST /session`, `POST /session/:id/prompt_async`, `POST /session/:id/message`, `GET /session/:id/message`
- `opencode acp` es stdio/nd-json para ACP, no el flujo objetivo de este producto
- la UI debe proyectar el progreso de la sesión por proyecto, no inventar una consola por stdin crudo
La consola visible en el UI debe representar el flujo del proyecto OpenCode:
- transcript de sesión
- eventos de estado
- salida relevante del servidor
- input del usuario hacia la misma sesión persistente
OBJETIVO
El objetivo es corregir el flujo SDD interno de cada proyecto generado para que:
- se configure correctamente su workspace
- se arranque un OpenCode headless por proyecto
- exista una sola sesión persistente por proyecto
- la consola del proyecto se proyecte en el UI en tiempo real
- el usuario pueda enviar mensajes a esa sesión desde el UI
- OpenSpec se genere con formato válido y contexto correcto
- el LLM monitoree la finalización con `gpt-5.4-mini`
- el resultado pueda empaquetarse y descargarse correctamente
TAREA EXACTA
Debes:
1. Revisar la documentación oficial de OpenCode y usarla como base técnica.
2. Revisar `HU-main-orquestador.md` para mantener el alcance correcto.
3. Corregir la integración OpenCode del nivel 2 para que cada proyecto tenga:
   - su propio proceso headless
   - su propio puerto dinámico
   - su propia sesión persistente
   - su propio stream de eventos
4. Corregir la forma en que se envían y muestran las historias de usuario:
   - el proyecto debe iniciar con el bloque completo de HUs
   - la UI debe mostrar el progreso de esa misma sesión
   - el input del usuario debe ir a esa misma sesión
5. Corregir la generación de OpenSpec del proyecto interno:
   - no concatenar YAML a mano
   - generar un `config.yaml` válido según la documentación de OpenSpec
   - preservar indentación y estructura correctas
   - incrustar las HUs como contexto persistente sin romper el formato
   - si OpenSpec permite referenciar un archivo de contexto, preferir eso antes que incrustar texto crudo gigantesco
6. Corregir las rutas del workspace del proyecto:
   - `sdd-orchestrator/projects/{project-id}/`
   - `sdd-orchestrator/completed-projects/{project-id}.zip`
7. Corregir la comunicación frontend-backend:
   - la UI debe conectarse al backend correcto
   - la conexión en tiempo real debe ser por proyecto
   - no debe abrirse una nueva conexión por cada mensaje del usuario
8. Corregir el modelo de consola:
   - la consola debe basarse en la sesión y eventos de OpenCode
   - el `stdout/stderr` del child process solo debe servir para diagnóstico del servidor, no como transcript principal del proyecto
9. Corregir el monitoreo LLM:
   - modelo fijo `gpt-5.4-mini`
   - usar las últimas 200 líneas o eventos relevantes de la sesión
   - no repetir prompts en bucle
   - pedir confirmación del usuario antes de empaquetar
10. Corregir validaciones y errores:
   - nombres e historias no vacíos
   - errores de servidor como 5xx cuando corresponda
   - `/complete` solo cuando el proyecto esté en estado válido
   - manejo correcto de reinicios
11. Mejorar la UI:
   - estados claros de cargando, conectando, running, waiting input, completed, error
   - scroll automático tipo terminal
   - re-conexión al proyecto sin perder la sesión
   - mensajes útiles cuando OpenCode no arranca o la configuración falla
12. Verificar todo con pruebas y build final.
REGLAS Y RESTRICCIONES
- El SDD nivel 1 de `sdd-orchestrator` no se modifica
- El SDD nivel 2 sí se corrige: es el de los proyectos generados
- No usar `stdin` como si `opencode serve` fuera una terminal interactiva
- No usar `acp` salvo que la documentación lo exija explícitamente
- No confundir OpenCode config con OpenSpec config
- La configuración de OpenCode por proyecto debe ser `opencode.json` o `opencode.jsonc` en la raíz del proyecto generado
- OpenSpec puede usar `config.yaml` si su documentación lo requiere, pero ese archivo es solo para OpenSpec
- No hardcodear puertos, URLs ni modelos
- No generar YAML por concatenación manual
- No hablar directamente con OpenCode desde el frontend; el backend es el único bridge
- No abrir una nueva sesión por cada mensaje; una sesión por proyecto debe persistir
- No permitir más de un proceso activo por proyecto
- Máximo 5 proyectos/procesos simultáneos globalmente
- Si la documentación contradice la guía, la documentación gana
- Si el flujo propuesto no funciona con `serve`, reformularlo según la documentación oficial
CRITERIOS DE CALIDAD
La respuesta/cambio debe ser:
Clara y estructurada
Técnicamente correcta
Accionable
Sin ambigüedades innecesarias
Optimizada para operación local estable y depuración real
FORMATO DE SALIDA
La respuesta debe incluir:
1. Diagnóstico de causa raíz
2. Lista priorizada de bugs y desalineaciones con la documentación
3. Propuesta de corrección por módulo o archivo
4. Decisión técnica final sobre el modo correcto de OpenCode para este caso
5. Pruebas ejecutadas y resultados
6. Riesgos o pendientes, si quedan
VALIDACIÓN / DEFINICIÓN DE ÉXITO
Se considera correcto si:
- Cada proyecto genera un workspace válido en `sdd-orchestrator/projects/{project-id}/`
- Cada proyecto tiene una sola sesión persistente de OpenCode
- La UI muestra el progreso real de esa sesión por proyecto
- El usuario puede enviar mensajes al proyecto correcto desde el UI
- El `opencode.json` por proyecto es válido y respeta la documentación de OpenCode
- El `config.yaml` por proyecto es válido y respeta la documentación de OpenSpec
- El modelo de monitoreo es `gpt-5.4-mini`
- El proyecto se puede completar y descargar como ZIP
- La app corre localmente sin desalineación de puertos o websockets
- Las pruebas y el build pasan
FUERA DE ALCANCE
No incluir:
- autenticación o roles
- multiusuario
- deploy cloud o CI/CD
- integración funcional con `ragapp` o `admin`
- cambios de stack
- edición del código generado desde la UI
- reanudación de procesos tras reinicio del servidor
- cambios al SDD nivel 1 de la plataforma
NOTAS ADICIONALES
Antes de implementar, revisar:
- `HU-main-orquestador.md`
- documentación oficial de OpenCode sobre:
  - `serve`
  - `opencode.json` / `opencode.jsonc`
  - `prompt_async`
  - `message`
  - `event`
  - `session`
  - `models`
- OpenSpec, para confirmar el formato correcto de su `config.yaml` y la forma más segura de inyectar contexto persistente
Importante:
- cuando se diga “consola” en este prompt, se refiere a la consola proyectada del proyecto OpenCode, no a un stdin crudo del proceso
- el backend API debe ser la única que conversa con OpenCode
- el frontend solo consume el backend por REST/WebSocket
- una sesión persistente por proyecto es obligatoria
- el stream de la UI debe poder rehidratarse al reconectar usando la sesión y el buffer del backend
- el usuario debe ver el progreso de la misma sesión a lo largo de toda la generación