# Rerkdee Admin Portal

Rebuilt admin frontend for Rerkdee, separated from the backend and connected to the FastAPI `admin-api`.

## What This Replaces

This project now replaces the previous Vite admin scaffold and is intended to become the primary admin UI.

Current live backend-connected modules:

- login and session bootstrap
- dashboard overview
- users and user detail
- credits policy and credit adjustment
- subscriptions and bulk revoke
- promo codes and bulk deactivate
- AI configuration
- remote config
- audit log
- admin users

The `Notifications` route is intentionally kept as a non-live placeholder until notification endpoints are added to the backend contract.

## Stack

- React 19
- TanStack Start
- TanStack Router
- TanStack Query
- Tailwind CSS 4
- Lovable Vite TanStack config

## Scripts

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Environment

Create a local `.env` only when needed. Public frontend env values:

```text
VITE_ADMIN_API_BASE_URL=http://localhost:8900/admin-api
VITE_APP_ENV=local
```

Example production pairing:

```text
VITE_ADMIN_API_BASE_URL=https://rerkdee-api-production.up.railway.app/admin-api
VITE_APP_ENV=production
```

## Railway Notes

Frontend service:

```text
VITE_ADMIN_API_BASE_URL=https://rerkdee-api-production.up.railway.app/admin-api
VITE_APP_ENV=production
```

Railway build/runtime notes:

- builder uses `npm install`
- build is forced to Nitro `node-server`
- runtime starts with `node .output/server/index.mjs`
- Railway should expose `PORT`; Nitro will bind from `PORT`
- `VITE_ADMIN_API_BASE_URL` and `VITE_APP_ENV` must be present at build time

Backend service:

```text
ALLOWED_ORIGINS=https://admin-portal-production-c563.up.railway.app
ADMIN_SESSION_COOKIE_SAMESITE=none
ADMIN_SESSION_COOKIE_SECURE=true
```

## Docs

- [Architecture](./docs/architecture.md)
- [API Contract](./docs/api-contract.md)
- [Roadmap](./docs/roadmap.md)
- [Backend Tasks](./docs/backend-tasks.md)
- [Frontend Tasks](./docs/frontend-tasks.md)
- [Frontend Redesign Spec](./docs/frontend-redesign-spec.md)
- [Lovable Prompts](./docs/lovable-prompts.md)

## Current Notes

- Session state is restored through `GET /admin-api/auth/me`
- Write actions use CSRF headers from the authenticated admin session
- Environment badges switch between local, staging, and production from `VITE_APP_ENV`
- If the backend is unavailable, the app now shows a retryable session error state instead of silently failing
