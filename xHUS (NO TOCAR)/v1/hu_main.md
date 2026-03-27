HU-PRINCIPAL-001 (FINAL CONSOLIDADA V1)
Como líder técnico de modernización legacy, quiero crear y gestionar proyectos donde pueda cargar activos mainframe (.cob, .cbl, .cpy, .bms, opcional .jcl), ejecutar una modernización integral a Java Spring Boot + React + PostgreSQL, publicar el resultado en GitHub, validar visualmente el resultado con un Test Preview local, y volver a modernizar desde las fuentes originales con un comentario de ajuste, para asegurar que la conversión realmente funcione, sea trazable y mejore por iteración con buena ingeniería y sin sobrecomplicar.
1) Principios obligatorios
- Prioridad máxima: calidad funcional de conversión.
- Ingeniería: suficiente + buenas prácticas de software.
- Flujo técnico: parsing determinístico primero, LLM después.
- Análisis siempre relacional multiarchivo (no por archivos aislados).
- V1 enfocada en que la modernización funcione bien end-to-end.
2) OpenSpec / SDD (alcance exacto V1, separación explícita)
2.1 SDD de la plataforma (sí operativo en V1)
- El SDD/OpenSpec de la plataforma se usa activamente para diseñar, especificar e implementar esta aplicación.
- Este SDD gobierna el ciclo de vida de la plataforma misma (features, cambios, tareas internas).
2.2 SDD de proyectos generados (no operativo en V1)
- Cada proyecto modernizado incluye OpenSpec preconfigurado dentro del repo generado.
- Ese OpenSpec del proyecto generado queda preparado para uso futuro.
- En V1, ese SDD del proyecto generado no ejecuta ciclos conversacionales ni aplica delta changes automáticos.
2.3 Regla de separación (obligatoria)
- Son dos SDD distintos:
  - SDD A: plataforma (activo en V1).
  - SDD B: proyecto generado (preparado, no activo en V1).
- Ningún flujo del SDD A modifica automáticamente el SDD B en V1.
3) Alcance funcional V1 (incluido)
- Gestión por proyectos de modernización.
- Carga y validación de archivos legacy.
- Análisis relacional entre COBOL/BMS/CPY/JCL.
- Construcción de IR canónico y Dependency Graph por corrida.
- Generación de Java Spring + React + PostgreSQL.
- Pruebas automáticas y quality gate obligatorio.
- Publicación en GitHub.
- Re-modernización con comentario (único mecanismo de iteración en V1).
- Test Preview local del producto modernizado por corrida.
- Historial y comparación entre corridas.
4) Fuera de alcance V1
- Edición conversacional directa del repo generado.
- Aplicación automática de delta changes OpenSpec en el proyecto generado.
- RBAC enterprise/compliance avanzado.
- Cobertura absoluta de todos los edge cases legacy.
5) Cobertura legacy V1
- COBOL: flujo de control, estructuras, copybooks, SQL embebido común.
- BMS: mapas, campos, atributos principales y flujo UI base.
- CICS/IMS/JCL: cobertura mayoritaria de patrones frecuentes para una buena modernización práctica.
- Todo no soportado se reporta en unsupported_constructs con severidad, archivo y línea.
6) Arquitectura V1
- Frontend: React.
- Backend: FastAPI.
- Parser: ANTLR4 (gramáticas COBOL/BMS) + postproceso determinístico.
- Persistencia de plataforma: PostgreSQL.
- Cola/procesamiento: Redis + workers (mínimo 3, configurable en .env).
- Workspace temporal: volumen efímero por corrida en worker.
- Código generado persistente: GitHub.
- Fuentes originales persistentes por proyecto: almacenamiento persistente (DB u object storage).
7) Modelos OpenAI (existentes y definidos)
- Generación principal de código: openai/gpt-5.3-codex.
- Razonamiento profundo: o3 (si está disponible en cuenta).
- Auxiliar económico: gpt-4.1.
Fallback:
- Si o3 no está disponible, usar openai/gpt-5.3-codex.
Configuración sugerida:
- OPENAI_MODEL_CODEGEN=openai/gpt-5.3-codex
- OPENAI_MODEL_REASONING=o3
- OPENAI_MODEL_REASONING_FALLBACK=openai/gpt-5.3-codex
- OPENAI_MODEL_AUX=gpt-4.1
Costo V1:
- Registro de costo por corrida.
- Límite configurable vía .env.
- La corrida se detiene automáticamente al superar el límite.
8) Conversión mainframe -> Java / React / PostgreSQL (sin ambigüedad)
8.1 Entradas y rol
- .cbl/.cob: lógica de negocio y control.
- .cpy: estructuras de datos compartidas.
- .bms: definición de pantallas/campos.
- .jcl opcional: secuencia/contexto batch.
8.2 Regla central (análisis conjunto obligatorio)
- El sistema no evalúa archivos por separado para convertirlos.
- Primero reconstruye un modelo lógico unificado del sistema a partir de todas las relaciones entre archivos.
- La conversión se ejecuta sobre ese modelo unificado (IR), no sobre archivos aislados.
8.3 Cómo se analizan como “un solo sistema” con relaciones
1. Se indexan todos los archivos del proyecto en una misma corrida.
2. Se parsea cada archivo y se extraen entidades estructurales.
3. Se resuelven referencias cruzadas:
   - COPY/REPLACE,
   - llamadas entre programas (CALL),
   - variables compartidas por copybooks,
   - campos BMS vinculados con lógica COBOL,
   - secuencia operativa de JCL/CICS/IMS cuando aplique.
