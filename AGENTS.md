# AGENTS.md

Guidance for AI coding agents working in this repository. Keep changes scoped, inspect existing patterns first, and avoid unrelated rewrites.

## Read These First

- [Stack and commands](docs/agents/stack-and-commands.md)
- [Project structure and routing](docs/agents/structure-and-routing.md)
- [UI and styling](docs/agents/ui-and-styling.md)
- [Auth, Firebase, data, and reuse](docs/agents/auth-firebase-data.md)
- [Engineering rules](docs/agents/engineering-rules.md)
- [Testing policy and finish checklist](docs/agents/testing-and-finish-checklist.md)

## Core Rules

- Think like a senior engineer: optimize for clarity, maintainability, and minimal surface area.
- Follow the existing stack and folder conventions before introducing new patterns.
- Do not guess. If requirements, data shape, auth flow, or UI behavior are unclear, ask before changing.
- Do not refactor unrelated code, delete unrelated code, or format unrelated files.
- Respect existing user changes in the working tree.
- Do not add dependencies unless the current stack cannot reasonably solve the task.
- Do not hardcode secrets, credentials, API keys, or environment-specific values.
- Do not add or require unit tests, integration tests, or test setup unless explicitly requested.
