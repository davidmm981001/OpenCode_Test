import logging

from backend.models.chat_api import ChatData, EventCallbackHandler
from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from fastapi.responses import JSONResponse
from llama_index.core.agent import AgentRunner
from llama_index.core.chat_engine import CondensePlusContextChatEngine

from backend.engine import get_chat_engine
from backend.engine.query_filters import generate_filters

chat_router = r = APIRouter()

logger = logging.getLogger("uvicorn")


def _safe_text(value):
    if value is None:
        return None
    if isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def _serialize_sources(source_nodes):
    serialized = []
    for node in source_nodes:
        inner = getattr(node, "node", None)
        serialized.append(
            {
                "id": _safe_text(
                    getattr(inner, "node_id", None) or getattr(inner, "id_", None)
                ),
                "score": _safe_text(getattr(node, "score", None)),
                "text": _safe_text(getattr(inner, "text", None)),
                "metadata": _safe_text(getattr(inner, "metadata", None)),
            }
        )
    return serialized


@r.post("")
async def chat(
    data: ChatData,
    background_tasks: BackgroundTasks,
):
    try:
        last_message_content = data.get_last_message_content()
        messages = data.get_history_messages()

        doc_ids = data.get_chat_document_ids()
        filters = generate_filters(doc_ids)
        params = data.data or {}
        logger.info(
            f"Creating chat engine with filters: {str(filters)}",
        )
        event_handler = EventCallbackHandler()
        chat_engine = get_chat_engine(
            filters=filters,
            params=params,
            event_handlers=[event_handler],
            chat_history=messages,
        )

        if isinstance(chat_engine, CondensePlusContextChatEngine) or isinstance(
            chat_engine, AgentRunner
        ):
            event_handler = EventCallbackHandler()
            chat_engine.callback_manager.handlers.append(event_handler)  # type: ignore
            response = await chat_engine.achat(last_message_content, messages)
            return JSONResponse(
                {
                    "answer": response.response,
                    "sources": [],
                    "message": response.response,
                }
            )
        else:
            event_handler = chat_engine.run(input=last_message_content, streaming=False)
            result = await event_handler
            response_message = getattr(
                getattr(result, "response", None), "message", None
            )
            response_text = (
                getattr(response_message, "content", "") if response_message else ""
            )

            return JSONResponse(
                {
                    "answer": response_text,
                    "sources": [],
                    "message": response_text,
                }
            )
    except Exception as e:
        logger.exception("Error in chat engine", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in chat engine: {e}",
        ) from e
