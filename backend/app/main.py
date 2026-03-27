import json
from datetime import datetime

from fastapi import FastAPI, File, HTTPException, Query, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from psycopg import connect
from psycopg.errors import OperationalError as PsycopgOperationalError
from redis import Redis
from redis.exceptions import RedisError

from app.celery_app import celery_app
from app.config import get_settings
from app.db import (
    db_conn,
    detect_encoding,
    expand_upload,
    file_digest,
    init_schema,
    new_id,
    now_iso,
)
from app.relational_parser import SourceRecord, analyze_relational

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=2000)


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=2000)


class RelationalRunRequest(BaseModel):
    snapshot_version: int | None = Field(default=None, ge=1)


@app.on_event("startup")
def startup_init() -> None:
    init_schema()


def check_postgres() -> tuple[bool, str]:
    try:
        with connect(settings.postgres_dsn, connect_timeout=2) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
        return True, "ok"
    except (PsycopgOperationalError, Exception) as exc:
        return False, f"error: {exc.__class__.__name__}"


def check_redis() -> tuple[bool, str]:
    try:
        client = Redis.from_url(settings.redis_url, socket_connect_timeout=2, socket_timeout=2)
        client.ping()
        client.close()
        return True, "ok"
    except (RedisError, Exception) as exc:
        return False, f"error: {exc.__class__.__name__}"


def check_celery() -> tuple[bool, str, int, int]:
    try:
        inspector = celery_app.control.inspect(timeout=2)
        replies = inspector.ping() or {}
        worker_count = len(replies)
        stats = inspector.stats() or {}
        worker_slots = 0
        for worker_data in stats.values():
            pool = worker_data.get("pool") if isinstance(worker_data, dict) else None
            max_concurrency = pool.get("max-concurrency") if isinstance(pool, dict) else None
            if isinstance(max_concurrency, int):
                worker_slots += max_concurrency
        if worker_slots == 0:
            worker_slots = worker_count

        healthy = worker_slots >= settings.celery_worker_count
        detail = (
            f"ok ({worker_count} workers/{worker_slots} slots)"
            if healthy
            else f"insufficient-workers ({worker_slots}/{settings.celery_worker_count} slots)"
        )
        return healthy, detail, worker_count, worker_slots
    except Exception as exc:
        return False, f"error: {exc.__class__.__name__}", 0, 0


@app.get("/health", response_model=None)
def health():
    postgres_ok, postgres_detail = check_postgres()
    redis_ok, redis_detail = check_redis()
    celery_ok, celery_detail, celery_workers, celery_slots = check_celery()

    overall_ok = postgres_ok and redis_ok and celery_ok
    payload = {
        "status": "ok" if overall_ok else "degraded",
        "services": {
            "api": {"status": "ok"},
            "postgres": {"status": "ok" if postgres_ok else "error", "detail": postgres_detail},
            "redis": {"status": "ok" if redis_ok else "error", "detail": redis_detail},
            "celery": {
                "status": "ok" if celery_ok else "error",
                "detail": celery_detail,
                "active_workers": celery_workers,
                "worker_slots": celery_slots,
                "required_workers": settings.celery_worker_count,
            },
        },
        "environment": settings.app_env,
    }

    if overall_ok:
        return payload

    return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=payload)


def _project_or_404(project_id: str) -> dict:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, name, description, is_active, created_at, updated_at
                FROM projects
                WHERE id = %s
                """,
                (project_id,),
            )
            row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return {
        "id": row[0],
        "name": row[1],
        "description": row[2],
        "is_active": row[3],
        "created_at": now_iso(row[4]),
        "updated_at": now_iso(row[5]),
    }


@app.post("/projects")
def create_project(payload: ProjectCreate):
    project_id = new_id()
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO projects (id, name, description)
                VALUES (%s, %s, %s)
                RETURNING created_at, updated_at
                """,
                (project_id, payload.name.strip(), payload.description),
            )
            row = cur.fetchone()
        conn.commit()
    return {
        "id": project_id,
        "name": payload.name.strip(),
        "description": payload.description,
        "is_active": True,
        "created_at": now_iso(row[0]),
        "updated_at": now_iso(row[1]),
    }


