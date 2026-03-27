from __future__ import annotations

import hashlib
import json
import os
import re
from pathlib import Path
from typing import Any

import chromadb
from chromadb.utils import embedding_functions


def _tokenize(text: str) -> list[str]:
    return re.findall(r"[A-Za-z0-9_\-]+", text)


def chunk_text(source: str, text: str, version: str, chunk_size: int = 512, overlap: int = 64) -> list[dict[str, Any]]:
    tokens = _tokenize(text)
    if not tokens:
        return []

    step = max(chunk_size - overlap, 1)
    chunks: list[dict[str, Any]] = []
    for start in range(0, len(tokens), step):
        segment = tokens[start : start + chunk_size]
        if not segment:
            continue
        chunk_body = " ".join(segment)
        digest = hashlib.sha256(f"{source}:{start}:{chunk_body}".encode("utf-8")).hexdigest()[:16]
        chunks.append(
            {
                "chunk_id": f"{source}-{digest}",
                "source": source,
                "version": version,
                "start_token": start,
                "text": chunk_body,
            }
        )
    return chunks


def build_chunks(docs: list[dict[str, Any]], chunk_size: int = 512, overlap: int = 64) -> list[dict[str, Any]]:
    all_chunks: list[dict[str, Any]] = []
    for doc in docs:
        all_chunks.extend(
            chunk_text(
                source=str(doc.get("source", "doc")),
                text=str(doc.get("text", "")),
                version=str(doc.get("version", "unknown")),
                chunk_size=chunk_size,
                overlap=overlap,
            )
        )
    return all_chunks


class RagStore:
    def __init__(self, root: Path, collection_name: str = "legacy_rag") -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)
        self.docs_file = self.root / "rag_docs.json"
        self.chunks_file = self.root / "chunks.json"
        if not self.docs_file.exists():
            self.docs_file.write_text("[]", encoding="utf-8")
        if not self.chunks_file.exists():
            self.chunks_file.write_text("[]", encoding="utf-8")

        self.client = chromadb.PersistentClient(path=str(self.root / "chromadb"))
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
        )

    def _embedding_fn(self):
        api_key = os.getenv("OPENAI_API_KEY", "")
        model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-large")
        if api_key:
            return embedding_functions.OpenAIEmbeddingFunction(api_key=api_key, model_name=model)
        return embedding_functions.DefaultEmbeddingFunction()

    def load_docs(self) -> list[dict[str, Any]]:
        return json.loads(self.docs_file.read_text(encoding="utf-8"))

    def save_docs(self, docs: list[dict[str, Any]]) -> None:
        self.docs_file.write_text(json.dumps(docs, indent=2, ensure_ascii=False), encoding="utf-8")

    def load_chunks(self) -> list[dict[str, Any]]:
        return json.loads(self.chunks_file.read_text(encoding="utf-8"))

    def save_chunks(self, chunks: list[dict[str, Any]]) -> None:
        self.chunks_file.write_text(json.dumps(chunks, indent=2, ensure_ascii=False), encoding="utf-8")

    def rebuild_index(self) -> dict[str, Any]:
        docs = self.load_docs()
        raw_chunks = build_chunks(docs, chunk_size=512, overlap=64)
        unique_map: dict[str, dict[str, Any]] = {}
        for chunk in raw_chunks:
            unique_map[chunk["chunk_id"]] = chunk
        chunks = list(unique_map.values())
        self.save_chunks(chunks)

        existing = self.collection.get(include=[])
        existing_ids = existing.get("ids", [])
        if existing_ids:
            self.collection.delete(ids=existing_ids)

        if chunks:
            embedding_fn = self._embedding_fn()
            vectors = embedding_fn([str(chunk["text"]) for chunk in chunks])
            self.collection.add(
                ids=[chunk["chunk_id"] for chunk in chunks],
                documents=[chunk["text"] for chunk in chunks],
                metadatas=[{k: v for k, v in chunk.items() if k not in {"text", "chunk_id"}} for chunk in chunks],
                embeddings=vectors,
            )

        return {"docs": len(docs), "chunks": len(chunks)}

    def add_docs(self, docs: list[dict[str, Any]]) -> dict[str, Any]:
        current = self.load_docs()
        current.extend(docs)
        self.save_docs(current)
        return self.rebuild_index()

    def query(self, text: str, top_k: int, min_score: float) -> list[dict[str, Any]]:
        embedding_fn = self._embedding_fn()
        query_vector = embedding_fn([text])
        result = self.collection.query(query_embeddings=query_vector, n_results=max(top_k, 8))
        docs_group = result.get("documents") or []
        ids_group = result.get("ids") or []
        distances_group = result.get("distances") or []
        metadatas_group = result.get("metadatas") or []

        if not docs_group:
            return []

        docs = docs_group[0] or []
        ids = ids_group[0] or []
        distances = distances_group[0] or []
        metadatas = metadatas_group[0] or []

        matches: list[dict[str, Any]] = []
        for idx, doc in enumerate(docs):
            distance = float(distances[idx]) if idx < len(distances) else 10.0
            similarity = 1.0 / (1.0 + max(distance, 0.0))
            if similarity < min_score:
                continue
            meta = metadatas[idx] if idx < len(metadatas) else {}
            matches.append(
                {
                    "chunk_id": ids[idx] if idx < len(ids) else "unknown",
                    "text": doc,
                    "score": round(similarity, 4),
                    "source": meta.get("source", "unknown"),
                    "version": meta.get("version", "unknown"),
                    "start_token": meta.get("start_token", 0),
                }
            )
        return matches
