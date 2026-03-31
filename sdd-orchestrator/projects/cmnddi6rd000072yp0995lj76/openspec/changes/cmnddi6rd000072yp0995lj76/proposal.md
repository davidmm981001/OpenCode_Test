## Why

We need a simple clock application that shows the time in different time zones from the provided user story.

## What Changes

- Build a single-page React clock that updates live every second.
- Let the user switch between a curated set of time zones.
- Keep the scope frontend-only because the user story does not require persistence or server-side data.

## Capabilities

### New Capabilities
- `world-clock-ui`: renders live clocks for multiple time zones and allows switching the active zone.

### Modified Capabilities
- `project-scope`: now describes the actual clock application instead of only the seed scaffolding.

## Impact

- Frontend source files, tests, and build configuration.
- OpenSpec artifacts updated to match the implemented user story.
