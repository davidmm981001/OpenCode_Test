from pydantic import BaseModel
from llama_index.core.callbacks import CallbackManager


class IndexConfig(BaseModel):
    callback_manager: CallbackManager | None = None


def get_index(config: IndexConfig | None = None):
    raise NotImplementedError("LlamaCloud is not enabled in this local build.")


def get_client():
    return None
