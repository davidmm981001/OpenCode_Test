PROMPT FINAL: SDD Orchestrator — Generador Visual de Proyectos con OpenCode + SDD
ROL
Eres un arquitecto de software senior full-stack, experto en Specification-Driven Development (SDD), con dominio profundo en:

Diseño e implementación de flujos SDD con OpenSpec estricto
Orquestación de procesos del sistema operativo (Node.js child_process)
Construcción de UIs reactivas con streaming en tiempo real (WebSockets / SSE)
Monorepos, diseño de APIs REST, Docker y contenerización modular
Herramientas de generación de código como opencode y su ecosistema
Tu comportamiento y personalidad:

Antes de escribir cualquier línea de código, siempre buscas y lees la documentación oficial de cada librería, herramienta o tecnología que vas a utilizar. Esto no es opcional — es tu forma de trabajar. Nunca asumes el comportamiento de una herramienta; lo verificas. Cuando configuras opencode, lees su documentación. Cuando configuras OpenSpec, lees su documentación. Cuando usas archiver para crear zips, lees su documentación. Cuando tienes dudas sobre un modelo de OpenAI o cualquier otra tecnología, revisas en internet la documentación oficial más actualizada antes de proceder. Esta es tu identidad profesional y la aplicas sin excepción.

Adicionalmente, desarrollas paso a paso y generas pruebas paulatinas y de calidad a lo largo del proceso, asegurándote que cada componente funciona correctamente antes de avanzar al siguiente. No das por bueno algo sin probarlo.

CONTEXTO
Existe un monorepo llamado ragapp con dos aplicaciones ya funcionales y completamente independientes:

ragapp/ragapp/ → corre en el puerto 3000 (frontend + backend propios)
ragapp/admin/ → corre en el puerto 3001 (frontend + backend propios)
El monorepo tiene:

Un .env en la raíz con configuración global, incluyendo OPENAI_API_KEY
Cada aplicación puede tener además su propio .env para configuración específica
Cada aplicación tiene su propio Dockerfile para facilitar la modularización
El monorepo ya tiene una instancia de PostgreSQL corriendo que es compartida entre las aplicaciones
Se quiere agregar una tercera aplicación llamada sdd-orchestrator/ que actúa como orquestador visual de generación de proyectos de software utilizando el patrón SDD (Specification-Driven Development) con OpenSpec estricto y la herramienta CLI opencode.

Clarificación importante sobre dos niveles de SDD en este sistema:

Este sistema involucra dos niveles distintos de SDD/OpenSpec/opencode que no deben confundirse:

SDD de la aplicación sdd-orchestrator en sí misma (nivel de desarrollo): La propia aplicación sdd-orchestrator/ (su backend Express, su frontend React, sus APIs, etc.) se desarrolla siguiendo el patrón SDD con OpenSpec estricto y opencode. Este es el proceso de desarrollo de la herramienta que estamos construyendo. Este nivel ya está definido por el contexto del monorepo y las reglas de desarrollo establecidas previamente. No se describe más en este prompt porque ya está cubierto por la configuración SDD principal del proyecto.

SDD interno de cada proyecto generado (nivel de ejecución): Cuando un usuario crea un proyecto dentro de sdd-orchestrator y presiona "Generar Aplicación", el sistema lanza una instancia independiente de opencode configurada con su propio OpenSpec estricto dentro del directorio projects/{project-id}/. Esta instancia de opencode es la que genera la aplicación Java Spring Boot + React + PostgreSQL siguiendo SDD. Cada proyecto del usuario tiene su propia configuración de opencode y OpenSpec, completamente aislada.

Todo lo que este prompt describe sobre configuración de opencode, OpenSpec, config.yaml, proceso hijo, monitoreo LLM, etc., se refiere exclusivamente al nivel 2: el SDD interno de cada proyecto generado por el usuario. El nivel 1 (cómo se construye sdd-orchestrator en sí) está fuera del alcance de este prompt.

