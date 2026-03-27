## ADDED Requirements

### Requirement: Analisis relacional multiarchivo obligatorio
El sistema MUST analizar todos los archivos de la corrida (`.cbl/.cob/.bms/.cpy`) como un sistema unificado y construir relaciones entre programas, pantallas, campos, transacciones y SQL embebido.

#### Scenario: Construccion de contexto unificado
- **WHEN** finaliza la etapa `ANALYZE`
- **THEN** el sistema genera `contexto_unificado.json` con `meta`, `sources`, `programs`, `screens`, `relations`, `transactions`, `business_rules`, `traceability`, `confidence`, `unsupported_or_uncertain`

### Requirement: RAG COBOL/BMS obligatorio previo al analisis
El sistema MUST consultar RAG especializado COBOL/BMS antes y durante `ANALYZE` y `STORIES`, con `top_k >= 8` y filtro por `RAG_MIN_SCORE`.

#### Scenario: Consulta RAG con evidencia suficiente
- **WHEN** A1 o A2 solicita evidencia de mapeo COBOL/BMS
- **THEN** el modulo RAG retorna chunks relevantes con metadatos de fuente y se inyectan al contexto del agente

### Requirement: Construccion inicial del RAG
El sistema MUST construir el indice RAG en `RAG_INDEX_PATH` si no existe uno previo, usando fuentes fidedignas de COBOL/BMS, chunking aproximado de 512 tokens con overlap de 64 y embeddings configurados por `OPENAI_EMBEDDING_MODEL`.

#### Scenario: Primer arranque sin indice previo
- **WHEN** el worker inicia y `RAG_INDEX_PATH` no existe
- **THEN** el sistema construye el indice, lo persiste y habilita corridas solo cuando la construccion finaliza

### Requirement: Anti-hallucination con registro de incertidumbre
El sistema MUST marcar `low_confidence` y registrar evidencia insuficiente en `unsupported_or_uncertain` con archivo, linea y motivo cuando no exista soporte recuperado para una regla critica.

#### Scenario: Evidencia insuficiente
- **WHEN** la consulta RAG retorna vacio o puntajes bajo umbral para una inferencia critica
- **THEN** el sistema evita inferir sin soporte y agrega entrada trazable en `unsupported_or_uncertain`

### Requirement: Activacion de skill COBOL y skills complementarias
El sistema MUST cargar skill de analisis COBOL y skills complementarias del pipeline durante `ANALYZE` y `STORIES`.

#### Scenario: Inicio de etapa de analisis
- **WHEN** arranca `ANALYZE`
- **THEN** el contexto de A1 incluye skill COBOL activa, heuristicas semanticas y contexto RAG recuperado

### Requirement: Carga manual de fuentes RAG antes de corrida
El sistema MUST permitir cargar fuentes RAG desde la plataforma antes de ejecutar una corrida para enriquecer el conocimiento COBOL/BMS y reducir alucinaciones.

#### Scenario: Carga de fuente RAG exitosa
- **WHEN** el usuario carga documentos RAG validos desde la UI
- **THEN** el sistema indexa los documentos en ChromaDB, actualiza el estado RAG y deja la evidencia disponible para ANALYZE y STORIES
