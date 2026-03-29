PROMPT: SDD Orchestrator - OpenCode inicial no ejecuta la sesión del proyecto
ROL
Eres un arquitecto senior full-stack especializado en:
Node.js y Express
TypeScript
OpenCode
OpenSpec
WebSockets y SSE
React/Vite
Prisma y PostgreSQL
Arquitecturas asíncronas, jobs y workers
Depuración de procesos y runtime orchestration
Forma de trabajar:
No asumes información, la verificas en código o la justificas
Revisas documentación oficial y fuentes externas relevantes antes de codificar
Investigas a fondo issues similares, ejemplos y discusiones técnicas
Explicas decisiones cuando impactan el flujo
Trabajas paso a paso cuando el problema lo requiere
Priorizas claridad, precisión y utilidad práctica
Si algo no está definido, lo declaras explícitamente
CONTEXTO
sdd-orchestrator es la tercera app del monorepo, junto a RagApp y Manager.
- RagApp: http://localhost:3000
- Manager: http://localhost:3001
- SDD Orchestrator frontend: http://localhost:3002
- SDD Orchestrator backend: http://localhost:8003
El sistema tiene dos niveles distintos de OpenCode y esto es crítico:
- Nivel 1: el OpenCode/OpenSpec que existe en el monorepo y/orquestador para construir la plataforma
- Nivel 2: el OpenCode/OpenSpec que se genera y ejecuta dentro de cada nuevo proyecto en sdd-orchestrator/projects/{project-id}/
Regla clave:
- Solo se debe tocar el nivel 2 del SDD.
- No modificar la configuración, estructura ni comportamiento del nivel 1 del monorepo.
El backend crea proyectos en una sola raíz canónica:
- sdd-orchestrator/projects/{project-id}/
- sdd-orchestrator/completed-projects/{project-id}.zip
Cada proyecto generado debe quedar con:
- OpenCode aislado por proyecto
- OpenSpec aislado por proyecto
- una sola sesión persistente por proyecto
- un stream de eventos por proyecto
- UI conectada al runtime correcto
Estado actual observado:
- Al crear un proyecto nuevo y pulsar “Generar aplicación”, el workspace se prepara bien.
- Se genera correctamente la configuración del proyecto.
- OpenCode del proyecto arranca en apariencia, pero no ejecuta realmente la primera tarea/comando del proyecto.
- La UI conectada a ese proyecto se queda en idle.
- No se ve avance real de la sesión del proyecto seleccionado.
- Puede haber un problema de arranque, enlace de sesión, prompt inicial, payload, suscripción, bloqueo por ejecución síncrona o falta de background processing.
- También es posible que este SDD interno por proyecto necesite workers, colas o jobs asíncronos para no bloquear la aplicación principal.
Hechos ya verificados en el código:
- OpenCode usa .opencode/opencode.jsonc.
- OpenSpec usa openspec/.
- La raíz canónica del workspace es sdd-orchestrator/projects/.
- completed-projects/ también vive al mismo nivel que projects/.
- El backend es el único puente entre frontend y OpenCode.
- No se debe usar stdin como terminal interactiva.
- No se debe abrir una nueva sesión por cada mensaje.
- Debe existir un solo proceso activo por proyecto y máximo 5 globales.
Regla importante sobre la primera acción del proyecto:
- La primera instrucción o comando que debe ejecutar el OpenCode de cada proyecto es el texto exacto de las historias de usuario que el usuario ingresó para ese proyecto antes de oprimir “Generar aplicación” en la Tab 1.
- Ese comando se llama únicamente después de que OpenCode y OpenSpec ya quedaron correctamente configurados para ese proyecto específico.
Archivos clave a revisar:
- sdd-orchestrator/backend/src/lib/process-supervisor.ts
- sdd-orchestrator/backend/src/lib/opencode-client.ts
- sdd-orchestrator/backend/src/lib/openSpec.ts
- sdd-orchestrator/backend/src/routes/projects.ts
- sdd-orchestrator/backend/src/server.ts
- sdd-orchestrator/backend/src/services/projects.ts
- sdd-orchestrator/backend/src/lib/workspace.ts
- sdd-orchestrator/backend/src/lib/project-runtime-policy.ts
- sdd-orchestrator/backend/src/lib/serialize.ts
- sdd-orchestrator/backend/src/lib/llm.ts
- sdd-orchestrator/frontend/src/App.tsx
- sdd-orchestrator/frontend/src/api.ts
- sdd-orchestrator/frontend/src/types.ts
- HU-main-orquestador.md
- documentación oficial vigente de OpenCode
- documentación oficial vigente de OpenSpec
- issues de GitHub relacionados
- Stack Overflow y otras fuentes técnicas relevantes
- documentación de WebSocket/SSE y APIs de OpenCode
- patrones de workers, queues y background jobs en Node.js si resultan necesarios
Cosas adicionales que también deben revisarse si afectan este objetivo:
- compatibilidad exacta de la API actual de OpenCode
- formato real del payload de prompt_async
- sessionId correcto y persistente
- baseUrl correcto para cada proyecto
- carreras entre serve, waitForHealth, createSession, sendPrompt, hydrateSessionTranscript y startSseBridge
- rehidratación de sesión después de refresh
- reconexión de WebSocket
- persistencia del snapshot del runtime
- recuperación tras reinicios del backend
- comportamiento en Windows y diferencias de spawn/shell
- si el problema requiere worker, job queue o background task
- si el bloqueo está en el request/response del backend y no en OpenCode en sí
- si el runtime queda vivo pero la UI no lo refleja
- si el proyecto correcto está siendo observado por la Tab 2
- si se está mezclando el runtime del proyecto con el runtime del monorepo
Suposiciones a validar:
- El problema real probablemente está en una de estas capas:
  - el primer prompt no se envía realmente al sessionId correcto
  - la API prompt_async no está recibiendo el payload correcto
  - la sesión se crea pero no se enlaza al proyecto visible
  - la UI está observando un snapshot viejo o un proyecto distinto
  - hay una condición de carrera entre serve, createSession, sendPrompt y la suscripción WebSocket
  - la sesión queda creada pero el runtime nunca sale de idle porque no recibe una tarea inicial efectiva
  - el trabajo interno por proyecto debe correr en background, con workers o una cola asíncrona, para evitar bloquear la app principal
  - la separación entre OpenCode nivel 1 y nivel 2 está mal interpretada o mezclada
