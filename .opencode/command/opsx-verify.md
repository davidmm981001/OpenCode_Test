---
description: Verify implementation against OpenSpec artifacts
---

Verify implementation against OpenSpec artifacts.

**Input**: Optionally specify a change name. If omitted, infer it from context or ask the user.

**Steps**

1. Read the active change artifacts.
2. Compare implementation with proposal, specs, design, and tasks.
3. Report mismatches clearly.

**Guardrails**
- Verification does not replace implementation.
- If artifacts drift, update artifacts before more code.
