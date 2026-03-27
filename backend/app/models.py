from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


RunState = Literal["RUNNING", "READY", "PARTIAL", "FAILED"]
StageState = Literal["pending", "running", "success", "failed", "skipped"]


class StageResult(BaseModel):
    name: str
    status: StageState = "pending"
    started_at: str | None = None
    ended_at: str | None = None
    duration_ms: int | None = None
    details: dict[str, Any] = Field(default_factory=dict)


class Project(BaseModel):
    project_id: str
    slug: str
    name: str
    created_at: str


class RunRecord(BaseModel):
    run_id: str
    project_id: str
    state: RunState
    source_snapshot_version: str
    created_at: str
    updated_at: str
    comment: str | None = None
    previous_run_id: str | None = None
    warnings: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    stages: dict[str, StageResult] = Field(default_factory=dict)
    artifacts: dict[str, str] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)


class CreateProjectRequest(BaseModel):
    name: str = Field(min_length=3, max_length=120)


class CreateRunResponse(BaseModel):
    project_id: str
    run_id: str
    state: RunState
    message: str