@app.get("/projects")
def list_projects(include_inactive: bool = Query(default=False)):
    query = (
        """
        SELECT id, name, description, is_active, created_at, updated_at
        FROM projects
        {where}
        ORDER BY updated_at DESC
        """
    )
    where_clause = "" if include_inactive else "WHERE is_active = TRUE"
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query.format(where=where_clause))
            rows = cur.fetchall()
    return [
        {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "is_active": row[3],
            "created_at": now_iso(row[4]),
            "updated_at": now_iso(row[5]),
        }
        for row in rows
    ]


@app.get("/projects/{project_id}")
def get_project(project_id: str):
    return _project_or_404(project_id)


@app.put("/projects/{project_id}")
def update_project(project_id: str, payload: ProjectUpdate):
    current = _project_or_404(project_id)
    name = payload.name.strip() if payload.name is not None else current["name"]
    description = payload.description if payload.description is not None else current["description"]

    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE projects
                SET name = %s,
                    description = %s,
                    updated_at = NOW()
                WHERE id = %s
                RETURNING updated_at
                """,
                (name, description, project_id),
            )
            row = cur.fetchone()
        conn.commit()

    current["name"] = name
    current["description"] = description
    current["updated_at"] = now_iso(row[0])
    return current


@app.delete("/projects/{project_id}")
def deactivate_project(project_id: str):
    _project_or_404(project_id)
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE projects
                SET is_active = FALSE,
                    updated_at = NOW()
                WHERE id = %s
                """,
                (project_id,),
            )
        conn.commit()
    return {"status": "ok", "project_id": project_id, "is_active": False}


@app.post("/projects/{project_id}/sources/upload")
async def upload_sources(project_id: str, files: list[UploadFile] = File(...)):
    project = _project_or_404(project_id)
    if not project["is_active"]:
        raise HTTPException(status_code=400, detail="Proyecto inactivo")

    if not files:
        raise HTTPException(status_code=400, detail="Debe enviar al menos un archivo")

    expanded_entries: list[tuple[str, bytes, str]] = []
    for upload in files:
        raw = await upload.read()
        if len(raw) > settings.source_max_file_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"Archivo excede limite de {settings.source_max_file_bytes} bytes",
            )
        try:
            expanded_entries.extend(expand_upload(upload.filename or "", raw))
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    if len(expanded_entries) > settings.source_max_files_per_upload:
        raise HTTPException(
            status_code=400,
            detail=f"La carga excede {settings.source_max_files_per_upload} archivos",
        )

    snapshot_id = new_id()
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT COALESCE(MAX(version), 0) FROM source_snapshots WHERE project_id = %s",
                (project_id,),
            )
            next_version = cur.fetchone()[0] + 1
            cur.execute(
                """
                INSERT INTO source_snapshots (id, project_id, version)
                VALUES (%s, %s, %s)
                """,
                (snapshot_id, project_id, next_version),
            )

            persisted = []
            for file_name, raw, extension in expanded_entries:
                if len(raw) > settings.source_max_file_bytes:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Archivo excede limite de {settings.source_max_file_bytes} bytes",
                    )
                encoding = detect_encoding(extension, raw)
                file_id = new_id()
                cur.execute(
                    """
                    INSERT INTO source_files (
                        id, project_id, snapshot_id, file_name, extension,
                        encoding, size_bytes, sha256, content
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        file_id,
                        project_id,
                        snapshot_id,
                        file_name,
                        extension,
                        encoding,
                        len(raw),
                        file_digest(raw),
                        raw,
                    ),
                )
                persisted.append(
                    {
                        "id": file_id,
                        "file_name": file_name,
                        "extension": extension,
                        "encoding": encoding,
                        "size_bytes": len(raw),
                    }
                )
        conn.commit()

    return {
        "project_id": project_id,
        "source_snapshot_version": next_version,
        "snapshot_id": snapshot_id,
        "files": persisted,
    }


@app.get("/projects/{project_id}/files")
def list_files(project_id: str, snapshot_version: int | None = Query(default=None, ge=1)):
    _project_or_404(project_id)
    with db_conn() as conn:
        with conn.cursor() as cur:
            if snapshot_version is None:
                cur.execute(
                    "SELECT id, version FROM source_snapshots WHERE project_id=%s ORDER BY version DESC LIMIT 1",
                    (project_id,),
                )
            else:
                cur.execute(
                    "SELECT id, version FROM source_snapshots WHERE project_id=%s AND version=%s",
                    (project_id, snapshot_version),
                )
            snapshot = cur.fetchone()
            if not snapshot:
                return {"project_id": project_id, "source_snapshot_version": None, "files": []}

            cur.execute(
                """
                SELECT id, file_name, extension, encoding, size_bytes, sha256, created_at
                FROM source_files
                WHERE snapshot_id = %s
                ORDER BY file_name ASC
                """,
                (snapshot[0],),
            )
            rows = cur.fetchall()

    return {
        "project_id": project_id,
        "source_snapshot_version": snapshot[1],
        "files": [
            {
                "id": row[0],
                "file_name": row[1],
                "extension": row[2],
                "encoding": row[3],
                "size_bytes": row[4],
                "sha256": row[5],
                "created_at": now_iso(row[6]),
            }
            for row in rows
        ],
    }


def _resolve_snapshot(project_id: str, snapshot_version: int | None) -> tuple[str, int]:
    with db_conn() as conn:
        with conn.cursor() as cur:
            if snapshot_version is None:
                cur.execute(
                    "SELECT id, version FROM source_snapshots WHERE project_id=%s ORDER BY version DESC LIMIT 1",
                    (project_id,),
                )
            else:
                cur.execute(
                    "SELECT id, version FROM source_snapshots WHERE project_id=%s AND version=%s",
                    (project_id, snapshot_version),
                )
            snapshot = cur.fetchone()
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot no encontrado")
    return snapshot[0], snapshot[1]


def _snapshot_files(snapshot_id: str) -> list[SourceRecord]:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, file_name, extension, encoding, content
                FROM source_files
                WHERE snapshot_id = %s
                ORDER BY file_name ASC
                """,
                (snapshot_id,),
            )
            rows = cur.fetchall()
    return [
        SourceRecord(
            file_id=row[0],
            file_name=row[1],
            extension=row[2],
            encoding=row[3],
            content=row[4],
        )
        for row in rows
    ]


