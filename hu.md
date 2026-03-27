HU-PRINCIPAL-001 (FINAL V6 CERRADA)

Mandato obligatorio (primera línea de la HU)

Seguir estrictamente OpenSpec para implementar esta HU con delta changes siguiendo SDD, generando artefactos OpenSpec concretos (proposal.md, design.md, tasks.md) listos para implementación.


Historia de usuario principal

Como líder técnico de modernización legacy, quiero crear y gestionar proyectos donde pueda cargar archivos .cob/.cbl y .bms relacionados, para que la plataforma los analice como un sistema único, genere historias de usuario equivalentes, construya una aplicación Java Spring Boot + React + PostgreSQL, publique el resultado en GitHub, despliegue automáticamente un preview público en Railway, y me permita validarlo en un iframe desde la plataforma, asegurando trazabilidad y re-modernización iterativa desde fuentes originales.


Principios obligatorios


Prioridad máxima: fidelidad funcional de conversión.
Ingeniería: simple, modular, mantenible; sin sobreingeniería.
Análisis: multiarchivo relacional obligatorio (no por archivo aislado).
Parsing formal ANTLR: fuera de V1.
Anti-hallucination obligatorio: RAG COBOL/BMS + skills especializadas.
Trazabilidad mínima obligatoria: source_ref -> context_ref -> story_ref -> target_ref.



Alcance V1 (incluido)


Gestión por proyectos y corridas.
Upload de múltiples .cbl/.cob + .bms por proyecto.
Construcción de contexto unificado relacional.
Generación de historias de usuario y criterios de aceptación.
Generación de app objetivo Spring + React + PostgreSQL.
Quality gate mínimo obligatorio.
Publicación a GitHub con token.
Deploy automático a Railway con token.
Preview público (Railway URL) embebido en iframe.
Re-modernización con comentario desde snapshot persistido.
Comparación de corrida nueva vs corrida anterior.



Fuera de alcance V1


ANTLR4 y pipeline determinístico complejo por muchas etapas.
Edición conversacional automática del repo generado.
Cobertura absoluta de todos los dialectos legacy.



Entradas y validaciones obligatorias

5.1 Entradas requeridas por corrida

Mínimo 1 archivo .cbl o .cob.
Mínimo 1 archivo .bms.
Se permiten múltiples archivos de un mismo sistema/programa (ejemplo 3 COBOL + 3 BMS).
Los archivos .cpy son opcionales; si se incluyen, van al mismo flujo de ingesta y análisis que los .cbl/.cob y .bms.

5.2 Validaciones técnicas

Extensiones permitidas: .cbl, .cob, .bms, .cpy.
Encoding: si se detecta cualquier problema de encoding en un archivo (Latin-1, EBCDIC, codepages legacy u otro), el sistema debe resolverlo automáticamente normalizando a UTF-8 al inicio de la etapa INGEST, antes de continuar con cualquier paso del pipeline. Esta normalización es silenciosa y transparente: el archivo queda en UTF-8 en el snapshot persistido y el proceso continúa igual que si hubiera llegado en UTF-8. Se registra un warning informativo en run_report.json por cada archivo que requirió conversión.
Tamaño máximo por archivo: configurable vía MAX_SOURCE_FILE_MB (default 20 MB). Este límite existe para evitar que archivos excesivamente grandes consuman créditos de LLM innecesarios o degraden el rendimiento del análisis. Si un archivo supera el límite, se rechaza individualmente con mensaje claro indicando el nombre del archivo, su tamaño real y el límite configurado; los demás archivos de la corrida no se ven afectados por el rechazo individual. El límite puede aumentarse mediante variable de entorno si el caso de uso lo justifica.
Máximo archivos por corrida: configurable vía MAX_RUN_FILES (default 200). Este límite protege contra corridas que agrupen sistemas completos de escala enterprise en una sola ejecución, lo que podría generar contextos inmanejables o costos descontrolados. Si se supera el límite, la corrida no inicia y se devuelve un error claro indicando cuántos archivos se intentaron cargar y cuál es el límite vigente. Para sistemas de mayor escala, se recomienda particionar en proyectos por módulo o subsistema.
Duplicados: rechazo por checksum idéntico dentro de la misma corrida.
Si falla validación: corrida no inicia y se registra error por archivo.



