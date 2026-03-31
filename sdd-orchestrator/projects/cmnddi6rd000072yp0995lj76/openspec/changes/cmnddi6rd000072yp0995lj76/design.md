## Context

The application is a frontend-only world clock. It must present a clean, single-screen experience that updates live and lets the user switch between a curated list of zones.

## Goals / Non-Goals

**Goals:**
- Render the current time for several time zones in one view.
- Allow the user to choose which zone is emphasized.
- Keep the implementation small, readable, and fully testable.

**Non-Goals:**
- Persistence, authentication, or backend APIs.
- Custom zone creation or external time data sources.

## Decisions

- Use React state plus a one-second interval to refresh the displayed time.
- Use the built-in `Intl.DateTimeFormat` API for time zone conversion.
- Keep the available zones fixed to a small curated list so the UI stays simple.

## Risks / Trade-offs

- Time formatting depends on browser locale support, so formatting stays within standard `Intl` features.
- A curated list keeps the app simple, but it limits flexibility compared with arbitrary zone entry.
