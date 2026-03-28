---
description: Archive a completed change in the experimental workflow
---

Archive a completed change in the experimental workflow.

**Input**: Optionally specify a change name after `/opsx-archive` (e.g., `/opsx-archive add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Show only active changes (not already archived).
   Include the schema used for each change if available.

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check artifact completion status**

   Run `openspec status --change "<name>" --json` to check artifact completion.

   Parse the JSON to understand:
   - `schemaName`: The workflow being used
   - `artifacts`: List of artifacts with their status (`done` or other)

    **If any artifacts are not `done`:**
    - Stop immediately
    - Report the incomplete artifacts
    - Do not archive until everything is `done`

3. **Check task completion status**

   Read the tasks file (typically `tasks.md`) to check for incomplete tasks.

   Count tasks marked with `- [ ]` (incomplete) vs `- [x]` (complete).

    **If incomplete tasks found:**
    - Stop immediately
    - Report the incomplete tasks
    - Do not archive until all tasks are complete

   **If no tasks file exists:** Proceed without task-related warning.

4. **Assess delta spec sync state**

    Check for delta specs at `openspec/changes/<name>/specs/`. If none exist, proceed.

    **If delta specs exist:**
    - Compare each delta spec with its corresponding main spec at `openspec/specs/<capability>/spec.md`
    - Determine what changes would be applied (adds, modifications, removals, renames)
    - Sync them first
    - Do not archive until the delta specs are fully reconciled with the main specs

5. **Perform the archive**

   Create the archive directory if it doesn't exist:
   ```bash
   mkdir -p openspec/changes/archive
   ```

   Generate target name using current date: `YYYY-MM-DD-<change-name>`

   **Check if target already exists:**
   - If yes: Fail with error, suggest renaming existing archive or using different date
   - If no: Move the change directory to archive

   ```bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   ```

6. **Display summary**

    Show archive completion summary including:
     - Change name
     - Schema that was used
     - Archive location
     - Spec sync status (synced / no delta specs)
     - Note that the archive only proceeded after all artifacts, tasks, and specs were complete

**Output On Success**

```
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Specs:** ✓ Synced to main specs

All artifacts complete. All tasks complete.
```

**Output On Success (No Delta Specs)**

```
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Specs:** No delta specs

All artifacts complete. All tasks complete.
```

**Output On Error (Archive Exists)**

```
## Archive Failed

**Change:** <change-name>
**Target:** openspec/changes/archive/YYYY-MM-DD-<name>/

Target archive directory already exists.

**Options:**
1. Rename the existing archive
2. Delete the existing archive if it's a duplicate
3. Wait until a different date to archive
```

**Guardrails**
- Always prompt for change selection if not provided
- Use artifact graph (openspec status --json) for completion checking
- Block archive on any incomplete artifact, task, or spec sync gap
- Preserve .openspec.yaml when moving to archive (it moves with the directory)
- Show clear summary of what happened
- If delta specs exist, always reconcile them before archiving
