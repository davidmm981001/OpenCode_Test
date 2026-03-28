---
description: Start a new OpenSpec change scaffold
---

Start a new OpenSpec change scaffold.

**Input**: Optionally specify a change name. If omitted, ask the user for the change name.

**Steps**

1. Create the change folder and metadata.
   - Use `openspec new change "<name>"`
   - Confirm the change exists before continuing.

2. Show the first ready artifact.
   - For `spec-driven`, the first artifact is usually `proposal`.
   - Do not write code.

3. Tell the user how to continue.
   - Recommend `/opsx-continue` to create artifacts progressively.
   - Recommend `/opsx-ff` only if the user wants all planning artifacts at once.

**Guardrails**
- Artifact-first only: no code generation here.
- Keep the change isolated in `openspec/changes/<name>/`.
