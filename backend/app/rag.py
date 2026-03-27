from __future__ import annotations

from pathlib import Path
from typing import Any

from .config import settings
from .rag_chromadb import RagStore

DEFAULT_DOCS = [
    {
        "source": "ibm-cobol-divisions",
        "version": "ANSI-85",
        "text": "COBOL define IDENTIFICATION DIVISION, ENVIRONMENT DIVISION, DATA DIVISION y PROCEDURE DIVISION.",
    },
    {
        "source": "ibm-cics-bms",
        "version": "BMS-IBM",
        "text": "BMS usa DFHMSD, DFHMDI y DFHMDF para mapsets. CICS usa SEND MAP y RECEIVE MAP con AID keys.",
    },
    {
        "source": "legacy-patterns",
        "version": "Patterns",
        "text": "Patrones legacy incluyen CALL y XCTL, validaciones transaccionales y SQL embebido.",
    },
]


class RagIndex:
    def __init__(self, root: Path) -> None:
        self.store = RagStore(root)
        if not self.store.load_docs():
            self.store.save_docs(DEFAULT_DOCS)
            self.store.rebuild_index()

    def status(self) -> dict[str, Any]:
        docs = self.store.load_docs()
        chunks = self.store.load_chunks()
        return {
            "docs_count": len(docs),
            "chunks_count": len(chunks),
            "sources": sorted({str(doc.get("source", "unknown")) for doc in docs}),
            "index_path": str(settings.rag_index_path),
        }

    def add_documents(self, docs: list[dict[str, Any]]) -> dict[str, Any]:
        return self.store.add_docs(docs)

    def query(self, text: str, top_k: int | None = None, min_score: float | None = None) -> list[dict[str, Any]]:
        return self.store.query(
            text=text,
            top_k=top_k if top_k is not None else settings.rag_top_k,
            min_score=min_score if min_score is not None else settings.rag_min_score,
        )


rag_index = RagIndex(settings.rag_index_path)