4. Se construye un grafo relacional único (Dependency Graph) con nodos y aristas tipadas.
5. Se agrupa la lógica dispersa en unidades funcionales/transacciones que combinan:
   - entrada (pantalla/batch/parámetros),
   - reglas de negocio,
   - acceso a datos,
   - salida y navegación.
6. Recién entonces se construye el IR semántico final y se genera código objetivo.
8.4 Consecuencia técnica de esta regla
- Si una regla de negocio está repartida entre .cbl + .cpy + .bms, se convierte como una sola unidad funcional coherente.
- Se evita generar backend/frontend/db desalineados por analizar piezas aisladas.
- La trazabilidad refleja la dispersión original, pero la salida queda integrada.
8.5 Pipeline de conversión
1. INGEST: validar, normalizar encoding y clasificar archivos.
2. PARSE_BASE: parseo determinístico de estructura.
3. PARSE_ENRICH_DETERMINISTIC:
   - resolver COPY/REPLACE,
   - resolver símbolos cruzados,
   - construir call graph y data flow,
   - vincular campos BMS con variables/reglas COBOL,
   - integrar contexto JCL/CICS/IMS.
4. GRAPH_BUILD: construir grafo de dependencias versionado.
5. IR_BUILD: construir IR canónico validado por schema.
6. LLM_AUGMENT: enriquecer semántica solo donde la capa determinística no resuelve con alta confianza.
7. CODEGEN: generar backend/frontend/sql desde IR validado.
8. TEST_GATE: ejecutar pruebas y gates.
9. PREVIEW_READY: habilitar Test Preview si gates están en verde.
10. PUBLISH: crear rama + PR en GitHub.
11. READY o PARTIAL.
8.6 Mapeo objetivo
- COBOL transaccional -> servicios/casos de uso/controladores Spring.
- Copybooks -> DTO/VO/Entity.
- SQL embebido -> repositorios y consultas parametrizadas.
- BMS -> componentes/pantallas React + validaciones.
- Modelo de datos -> tablas/relaciones/migraciones PostgreSQL.
- Decimales críticos -> BigDecimal en Java cuando corresponda.
8.7 Trazabilidad obligatoria
- Todo artefacto generado debe mapear source_ref -> ir_ref -> target_ref.
9) IR canónico (formato cerrado)
Formato: JSON validado por JSON Schema versionado.
Campos obligatorios:
- meta
- sources
- data_model
- control_flow
- transactions
- ui_model_from_bms
- business_rules
- io_contracts
- traceability
- confidence
- test_intents
- unsupported_constructs
- llm_augmentations
10) Dependency Graph
- Nodos: program, copybook, bms_screen, paragraph, file, table, transaction.
- Aristas: CALLS, INCLUDES, READS, WRITES, MAPS_TO, USES, TRIGGERS.
- Visible por corrida en tab dedicado.
- Versionado y comparativa entre corridas.
11) Fallo parcial y recuperación
- Si falla etapa crítica: estado PARTIAL.
- Se conservan artefactos válidos hasta ese punto.
- Usuario puede reintentar etapa fallida o re-modernizar con comentario.
- No se pierde toda la corrida por una falla puntual.
12) Re-modernización con comentario
- Re-modernización siempre parte de fuentes originales persistidas del proyecto.
- El comentario se normaliza en:
  - restricciones funcionales,
  - restricciones técnicas,
  - prioridades,
  - exclusiones.
- Se crea nueva corrida con comparación contra corrida previa.
13) Persistencia de fuentes (definitivo)
- Las fuentes originales sí se persisten por proyecto.
- Cada corrida referencia una source_snapshot_version.
- El workspace del worker es efímero y no reemplaza persistencia.
- Usuario puede subir nuevas fuentes para crear una nueva versión base.
14) Test Preview local (integrado V1)
Objetivo:
- Permitir validar visual y funcionalmente el producto modernizado desde la plataforma.
Reglas:
- Botón Test Preview se habilita solo si TEST_GATE está en verde.
- Al activar preview, la plataforma levanta temporalmente:
  - backend generado,
  - frontend generado,
  - base de datos específica del proyecto/corrida,
  - y ejecuta la inicialización necesaria de ese entorno (creación de DB, esquema y migraciones del proyecto generado).