RAG COBOL/BMS, Arquitectura y Skills (obligatorio y explícito)

6.1 RAG obligatorio
Antes de generar HUs/historias/código, el agente debe consultar un índice RAG especializado en COBOL/BMS con:

Sintaxis COBOL (divisiones, secciones, statements, copy-like patterns, SQL embebido común).
Sintaxis CICS/BMS (DFHMSD/DFHMDI/DFHMDF, SEND/RECEIVE MAP/MAPSET, AID keys).
Patrones comunes legacy (CALL/XCTL, validaciones, paginación, flujos transaccionales).

6.2 Construcción del RAG si no existe uno previo

Si no se encuentra un índice RAG ya construido en RAG_INDEX_PATH, el sistema debe construir el RAG desde cero antes de iniciar el análisis.
La construcción del RAG debe priorizar la recopilación de múltiples fuentes fidedignas y autoritativas, tales como: documentación oficial de IBM Enterprise COBOL, manuales de Micro Focus COBOL, especificaciones ANSI COBOL (estándares 74, 85, 2002, 2014), documentación oficial de CICS/BMS de IBM, referencias de COBOL/400 (AS/400 / IBM i), libros técnicos de referencia ampliamente reconocidos en la industria, repositorios públicos de ejemplos COBOL reales, y cualquier otra fuente técnica verificable y de alta confiabilidad.
El RAG resultante debe ser extensivo y de alta cobertura: debe contemplar todos los dialectos, versiones y variantes relevantes de COBOL y BMS, incluyendo casos edge, patrones poco comunes, SQL embebido, copybooks, y estructuras complejas de navegación transaccional. No se aceptan RAGs parciales o de cobertura mínima.
Se debe priorizar siempre la cantidad y diversidad de fuentes fidedignas por encima de la velocidad de construcción: es preferible un RAG más completo aunque tome más tiempo en armarse.
Una vez construido, el RAG debe persistirse en RAG_INDEX_PATH para reutilización en corridas posteriores.

6.3 Arquitectura del RAG e integración con la plataforma
El RAG sigue una arquitectura simple, suficiente y sin sobreingeniería: un índice de vectores embebido que se construye una vez, se persiste en disco y se consulta en cada corrida. No requiere infraestructura adicional ni servicios externos más allá del modelo de embeddings.
Componentes:

Vector store: ChromaDB en modo embebido (sin servidor separado). Se inicializa directamente desde el proceso de la plataforma, lee y escribe en RAG_INDEX_PATH. Sin dependencias de red adicionales, sin contenedor aparte. Simple, confiable y suficiente para este caso de uso.
Embeddings: OpenAI text-embedding model configurado vía OPENAI_EMBEDDING_MODEL. Los mismos embeddings se usan tanto para la indexación de fuentes como para las queries en tiempo de análisis.
Chunking: los documentos fuente del RAG se trocean en chunks de aproximadamente 512 tokens con solapamiento de 64 tokens. Cada chunk conserva metadatos de origen (fuente, sección, versión de dialecto) para permitir trazabilidad de la evidencia recuperada.

Pipeline de construcción (solo si no existe RAG previo):

Recolectar fuentes fidedignas (documentación IBM, ANSI, Micro Focus, ejemplos reales, etc.).
Parsear y limpiar cada fuente a texto plano normalizado en UTF-8.
Trocear en chunks con metadatos.
Generar embeddings via OpenAI.
Insertar en ChromaDB y persistir en RAG_INDEX_PATH.

Pipeline de consulta (en cada corrida, antes de ANALYZE y STORIES):

Recibir query contextual del agente (fragmento de código COBOL/BMS a analizar o pregunta de mapeo).
Generar embedding de la query.
Buscar top_k chunks más similares en ChromaDB.
Filtrar por score mínimo RAG_MIN_SCORE.
Inyectar chunks recuperados en el system prompt del agente como contexto de evidencia.

Integración con la plataforma:

