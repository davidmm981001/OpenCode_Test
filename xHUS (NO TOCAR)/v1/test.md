Contexto transversal obligatorio (aplica a TODAS las sub-HUs)
- IMPORTANTE: Recuerda que en open spec primero se generan los specs. Lee la documentacion de open spec, sigue SDD estrictamente, es decir debes crear el archivo proposal para este nuevo delta change y todos los archivos respectivos para cada nuevo delta change dentro de esta hu. Luego debes ejecutar los comandos de open spec para cada delta change, leyendo bien la documentación.
- Sigue estrictamente Open Spec y la metodología SDD.
- Ejecutar cada sub-HU con OpenSpec/SDD, en 1 o varios delta changes atómicos.
- LO MAS IMPORTANTE: Para esto debes leer la doc de open spec y ejecutar los comandos opsx apply, archive, explore, etc. además construir los archivos necesarios antes para los delta changes de cada hu respectiva.
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
- Realizar pruebas para cada hu, y asegurarse que funcione bien.
- Arquitectura para esta plataforma base: Bootstrap React + FastAPI + PostgreSQL + Redis + Docker y Docker Compose, Redis, Celery.




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




Cierre global de secuencia (TODAS LAS HUS, hacia donde van)
- Para cuando se completa la corrida de la HU-10, queda cubierta íntegramente la HU principal original:
  - modernización multiarchivo relacional,
  - IR/Graph trazables,
  - generación Java/React/PostgreSQL,
  - pruebas y quality gates,
  - publicación GitHub,
  - re-modernización por comentario,
  - preview local real con DB específica.
- Todo queda secuencial, modular y sin cabos sueltos para ejecución con SDD/OpenSpec.