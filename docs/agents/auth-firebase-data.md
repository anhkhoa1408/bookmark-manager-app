# Auth, Firebase, Data, and Reuse

## Auth and Firebase

- Client Firebase SDK lives in `src/lib/firebase.ts`.
- Firebase Admin/server-only code lives in `src/lib/firebase-admin.ts` and server-only callers.
- Better Auth setup lives in `src/lib/auth.ts`.
- Route protection lives in `src/middleware/auth.ts`.
- Firebase token verification is server-side via `src/server/decodeToken.ts`.
- Sign-in exchanges a Firebase ID token at `/api/auth/firebase/sign-in` so Better Auth can set the session cookie.
- Do not bypass Better Auth with custom cookies or client-only checks.
- Do not import Firebase Admin code into client components.
- Preserve email verification behavior unless explicitly changed.

## Data and Reuse

- Use TanStack Query through the existing integration in `src/integrations/tanstack-query`.
- Keep private/server-only data behind server-safe routes, middleware, or server functions.
- Validate external/form data at boundaries, preferably with Zod where the repo already does.
- Handle loading, empty, error, unauthorized, and success states when relevant.
- Follow SOLID and DRY.
- If React logic is reused multiple times, extract a custom hook only when the repo already has a suitable location or the task clearly needs one.
- If pure helper logic is reused multiple times, extract a const function under `src/utils` only when that folder is explicitly needed.
