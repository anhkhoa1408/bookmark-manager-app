# Engineering Rules

- Think like a senior engineer: optimize for clarity, maintainability, and minimal surface area.
- Do not guess. If requirements, data shape, auth flow, or UI behavior are unclear, ask before changing.
- If a 200-line feature can be correctly implemented in 50 lines, prefer the 50-line version.
- Remove unnecessary abstraction only inside the feature being built.
- Do not remove unrelated dead code.
- Do not refactor unrelated code.
- Do not format unrelated files.
- Do not change behavior outside the requested task.
- Do not add dependencies unless the current stack cannot reasonably solve the task.
- Do not hardcode secrets, credentials, API keys, or environment-specific values.
- Preserve strict TypeScript settings.
- Respect existing user changes in the working tree.
