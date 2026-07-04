# Project Structure and Routing

## Structure

- `src/components/atoms/` - base UI primitives
- `src/components/molecules/` - small composed UI pieces
- `src/components/organisms/` - large UI sections and auth forms
- `src/components/templates/` - route/page layout shells
- `src/data/` - static/demo data
- `src/integrations/` - provider and devtools wiring
- `src/lib/` - shared clients, auth, Firebase, utilities
- `src/middleware/` - TanStack Start middleware
- `src/routes/` - TanStack file routes and API routes
- `src/server/` - server functions and server-only helpers
- `src/styles.css` - Tailwind v4 theme, globals, utilities

## Structure Rules

- Do not introduce `src/features`, `src/styles`, `hooks`, or `utils` folders unless the change clearly needs them.
- Do not edit `src/routeTree.gen.ts` manually.
- Prefer `@/` imports for cross-folder imports.

## Routing

- Use TanStack Router file-based routes under `src/routes`.
- Keep route files thin: route config, loader/server config, and composition only.
- Protected app routes live under `src/routes/_main`; preserve `authMiddleware`.
- `/home` routes are protected and require a Better Auth session.
- `/auth` routes are public auth flows and must remain accessible without a session.
- API routes live under `src/routes/api`.