El RAG vive como módulo interno de la plataforma (rag/), sin microservicio separado.
Se inicializa en el arranque del worker; si RAG_INDEX_PATH existe, carga el índice; si no, dispara la construcción.
Los agentes A1 y A2 reciben los resultados del RAG como contexto adicional en sus prompts; no hacen queries directas al vector store, sino que el módulo RAG expone una función simple: query(text, top_k) -> list[Chunk].
El módulo RAG es stateless desde la perspectiva de los agentes: siempre devuelve chunks, nunca falla silenciosamente (si no hay evidencia suficiente, devuelve lista vacía y el agente marca low_confidence).

6.4 Reglas operativas del RAG

top_k mínimo: 8.
Si no hay evidencia suficiente: marcar low_confidence.
Nunca inferir reglas críticas sin soporte de evidencia recuperada.
Registrar todo caso incierto en unsupported_or_uncertain con archivo/línea/motivo.

6.5 Skills obligatorias

Cargar skill de análisis COBOL (ej. cobol-migration-analyzer) y skills complementarias del pipeline.
La skill debe inyectar:

patrones de parsing semántico,
mapeos COBOL/BMS -> historias,
heurísticas para casos complejos.


RAG + skills se usan antes y durante el análisis; no al final.



Pipeline exacto y ejecutable (sin ambigüedad)

run_id formato: run_<yyyyMMdd_HHmmss>_<8hex>

INGEST

Normaliza encoding a UTF-8 de todos los archivos que lo requieran antes de cualquier otra operación.
Guarda fuentes normalizadas en snapshot persistido (.cbl, .cob, .bms y .cpy si los hubiera).
Crea source_snapshot_version.
Estado etapa: INGEST_SUCCESS o INGEST_FAILED.


ANALYZE (Agente A1 + RAG + skills)

El agente A1 actúa con el rol explícito de experto en COBOL en todos sus tipos y versiones (COBOL 74, 85, 2002, 2014, dialecto IBM Enterprise COBOL, Micro Focus, COBOL/400, COBOL con CICS/BMS, COBOL con SQL embebido, entre otros), combinando dicho expertise con el RAG y las skills para garantizar máxima cobertura y fidelidad en el análisis.
Analiza todos los archivos juntos (.cbl, .cob, .bms y .cpy).
Extrae programas, pantallas, campos, relaciones, SQL, navegación.
Genera contexto_unificado.json.


STORIES (Agente A2)

El agente A2 actúa con el rol explícito de experto en COBOL en todos sus tipos y versiones, con el mismo alcance de dialectos y versiones que A1, combinando dicho expertise con el RAG y las skills para garantizar la correcta interpretación del contexto unificado al convertirlo en historias de usuario.
Convierte contexto en:

historias_usuario.md
criterios_aceptacion.md


Incluye historias funcionales + historias UI modernizada equivalente.


CODEGEN (Agente A3)

Genera:

generated/backend (Spring Boot)
generated/frontend (React)
generated/db (PostgreSQL migrations)




TEST_GATE

Backend build OK.
Frontend build OK.
Migraciones DB aplicables.
/health responde 200.
Si falla: corrida PARTIAL, sin publish ni deploy.


PUBLISH_GITHUB (obligatorio si gate verde)

Usa GITHUB_TOKEN para autenticación.
Crea un nuevo repositorio GitHub con nombre modernized-<project-slug>.
Inicializa el repositorio con rama main como rama principal.
Commit + push del código generado directamente a main.
Persiste URLs y SHA.


DEPLOY_RAILWAY (obligatorio si publish OK)

Usa RAILWAY_TOKEN.
Despliega servicio del proyecto.
Obtiene dominio HTTPS público.
Persiste preview_url_public.


PREVIEW_READY

Habilita:

preview público embebido en iframe con la URL de Railway,
botón fallback "Open in new tab",
enlace directo al repositorio GitHub generado (github_repo_url) visible y clickeable en la UI.





Estados globales corrida: RUNNING | READY | PARTIAL | FAILED.


Artefactos obligatorios por corrida


contexto_unificado.json

Campos obligatorios:

meta, sources, programs, screens, relations, transactions,
business_rules, traceability, confidence, unsupported_or_uncertain.


historias_usuario.md


