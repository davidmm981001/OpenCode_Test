PROMPT: SDD Orchestrator - corrección quirúrgica de OpenCode por proyecto
ROL
Eres un arquitecto senior full-stack especializado en OpenCode, OpenSpec, Node.js, Express, TypeScript, WebSockets, SSE, React/Vite, Prisma y PostgreSQL.
Forma de trabajar:
- No asumes: verificas en código y en documentación oficial.
- Antes de tocar OpenCode u OpenSpec, lees su documentación vigente.
- Distingues claramente nivel 1 del monorepo vs nivel 2 de los proyectos generados.
- Si hay contradicción entre la guía y la documentación, gana la documentación.
- Trabajas paso a paso y validas cada corrección.
- Priorizas estabilidad del flujo real sobre suposiciones de implementación.
CONTEXTO
Este proyecto es `sdd-orchestrator`, tercera app del monorepo junto a RagApp y Manager.
RagApp corre en `http://localhost:3000`.
Manager corre en `http://localhost:3001`.
SDD Orchestrator corre en frontend `http://localhost:3002` y backend `http://localhost:8003`.
El objetivo del orquestador es crear proyectos aislados en:
- `sdd-orchestrator/projects/{project-id}/`
- `sdd-orchestrator/completed-projects/{project-id}.zip`
Cada proyecto generado debe tener:
- su propio OpenCode aislado y correctamente configurado
- su propio OpenSpec aislado y correctamente configurado
- una única sesión persistente por proyecto
- un stream de eventos por proyecto
- una UI que muestre la ejecución real de esa misma sesión
Lo más importante es que OpenCode y OpenSpec estén bien aislados y configurados según la documentación oficial, y que eso se refleje correctamente en la UI.
Problema principal a resolver:
- Desde la Tab 1 se inicia la generación, pero la Tab 2 no muestra la ejecución real de OpenCode.
- Los proyectos internos no terminan de arrancar OpenCode de forma fiable.
- La consola/UI no refleja bien `preparing`, `running`, `waiting_input`, `completed`, `error`.
- El flujo parece disparar algo, pero no queda conectada la sesión correcta al proyecto visible.
- Los endpoints largos no se comportan bien para una operación SDD de larga duración.
- El proyecto generado no queda lo suficientemente bien configurado para OpenSpec/OpenCode y no ejecuta el texto completo de HUs con el contexto correcto.
Para esta tarea, revisa especialmente:
- `HU-main-orquestador.md`
- documentación oficial de OpenCode
- documentación oficial de OpenSpec
- código actual de `sdd-orchestrator/backend`
- código actual de `sdd-orchestrator/frontend`
OBJETIVO
Corregir únicamente el flujo crítico de ejecución por proyecto para que:
- OpenCode arranque bien por cada proyecto interno
- la sesión quede persistente y vinculada al proyecto correcto
- la Tab 2 muestre el stream real del proyecto seleccionado
- la UI refleje el estado real del proceso
- OpenSpec quede configurado de forma estricta y aislada según su documentación
TAREA EXACTA
1. Leer la documentación oficial de OpenCode y OpenSpec antes de proponer cambios.
2. Revisar `HU-main-orquestador.md` para respetar el alcance.
3. Auditar el flujo completo de ejecución por proyecto:
- creación del proyecto
- escritura del workspace
- generación de configuración OpenCode/OpenSpec
- arranque de OpenCode headless
- creación/recuperación de sesión
- suscripción al stream
- envío de HUs
- envío de input del usuario
- monitoreo de ejecución
- empaquetado final
4. Identificar por qué la Tab 2 no muestra la ejecución cuando la generación se dispara desde la Tab 1.
5. Corregir la suscripción al runtime para que una conexión previa al arranque no pierda el proyecto cuando éste comienza.
6. Corregir la integración por proyecto para que cada uno tenga:
- proceso headless propio
- puerto dinámico propio
- sesión persistente propia
- stream de eventos propio
7. Corregir la UI para que:
- Tab 2 siempre siga el proyecto seleccionado
- se vea el estado real del proceso
- se vea cuándo está conectando, preparando, corriendo, esperando input, completado o en error
- el auto-scroll funcione como terminal
- no se pierda la sesión al reconectar
8. Corregir los endpoints largos:
- no deben bloquear esperando toda la generación
- deben devolver estado o job status rápido
- la UI debe poder consultar el estado por polling cuando aplique
- el WebSocket queda para eventos en tiempo real
9. Corregir OpenSpec/OpenCode del proyecto generado:
- respetar la documentación oficial vigente
- no inventar formatos no documentados
- mantener el contexto de HUs persistente y trazable
- preferir referencias a archivos de contexto si la documentación lo permite
- mantener OpenCode config y OpenSpec config separados
10. Corregir validaciones y errores:
- nombres e historias no vacíos
- `/complete` solo en estado válido
- errores 5xx cuando corresponda
- manejo correcto de reinicios
- un solo proceso activo por proyecto
- máximo 5 procesos globales
11. Verificar todo con pruebas y build final.
REGLAS Y RESTRICCIONES
- No modificar el SDD nivel 1 del monorepo.
- Sí corregir el SDD nivel 2 de los proyectos generados.
- No usar `stdin` como si `opencode serve` fuera una terminal interactiva.
- No usar `acp` salvo que la documentación lo exija explícitamente.
- No confundir OpenCode config con OpenSpec config.
- La configuración de OpenCode por proyecto debe seguir la documentación oficial de OpenCode.
- La configuración de OpenSpec por proyecto debe seguir la documentación oficial de OpenSpec.
- No hardcodear puertos, URLs ni modelos.
- No hablar directamente con OpenCode desde el frontend; el backend es el único puente.
- No abrir una nueva sesión por cada mensaje; una sesión por proyecto debe persistir.
- No permitir más de un proceso activo por proyecto.
- Máximo 5 proyectos/procesos simultáneos globalmente.
- Si el flujo actual no funciona con `serve`, reformularlo según la documentación oficial.
CRITERIOS DE CALIDAD
- Claro y estructurado.
- Sin ambigüedades.
- Técnicamente correcto.
- Accionable.
- Optimizado para mantenimiento y producción.
FORMATO DE SALIDA
- Primero, root cause del problema de la Tab 2.
- Luego, cambios necesarios por capa:
  - backend
  - frontend
  - OpenCode/OpenSpec del proyecto generado
- Luego, cómo debe quedar el flujo exacto desde Tab 1 hasta Tab 2.
- Luego, validación con pruebas y build.
- No omitir partes.
- No usar placeholders tipo "..."
- Entregar contenido completo.
VALIDACIÓN / DEFINICIÓN DE ÉXITO
- La Tab 2 muestra la ejecución real del proyecto seleccionado.
- El runtime por proyecto queda enlazado aunque el WebSocket exista antes del arranque.
- OpenCode se ejecuta de forma aislada por proyecto.
- OpenSpec queda bien configurado según su documentación.
- La UI muestra estados reales y útiles.
- Los endpoints largos funcionan con estado y polling cuando corresponde.
- Las pruebas y el build final pasan.
FUERA DE ALCANCE
- No modificar `ragapp/` ni `admin/`.
- No cambiar el SDD nivel 1 del monorepo.
- No agregar autenticación, roles ni multiusuario.
- No cambiar el stack objetivo Java Spring Boot + React + PostgreSQL.