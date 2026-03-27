# SoftFab V2

Plataforma base de modernizacion construida con enfoque SDD/OpenSpec.

## Stack HU-01

- Frontend: React + Vite
- Backend: FastAPI
- Workers: Celery (minimo 3, configurable)
- Infraestructura local: PostgreSQL + Redis (Docker Compose)

## Flujo SDD estricto

1. Crear o actualizar artefactos del cambio OpenSpec.
2. Validar en estricto:
   - `openspec validate --type change --strict <change-name>`
3. Implementar tareas (`tasks.md`) con `/opsx-apply`.
4. Revalidar en estricto.
5. Cerrar sub-HU con criterios de aceptacion + DoD.
6. Archivar cambio.

Referencia completa: `docs/sdd-estricto.md`.

## Ejecutar HU-01 local

1. Copiar variables de entorno:
   - `cp .env.example .env` (o equivalente en Windows)
2. Levantar infraestructura:
   - `docker compose up -d`
3. Backend:
   - `python -m venv .venv`
   - `./.venv/Scripts/pip install -r backend/requirements.txt`
   - `./.venv/Scripts/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend`
4. Worker Celery:
   - `PYTHONPATH=backend ./.venv/Scripts/celery -A app.celery_app:celery_app worker --loglevel=info --concurrency=3 --pool=threads`
5. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev -- --host 0.0.0.0 --port 5173`

## Endpoints

- `GET /health` en `http://localhost:8000/health`
- `POST /projects`, `GET /projects`, `PUT /projects/{id}`, `DELETE /projects/{id}`
- `POST /projects/{id}/sources/upload`
- `GET /projects/{id}/files`
- `POST /projects/{id}/analysis/relational`
- `GET /projects/{id}/analysis/relational/latest`

## Workspace efimero por corrida

- Directorio base configurable por `RUN_WORKSPACE_ROOT` en `.env`.
- Cada run usa un directorio unico y se limpia automaticamente al finalizar.

## Persistencia de fuentes (HU-02)

- Las fuentes originales se persisten por snapshot en PostgreSQL (`source_snapshot_version`).
- Esta persistencia no depende del workspace efimero del worker.

## Parsing relacional (HU-03)

- Analisis deterministico multiarchivo con base de parseo ANTLR4 runtime.
- Resolucion cruzada de `COPY`, `CALL` y enlaces COBOL/BMS/CPY/JCL.
- Salida relacional unificada con cobertura por constructo y `unsupported_constructs`.

## Gobernanza SDD A/B

Documento oficial: `docs/sdd-separacion-a-b.md`.