Historias funcionales en Given/When/Then.
Historias de UI modernizada.
Referencia de trazabilidad por historia.


criterios_aceptacion.md


Criterios verificables por historia.


run_report.json


Estado por etapa, gate, costos, warnings, fallos, archivos con conversión de encoding.



Publicación GitHub (detalle obligatorio)


Autenticación: GITHUB_TOKEN (sin token no hay publish).
Owner: GITHUB_OWNER.
Repo: modernized-<project-slug> (nuevo repositorio creado por corrida).
Rama principal: main. El código se publica directamente en main como rama inicial del repositorio.
Commit message: feat(modernization): generated app for <run_id> from legacy sources.
Metadatos persistidos:

github_repo_url
github_branch (main)
github_commit_sha





Deploy Railway y dominio público (detalle obligatorio)

Railway es la opción recomendada para el deploy del preview público por su simplicidad operativa, integración nativa con GitHub, auto-detección de frameworks, base de datos PostgreSQL gestionada incluida, y experiencia de despliegue similar a git push. No requiere configuración de infraestructura adicional.
Nota de pricing obligatoria: Railway no tiene tier gratuito permanente. Ofrece una prueba de 30 días con $5 de crédito inicial. Para uso continuado, el plan Hobby ($5/mes) incluye $5 de crédito de uso mensual, lo que en la práctica cubre despliegues ligeros de preview sin costo adicional. Esta consideración debe estar documentada en el onboarding de la plataforma para que el usuario configure su RAILWAY_TOKEN con un plan Hobby activo.

Autenticación: RAILWAY_TOKEN.
Proyecto/entorno: RAILWAY_PROJECT_ID, RAILWAY_ENVIRONMENT_ID.
Servicio por proyecto: modernized-<project_id>.
Resultado esperado:

railway_deploy_status=ready
preview_url_public=https://...


Si falla:

railway_deploy_status=failed
preview_failure_reason
logs_summary





Preview público e iframe


Se habilita cuando el deploy Railway está ready.
La preview_url_public generada por Railway se embebe directamente en un iframe en la UI de la plataforma.
No se corre ningún entorno local efímero: el único preview es el de Railway.
Botón fallback "Open in new tab" siempre visible junto al iframe.
Enlace directo al repositorio GitHub generado (github_repo_url) visible de forma permanente junto al preview.
Regla iframe: la app desplegada debe permitir frame-ancestors del dominio de la plataforma. Si hay bloqueo de frame, la UI detecta la causa y muestra el fallback automáticamente con mensaje explicativo.



UI/UX mínima obligatoria (específica)

Tabs por proyecto:

Overview
Files
Context
User Stories
Build & Tests
Test Preview
GitHub
Re-modernize

Reglas UI y buenas prácticas:

Run Modernization habilitado solo con snapshot válido (>=1 COBOL y >=1 BMS).
Timeline de etapas con timestamps y duración en Build & Tests; cada etapa muestra estado visual claro (pending / running / success / failed) con icono y color consistente.
El tab User Stories muestra las historias de usuario (historias_usuario.md) generadas durante la etapa STORIES del pipeline, renderizadas en formato legible (Markdown renderizado, no texto plano), con trazabilidad por historia visible y navegación rápida entre historias.
Test Preview muestra el iframe de Railway a pantalla completa dentro del tab, con barra superior que incluye la URL pública, botón "Open in new tab" y enlace al repositorio GitHub.
GitHub muestra repo/branch/SHA con enlaces directos y clicables; incluye enlace prominente al repositorio GitHub generado (github_repo_url).
Re-modernize exige comentario mínimo 10 caracteres con contador de caracteres visible.

Buenas prácticas UX obligatorias:

Feedback inmediato: toda acción del usuario (upload, run, stop) debe dar respuesta visual en menos de 300ms aunque el proceso siga en background.
Estados de carga explícitos: spinners o skeleton screens en tabs que aún no tienen datos disponibles; nunca pantalla en blanco sin contexto.
Mensajes de error específicos por etapa, con causa legible y acción sugerida cuando aplique.
Jerarquía visual clara: el estado global de la corrida (RUNNING / READY / PARTIAL / FAILED) siempre visible en el header del proyecto sin necesidad de navegar a un tab específico.
Accesibilidad mínima: contraste suficiente, foco de teclado visible, labels en todos los controles interactivos.
Diseño responsive desktop/mobile.
No agregar elementos decorativos innecesarios.