OBJETIVO
El objetivo es:
hacer que, al pulsar “Generar aplicación” sobre un proyecto nuevo, OpenCode de ese proyecto específico reciba y ejecute realmente, como primer comando, el texto exacto de las historias de usuario ingresado en la Tab 1, cambie de idle a una sesión activa, y que la UI muestre el estado correcto del runtime seleccionado.
TAREA EXACTA
Debes:
1. Leer la documentación oficial de OpenCode y OpenSpec antes de cambiar nada.
2. Investigar a fondo en internet:
   - documentación oficial
   - GitHub issues
   - discussions
   - Stack Overflow
   - repos o ejemplos relacionados
   - APIs y patrones de OpenCode/OpenSpec
   - patrones de workers, colas asíncronas y background jobs en Node.js si aplican
3. Distinguir claramente entre:
   - OpenCode nivel 1 del monorepo/plataforma
   - OpenCode nivel 2 de los proyectos generados dentro de projects/
4. Confirmar que solo se toca el nivel 2 del SDD.
5. Revisar el flujo completo de arranque:
   - creación del proyecto
   - escritura del workspace
   - configuración de OpenCode/OpenSpec
   - arranque de opencode serve
   - creación de sesión
   - envío del prompt inicial
   - suscripción al stream
   - actualización del snapshot
   - sincronización con la UI
6. Identificar con precisión por qué el proyecto queda en idle.
7. Verificar si el primer prompt se está enviando realmente al sessionId correcto.
8. Verificar si el payload de prompt_async es correcto según la documentación vigente.
9. Verificar si el baseUrl, la sesión o la conexión SSE/WebSocket están apuntando al runtime correcto.
10. Verificar si existe una condición de carrera entre:
    - spawnOpenCodeServe
    - waitForHealth
    - createSession
    - sendPrompt
    - hydrateSessionTranscript
    - startSseBridge
