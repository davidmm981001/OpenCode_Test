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

from backend.routers.chat.index import chat_router
from backend.routers.management import management_router
from backend.middlewares.rate_limit import request_limit_middleware
from backend.models.model_config import ModelConfig


def init_settings():
    return None


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

app.include_router(
    chat_router,
    prefix="/api/chat",
    tags=["Chat"],
    dependencies=[Depends(request_limit_middleware)],
)
app.include_router(management_router, prefix="/api/management", tags=["Management"])


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

    server = uvicorn.Server(uvicorn_config)
    server.run()
