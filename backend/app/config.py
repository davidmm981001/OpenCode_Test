from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    app_name: str = "SoftFab Platform"
    app_env: str = "development"

    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    frontend_origin: str = "http://localhost:5173"

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "softfab"
    postgres_user: str = "softfab"
    postgres_password: str = "softfab"

    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: str | None = None

    celery_broker_url: str | None = None
    celery_result_backend: str | None = None
    celery_worker_count: int = Field(default=3, ge=1)
    celery_worker_pool: str = "threads"

    run_workspace_root: str = "worker_runs"

    source_max_file_bytes: int = Field(default=2_000_000, ge=1024)
    source_max_files_per_upload: int = Field(default=300, ge=1)

    run_max_cost_usd: float = Field(default=10.0, ge=0)

    model_config = SettingsConfigDict(
        env_file=str(ROOT_ENV_FILE),
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def postgres_dsn(self) -> str:
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}@"
            f"{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def redis_url(self) -> str:
        auth = f":{self.redis_password}@" if self.redis_password else ""
        return f"redis://{auth}{self.redis_host}:{self.redis_port}/{self.redis_db}"

    def redis_url_for_db(self, db: int) -> str:
        auth = f":{self.redis_password}@" if self.redis_password else ""
        return f"redis://{auth}{self.redis_host}:{self.redis_port}/{db}"

    @property
    def resolved_celery_broker_url(self) -> str:
        return self.celery_broker_url or self.redis_url_for_db(self.redis_db)

    @property
    def resolved_celery_result_backend(self) -> str:
        return self.celery_result_backend or self.redis_url_for_db(self.redis_db + 1)


@lru_cache
def get_settings() -> Settings:
    return Settings()
