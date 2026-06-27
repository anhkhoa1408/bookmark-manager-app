AGENTS.md

Guidance for AI coding agents working in this repository. Keep changes scoped, inspect existing patterns first, and avoid unrelated rewrites.

Stack

- TanStack Start, TanStack Router, React 19
- TanStack Query
- Tailwind CSS v4
- shadcn/ui-style primitives in an Atomic Design structure
- Better Auth + Firebase Authentication
- Firebase client SDK + Firebase Admin SDK
- Vite + Wrangler

Commands

Use npm; this repo has package-lock.json.

- npm run dev - Vite dev server on port 3000
- npm run build - production build
- npm run preview - preview build output
- npm run deploy - build and deploy with Wrangler

There is currently no lint or typecheck script.

Do not add or require unit tests, integration tests, or test setup unless explicitly requested. If a test script exists, do not run it by default for normal feature work.

Structure

src/ components/ atoms/ base UI primitives molecules/ small composed UI pieces organisms/ large UI sections and auth forms templates/ route/page layout shells data/ static/demo data integrations/ provider and devtools wiring lib/ shared clients, auth, Firebase, utilities middleware/ TanStack Start middleware routes/ TanStack file routes and API routes server/ server functions and server-only helpers styles.css Tailwind v4 theme, globals, utilities

- Do not introduce src/features, src/styles, hooks, or utils folders unless the change clearly needs them.
- Do not edit src/routeTree.gen.ts manually.
- Prefer @/ imports for cross-folder imports.

Routing

- Use TanStack Router file-based routes under src/routes.
- Keep route files thin: route config, loader/server config, and composition only.
- Protected app routes live under src/routes/\_main; preserve authMiddleware.
- /home routes are protected and require a Better Auth session.
- /auth routes are public auth flows and must remain accessible without a session.
- API routes live under src/routes/api.

UI and Styling

- Follow the existing Atomic Design split: atoms, molecules, organisms, templates.
- Keep business/data access logic out of atoms and molecules.
- Reuse existing atoms before adding new primitives.
- Use lucide-react icons when icons are needed.
- shadcn/ui primitives belong in src/components/atoms.
- When adding or adapting shadcn/ui components, delete unused variants, exports, helpers, props, imports, and scaffolded code.
- Use Tailwind tokens from src/styles.css; avoid repeated raw colors.
- Prefer Tailwind utilities, but if the same class group appears multiple times, extract a named class in src/styles.css with @apply.
- Keep layouts responsive and do not introduce another design system.

Auth and Firebase

- Client Firebase SDK lives in src/lib/firebase.ts.
- Firebase Admin/server-only code lives in src/lib/firebase-admin.ts and server-only callers.
- Better Auth setup lives in src/lib/auth.ts.
- Route protection lives in src/middleware/auth.ts.
- Firebase token verification is server-side via src/server/decodeToken.ts.
- Sign-in exchanges a Firebase ID token at /api/auth/firebase/sign-in so Better Auth can set the session cookie.
- Do not bypass Better Auth with custom cookies or client-only checks.
- Do not import Firebase Admin code into client components.
- Preserve email verification behavior unless explicitly changed.

Data and Reuse

- Use TanStack Query through the existing integration in src/integrations/tanstack-query.
- Keep private/server-only data behind server-safe routes, middleware, or server functions.
- Validate external/form data at boundaries, preferably with Zod where the repo already does.
- Handle loading, empty, error, unauthorized, and success states when relevant.
- Follow SOLID and DRY.
- If React logic is reused multiple times, extract a custom hook only when the repo already has a suitable location or the task clearly needs one.
- If pure helper logic is reused multiple times, extract a const function under src/utils only when that folder is explicitly needed.

Engineering Rules

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

Testing Policy

Unit tests and integration tests are not required for this project by default.

Do not:

- Add unit tests unless explicitly requested.
- Add integration tests unless explicitly requested.
- Add test libraries or test setup unless explicitly requested.
- Block completion because tests are missing.
- Run npm run test by default for normal feature work.

For normal tasks, validate with the existing non-test checks that are relevant, especially:

npm run build

If a requested task specifically involves tests, then follow the user’s instruction for that task only.

Before finishing

Check:

- The change solves only the requested task.
- No unrelated files were modified.
- No unrelated code was deleted.
- Existing patterns were followed.
- Auth and Firebase boundaries are respected.
- UI follows Atomic Design.
- Loading, empty, error, and unauthorized states are handled when relevant.
- Unit/integration tests were not added unless explicitly requested.
- Relevant existing non-test checks were run, or the reason they were skipped is stated.
