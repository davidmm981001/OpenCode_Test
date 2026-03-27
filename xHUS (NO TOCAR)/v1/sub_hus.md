
Contexto transversal obligatorio (aplica a TODAS las sub-HUs)
- Ejecutar cada sub-HU con OpenSpec/SDD, en 1 o varios delta changes atómicos.
- No avanzar a la siguiente sub-HU sin cerrar la actual con criterios de aceptación + DoD.
- Al final de cada sub-HU, el agente debe levantar la aplicación para validar el producto alcanzado.
- Prioridad máxima: calidad funcional de conversión.
- Ingeniería: suficiente + buenas prácticas (sin sobrecomplicar).
- Parsing determinístico primero, LLM después.
- Análisis relacional multiarchivo obligatorio (COBOL/BMS/CPY/JCL se analizan como sistema unificado).
- Separación SDD obligatoria:
  - SDD A (plataforma): operativo en V1.
  - SDD B (proyectos generados): preconfigurado, no operativo conversacional en V1.
- Modelos por rol:
  - openai/gpt-5.3-codex (codegen principal),
  - o3 (razonamiento profundo si disponible),
  - gpt-4.1 (auxiliar),
  - fallback de o3 a openai/gpt-5.3-codex.
- Costos por corrida: límite configurable por .env; al exceder, se detiene corrida.
- Estado PARTIAL obligatorio: conserva artefactos y habilita retry por etapa.
- Publicación GitHub: branch + PR; merge lo hace el usuario.
- Preview: entorno efímero por corrida, con DB específica del run creada/inicializada al iniciar preview.

---
HU-01 — Plataforma base runnable + separación explícita de SDD
Instrucción inicial al agente
- Ejecutar con OpenSpec/SDD.
- Crear delta changes atómicos.
- No mezclar alcance de HUs futuras.
Objetivo
- Tener plataforma base corriendo y separación SDD A/B formalizada.
Alcance
- Bootstrap React + FastAPI + PostgreSQL + Redis + Celery workers (mínimo 3, configurable en .env).
- Health checks.
- Configuración .env base.
- Documento de separación entre SDD plataforma y SDD proyecto generado.
- Workspace temporal efímero por corrida en worker.
Delta changes sugeridos
- Estructura inicial de app.
- Conexión backend con DB/Redis/Celery.
- Endpoint /health.
- Pantalla base frontend.
- Artefacto de arquitectura y gobernanza SDD.
Criterios de aceptación
- Frontend y backend inician local.
- /health responde correctamente.
- DB/Redis/Celery conectan.
- Separación SDD A/B documentada sin ambigüedad.
Definition of Done
- Base técnica ejecutable y lista para gestionar proyectos/fuentes.
Cierre obligatorio
- Levantar aplicación y validar funcionamiento base.




---
HU-02 — Gestión de proyectos + carga y persistencia de fuentes
Instrucción inicial al agente
- Ejecutar con OpenSpec/SDD.
- Implementar con delta changes atómicos de proyecto, upload y persistencia.
Objetivo
- Crear proyectos y almacenar fuentes originales por snapshot.
Alcance
- CRUD básico de proyectos.
- Upload de .cob/.cbl/.cpy/.bms/.jcl y zip.
- Validación de formato/encoding/tamaño.
- Persistencia por source_snapshot_version (DB u object storage).
- Tab Files.
- No dependencia del workspace efímero (fuentes siempre persisten).
Delta changes sugeridos
- Modelos de dominio de proyecto/snapshot.
- Endpoints de creación/listado/carga.
- Normalización y almacenamiento de fuentes.
- UI de carga/visualización.
Criterios de aceptación
- Se crea proyecto.
- Fuentes quedan persistidas por snapshot.
- Archivos visibles en UI.
- No dependencia del workspace efímero.
Definition of Done
- Proyecto con baseline de fuentes listo para corridas.
Cierre obligatorio
- Levantar app y validar proyecto + upload + snapshot.




---
HU-03 — Parsing determinístico relacional multiarchivo
Instrucción inicial al agente
- Ejecutar con OpenSpec/SDD.
- La salida debe ser relacional/unificada, no archivo-a-archivo.
Objetivo
- Reconstruir estructura y relaciones de negocio dispersas en archivos mainframe.
Alcance
- PARSE_BASE con ANTLR4.
- Postproceso determinístico:
  - COPY/REPLACE,
  - resolución de símbolos cruzados,
  - relaciones CALL,
  - vínculo BMS↔COBOL↔CPY↔JCL/CICS/IMS.
