from contextlib import contextmanager
from datetime import datetime
from hashlib import sha256
from io import BytesIO
from pathlib import PurePosixPath
from uuid import uuid4
import zipfile

from psycopg import Connection, connect

from app.config import get_settings


ALLOWED_EXTENSIONS = {".cob", ".cbl", ".cpy", ".bms", ".jcl", ".zip"}
TEXT_EXTENSIONS = {".cob", ".cbl", ".cpy", ".bms", ".jcl"}


@contextmanager
def db_conn() -> Connection:
    settings = get_settings()
    with connect(settings.postgres_dsn, autocommit=False) as conn:
        yield conn


def init_schema() -> None:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    description TEXT,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS source_snapshots (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL REFERENCES projects(id),
                    version INTEGER NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    UNIQUE(project_id, version)
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS source_files (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL REFERENCES projects(id),
                    snapshot_id TEXT NOT NULL REFERENCES source_snapshots(id),
                    file_name TEXT NOT NULL,
                    extension TEXT NOT NULL,
                    encoding TEXT NOT NULL,
                    size_bytes INTEGER NOT NULL,
                    sha256 TEXT NOT NULL,
                    content BYTEA NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS relational_analysis_runs (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL REFERENCES projects(id),
                    snapshot_id TEXT NOT NULL REFERENCES source_snapshots(id),
                    snapshot_version INTEGER NOT NULL,
                    coverage_json JSONB NOT NULL,
                    relational_json JSONB NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS unsupported_constructs (
                    id TEXT PRIMARY KEY,
                    run_id TEXT NOT NULL REFERENCES relational_analysis_runs(id),
                    file_id TEXT NOT NULL REFERENCES source_files(id),
                    file_name TEXT NOT NULL,
                    line INTEGER,
                    construct TEXT NOT NULL,
                    detail TEXT,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
        conn.commit()


def now_iso(value: datetime) -> str:
    return value.isoformat()


def normalize_path(name: str) -> str:
    normalized = PurePosixPath(name.replace("\\", "/"))
    if normalized.is_absolute() or ".." in normalized.parts:
        raise ValueError("Ruta de archivo invalida en zip")
    cleaned = str(normalized).strip("/")
    if not cleaned:
        raise ValueError("Nombre de archivo vacio")
    return cleaned


def detect_encoding(extension: str, raw: bytes) -> str:
    if extension not in TEXT_EXTENSIONS:
        return "binary"
    try:
        raw.decode("utf-8")
        return "utf-8"
    except UnicodeDecodeError:
        raw.decode("latin-1")
        return "latin-1"


def validate_extension(name: str) -> str:
    ext = PurePosixPath(name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Extension no soportada: {ext or '<sin extension>'}")
    return ext


def file_digest(raw: bytes) -> str:
    return sha256(raw).hexdigest()


def expand_upload(file_name: str, raw: bytes) -> list[tuple[str, bytes, str]]:
    extension = validate_extension(file_name)
    if extension != ".zip":
        return [(normalize_path(file_name), raw, extension)]

    entries: list[tuple[str, bytes, str]] = []
    with zipfile.ZipFile(BytesIO(raw)) as zf:
        for member in zf.infolist():
            if member.is_dir():
                continue
            normalized_name = normalize_path(member.filename)
            ext = validate_extension(normalized_name)
            if ext == ".zip":
                raise ValueError("Zip anidado no permitido")
            entries.append((normalized_name, zf.read(member), ext))
    if not entries:
        raise ValueError("El zip no contiene archivos soportados")
    return entries


def new_id() -> str:
    return str(uuid4())