- El preview no reutiliza una DB compartida entre proyectos; cada preview usa su propia DB aislada.
- Se muestran:
  - estado (building, starting, ready, failed),
  - URL frontend local de preview,
  - URL backend /health,
  - logs resumidos de arranque.
Ciclo de vida:
- Preview corre en entorno efímero por corrida.
- TTL configurable (ej. 20 min).
- Botón Stop Preview para apagar y liberar recursos.
- Si falla arranque, mostrar causa resumida y categoría (backend, frontend, db, config).
Seguridad/simplicidad V1:
- Preview no se expone públicamente fuera del entorno de ejecución definido.
- No persiste estado funcional del preview; solo metadatos y resultados.
Persistencia de preview:
- preview_requested_at
- preview_started_at
- preview_status
- preview_url_frontend
- preview_url_backend_health
- preview_stopped_at
- preview_failure_reason
15) Pruebas y quality gates
Smoke mínimo obligatorio:
- backend levanta,
- /health responde 200,
- frontend carga pantalla principal,
- conexión PostgreSQL válida.
Además:
- tests críticos de reglas de negocio,
- build exitoso,
- migraciones aplicables.
Sin gates verdes:
- no READY,
- no habilitar Test Preview,
- no publicar PR como recomendada para merge.
16) GitHub strategy
- Rama por corrida: modernization/<run-id>.
- PR hacia main solo si quality gate está verde.
- La plataforma crea rama y PR.
- El merge final es responsabilidad del usuario.
17) Persistencia de plataforma (PostgreSQL)
Se guarda:
- proyectos, configuración, comentarios,
- corridas y estados por etapa,
- metadatos IR/Graph,
- costos/tokens/modelos usados,
- resultados de pruebas,
- metadatos de preview,
- eventos operativos.
No se guarda:
- código final generado (vive en GitHub).
18) UI esencial por proyecto
Tabs mínimas:
- Overview
- Files
- IR
- Dependency Graph
- Build & Tests
- Test Preview
- GitHub
- Re-modernize
Objetivo UX:
- claridad de estado,
- trazabilidad visible,
- validación rápida de funcionamiento real.
19) Criterios de aceptación (suficientes y verificables)
- Given fuentes válidas, When inicia modernización, Then corre pipeline completo por etapas.
- Given relaciones COBOL/BMS/CPY/JCL, When se construye IR/Graph, Then quedan explícitas y trazables como sistema unificado.
- Given lógica de negocio dispersa en múltiples archivos, When se genera código, Then backend/frontend/db resultan coherentes para la misma transacción funcional.
- Given falla crítica en cualquier etapa, When termina corrida, Then estado es PARTIAL y se preservan artefactos válidos.
- Given corrida PARTIAL, When usuario elige reintento, Then puede reintentar la etapa fallida sin reiniciar toda la corrida.
- Given comentario de ajuste, When re-moderniza, Then se crea nueva corrida desde source_snapshot_version persistido.
- Given corrida nueva, When se compara con la anterior, Then se muestran diferencias de cobertura, riesgos, artefactos y resultados de tests.
- Given constructos no soportados, When finaliza análisis, Then aparecen en unsupported_constructs con severidad e impacto.
- Given TEST_GATE verde, When usuario activa Test Preview, Then se levanta entorno efímero con backend, frontend y DB específica del proyecto/corrida.
- Given preview activo, When usuario detiene o expira TTL, Then se apaga entorno y libera recursos.
- Given fallo al iniciar preview, When termina intento, Then se registra preview_status=failed con preview_failure_reason y logs resumidos.
- Given quality gate verde, When plataforma publica, Then crea rama y PR en GitHub; merge queda en manos del usuario.
- Given V1, When se revisa repo generado, Then OpenSpec está preconfigurado pero no operativo conversacionalmente.
20) Definition of Done (suficiente y ejecutable)
- Flujo end-to-end estable: ingestión -> análisis relacional unificado -> IR/Graph -> generación -> pruebas -> preview -> GitHub.
- Conversión multiarchivo funcional con trazabilidad completa source_ref -> ir_ref -> target_ref.
- Re-modernización con comentario operativa sobre fuentes persistidas.
- Estado PARTIAL + reintento por etapa implementados y verificados.
- Test Preview funcional con entorno efímero aislado y DB específica por proyecto/corrida creada al iniciar preview.
- Quality gates y smoke tests bloquean promoción si hay fallos críticos.
- Costos de modelos registrados por corrida y detenidos por límite configurable.
- OpenSpec operativo para plataforma y preconfigurado en proyectos generados (sin ejecución conversacional en V1).
- Integración GitHub funcional con rama y PR por corrida.
- UI por proyecto clara, con tabs mínimas y estados verificables.
- Especificación implementable por agente sin ambigüedades.