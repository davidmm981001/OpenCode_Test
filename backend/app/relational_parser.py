import json
import re
from collections import defaultdict
from dataclasses import dataclass
from pathlib import PurePosixPath

from antlr4 import InputStream


@dataclass
class SourceRecord:
    file_id: str
    file_name: str
    extension: str
    encoding: str
    content: bytes


def _antlr_text(raw: bytes, encoding: str) -> str:
    if encoding == "binary":
        return ""
    text = raw.decode(encoding, errors="ignore")
    return InputStream(text).strdata


def _make_entity(entity_id: str, entity_type: str, name: str, file_name: str, line: int) -> dict:
    return {
        "id": entity_id,
        "type": entity_type,
        "name": name,
        "file_name": file_name,
        "line": line,
    }


def analyze_relational(files: list[SourceRecord]) -> dict:
    entities: list[dict] = []
    relations: list[dict] = []
    unresolved: list[dict] = []
    unsupported: list[dict] = []
    coverage = defaultdict(int)

    copy_refs: list[tuple[str, str, str, int]] = []
    call_refs: list[tuple[str, str, str, int]] = []
    bms_refs: list[tuple[str, str, str, int]] = []
    jcl_execs: list[tuple[str, str, str, int]] = []

    entity_seq = 0

    for source in sorted(files, key=lambda item: item.file_name.lower()):
        text = _antlr_text(source.content, source.encoding)
        lines = text.splitlines()
        ext = source.extension.lower()

        program_name: str | None = None
        for index, line in enumerate(lines, start=1):
            up = line.upper()

            if "ALTER " in up or "ENTER " in up:
                unsupported.append(
                    {
                        "file_id": source.file_id,
                        "file_name": source.file_name,
                        "line": index,
                        "construct": "COBOL_LEGACY_UNSUPPORTED",
                        "detail": line.strip()[:400],
                    }
                )

            if ext in {".cob", ".cbl"}:
                match = re.search(r"PROGRAM-ID\.\s*([A-Z0-9_-]+)", up)
                if match and program_name is None:
                    program_name = match.group(1)
                    entity_seq += 1
                    entity_id = f"E{entity_seq:06d}"
                    entities.append(_make_entity(entity_id, "cobol_program", program_name, source.file_name, index))
                    coverage["cobol_programs"] += 1

                for copy_match in re.finditer(r"\bCOPY\s+([A-Z0-9_-]+)", up):
                    copy_refs.append((program_name or source.file_name, copy_match.group(1), source.file_name, index))
                    coverage["copy_refs"] += 1

                if " REPLACE " in f" {up} ":
                    coverage["replace_constructs"] += 1

                for call_match in re.finditer(r"\bCALL\s+['\"]?([A-Z0-9_-]+)", up):
                    call_refs.append((program_name or source.file_name, call_match.group(1), source.file_name, index))
                    coverage["call_refs"] += 1

                mapset_match = re.search(r"MAPSET\s*\(\s*['\"]([A-Z0-9_-]+)", up)
                if mapset_match:
                    bms_refs.append((program_name or source.file_name, mapset_match.group(1), source.file_name, index))
                    coverage["bms_refs"] += 1

                if "EXEC CICS" in up:
                    coverage["exec_cics"] += 1
                if "EXEC IMS" in up or "EXEC DLI" in up:
                    coverage["exec_ims"] += 1

            elif ext == ".cpy":
                stem_name = PurePosixPath(source.file_name).stem.upper()
                entity_seq += 1
                entity_id = f"E{entity_seq:06d}"
                entities.append(_make_entity(entity_id, "copybook_file", stem_name, source.file_name, 1))
                coverage["copybook_files"] += 1
                for sym_match in re.finditer(r"^\s*\d{2}\s+([A-Z0-9-]+)", up):
                    entity_seq += 1
                    entity_id = f"E{entity_seq:06d}"
                    entities.append(
                        _make_entity(entity_id, "copybook_symbol", sym_match.group(1), source.file_name, index)
                    )
                    coverage["copybook_symbols"] += 1

            elif ext == ".bms":
                mapset = re.search(r"^\s*([A-Z0-9_-]+)\s+DFHMSD\b", up)
                if mapset:
                    entity_seq += 1
                    entity_id = f"E{entity_seq:06d}"
                    entities.append(_make_entity(entity_id, "bms_mapset", mapset.group(1), source.file_name, index))
                    coverage["bms_mapsets"] += 1

                map_item = re.search(r"^\s*([A-Z0-9_-]+)\s+DFHMDI\b", up)
                if map_item:
                    entity_seq += 1
                    entity_id = f"E{entity_seq:06d}"
                    entities.append(_make_entity(entity_id, "bms_map", map_item.group(1), source.file_name, index))
                    coverage["bms_maps"] += 1

            elif ext == ".jcl":
                exec_match = re.search(r"^//([A-Z0-9$#@]+)\s+EXEC\s+PGM=([A-Z0-9$#@_-]+)", up)
                if exec_match:
                    step = exec_match.group(1)
                    pgm = exec_match.group(2)
                    entity_seq += 1
                    entity_id = f"E{entity_seq:06d}"
                    entities.append(_make_entity(entity_id, "jcl_step", step, source.file_name, index))
                    jcl_execs.append((step, pgm, source.file_name, index))
                    coverage["jcl_exec"] += 1

    program_index = {item["name"]: item["id"] for item in entities if item["type"] == "cobol_program"}
    copybook_index = {
        item["name"]: item["id"]
        for item in entities
        if item["type"] in {"copybook_file", "copybook_symbol"}
    }
    mapset_index = {item["name"]: item["id"] for item in entities if item["type"] == "bms_mapset"}

    for source_name, target_name, file_name, line in copy_refs:
        target_id = copybook_index.get(target_name)
        if target_id:
            relations.append(
                {
                    "type": "copy",
                    "source": source_name,
                    "target": target_name,
                    "file_name": file_name,
                    "line": line,
                    "resolved": True,
                }
            )
            coverage["copy_resolved"] += 1
        else:
            unresolved.append(
                {
                    "type": "copy",
                    "source": source_name,
                    "target": target_name,
                    "file_name": file_name,
                    "line": line,
                }
            )

    for source_name, target_name, file_name, line in call_refs:
        target_id = program_index.get(target_name)
        if target_id:
            relations.append(
                {
                    "type": "call",
                    "source": source_name,
                    "target": target_name,
                    "file_name": file_name,
                    "line": line,
                    "resolved": True,
                }
            )
            coverage["call_resolved"] += 1
        else:
            unresolved.append(
                {
                    "type": "call",
                    "source": source_name,
                    "target": target_name,
                    "file_name": file_name,
                    "line": line,
                }
            )

    for source_name, target_name, file_name, line in bms_refs:
        target_id = mapset_index.get(target_name)
        if target_id:
            relations.append(
                {
                    "type": "bms_link",
                    "source": source_name,
                    "target": target_name,
                    "file_name": file_name,
                    "line": line,
                    "resolved": True,
                }
            )
            coverage["bms_resolved"] += 1
        else:
            unresolved.append(
                {
                    "type": "bms_link",
                    "source": source_name,
                    "target": target_name,
                    "file_name": file_name,
                    "line": line,
                }
            )

    for source_name, target_name, file_name, line in jcl_execs:
        if target_name in program_index:
            relations.append(
                {
                    "type": "jcl_exec",
                    "source": source_name,
                    "target": target_name,
                    "file_name": file_name,
                    "line": line,
                    "resolved": True,
                }
            )
            coverage["jcl_exec_resolved"] += 1
        else:
            unresolved.append(
                {
                    "type": "jcl_exec",
                    "source": source_name,
                    "target": target_name,
                    "file_name": file_name,
                    "line": line,
                }
            )

    coverage_report = {
        "files_processed": len(files),
        "constructs": dict(sorted(coverage.items())),
        "relations_total": len(relations),
        "unresolved_total": len(unresolved),
        "unsupported_total": len(unsupported),
    }

    relational = {
        "entities": sorted(entities, key=lambda item: (item["type"], item["name"], item["file_name"], item["line"])),
        "relations": sorted(
            relations,
            key=lambda item: (item["type"], item["source"], item["target"], item["file_name"], item["line"]),
        ),
        "unresolved": sorted(
            unresolved,
            key=lambda item: (item["type"], item["source"], item["target"], item["file_name"], item["line"]),
        ),
    }

    return {
        "coverage": coverage_report,
        "relational": relational,
        "unsupported_constructs": unsupported,
        "signature": json.dumps(coverage_report, sort_keys=True),
    }
