from dotenv import load_dotenv
from backend.constants import ENV_FILE_PATH

load_dotenv(dotenv_path=ENV_FILE_PATH, verbose=False, override=False)

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]

# flake8: noqa
import logging
import os

import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from create_llama.backend.app.settings import init_settings
from create_llama.backend.app.api.routers.upload import file_upload_router
from create_llama.backend.app.api.routers.chat_config import config_router
from backend.models.model_config import ModelConfig
from backend.controllers.providers import AIProvider
from backend.routers.chat.index import chat_router
from backend.routers.management import management_router
from backend.middlewares.rate_limit import request_limit_middleware

try:
    from create_llama.backend.app.api.routers.sandbox import sandbox_router
except Exception:
    sandbox_router = None


init_settings()

app = FastAPI(
    title="RAGapp",
    root_path=os.getenv("BASE_URL", ""),
)

environment = os.getenv("ENVIRONMENT")
if environment == "dev":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Use upload router form create-llama codebase
app.include_router(
    file_upload_router,
    prefix="/api/chat/upload",
    tags=["Chat"],
    dependencies=[Depends(request_limit_middleware)],
)
app.include_router(config_router, prefix="/api/chat/config", tags=["Chat"])
if sandbox_router is not None:
    app.include_router(sandbox_router, prefix="/api/sandbox", tags=["Sandbox"])
# RAGapp routers
app.include_router(
    chat_router,
    prefix="/api/chat",
    tags=["Chat"],
    dependencies=[Depends(request_limit_middleware)],
)
app.include_router(management_router, prefix="/api/management", tags=["Management"])


@app.get("/api/management/config/is_configured")
def management_is_configured():
    return ModelConfig.get_config().configured


@app.get("/api/management/config/models")
def management_get_model_config():
    return ModelConfig.get_config().to_api_response()


@app.post("/api/management/config/models")
def management_update_model_config(new_config: ModelConfig):
    new_config.to_env_file()
    new_config.to_runtime_env()
    init_settings()
    return {
        "message": "Config updated successfully.",
        "data": ModelConfig.get_config().to_api_response(),
    }


@app.get("/api/management/config/models/list")
def management_list_models(
    provider: str | None = None, provider_url: str | None = None
):
    return AIProvider.fetch_available_models(provider or "", provider_url or "")


@app.get("/")
async def redirect():
    config = ModelConfig.get_config()
    if config.configured:
        # system is configured - / points to chat UI
        return FileResponse("static/index.html")
    else:
        # system is not configured - redirect to onboarding page
        return RedirectResponse(url="/admin/#new")


# Mount the data files to serve the file viewer
app.mount(
    "/api/files/data",
    StaticFiles(directory="data", check_dir=False),
)

# Mount the output files from tools
app.mount(
    "/api/files/output",
    StaticFiles(directory="output", check_dir=False),
)

# Mount the frontend static files
app.mount(
    "",
    StaticFiles(directory="static", check_dir=False, html=True),
)

if __name__ == "__main__":
    app_host = os.getenv("APP_HOST", "0.0.0.0")
    app_port = int(os.getenv("APP_PORT", "8000"))
    reload = environment == "dev"

    uvicorn_config = uvicorn.Config(
        app="main:app",
        host=app_host,
        port=app_port,
        reload=reload,
        loop="asyncio",
    )

    if reload:
        uvicorn_config.reload_dirs = ["backend"]

    server = uvicorn.Server(uvicorn_config)
    server.run()
