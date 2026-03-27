from __future__ import annotations

import json
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.responses import FileResponse
from .cors_middleware import CORSErrorCatchMiddleware

from .config import get_preview_mode
from .models import CreateProjectRequest, CreateRunResponse, Project, RunRecord
from .pipeline import execute_pipeline
from .rag import rag_index
from .storage import storage
from .utils import normalize_remod_comment, now_id, slugify, utc_now_iso

app = FastAPI(title="Legacy Modernization Platform", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(CORSErrorCatchMiddleware)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/config/preview-mode")
def preview_mode() -> dict[str, str]:
    return {"preview_mode": get_preview_mode()}


@app.get("/api/rag/status")
def rag_status() -> dict:
    return rag_index.status()


@app.post("/api/rag/sources")
def rag_sources(files: Annotated[list[UploadFile], File(description="RAG source files")]) -> dict:
    docs: list[dict] = []
    for upload in files:
        content = upload.file.read()
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = content.decode("latin-1", errors="replace")
        docs.append(
            {
                "source": upload.filename or "rag-source",
                "version": "uploaded",
                "text": text,
            }
        )
    result = rag_index.add_documents(docs)
    return {"uploaded": len(docs), **result}


@app.get("/api/projects")
def list_projects() -> list[dict[str, str]]:
    return [project.model_dump() for project in storage.list_projects()]


@app.post("/api/projects")
def create_project(payload: CreateProjectRequest) -> dict[str, str]:
    projects = storage.list_projects()
    slug = slugify(payload.name)
    project = Project(
        project_id=f"prj-{now_id().split('_')[-1]}",
        slug=slug,
        name=payload.name,
        created_at=utc_now_iso(),
    )
    projects.append(project)
    storage.save_projects(projects)
    return project.model_dump()


@app.get("/api/projects/{project_id}/runs")
def list_runs(project_id: str) -> list[dict]:
    return [run.model_dump() for run in storage.list_runs(project_id)]


@app.get("/api/projects/{project_id}/runs/{run_id}")
def get_run(project_id: str, run_id: str) -> dict:
    runs = storage.list_runs(project_id)
    found = next((run for run in runs if run.run_id == run_id), None)
    if not found:
        raise HTTPException(status_code=404, detail="Run not found")
    return found.model_dump()


@app.get("/api/projects/{project_id}/runs/{run_id}/artifacts/{artifact_name}")
def read_artifact(project_id: str, run_id: str, artifact_name: str) -> dict[str, str]:
    run_dir = storage.run_dir(project_id, run_id)
    artifact = run_dir / artifact_name
    if not artifact.exists():
        raise HTTPException(status_code=404, detail="Artifact not found")
    return {"artifact": artifact_name, "content": artifact.read_text(encoding="utf-8")}


@app.post("/api/projects/{project_id}/runs")
def create_run(
    project_id: str,
    files: Annotated[list[UploadFile], File(description=".cbl/.cob/.bms/.cpy files")],
    comment: Annotated[str | None, Form()] = None,
    previous_run_id: Annotated[str | None, Form()] = None,
) -> CreateRunResponse:
    projects = storage.list_projects()
    project = next((item for item in projects if item.project_id == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if previous_run_id and (not comment or len(comment.strip()) < 10):
        raise HTTPException(status_code=400, detail="Re-modernize requiere comentario minimo de 10 caracteres")

    run_id = now_id()
    run = RunRecord(
        run_id=run_id,
        project_id=project_id,
        state="RUNNING",
        source_snapshot_version=f"snapshot_{run_id}",
        created_at=utc_now_iso(),
        updated_at=utc_now_iso(),
        comment=comment,
        previous_run_id=previous_run_id,
    )
    if previous_run_id and comment:
        run.metadata["remodernize_comment_normalized"] = normalize_remod_comment(comment)

    run_dir = storage.run_dir(project_id, run_id)
    run = execute_pipeline(run, files, run_dir, project.slug)

    runs = storage.list_runs(project_id)
    runs.append(run)
    storage.save_runs(project_id, runs)

    return CreateRunResponse(
        project_id=project_id,
        run_id=run_id,
        state=run.state,
        message="Corrida ejecutada",
    )


@app.get("/api/projects/{project_id}/runs/{run_id}/diff/{other_run_id}")
def compare_runs(project_id: str, run_id: str, other_run_id: str) -> dict:
    runs = storage.list_runs(project_id)
    current = next((item for item in runs if item.run_id == run_id), None)
    previous = next((item for item in runs if item.run_id == other_run_id), None)
    if not current or not previous:
        raise HTTPException(status_code=404, detail="Run(s) not found")

    current_stories = Path(current.artifacts.get("historias_usuario.md", ""))
    previous_stories = Path(previous.artifacts.get("historias_usuario.md", ""))
    current_text = current_stories.read_text(encoding="utf-8") if current_stories.exists() else ""
    previous_text = previous_stories.read_text(encoding="utf-8") if previous_stories.exists() else ""

    return {
        "run_id": run_id,
        "other_run_id": other_run_id,
        "state_change": {"from": previous.state, "to": current.state},
        "warnings_change": {"from": len(previous.warnings), "to": len(current.warnings)},
        "stories_change": {
            "from_count": previous_text.count("## HU-"),
            "to_count": current_text.count("## HU-"),
        },
        "links": {
            "github_from": previous.metadata.get("github_repo_url"),
            "github_to": current.metadata.get("github_repo_url"),
            "preview_from": previous.metadata.get("preview_url_public"),
            "preview_to": current.metadata.get("preview_url_public"),
        },
    }


@app.get("/preview/local/{project_id}/{run_id}", response_class=HTMLResponse)
def local_preview(project_id: str, run_id: str) -> str:
    runs = storage.list_runs(project_id)
    run = next((item for item in runs if item.run_id == run_id), None)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    stages_html = "".join(
        f"<tr><td>{name}</td><td>{stage.status}</td></tr>" for name, stage in run.stages.items()
    )
    repo = run.metadata.get("github_repo_url", "-")
    preview_mode = run.metadata.get("preview_mode", "local")
    stories_ref = run.artifacts.get("historias_usuario.md", "")
    context_ref = run.artifacts.get("contexto_unificado.json", "")

    return f"""
<!doctype html>
<html lang=\"en\">
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <title>Local Preview {run_id}</title>
    <style>
      body {{ font-family: Segoe UI, Arial, sans-serif; margin: 0; background: #f5f7fb; color: #1f2937; }}
      .shell {{ max-width: 980px; margin: 0 auto; padding: 20px; }}
      .card {{ background: #fff; border: 1px solid #d6deeb; border-radius: 10px; padding: 16px; margin-bottom: 12px; }}
      table {{ width: 100%; border-collapse: collapse; }}
      th, td {{ text-align: left; border-bottom: 1px solid #e5eaf2; padding: 8px; }}
      .badge {{ display: inline-block; padding: 4px 8px; border-radius: 999px; background: #0f766e; color: white; }}
      code {{ background: #eef2ff; padding: 1px 5px; border-radius: 4px; }}
    </style>
  </head>
  <body>
    <div class=\"shell\">
      <div class=\"card\">
        <h1>Local Preview - {run_id}</h1>
        <p>Proyecto: <strong>{project_id}</strong></p>
        <p>Estado: <span class=\"badge\">{run.state}</span></p>
        <p>Modo preview: <strong>{preview_mode}</strong> (sin publish/deploy remotos)</p>
      </div>

      <div class=\"card\">
        <h2>Pipeline</h2>
        <table>
          <thead><tr><th>Etapa</th><th>Estado</th></tr></thead>
          <tbody>{stages_html}</tbody>
        </table>
      </div>

      <div class=\"card\">
        <h2>Trazabilidad</h2>
        <p><code>source_ref -> context_ref -> story_ref -> target_ref</code></p>
        <p>Contexto: {context_ref or '-'} </p>
        <p>Historias: {stories_ref or '-'} </p>
      </div>

      <div class=\"card\">
        <h2>Integraciones</h2>
        <p>GitHub: {repo}</p>
        <p>Railway: {run.metadata.get('railway_deploy_status', '-')}</p>
      </div>
    </div>
  </body>
</html>
"""


@app.get("/preview/local/{project_id}/{run_id}/app")
def local_generated_app(project_id: str, run_id: str):
    run_dir = storage.run_dir(project_id, run_id)
    app_file = run_dir / "generated" / "frontend" / "dist" / "index.html"
    if not app_file.exists():
        raise HTTPException(status_code=404, detail="Generated app not found")
    return FileResponse(path=str(app_file), media_type="text/html")
