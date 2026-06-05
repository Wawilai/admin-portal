# Rerkdee Admin Portal

Standalone React admin portal scaffold for the mobile app operations console.

## Purpose

This project is intentionally separated from the FastAPI backend so the admin UI can evolve independently while the backend becomes a JSON Admin API.

Docs:

- [Architecture](/d:/Lab/MobileAPP/admin_portal/docs/architecture.md:1)
- [API Contract](/d:/Lab/MobileAPP/admin_portal/docs/api-contract.md:1)
- [Roadmap](/d:/Lab/MobileAPP/admin_portal/docs/roadmap.md:1)
- [Backend Tasks](/d:/Lab/MobileAPP/admin_portal/docs/backend-tasks.md:1)
- [Frontend Tasks](/d:/Lab/MobileAPP/admin_portal/docs/frontend-tasks.md:1)

## Included

- React + TypeScript + Vite scaffold
- protected admin shell layout
- route structure for core modules
- dashboard and operational pages with realistic seeded data
- local auth/session shell for frontend development
- API client skeleton for future backend wiring
- shared domain types aligned to the proposed admin API

## Next Steps

1. Install dependencies
2. Run the portal locally
3. Start replacing seeded loaders with real `admin-api` calls
4. Replace the local session shell with backend auth/session integration

## Scripts

```bash
npm install
npm run dev
```

## Suggested Backend Pairing

Use this portal with new FastAPI JSON routes under:

```text
/admin-api/auth/*
/admin-api/dashboard/*
/admin-api/users/*
/admin-api/credits/*
/admin-api/subscriptions/*
/admin-api/promo/*
/admin-api/ai/*
/admin-api/notifications/*
/admin-api/config/*
/admin-api/audit-log
```

## Current Scaffold Notes

- Route protection is handled in `src/features/auth/RequireAuth.tsx`
- Session bootstrap currently uses browser storage only for local demo flow
- Replace `SessionProvider` sign-in logic with `POST /admin-api/auth/login`
- Replace session bootstrap with `GET /admin-api/auth/me`