- Reporte de cobertura por constructo.
- Registro unsupported_constructs.
Delta changes sugeridos
- Integración parser COBOL/BMS.
- Resolución de referencias.
- Generación de artefacto relacional base.
- Métricas de cobertura.
- Persistencia de no soportados.
Criterios de aceptación
- La lógica se analiza como sistema único.
- Relaciones cruzadas críticas resueltas.
- Cobertura y no soportados visibles.
Definition of Done
- Base determinística confiable para Graph + IR.
Cierre obligatorio
- Levantar app y ejecutar análisis relacional de una corrida.




---
HU-04 — Dependency Graph + IR canónico versionado
Instrucción inicial al agente
- Ejecutar con OpenSpec/SDD.
- No pasar a codegen sin Graph e IR válidos.
Objetivo
- Materializar modelo semántico trazable y versionado por corrida.
Alcance
- Dependency Graph con nodos/aristas tipadas.
- IR JSON validado por JSON Schema.
- Trazabilidad completa source_ref -> ir_ref -> target_ref.
- Tabs IR y Dependency Graph.
- Versionado por corrida.
Delta changes sugeridos
- Esquema y generador de graph.
- Definición y validación de IR.
- Persistencia de artifacts.
- UI de visualización y consulta.
Criterios de aceptación
- Graph visible y navegable.
- IR válido por schema.
- Trazabilidad obligatoria disponible.
Definition of Done
- Capa semántica lista para enriquecimiento y generación.
Cierre obligatorio
- Levantar app y validar tabs IR/Graph con corrida real.




---
HU-05 — Integración OpenAI por rol + control de costo por corrida
Instrucción inicial al agente
- Ejecutar con OpenSpec/SDD.
- Separar delta changes para configuración, fallback, trazabilidad y costo.
Objetivo
- Usar modelo correcto por paso, con control de costos y fallback.
Alcance
- Configurar:
  - openai/gpt-5.3-codex,
  - o3 (si disponible),
  - gpt-4.1.
- Verificación de disponibilidad.
- Fallback de o3.
- Registro tokens/costo/latencia.
- Corte automático por límite.
Delta changes sugeridos
- Capa de configuración de modelos.
- Health check de disponibilidad.
- Enrutamiento por rol.
- Instrumentación costo/uso.
- Hard-stop por presupuesto.
Criterios de aceptación
- Routing de modelos correcto.
- Fallback funcional.
- Costos visibles por corrida.
- Corrida se detiene al exceder límite.
Definition of Done
- LLM integrada de forma segura, auditable y controlada.
Cierre obligatorio
- Levantar app y validar corrida con métricas de uso/costo de modelo.



---
HU-06 — Codegen backend Java Spring + PostgreSQL
Instrucción inicial al agente
- Ejecutar con OpenSpec/SDD.
- Dividir delta changes por capa backend y base de datos.
Objetivo
- Generar backend y DB funcionales desde IR.
Alcance
- Codegen de controladores, servicios, repositorios, DTO/VO/Entity.
- Generación de esquema y migraciones PostgreSQL.
- Manejo de precisión (BigDecimal) donde aplique.
- Build backend y smoke /health.
Delta changes sugeridos
- Plantillas backend.
- Mapeo IR->dominio/API.
- Migraciones DB.
- Validación de build.
- Smoke backend generado.
Criterios de aceptación
- Backend compila y corre.
- DB se crea/migra correctamente.
- Health endpoint operativo en proyecto generado.
Definition of Done
- Backend+DB generados funcionales y listos para frontend.
Cierre obligatorio
- Levantar app y validar backend/DB generados.




---
HU-07 — Codegen frontend React desde BMS + coherencia full-stack
Instrucción inicial al agente
- Ejecutar con OpenSpec/SDD.
- Mantener contrato estricto entre IR, backend y frontend.
Objetivo
- Generar frontend React funcional derivado de BMS, integrado con backend.
Alcance
- Mapeo BMS -> pantallas/componentes.
- Campos, validaciones, navegación base.
- Integración API con backend generado.
- Build + smoke frontend.
Delta changes sugeridos
- Generador de componentes desde ui_model_from_bms.
- Validaciones UI.
- Wiring de rutas/API.
- Build y smoke de frontend.
Criterios de aceptación
- Frontend levanta.
- Pantalla principal carga.
- Flujo funcional base backend+frontend consistente.
Definition of Done
- Producto modernizado full-stack base ejecutable.
Cierre obligatorio
- Levantar app y validar flujo end-to-end básico.