Re-modernización (detallado)


Siempre parte de source_snapshot_version persistido.
Comentario se normaliza a:

funcional,
técnico,
prioridades,
exclusiones.


Crea nueva corrida y compara contra corrida anterior:

diferencias de historias,
cambios en warnings/unsupported,
cambios en tests/gate,
nuevos enlaces PR/preview.





Criterios de aceptación (verificables)


Con fuentes válidas, la corrida completa genera contexto, historias y app.
Los archivos con problemas de encoding son normalizados a UTF-8 automáticamente al inicio de INGEST y el proceso continúa sin interrupción.
El análisis refleja relaciones multiarchivo como sistema unificado.
Si TEST_GATE=green, se ejecutan publish GitHub y deploy Railway.
Se crea un nuevo repositorio GitHub con el código en la rama main y se obtiene dominio público de preview en Railway.
El preview público se puede abrir en iframe (o fallback nueva pestaña).
El enlace al repositorio GitHub generado es visible y funcional en la UI (tab GitHub y sección preview).
Las historias de usuario generadas son visibles en el tab User Stories antes de que finalice el pipeline completo.
Si no existe un RAG previo, el sistema lo construye desde múltiples fuentes fidedignas antes de iniciar el análisis, y el RAG resultante es extensivo y cubre todos los dialectos y versiones relevantes de COBOL/BMS.
Si falla etapa crítica, corrida termina en PARTIAL o FAILED con causa trazable.
Re-modernización crea nueva corrida desde snapshot original y muestra comparación.



Definition of Done


Pipeline end-to-end estable con 3 agentes.
Normalización de encoding a UTF-8 operativa en INGEST para todos los formatos legacy.
RAG COBOL/BMS operativo y consultado obligatoriamente con arquitectura ChromaDB embebida.
Si no existe RAG previo, el sistema lo construye desde múltiples fuentes fidedignas y lo persiste en RAG_INDEX_PATH antes de iniciar el análisis; el RAG es extensivo y de alta cobertura.
Skills COBOL activas en análisis para casos complejos.
Agente A1 opera con rol explícito de experto COBOL en todos sus tipos y versiones, combinado con RAG y skills.
Agente A2 opera con rol explícito de experto COBOL en todos sus tipos y versiones, combinado con RAG y skills.
Publicación GitHub funcionando: nuevo repositorio creado con código en rama main.
Deploy Railway funcionando con RAILWAY_TOKEN y plan Hobby activo.
Preview público funcional embebido en iframe; sin entorno local efímero.
Enlace al repositorio GitHub generado visible y funcional en la UI.
Tab User Stories muestra las historias generadas de forma legible con trazabilidad.
UI cumple buenas prácticas: feedback inmediato, estados de carga explícitos, errores específicos, accesibilidad mínima, responsive.
Trazabilidad completa source -> context -> stories -> target.
OpenSpec de la plataforma actualizado con proposal/design/tasks implementables.



Variables obligatorias en .env.example (para que funcione todo)


OPENAI_API_KEY
OPENAI_MODEL_ANALYZER
OPENAI_MODEL_STORIES
OPENAI_MODEL_CODEGEN
OPENAI_EMBEDDING_MODEL
RAG_INDEX_PATH
RAG_TOP_K
RAG_MIN_SCORE
GITHUB_TOKEN
GITHUB_OWNER
GITHUB_DEFAULT_REPO_PREFIX
GITHUB_DEFAULT_BASE_BRANCH
RAILWAY_TOKEN
RAILWAY_PROJECT_ID
RAILWAY_ENVIRONMENT_ID
DATABASE_URL
REDIS_URL
WORKER_CONCURRENCY
PREVIEW_IFRAME_ALLOWED_ORIGINS
RUN_COST_LIMIT_USD
RUN_STOP_ON_COST_LIMIT
PREVIEW_ENABLED