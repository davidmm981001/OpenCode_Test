from __future__ import annotations

import json
from pathlib import Path

from .config import settings
from .models import Project, RunRecord


class JsonStorage:
    def __init__(self) -> None:
        self.root = settings.data_dir
        self.root.mkdir(parents=True, exist_ok=True)
        self.projects_file = self.root / "projects.json"
        self.projects_file.touch(exist_ok=True)
        if self.projects_file.stat().st_size == 0:
            self.projects_file.write_text("[]", encoding="utf-8")

    def list_projects(self) -> list[Project]:
        payload = json.loads(self.projects_file.read_text(encoding="utf-8"))
        return [Project.model_validate(item) for item in payload]

    def save_projects(self, projects: list[Project]) -> None:
        self.projects_file.write_text(
            json.dumps([p.model_dump() for p in projects], indent=2),
            encoding="utf-8",
        )

    def project_dir(self, project_id: str) -> Path:
        path = self.root / project_id
        path.mkdir(parents=True, exist_ok=True)
        return path

    def runs_file(self, project_id: str) -> Path:
        file_path = self.project_dir(project_id) / "runs.json"
        file_path.touch(exist_ok=True)
        if file_path.stat().st_size == 0:
            file_path.write_text("[]", encoding="utf-8")
        return file_path

    def list_runs(self, project_id: str) -> list[RunRecord]:
        payload = json.loads(self.runs_file(project_id).read_text(encoding="utf-8"))
        return [RunRecord.model_validate(item) for item in payload]

    def save_runs(self, project_id: str, runs: list[RunRecord]) -> None:
        self.runs_file(project_id).write_text(
            json.dumps([r.model_dump() for r in runs], indent=2),
            encoding="utf-8",
        )

    def run_dir(self, project_id: str, run_id: str) -> Path:
        path = self.project_dir(project_id) / run_id
        path.mkdir(parents=True, exist_ok=True)
        return path


storage = JsonStorage()
