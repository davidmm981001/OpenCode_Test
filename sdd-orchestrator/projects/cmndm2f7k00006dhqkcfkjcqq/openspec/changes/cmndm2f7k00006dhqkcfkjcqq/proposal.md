## Why

We need to generate a new project for Todo full app from the provided user stories and keep the initial scope stable for OpenCode and OpenSpec.

## What Changes

- Seed the project workspace with OpenSpec change artifacts.
- Preserve the full user story block as persistent context.
- Keep OpenCode configuration isolated from OpenSpec configuration.
- Drive the workspace toward a complete, runnable app with dependencies and validation.

## Capabilities

### New Capabilities
- `project-scope`: the generated project context, requirements, and task seed for the initial SDD loop.

### Modified Capabilities
- None.

## Impact

- Project-local OpenSpec artifacts and OpenCode instructions.
- The initial execution context sent to OpenCode.