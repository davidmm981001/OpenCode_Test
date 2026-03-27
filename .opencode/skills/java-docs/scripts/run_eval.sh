#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/run_eval.sh [options] [lint_paths...]

Run javadoc lint and eval metadata summary in one command.

Options:
  --profile <strict|compatible>  Lint profile (default: strict)
  --eval-file <path>             Evals json path (default: evals/evals.json)
  --report-dir <path>            Report output directory (default: evals/reports)
  -h, --help                     Show this help

Examples:
  scripts/run_eval.sh
  scripts/run_eval.sh --profile compatible src/main/java
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

PROFILE="strict"
EVAL_FILE="${ROOT_DIR}/evals/evals.json"
REPORT_DIR="${ROOT_DIR}/evals/reports"
LINT_PATHS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --profile" >&2
        exit 2
      fi
      PROFILE="$2"
      shift 2
      ;;
    --eval-file)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --eval-file" >&2
        exit 2
      fi
      EVAL_FILE="$2"
      shift 2
      ;;
    --report-dir)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --report-dir" >&2
        exit 2
      fi
      REPORT_DIR="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      while [[ $# -gt 0 ]]; do
        LINT_PATHS+=("$1")
        shift
      done
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage
      exit 2
      ;;
    *)
      LINT_PATHS+=("$1")
      shift
      ;;
  esac
done

if [[ "${PROFILE}" != "strict" && "${PROFILE}" != "compatible" ]]; then
  echo "Invalid profile: ${PROFILE}. Use strict or compatible." >&2
  exit 2
fi

