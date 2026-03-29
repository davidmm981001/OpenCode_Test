from __future__ import annotations

from typing import Any, AsyncGenerator, List

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    content: str


class Message(BaseModel):
    role: str
    content: str


class ChatData(BaseModel):
    messages: List[Message] = Field(default_factory=list)
    data: dict[str, Any] | None = None

    def get_last_message_content(self) -> str:
        return self.messages[-1].content if self.messages else ""

    def get_history_messages(self) -> List[ChatMessage]:
        return [
            ChatMessage(role=item.role, content=item.content) for item in self.messages
        ]

    def get_chat_document_ids(self) -> List[str]:
        payload = self.data or {}
        doc_ids = payload.get("doc_ids") or payload.get("document_ids") or []
        if isinstance(doc_ids, list):
            return [str(item) for item in doc_ids]
        return []


class SourceNodes(BaseModel):
    id: str | None = None
    score: float | None = None
    text: str | None = None
    metadata: dict[str, Any] | None = None

    @classmethod
    def from_source_node(cls, node: Any) -> "SourceNodes":
        inner = getattr(node, "node", None)
        return cls(
            id=getattr(inner, "node_id", None) or getattr(inner, "id_", None),
            score=getattr(node, "score", None),
            text=getattr(inner, "text", None),
            metadata=getattr(inner, "metadata", None),
        )


class EventCallbackHandler:
    def __init__(self):
        self.is_done = False

    async def async_event_gen(self) -> AsyncGenerator[Any, None]:
        if False:
            yield None

    async def cancel_run(self):
        return None
