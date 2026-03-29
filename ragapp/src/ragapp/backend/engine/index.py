import logging
import os

from pydantic import BaseModel
from llama_index.core.callbacks import CallbackManager
from llama_index.core.indices import VectorStoreIndex

from backend.engine.llamacloud_index import (
    IndexConfig as LlamaCloudIndexConfig,
    get_index as get_llama_cloud_index,
)
from backend.engine.vectordb import get_vector_store

logger = logging.getLogger("uvicorn")


class IndexConfig(BaseModel):
    callback_manager: CallbackManager | None = None

    def __new__(cls, *args, **kwargs):
        if os.getenv("USE_LLAMA_CLOUD", "false").lower() == "true":
            return LlamaCloudIndexConfig(callback_manager=CallbackManager())
        return super().__new__(cls)

    def __init__(self, callback_manager: CallbackManager | None = None):
        self.callback_manager = callback_manager or CallbackManager()

    @classmethod
    def from_env(cls):
        if os.getenv("USE_LLAMA_CLOUD", "false").lower() == "true":
            return LlamaCloudIndexConfig()
        return cls()


def get_index(index_config=None):
    if index_config is None:
        index_config = IndexConfig.from_env()

    if isinstance(index_config, LlamaCloudIndexConfig):
        return get_llama_cloud_index(index_config)

    store = get_vector_store()
    index = VectorStoreIndex.from_vector_store(
        store, callback_manager=index_config.callback_manager
    )
    logger.info("Finished load index from vector store.")
    return index


def get_client():
    if os.getenv("USE_LLAMA_CLOUD", "false").lower() == "true":
        from backend.engine.llamacloud_index import get_client as get_llama_client

        return get_llama_client()

    return None
