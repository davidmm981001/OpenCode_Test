from __future__ import annotations

import hashlib
import re
import uuid
from datetime import UTC, datetime


def utc_now_iso() -> str:
    return datetime.now(tz=UTC).isoformat()


def now_id() -> str:
    stamp = datetime.now(tz=UTC).strftime("%Y%m%d_%H%M%S")
    return f"run_{stamp}_{uuid.uuid4().hex[:8]}"


def slugify(value: str) -> str:
    text = value.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-{2,}", "-", text)
    return text.strip("-") or "project"


def sha256_bytes(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def decode_with_normalization(content: bytes) -> tuple[str, str, bool]:
    try:
        return content.decode("utf-8"), "utf-8", False
    except UnicodeDecodeError:
        pass

    for candidate in ("cp500", "latin-1", "cp1252"):
        try:
            decoded = content.decode(candidate)
            return decoded, candidate, True
        except UnicodeDecodeError:
            continue
    return content.decode("utf-8", errors="replace"), "unknown", True


def normalize_remod_comment(comment: str) -> dict[str, str]:
    text = comment.strip()
    return {
        "funcional": text,
        "tecnico": "Ajustar implementacion y trazabilidad segun comentario.",
        "prioridades": "fidelidad-funcional, estabilidad-pipeline, trazabilidad",
        "exclusiones": "no-cambiar-snapshot-original",
    }