11. Verificar si la ejecución interna de cada proyecto debe correr mediante worker, job queue o background task para no bloquear la aplicación.
12. Corregir el backend para que el proyecto seleccionado realmente reciba trabajo inicial.
13. Corregir la UI para que no se quede mostrando idle cuando el runtime ya está activo o esperando entrada.
14. Verificar el flujo completo en local con un proyecto nuevo.
15. Dejar el sistema listo para probar en local, sin tocar RagApp ni Manager.
REGLAS Y RESTRICCIONES
- No modificar el SDD nivel 1 del monorepo.
- Sí corregir exclusivamente el SDD nivel 2 de los proyectos generados.
- No usar stdin como terminal interactiva para OpenCode.
- No usar acp salvo que la documentación lo exija.
- No confundir openspec/ con .opencode/.
- No confundir OpenCode nivel 1 con OpenCode nivel 2.
- No confundir OpenCode config con OpenSpec config.
- No hardcodear puertos, URLs ni modelos.
- El frontend no debe hablar directo con OpenCode.
- El backend es el único puente.
- Mantener una única sesión persistente por proyecto.
- Mantener un único proceso activo por proyecto.
- Máximo 5 procesos globales simultáneos.
- Si el flujo actual no funciona con serve, reformularlo según la documentación oficial.
- Si hace falta un worker o una cola asíncrona para evitar bloquear la app, evaluarlo e implementarlo de forma justificada.
CRITERIOS DE CALIDAD
La respuesta debe ser:
- Clara y estructurada
- Sin ambigüedades innecesarias
- Accionable
- Técnicamente correcta
- Optimizada para diagnóstico profundo y prueba local
FORMATO DE SALIDA
La respuesta debe incluir:
1. Root cause exacto de por qué la sesión queda en idle
2. Hallazgos de investigación externa relevantes
3. Cambios necesarios por capa:
   - backend
   - frontend
   - OpenCode/OpenSpec del proyecto generado
4. Flujo exacto corregido de principio a fin
5. Validación local y pruebas realizadas
Importante:
- No omitir partes
- No usar placeholders tipo ...
- Entregar contenido completo
VALIDACIÓN / DEFINICIÓN DE ÉXITO
Se considera correcto si:
- El proyecto nuevo ya no queda en idle
- El prompt inicial realmente se ejecuta en el OpenCode del proyecto seleccionado
- La UI refleja el runtime activo y la sesión correcta
- El estado del proyecto cambia de forma visible y real
- La suscripción al runtime funciona aunque el WebSocket exista antes del arranque
- Se verificó la causa con documentación e investigación externa
- El flujo se puede probar localmente de punta a punta
- Si se requiere worker/cola asíncrona, queda implementado o justificado claramente
FUERA DE ALCANCE
No incluir:
- Cambios en RagApp
- Cambios en Manager
- Autenticación o multiusuario
- Cambio del stack objetivo
- Reescritura completa del sistema
- Modificaciones al nivel 1 del SDD
NOTAS ADICIONALES
- Enfócate especialmente en el punto donde se crea la sesión y se envía el primer prompt.
- La primera instrucción que debe ejecutar el OpenCode del proyecto es el texto exacto de las historias de usuario ingresado en la Tab 1.
- Ese comando se llama únicamente después de que OpenCode y OpenSpec ya quedaron correctamente configurados para ese proyecto específico.
- Si detectas que el problema está en el payload de OpenCode, en el sessionId, en el baseUrl, en la sincronización del runtime, en el diseño de nivel 1 vs nivel 2, o en la necesidad de workers/background jobs, corrígelo con precisión.
- Investiga primero, codifica después.
- Busca precedentes reales en issues y ejemplos antes de asumir la causa.
- IMPORTANTE: realiza pruebas extensivas de que esta funcionalidad funcione, para luego correr la app localmente y probarla por el usuario.