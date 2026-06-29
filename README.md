# Bookmark Manager App

A bookmark manager built with TanStack Start, React 19, TanStack Query, Tailwind CSS v4, Better Auth, and Firebase.

The UI follows the Atomic Design principle for a clear, scalable component structure.

## What it does

- Save and organize bookmarks with tags
- Browse active and archived bookmarks separately
- Search, filter, sort, pin, archive, and delete bookmarks
- Import bookmarks in bulk
- Sign in with Better Auth + Firebase Authentication

## Tech Stack

- TanStack Start
- TanStack Router
- TanStack Query
- React 19
- Tailwind CSS v4
- Better Auth
- Firebase client SDK
- Firebase Admin SDK
- Vite
- Wrangler

## Requirements

- Node.js 20+ recommended
- npm
- A configured Firebase project
- Better Auth environment variables

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The app runs on `http://localhost:3000`.

## Build

Create a production build:

```bash
npm run build
```

Preview the built app locally:

```bash
npm run preview
```

Deploy with Wrangler:

```bash
npm run deploy
```

## Environment Setup

This app relies on auth and Firebase configuration. Set up the environment variables required by your local Firebase and Better Auth setup before running the app.

If you need a Better Auth secret, generate one with:

```bash
npx @better-auth/cli secret
```

## Project Structure

- `src/components/` - UI components split into atoms, molecules, organisms, and templates
- `src/lib/` - shared client helpers, auth, Firebase, cache, and utilities
- `src/routes/` - TanStack Router file-based routes
- `src/server/` - server functions and server-only helpers
- `src/middleware/` - route protection and auth middleware
- `src/integrations/` - TanStack Query integration and devtools wiring
- `src/styles.css` - Tailwind v4 theme, tokens, and global styles

## Routing Overview

- `/home` - protected bookmarks dashboard
- `/archived` - protected archived bookmarks view
- `/auth/*` - public authentication pages
- `/api/auth/*` - auth-related API routes

## Notes

- The root route redirects to `/home`
- Protected app routes use Better Auth session checks
- Firebase Admin code stays server-side only
- TanStack Router route files are kept thin by design
