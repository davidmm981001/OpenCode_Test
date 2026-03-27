from pathlib import Path
import shutil
from uuid import uuid4

from app.celery_app import celery_app
from app.config import get_settings


def _workspace_path(run_id: str) -> Path:
    settings = get_settings()
    base = Path(settings.run_workspace_root)
    return base / run_id


@celery_app.task(name="app.worker_tasks.run_smoke_job")
def run_smoke_job(run_id: str | None = None) -> dict:
    resolved_run_id = run_id or str(uuid4())
    workspace = _workspace_path(resolved_run_id)
    workspace.mkdir(parents=True, exist_ok=False)

    try:
        marker = workspace / "run.txt"
        marker.write_text(f"run_id={resolved_run_id}\nstatus=running\n", encoding="utf-8")
        return {"run_id": resolved_run_id, "workspace": str(workspace), "status": "ok"}
    finally:
        shutil.rmtree(workspace, ignore_errors=True)
