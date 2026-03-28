---
description: Fast-forward OpenSpec planning artifacts
---

Fast-forward OpenSpec planning artifacts.

**Input**: Optionally specify a change name. If omitted, infer it from context or ask the user.

**Steps**

1. Check status and artifact order.
2. Create ready artifacts in dependency order.
3. Stop once proposal, specs, design, and tasks are complete.
4. Do not write application code.

**Guardrails**
- Use this only when the user wants speed over step-by-step review.
- Keep the artifact order strict.
- The change is not ready for implementation until tasks exist.