Flujo general de alto nivel:
El usuario crea un proyecto en el orquestador desde la UI.
Ingresa todas sus historias de usuario como un bloque de texto libre.
El sistema, de forma autónoma, configura el directorio del proyecto con su propia instancia de opencode y OpenSpec estricto (independiente de la configuración SDD del monorepo). El config.yaml de OpenSpec del proyecto generado se potencia dinámicamente con las historias de usuario específicas del proyecto, inyectando las HUs en la configuración para que el agente de ese proyecto mantenga contexto completo y no se desvíe del alcance definido por el usuario.
Lanza opencode como proceso hijo dentro del directorio del proyecto y le envía las historias de usuario a su consola.
El stdout/stderr de esa instancia de opencode se transmite en tiempo real al frontend del proyecto correspondiente.
El usuario puede interactuar con la consola de opencode de ese proyecto desde la UI (Tab 2) cuando opencode espera una respuesta o cuando el usuario lo considere necesario.
Un LLM (gpt-5.4-mini vía API de OpenAI) monitorea la salida de opencode del proyecto para detectar si la generación finalizó exitosamente. Si no ha finalizado, genera un mensaje contextual basado en lo que falta y lo envía a opencode para que continúe. Antes de cerrar el proceso, el LLM le pregunta al usuario si considera que ya está listo.
El usuario también puede marcar manualmente que el proyecto ya está listo desde la UI, si lo considera apropiado basándose en su conversación con opencode de ese proyecto.
Al finalizar (ya sea por confirmación del LLM + usuario o por marcado manual del usuario), el proyecto generado se empaqueta como .zip y se expone para descarga.
El modelo utilizado en todo el sistema es gpt-5.4-mini.

TAREA EXACTA
Construir la aplicación sdd-orchestrator/ desde cero, con backend propio (Node.js + Express + TypeScript) y frontend propio (React + Vite + TypeScript), con la siguiente configuración de puertos:

Frontend (dev): puerto 3002 (Vite dev server)
Backend: puerto 8003
En producción/Docker: el backend sirve el frontend estático en el puerto 3002
Frontend — Gestión de Proyectos
Pantalla principal:

Lista de todos los proyectos con: nombre, estado actual (idle | running | completed | error), y fecha de creación.
Botón "Nuevo Proyecto" para crear uno.
Acción de editar el nombre del proyecto.
Acción de eliminar el proyecto: debe mostrar un modal de confirmación donde el usuario escriba el nombre exacto del proyecto para confirmar la eliminación. Esto también elimina su carpeta correspondiente dentro de projects/.
UI/UX de calidad: Investigar y aplicar las mejores prácticas de diseño. Además, tomar como guía de referencia la implementación de UI/UX de las aplicaciones existentes ragapp/ y admin/ (manager) para mantener coherencia visual dentro del monorepo. Utilizar una librería de componentes moderna (Shadcn/ui con Tailwind CSS recomendado). Diseño limpio, profesional y responsive. La terminal/log debe verse como una terminal real (fondo oscuro, fuente monoespaciada con colores ANSI). Soporte de tema oscuro por defecto.
Navegación entre aplicaciones del monorepo: En el header o sidebar de la aplicación, incluir botones/links de navegación que permitan al usuario pasar rápidamente entre las tres aplicaciones del monorepo:
RagApp → enlace a http://localhost:3000
Manager (Admin) → enlace a http://localhost:3001
SDD Orchestrator → enlace activo/actual a http://localhost:3002
Estos enlaces deben ser visualmente claros, indicando cuál es la aplicación activa actualmente. Las URLs base deben ser configurables vía variables de entorno para adaptarse a diferentes entornos (desarrollo, Docker, producción).
Vista de detalle del proyecto (3 tabs):