if [[ ${#LINT_PATHS[@]} -eq 0 ]]; then
  if [[ -d "${ROOT_DIR}/src/main/java" ]]; then
    LINT_PATHS=("${ROOT_DIR}/src/main/java")
  else
    LINT_PATHS=("${ROOT_DIR}")
  fi
fi

mkdir -p "${REPORT_DIR}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
LINT_LOG="${REPORT_DIR}/lint-${TIMESTAMP}.log"
EVAL_SUMMARY_JSON="${REPORT_DIR}/eval-summary-${TIMESTAMP}.json"
EVAL_SUMMARY_MD="${REPORT_DIR}/eval-summary-${TIMESTAMP}.md"
RUN_REPORT_JSON="${REPORT_DIR}/run-eval-${TIMESTAMP}.json"

echo "[1/2] Running javadoc lint..."
set +e
python3 "${ROOT_DIR}/scripts/javadoc_lint" --profile "${PROFILE}" "${LINT_PATHS[@]}" | tee "${LINT_LOG}"
LINT_EXIT=${PIPESTATUS[0]}
set -e

echo "[2/2] Summarizing eval metadata..."
set +e
python3 - "${EVAL_FILE}" "${EVAL_SUMMARY_JSON}" "${EVAL_SUMMARY_MD}" <<'PY'
import json
import sys
from pathlib import Path

eval_file = Path(sys.argv[1])
out_json = Path(sys.argv[2])
out_md = Path(sys.argv[3])

errors = []
summary = {
    "eval_file": str(eval_file),
    "skill_name": "",
    "total_evals": 0,
    "ids": [],
    "duplicate_ids": [],
    "non_object_items": 0,
    "missing_prompt": 0,
    "missing_expected_output": 0,
    "invalid_files_field": 0,
    "evals_with_files": 0,
    "max_prompt_length": 0,
    "avg_prompt_length": 0,
    "status": "PASS",
    "errors": [],
}

if not eval_file.exists():
    errors.append(f"eval file not found: {eval_file}")
else:
    try:
        data = json.loads(eval_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"invalid json: {exc}")
        data = None
    except OSError as exc:
        errors.append(f"failed to read eval file: {exc}")
        data = None

    if data is not None:
        if not isinstance(data, dict):
            errors.append("root must be an object")
        else:
            skill_name = data.get("skill_name")
            evals = data.get("evals")

            if not isinstance(skill_name, str) or not skill_name.strip():
                errors.append("skill_name must be a non-empty string")
            else:
                summary["skill_name"] = skill_name.strip()

            if not isinstance(evals, list):
                errors.append("evals must be an array")
            else:
                seen = set()
                dup = set()
                prompt_lengths = []
                ids = []

                for item in evals:
                    if not isinstance(item, dict):
                        summary["non_object_items"] += 1
                        continue

                    eval_id = item.get("id")
                    if isinstance(eval_id, int):
                        ids.append(eval_id)
                        if eval_id in seen:
                            dup.add(eval_id)
                        seen.add(eval_id)
                    else:
                        errors.append("each eval.id must be an integer")

                    prompt = item.get("prompt")
                    if not isinstance(prompt, str) or not prompt.strip():
                        summary["missing_prompt"] += 1
                    else:
                        prompt_lengths.append(len(prompt.strip()))

                    expected = item.get("expected_output")
                    if not isinstance(expected, str) or not expected.strip():
                        summary["missing_expected_output"] += 1

                    files = item.get("files")
                    if not isinstance(files, list):
                        summary["invalid_files_field"] += 1
                    elif files:
                        summary["evals_with_files"] += 1

                summary["total_evals"] = len(evals)
                summary["ids"] = sorted(ids)
                summary["duplicate_ids"] = sorted(dup)
                summary["max_prompt_length"] = max(prompt_lengths) if prompt_lengths else 0
                summary["avg_prompt_length"] = round(sum(prompt_lengths) / len(prompt_lengths), 2) if prompt_lengths else 0

if summary["duplicate_ids"]:
    errors.append(f"duplicate eval ids: {summary['duplicate_ids']}")
if summary["non_object_items"] > 0:
    errors.append(f"non-object eval entries: {summary['non_object_items']}")
if summary["missing_prompt"] > 0:
    errors.append(f"missing prompt entries: {summary['missing_prompt']}")
if summary["missing_expected_output"] > 0:
    errors.append(f"missing expected_output entries: {summary['missing_expected_output']}")
if summary["invalid_files_field"] > 0:
    errors.append(f"invalid files field entries: {summary['invalid_files_field']}")

summary["errors"] = errors
summary["status"] = "FAIL" if errors else "PASS"

out_json.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

lines = [
    "# Eval Summary",
    "",
    f"- eval_file: `{summary['eval_file']}`",
    f"- skill_name: `{summary['skill_name']}`" if summary["skill_name"] else "- skill_name: `<invalid>`",
    f"- total_evals: `{summary['total_evals']}`",
    f"- eval_ids: `{summary['ids']}`",
    f"- evals_with_files: `{summary['evals_with_files']}`",
    f"- prompt_length(avg/max): `{summary['avg_prompt_length']}/{summary['max_prompt_length']}`",
    f"- status: `{summary['status']}`",
]

if errors:
    lines.append("")
    lines.append("## Errors")
    for err in errors:
        lines.append(f"- {err}")

out_md.write_text("\n".join(lines) + "\n", encoding="utf-8")

print(f"Eval summary written: {out_json}")
print(f"Eval summary markdown: {out_md}")

sys.exit(1 if errors else 0)
PY
EVAL_EXIT=$?
set -e

python3 - "${RUN_REPORT_JSON}" "${PROFILE}" "${LINT_EXIT}" "${EVAL_EXIT}" "${LINT_LOG}" "${EVAL_SUMMARY_JSON}" "${EVAL_SUMMARY_MD}" <<'PY'
import json
import sys

report_path = sys.argv[1]
profile = sys.argv[2]
lint_exit = int(sys.argv[3])
eval_exit = int(sys.argv[4])
lint_log = sys.argv[5]
eval_summary_json = sys.argv[6]
eval_summary_md = sys.argv[7]

report = {
    "profile": profile,
    "lint": {
        "exit_code": lint_exit,
        "status": "PASS" if lint_exit == 0 else "FAIL",
        "log": lint_log,
    },
    "eval_summary": {
        "exit_code": eval_exit,
        "status": "PASS" if eval_exit == 0 else "FAIL",
        "json": eval_summary_json,
        "markdown": eval_summary_md,
    },
    "overall_status": "PASS" if lint_exit == 0 and eval_exit == 0 else "FAIL",
}

with open(report_path, "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)
    f.write("\n")
PY

echo "Run report: ${RUN_REPORT_JSON}"
echo "Lint log:   ${LINT_LOG}"
echo "Eval json:  ${EVAL_SUMMARY_JSON}"
echo "Eval md:    ${EVAL_SUMMARY_MD}"

if [[ ${LINT_EXIT} -ne 0 || ${EVAL_EXIT} -ne 0 ]]; then
  echo "run_eval failed: lint_exit=${LINT_EXIT}, eval_exit=${EVAL_EXIT}" >&2
  exit 1
fi

echo "run_eval passed."
