## Context

This generated project starts from user stories and must keep a strict SDD boundary so OpenCode can work from stable OpenSpec artifacts rather than loose chat text.

## Goals / Non-Goals

**Goals:**
- Preserve the full story block in the workspace.
- Keep OpenSpec and OpenCode artifacts isolated and referenced by file path.
- Make the first generation pass deterministic and reconnectable.

**Non-Goals:**
- Implementing the final application features in this workspace seed.
- Changing the target stack.

## Decisions

- Use project-local OpenSpec change artifacts as the primary planning context.
- Keep the raw user stories in a dedicated workspace file for traceability.
- Reference files from OpenCode instructions instead of concatenating a single giant prompt.

## Risks / Trade-offs

- The initial scaffold is generic, so later refinement may still be needed.
- Keeping too much context inline can reduce signal; file references help reduce that risk.