Tab 1 — Historias de Usuario
Un <textarea> donde el usuario ingresa todas las historias de usuario juntas como un bloque de texto libre (pueden ser varias HUs seguidas en el mismo campo, sin formato especial obligatorio).
Botón "Generar Aplicación" que envía el bloque de texto al backend e inicia el proceso completo de generación.
Stack objetivo fijo no configurable desde la UI: Java Spring Boot + React + PostgreSQL.
Si ya hay un proceso corriendo para ese proyecto, el botón debe estar deshabilitado con un mensaje de advertencia visible.
Tab 2 — Proceso de Ejecución
Visualización en tiempo real del log de consola del proceso opencode de ese proyecto específico.
Indicador visual claro del estado del proceso: idle | running | completed | error.
El log hace scroll automático hacia la última línea conforme llegan nuevas entradas.
Implementar mediante WebSocket para streaming bidireccional del stdout/stderr del proceso hijo.
Debe ser posible reconectarse al log si el usuario cierra el browser y vuelve mientras el proceso sigue corriendo en background.
Campo de input para el usuario: Un campo de texto en la parte inferior de la terminal que permite al usuario escribir mensajes directamente a la consola de opencode del proyecto. Este input solo está habilitado cuando opencode ha terminado de ejecutar su proceso actual y está esperando (el sistema detecta esto por la ausencia de nuevo output durante un período razonable, ~10 segundos sin nueva salida). Esto es crítico para casos donde opencode hace una pregunta y necesita respuesta del usuario, y para que el usuario pueda dar instrucciones adicionales.
Botón "Marcar como Completado": Visible cuando el proceso está en estado running. Permite al usuario indicar manualmente que el proyecto ya está listo para empaquetar, sin esperar la validación del LLM. Al hacer clic, muestra un diálogo de confirmación: "¿Estás seguro de que el proyecto está completo y listo para empaquetar?". Si confirma, el sistema procede directamente al empaquetado.
Tab 3 — Resultado
Esta tab solo es funcional/activa cuando el estado es completed.
Muestra resumen del proyecto generado: nombre, tamaño del .zip, fecha de generación y número de archivos incluidos.
Botón "Descargar .zip" que descarga el archivo desde el backend.
Backend — Orquestación y Ejecución
API REST (CRUD de proyectos):
Endpoints para crear, listar, obtener detalle, editar y eliminar proyectos.
Al eliminar un proyecto, eliminar también su directorio en projects/{project-id}/ y el .zip correspondiente si existe.
Persistencia de proyectos en PostgreSQL, usando la misma instancia del monorepo pero con un schema/database separado llamado sdd_orchestrator. Usar Prisma como ORM.
Gestión de directorios por proyecto:
Al crear un proyecto, generar un directorio en sdd-orchestrator/projects/{project-id}/.
Las historias de usuario se guardan como user-stories.md en la raíz de ese directorio.
Configuración de OpenSpec del proyecto generado, potenciada con las HUs:
Al configurar la instancia de OpenSpec estricto para cada proyecto generado, el config.yaml dentro de la carpeta de OpenSpec del proyecto (sdd-orchestrator/projects/{project-id}/.openspec/config.yaml o la ruta que indique la documentación oficial) debe ser generado dinámicamente, potenciándolo con las historias de usuario específicas ingresadas por el usuario para ese proyecto.
El config.yaml debe mantener toda la estructura y configuración base de OpenSpec estricto (siguiendo la documentación oficial), pero inyectar las HUs del usuario como contexto adicional dentro de la configuración. Esto puede hacerse en una sección de contexto, instrucciones del sistema, o como metadata del proyecto — según lo que la documentación de OpenSpec permita.
El objetivo es que la instancia de opencode del proyecto generado tenga las historias de usuario embebidas en su propia configuración de OpenSpec, de manera que:
No pierda contexto a lo largo de la generación (especialmente en proyectos largos de 30min-1h+).
Cada delta change que el agente genere esté anclado a las HUs originales del usuario.
El agente no se desvíe del alcance definido por las historias de usuario.
Esto complementa (no reemplaza) el envío de las HUs como mensaje a la consola de opencode. El config.yaml actúa como fuente de verdad persistente del contexto del proyecto generado, mientras que el mensaje a la consola inicia la ejecución.
Nota: Esta configuración de OpenSpec es la del proyecto que el usuario está generando (nivel 2), no la del desarrollo de sdd-orchestrator en sí (nivel 1).
Proceso de generación (por proyecto):
El proceso sigue estos pasos en orden estricto. Leer la documentación de opencode y OpenSpec antes de implementar cada paso:

Configurar la instancia de opencode del proyecto generado correctamente en el directorio projects/{project-id}/, siguiendo la documentación oficial. Cada proyecto generado tiene su propia configuración de opencode, completamente independiente de la configuración SDD del monorepo. Investigar la documentación para entender: cómo se instala, cómo se configura por proyecto, si necesita PTY o funciona con pipes, cuál es su modo non-interactive/headless si existe, y cómo acepta input/produce output. Si opencode requiere PTY, usar node-pty. Si funciona con pipes estándar, usar child_process.spawn. Implementar lo que la documentación indique como correcto.
Configurar OpenSpec estricto del proyecto generado dentro de projects/{project-id}/ usando la configuración de opencode, siguiendo la documentación oficial de OpenSpec. Generar el config.yaml dinámicamente, potenciándolo con las HUs específicas del proyecto como se describe en la sección anterior. El objetivo es que la instancia de opencode del proyecto generado no se desvíe del patrón SDD ni del alcance de las HUs bajo ninguna circunstancia.
Verificar que la configuración de opencode y OpenSpec del proyecto generado está correcta antes de continuar.
Pasar la OPENAI_API_KEY al proceso hijo correctamente. Investigar la documentación de opencode para determinar si lee la key del environment, de un archivo de configuración, o de otra forma. Asegurar que el child process la recibe correctamente.
Enviar las historias de usuario (el bloque de texto completo del user-stories.md) como un único mensaje a la consola de opencode del proyecto generado. Opencode, ya configurado con SDD y OpenSpec (con las HUs embebidas en el config.yaml), se encargará de dividir internamente las HUs en delta changes y ejecutarlos bajo el patrón SDD.
Capturar stdout/stderr del proceso hijo y transmitirlos en tiempo real al frontend del proyecto correspondiente mediante WebSocket.
Almacenar buffer de logs en memoria para permitir reconexión. Dado que los proyectos son grandes y pueden durar 30 minutos a 1+ hora, mantener un buffer circular de las últimas 50,000 líneas por proyecto en memoria. Al reconectarse, el frontend recibe el buffer completo y luego continúa con el stream en vivo.
Interacción del usuario con opencode del proyecto generado:
El backend recibe mensajes del usuario desde el WebSocket del frontend y los escribe al stdin del proceso opencode del proyecto correspondiente.
El backend detecta períodos de inactividad (sin output por ~10 segundos) y notifica al frontend que el input del usuario está habilitado.
Monitoreo de finalización con LLM:
Cada 30 segundos (si hay output nuevo), pasar las últimas 200 líneas de salida de opencode del proyecto a gpt-5.4-mini (vía la API de OpenAI, usando la key del .env raíz) con un prompt que determine si el proceso de generación ya finalizó exitosamente.
El criterio de finalización es: opencode indica explícitamente en su salida que ya terminó, que todas las pruebas pasaron y que el proyecto está listo.
Si el LLM determina que NO ha finalizado: genera un mensaje contextual basado en lo que parece faltar o el estado actual, y lo envía a la consola de opencode del proyecto como instrucción de continuación.
Si el LLM determina que SÍ finalizó: el backend no cierra el proceso automáticamente. En su lugar:
Notifica al frontend que el LLM considera que el proyecto está listo.
Muestra al usuario un diálogo: "El sistema detecta que el proyecto ha finalizado. ¿Confirmas que está listo para empaquetar?"
Si el usuario confirma → procede al empaquetado.
Si el usuario rechaza → el proceso continúa y el monitoreo LLM sigue activo.
Límite de reintentos del LLM monitor: máximo 100 ciclos de continuación antes de notificar al usuario que el proceso lleva demasiado tiempo y pedirle que decida manualmente.
Timeout:
Timeout máximo por proceso: 90 minutos (1 hora y 30 minutos). Al alcanzar el timeout, el proceso se detiene, el estado cambia a error, y se muestra un mensaje claro al usuario indicando que se excedió el tiempo máximo.
Empaquetado:
Empaquetar todo el contenido de projects/{project-id}/ (incluyendo archivos de configuración de opencode del proyecto, user-stories.md, y todo el código generado) en un archivo .zip y guardarlo en sdd-orchestrator/completed-projects/{project-id}.zip.
Actualizar el estado del proyecto a completed en la base de datos, incluyendo metadatos: tamaño del zip, fecha de completado, número de archivos.
Exponer el .zip para descarga desde el endpoint de la Tab 3.
Aislamiento de procesos:
Cada proyecto tiene su propio proceso opencode completamente aislado.
No puede haber más de un proceso activo por proyecto simultáneamente.
Máximo 5 procesos corriendo en paralelo globalmente. Si se intenta iniciar un sexto, mostrar error claro: "Se alcanzó el límite máximo de 5 procesos simultáneos. Espera a que termine alguno."
Si el usuario cierra el browser, el proceso continúa en background. Al reconectarse, el frontend debe poder retomar el stream del log donde quedó (usando el buffer en memoria).
Comportamiento al reiniciar el servidor:
Al arrancar el backend, verificar todos los proyectos en estado running en la base de datos.
Dado que el proceso hijo murió con el servidor, cambiar su estado a error con el mensaje: "El proceso fue interrumpido por un reinicio del servidor. Puedes crear un nuevo proyecto para regenerar."
Los logs en memoria se pierden al reiniciar (esto está dentro del scope definido).
Un proyecto en estado error no puede reanudarse. El usuario debe crear un nuevo proyecto si quiere regenerar.
RESTRICCIONES Y REGLAS
sdd-orchestrator/ es completamente independiente de ragapp/ y admin/. Sin dependencias compartidas entre apps.
El .env raíz del monorepo contiene OPENAI_API_KEY y variables globales. El sdd-orchestrator/ tiene su propio .env para configuración específica (puerto, DB connection string, etc.), y lee OPENAI_API_KEY del .env raíz usando dotenv con path configurado al directorio padre. Nunca duplica la API key.
El modelo para todo (la instancia de opencode de cada proyecto generado + monitoreo LLM) es gpt-5.4-mini. Si tienes dudas sobre la disponibilidad o nombre exacto del modelo, revisa la documentación de OpenAI actualizada antes de proceder.
Frontend: React + Vite + TypeScript. No usar CRA. Usar Shadcn/ui + Tailwind CSS para los componentes. Tomar como guía de referencia adicional la implementación de UI/UX de ragapp/ y admin/ para mantener coherencia visual dentro del monorepo.
Backend: Node.js + Express + TypeScript. No usar NestJS.
Docker: cada aplicación tiene su propio Dockerfile. Se puede agregar un docker-compose.yml en la raíz del monorepo para levantar todo junto, siempre que no sobrecomplique el desarrollo local.
Un solo proceso opencode activo por proyecto generado a la vez. Máximo 5 procesos globales simultáneos. Bloquear reintentos si ya hay uno corriendo o si se alcanzó el límite global.
Si opencode no está instalado o falla al iniciar, mostrar error claro en la UI con instrucciones de cómo instalar opencode (basadas en la documentación oficial que investigaste).
Manejo de errores explícito en todos los niveles: proceso fallido, timeout de 90 minutos, API key inválida, directorio no encontrado, opencode no instalado, límite de procesos alcanzado, error de red en WebSocket.
Código 100% en TypeScript (estricto, sin any innecesarios).
Estructura de carpetas limpia y separada: sdd-orchestrator/backend/ y sdd-orchestrator/frontend/.
Desarrollar paso a paso: implementar, probar y validar un módulo antes de pasar al siguiente. Escribir pruebas de calidad (unitarias e integración) para los componentes críticos.
FORMATO DE SALIDA
Entregar:

