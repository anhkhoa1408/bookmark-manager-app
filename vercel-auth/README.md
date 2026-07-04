# Vercel Firebase Auth Function

Small Vercel Function used by the Cloudflare app to verify Firebase ID tokens with `firebase-admin`.

## Environment variables

Set these in the Vercel project:

- `AUTH_FUNCTION_SECRET`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Set these in the Cloudflare Worker app:

- `VERCEL_FIREBASE_AUTH_FUNCTION_URL`
- `VERCEL_FIREBASE_AUTH_FUNCTION_SECRET`

The two secret values must match.

## Endpoint

`POST /api/verify-firebase-token`

Body:

```json
{ "idToken": "..." }
```

Required header:

```text
X-Internal-Auth-Secret: <AUTH_FUNCTION_SECRET>
```
