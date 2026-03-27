# Soft FAB V2 - Modernizacion Legacy (V1)

Implementacion base de la plataforma para ejecutar corridas de modernizacion sobre fuentes COBOL/BMS y generar artefactos de salida con trazabilidad.

## Estructura

- `backend/`: API FastAPI con pipeline de corridas (INGEST -> PREVIEW_READY)
- `frontend/`: UI React + Vite con tabs obligatorios y visor de artefactos
- `openspec/`: artefactos OpenSpec del cambio activo
- `worker_runs/`: datos persistidos por proyecto/corrida

## Ejecutar en local

### 1) Backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

### 2) Frontend

```bash
npm install --prefix frontend
npm run dev --prefix frontend
```

UI: `http://127.0.0.1:5173`

## Pruebas

```bash
pytest backend/tests
npm run build --prefix frontend
```

## Notas importantes

- El pipeline ejecuta quality gate. Si no hay Java/Maven disponibles, el check de backend generado falla y la corrida queda `PARTIAL`.
- Publish GitHub y Deploy Railway requieren `GITHUB_TOKEN/GITHUB_OWNER` y `RAILWAY_TOKEN` configurados.
- Modo preview:
  - `PREVIEW_MODE=public`: intenta publish GitHub + deploy Railway.
  - `PREVIEW_MODE=local`: salta publish/deploy y expone preview local en `/preview/local/{project_id}/{run_id}`.
  - Compatibilidad: `PREVIEW_ENABLED=false` (sin `PREVIEW_MODE`) equivale a `PREVIEW_MODE=local`.