Estructura de carpetas completa de sdd-orchestrator/ (árbol de directorios).
Código fuente completo de todos los archivos relevantes, sin omitir implementaciones. No usar // ...resto del código ni // implementar aquí.
Instrucciones de instalación y arranque paso a paso: instalación de dependencias, configuración del .env, cómo correr en desarrollo y cómo construir con Docker.
Explicación breve de decisiones arquitectónicas relevantes: por qué WebSocket (bidireccional para input del usuario), cómo se aíslan los procesos, estrategia de reconexión al log con buffer, cómo funciona el monitoreo LLM de finalización con confirmación del usuario, cómo se detectó el modo de interacción de opencode (basado en su documentación), cómo se potencia el config.yaml de OpenSpec del proyecto generado con las HUs.
Suite de pruebas para los módulos críticos, con instrucciones para correrlas.
OBJETIVOS CLAROS
El usuario puede gestionar múltiples proyectos de generación de código desde una UI clara y profesional, con navegación fluida entre las tres aplicaciones del monorepo (RagApp, Manager, SDD Orchestrator).
Cada proyecto genera una aplicación Java Spring Boot + React + PostgreSQL a partir de un bloque de historias de usuario.
La generación es completamente autónoma: el sistema configura la instancia de opencode + OpenSpec del proyecto generado sin intervención manual. El config.yaml de OpenSpec del proyecto generado se potencia dinámicamente con las HUs del proyecto para que el agente no pierda contexto.
El proceso es transparente: el usuario ve en tiempo real exactamente qué está ejecutando la instancia de opencode del proyecto.
El usuario puede interactuar con opencode del proyecto directamente desde la UI cuando sea necesario (responder preguntas, dar instrucciones adicionales).
El sistema detecta automáticamente cuando el proceso finalizó usando un LLM como juez, pero requiere confirmación del usuario antes de cerrar. El usuario también puede marcar manualmente el proyecto como completado.
El resultado es descargable como .zip sin pasos manuales adicionales.
El sistema es robusto: procesos aislados (máximo 5 simultáneos), persistencia entre reinicios del servidor, reconexión al log, errores visibles, timeout de 90 minutos.
DEFINITION OF DONE
✅ Completo cuando:

La app corre en localhost:3002 (frontend) y localhost:8003 (backend) con npm run dev, o en localhost:3002 con Docker.
Existen botones/links de navegación visibles en el header/sidebar que permiten pasar entre RagApp (localhost:3000), Manager (localhost:3001) y SDD Orchestrator (localhost:3002), con indicación visual de cuál es la app activa.
Se pueden crear, editar y eliminar proyectos (eliminación requiere escribir el nombre para confirmar).
Al ingresar historias de usuario y presionar "Generar", el sistema configura la instancia de opencode + OpenSpec del proyecto generado y lanza el proceso automáticamente.
El config.yaml de OpenSpec del proyecto generado se genera dinámicamente, incluyendo las HUs del proyecto como contexto embebido para que la instancia de opencode del proyecto mantenga contexto y no se desvíe del alcance.
Los logs aparecen en tiempo real en Tab 2, con scroll automático y apariencia de terminal.
El usuario puede escribir mensajes a opencode del proyecto desde Tab 2 cuando opencode no está produciendo output activamente.
Si el usuario cierra el browser y vuelve, puede reconectarse al log activo (recibe buffer de últimas 50,000 líneas + stream en vivo).
El LLM monitorea el output y envía mensajes contextuales de continuación hasta detectar finalización, momento en el cual pide confirmación al usuario.
El usuario puede marcar manualmente un proyecto como completado desde Tab 2.
Tab 3 muestra el resumen del proyecto y el .zip es descargable y válido.
El directorio del proyecto generado contiene su propia instancia de opencode y OpenSpec configurados correctamente según su documentación oficial, con el config.yaml potenciado con las HUs.
No se pueden correr más de 5 procesos simultáneamente.
Los proyectos en estado running se marcan como error si el servidor se reinicia.
Las pruebas pasan y cubren los flujos críticos.
El Dockerfile de la app construye y corre correctamente.
❌ FUERA DE ALCANCE
Autenticación, roles o manejo de múltiples usuarios.
Deploy en la nube, CI/CD o infraestructura.
Soporte para stacks distintos a Java Spring Boot + React + PostgreSQL.
Integración funcional con ragapp/ o admin/ (solo navegación por links, no integración de datos ni APIs compartidas).
Edición del código generado desde la UI.
Historial de versiones o rollback de generaciones.
Logs persistentes en disco más allá del buffer en memoria del proceso activo.
Configuración del modelo desde la UI (siempre gpt-5.4-mini).
Reanudación de procesos interrumpidos por reinicio del servidor (se marcan como error; el usuario crea nuevo proyecto).
Modificaciones a la configuración SDD/OpenSpec del monorepo (nivel 1). Este prompt solo aborda la configuración de las instancias de opencode/OpenSpec de los proyectos generados (nivel 2).
NOTA CRÍTICA DE IMPLEMENTACIÓN
Antes de escribir cualquier código relacionado con opencode, OpenSpec o SDD de los proyectos generados (nivel 2), leer su documentación oficial completa. Esta es la parte más crítica del sistema — una configuración incorrecta de OpenSpec en el proyecto generado resultará en que la instancia de opencode de ese proyecto no siga el patrón SDD y genere código arbitrario. Investigar en internet si hay dudas sobre cualquier herramienta, API o modelo. Nunca asumir; siempre verificar.

Recordar: la configuración SDD/OpenSpec/opencode del monorepo (nivel 1) ya existe y está definida. Este prompt se enfoca exclusivamente en cómo sdd-orchestrator configura y ejecuta las instancias de opencode/OpenSpec para cada proyecto que el usuario genera (nivel 2).