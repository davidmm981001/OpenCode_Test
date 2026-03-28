---
description: Create the next OpenSpec artifact in dependency order
---

Create the next OpenSpec artifact in dependency order.

Also follow `.opencode/instructions/openspec-sdd.md`.

**Input**: Optionally specify a change name. If omitted, infer it from context or ask the user to select one.

**Steps**

1. Check status.
   - Run `openspec status --change "<name>" --json`
   - Identify the next ready artifact.

2. Read dependencies.
   - Use `openspec instructions <artifact-id> --change "<name>" --json`
   - Read every dependency artifact first.

3. Create exactly one artifact.
   - Fill it from the template and instructions.
   - Stop after creating that artifact.

4. Re-check status.
   - Show what is now unlocked.
   - Tell the user to run `/opsx-continue` again for the next artifact.

**Guardrails**
- Never create code here.
- Never skip dependency order.
- Prefer progressive completion over fast-forward.