@app.post("/projects/{project_id}/analysis/relational")
def run_relational_analysis(project_id: str, payload: RelationalRunRequest):
    project = _project_or_404(project_id)
    if not project["is_active"]:
        raise HTTPException(status_code=400, detail="Proyecto inactivo")

    snapshot_id, version = _resolve_snapshot(project_id, payload.snapshot_version)
    sources = _snapshot_files(snapshot_id)
    if not sources:
        raise HTTPException(status_code=400, detail="Snapshot sin fuentes")

    result = analyze_relational(sources)
    run_id = new_id()

    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO relational_analysis_runs (
                    id, project_id, snapshot_id, snapshot_version, coverage_json, relational_json
                )
                VALUES (%s, %s, %s, %s, %s::jsonb, %s::jsonb)
                """,
                (
                    run_id,
                    project_id,
                    snapshot_id,
                    version,
                    json.dumps(result["coverage"]),
                    json.dumps(result["relational"]),
                ),
            )

            for item in result["unsupported_constructs"]:
                cur.execute(
                    """
                    INSERT INTO unsupported_constructs (
                        id, run_id, file_id, file_name, line, construct, detail
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        new_id(),
                        run_id,
                        item["file_id"],
                        item["file_name"],
                        item.get("line"),
                        item["construct"],
                        item.get("detail"),
                    ),
                )
        conn.commit()

    return {
        "run_id": run_id,
        "project_id": project_id,
        "source_snapshot_version": version,
        "coverage": result["coverage"],
        "relations_total": len(result["relational"]["relations"]),
        "unresolved_total": len(result["relational"]["unresolved"]),
        "unsupported_total": len(result["unsupported_constructs"]),
    }


@app.get("/projects/{project_id}/analysis/relational/latest")
def get_latest_relational_analysis(project_id: str):
    _project_or_404(project_id)
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, snapshot_version, coverage_json, relational_json, created_at
                FROM relational_analysis_runs
                WHERE project_id = %s
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (project_id,),
            )
            row = cur.fetchone()

            if not row:
                return {"project_id": project_id, "run": None}

            cur.execute(
                """
                SELECT file_name, line, construct, detail
                FROM unsupported_constructs
                WHERE run_id = %s
                ORDER BY file_name ASC, line ASC NULLS LAST
                """,
                (row[0],),
            )
            unsupported = cur.fetchall()

    return {
        "project_id": project_id,
        "run": {
            "run_id": row[0],
            "source_snapshot_version": row[1],
            "coverage": row[2],
            "relational": row[3],
            "unsupported_constructs": [
                {
                    "file_name": item[0],
                    "line": item[1],
                    "construct": item[2],
                    "detail": item[3],
                }
                for item in unsupported
            ],
            "created_at": now_iso(row[4]),
        },
    }
