---
description: Sync delta specs into the main OpenSpec specs folder
---

Sync delta specs into the main OpenSpec specs folder.

**Input**: Optionally specify a change name. If omitted, infer it from context or ask the user.

**Steps**

1. Read delta specs from `openspec/changes/<name>/specs/`.
2. Merge ADDED, MODIFIED, REMOVED, and RENAMED changes into `openspec/specs/`.
3. Verify the main specs reflect the merged behavior.

**Guardrails**
- Sync before archive when delta specs exist.
- Do not archive until the sync is complete.