---
HU-08 — Quality Gate + PARTIAL + retry por etapa
Instrucción inicial al agente
- Ejecutar con OpenSpec/SDD.
- Implementar delta changes atómicos para quality gate, estados y retry.
Objetivo
- Robustecer corridas con control de calidad y recuperación.
Alcance
- TEST_GATE obligatorio:
  - smoke,
  - tests críticos,
  - build,
  - migraciones.
- Estados READY, PARTIAL, FAILED.
- Preservación de artefactos en PARTIAL.
- Retry por etapa fallida.
Delta changes sugeridos
- Orquestador de tests.
- Regla de promoción/bloqueo.
- Persistencia de resultados por etapa.
- Retry stage-only.
- UI de estado por etapa.
Criterios de aceptación
- Fallo crítico bloquea promoción.
- PARTIAL conserva artefactos.
- Retry por etapa funciona.
Definition of Done
- Pipeline estable y recuperable.
Cierre obligatorio
- Levantar app y validar casos READY/PARTIAL/retry.



---
HU-09 — Publicación en GitHub + Re-modernize con comentario
Instrucción inicial al agente
- Ejecutar con OpenSpec/SDD.
- Separar delta changes de publicación y re-modernización.
Objetivo
- Completar ciclo de iteración V1: publicar y re-modernizar sin romper trazabilidad.
Alcance
- Branch por corrida modernization/<run-id>.
- PR a main.
- Merge manual por usuario.
- Re-modernize desde source_snapshot_version.
- Normalización de comentario (restricciones/prioridades/exclusiones).
- Comparativa entre corridas.
Delta changes sugeridos
- Integración GitHub.
- Branch/commit/PR.
- Formulario y backend de re-modernización.
- Motor de comparación run-vs-run.
- UI de historial de corridas.
Criterios de aceptación
- PR creada correctamente.
- Re-modernización usa snapshot persistido.
- Comparativa de cambios y calidad visible.
Definition of Done
- Iteración V1 completa sin edición conversacional directa del repo.
Cierre obligatorio
- Levantar app y validar flujo corrida -> PR -> re-modernize -> comparación.



---
HU-10 — Test Preview local con DB específica por proyecto/corrida
Instrucción inicial al agente
- Ejecutar con OpenSpec/SDD.
- Esta HU debe terminar con preview real, no simulado.
Objetivo
- Validar visual y funcionalmente el producto modernizado en entorno efímero antes de promoción.
Alcance
- Test Preview solo con TEST_GATE verde.
- Levantar temporalmente:
  - backend generado,
  - frontend generado,
  - DB específica por proyecto/corrida.
- Al iniciar preview:
  - crear DB del run,
  - crear esquema,
  - aplicar migraciones.
- Exponer estado:
  - building, starting, ready, failed.
- Mostrar:
  - URL frontend,
  - URL backend /health,
  - logs resumidos.
- TTL + Stop Preview.
- Persistir metadata de preview:
  - preview_requested_at,
  - preview_started_at,
  - preview_status,
  - preview_url_frontend,
  - preview_url_backend_health,
  - preview_stopped_at,
  - preview_failure_reason.
Delta changes sugeridos
- Provisionador de preview.
- Provisionador DB aislada.
- Inicialización DB/schema/migrations.
- Estado/URLs/logs.
- Stop/TTL/cleanup.
- Persistencia metadata.
Criterios de aceptación
- Preview solo habilita con gates verdes.
- DB aislada por corrida (no compartida).
- Stop/TTL liberan recursos.
- Fallos quedan trazados y diagnosticados.
Definition of Done
- Preview local funcional, reproducible y útil para validación final.
Cierre obligatorio
- Levantar app y ejecutar preview completo (start -> validar -> stop -> cleanup).



---
Cierre global de secuencia
- Para cuando se completa la corrida de la HU-10, queda cubierta íntegramente la HU principal original:
  - modernización multiarchivo relacional,
  - IR/Graph trazables,
  - generación Java/React/PostgreSQL,
  - pruebas y quality gates,
  - publicación GitHub,
  - re-modernización por comentario,
  - preview local real con DB específica.
- Todo queda secuencial, modular y sin cabos sueltos para ejecución con SDD/OpenSpec.