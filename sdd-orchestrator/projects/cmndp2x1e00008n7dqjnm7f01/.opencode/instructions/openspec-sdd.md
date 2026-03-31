# OpenSpec SDD Instructions

These rules are mandatory for generated projects:

1. Create OpenSpec artifacts first.
   - proposal.md
   - specs/ as delta specs
   - design.md
   - tasks.md

2. Do not create application code until the artifacts are ready.

3. Implement by task, progressively.
   - Complete one task before starting the next.
   - Keep changes small and aligned to the current task.

4. Consult official documentation before using main libraries.
   - Before coding or running commands that depend on a main library, read its current official documentation first.

5. Sync delta specs at the end.
   - Merge openspec/changes/<change>/specs/ into openspec/specs/.
   - Archive only after that.

6. If a technical or design doubt appears, pause and update artifacts.
