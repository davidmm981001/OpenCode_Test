from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import dotenv_values, load_dotenv


load_dotenv()
_DOTENV_FALLBACK = dotenv_values(".env")


def _env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if not value:
        return default
    try:
        return int(value)
    except ValueError:
        return default


def _env_float(name: str, default: float) -> float:
    value = os.getenv(name)
    if not value:
        return default
    try:
        return float(value)
    except ValueError:
        return default


def _preview_mode() -> str:
    enabled = os.getenv("PREVIEW_ENABLED", "").strip().lower()
    if not enabled:
        enabled = str(_DOTENV_FALLBACK.get("PREVIEW_ENABLED", "")).strip().lower()
    if enabled == "false":
        return "local"

    explicit = os.getenv("PREVIEW_MODE", "").strip().lower()
    if not explicit:
        explicit = str(_DOTENV_FALLBACK.get("PREVIEW_MODE", "")).strip().lower()
    if explicit in {"local", "public"}:
        return explicit

    return "public"


def get_preview_mode() -> str:
    return _preview_mode()


def get_local_preview_base_url() -> str:
    value = os.getenv("LOCAL_PREVIEW_BASE_URL", "").strip()
    if not value:
        value = str(_DOTENV_FALLBACK.get("LOCAL_PREVIEW_BASE_URL", "")).strip()
    return value or "http://127.0.0.1:8000"


@dataclass(frozen=True)
class Settings:
    data_dir: Path = Path(os.getenv("DATA_DIR", "worker_runs"))
    rag_index_path: Path = Path(os.getenv("RAG_INDEX_PATH", "worker_runs/rag_index"))
    rag_top_k: int = _env_int("RAG_TOP_K", 8)
    rag_min_score: float = _env_float("RAG_MIN_SCORE", 0.05)
    max_source_file_mb: int = _env_int("MAX_SOURCE_FILE_MB", 20)
    max_run_files: int = _env_int("MAX_RUN_FILES", 200)
    run_cost_limit_usd: float = _env_float("RUN_COST_LIMIT_USD", 20.0)
    run_stop_on_cost_limit: bool = os.getenv("RUN_STOP_ON_COST_LIMIT", "true").strip().lower() == "true"
    preview_mode: str = _preview_mode()
    local_preview_base_url: str = os.getenv("LOCAL_PREVIEW_BASE_URL", "http://127.0.0.1:8000")
    github_default_repo_prefix: str = os.getenv("GITHUB_DEFAULT_REPO_PREFIX", "modernized")
    github_default_base_branch: str = os.getenv("GITHUB_DEFAULT_BASE_BRANCH", "main")


settings = Settings()
