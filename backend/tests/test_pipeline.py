from __future__ import annotations

from io import BytesIO
from pathlib import Path
import sys

from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.main import app


def _files_payload() -> list[tuple[str, tuple[str, BytesIO, str]]]:
    cobol = b"IDENTIFICATION DIVISION.\nPROGRAM-ID. DEMO01.\nCALL 'PROG2'.\n"
    bms = b"MAPA DFHMDI SIZE=(24,80)\nSEND MAP(MAPA)\n"
    return [
        ("files", ("demo.CBL", BytesIO(cobol), "text/plain")),
        ("files", ("screen.BMS", BytesIO(bms), "text/plain")),
    ]


def test_create_project_and_run() -> None:
    client = TestClient(app)
    create = client.post("/api/projects", json={"name": "Proyecto Legacy QA"})
    assert create.status_code == 200
    project_id = create.json()["project_id"]

    run_resp = client.post(f"/api/projects/{project_id}/runs", files=_files_payload())
    assert run_resp.status_code == 200
    body = run_resp.json()
    assert body["state"] in {"PARTIAL", "READY"}

    detail = client.get(f"/api/projects/{project_id}/runs/{body['run_id']}")
    assert detail.status_code == 200
    run = detail.json()
    assert "INGEST" in run["stages"]
    assert run["stages"]["INGEST"]["status"] == "success"

    artifact = client.get(
        f"/api/projects/{project_id}/runs/{body['run_id']}/artifacts/contexto_unificado.json"
    )
    assert artifact.status_code == 200
    assert "programs" in artifact.json()["content"]


def test_local_preview_mode(monkeypatch) -> None:
    monkeypatch.setenv("PREVIEW_MODE", "local")
    monkeypatch.setenv("LOCAL_PREVIEW_BASE_URL", "http://127.0.0.1:8000")

    client = TestClient(app)
    create = client.post("/api/projects", json={"name": "Proyecto Preview Local"})
    assert create.status_code == 200
    project_id = create.json()["project_id"]

    run_resp = client.post(f"/api/projects/{project_id}/runs", files=_files_payload())
    assert run_resp.status_code == 200
    run_id = run_resp.json()["run_id"]

    detail = client.get(f"/api/projects/{project_id}/runs/{run_id}")
    assert detail.status_code == 200
    run = detail.json()
    assert run["metadata"]["preview_mode"] == "local"
    assert run["stages"]["PUBLISH_GITHUB"]["status"] == "skipped"
    assert run["stages"]["DEPLOY_RAILWAY"]["status"] == "skipped"
    assert "/preview/local/" in run["metadata"]["preview_url_public"]
    assert run["metadata"]["preview_url_public"].endswith("/app")

    preview = client.get(f"/preview/local/{project_id}/{run_id}")
    assert preview.status_code == 200
    assert "Local Preview" in preview.text

    generated_preview = client.get(f"/preview/local/{project_id}/{run_id}/app")
    assert generated_preview.status_code == 200
    assert "Generated Modernized App" in generated_preview.text


def test_rag_source_upload() -> None:
    client = TestClient(app)
    status_before = client.get("/api/rag/status")
    assert status_before.status_code == 200

    rag_payload = [
        (
            "files",
            (
                "rag-cobol-note.md",
                BytesIO(b"CALL TRANSACCIONX en COBOL dispara flujo de validacion y envio de mapa BMS."),
                "text/markdown",
            ),
        )
    ]
    upload = client.post("/api/rag/sources", files=rag_payload)
    assert upload.status_code == 200
    assert upload.json()["uploaded"] == 1

    status_after = client.get("/api/rag/status")
    assert status_after.status_code == 200
    assert status_after.json()["docs_count"] >= status_before.json()["docs_count"]
