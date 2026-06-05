# React Admin Portal Roadmap

## Scope

This document tracks delivery order for the standalone React admin portal and the backend `admin-api` it depends on.

For system structure, see [Architecture](/d:/Lab/MobileAPP/admin_portal/docs/architecture.md:1). For endpoint details, see [API Contract](/d:/Lab/MobileAPP/admin_portal/docs/api-contract.md:1).

## MVP Scope

### Frontend MVP

- login page
- protected app shell
- dashboard overview
- users list
- user detail placeholder
- credits page
- subscriptions page
- promo page
- AI Ops placeholder
- notifications placeholder
- remote config placeholder
- audit log placeholder

### Backend MVP

- `GET /admin-api/auth/me`
- `POST /admin-api/auth/login`
- `POST /admin-api/auth/logout`
- `GET /admin-api/dashboard/overview`
- `GET /admin-api/users`
- `GET /admin-api/users/:userId`
- `GET /admin-api/credits/policy`
- `GET /admin-api/subscriptions`
- `GET /admin-api/promo/codes`
- `GET /admin-api/audit-log`

## Recommended Delivery Order

1. Keep current template admin alive.
2. Add JSON endpoints beside existing HTML routes.
3. Release the React portal on a separate admin subdomain or protected internal path.
4. Migrate modules in this order: dashboard, users, credits, subscriptions, promo.
5. Move AI Ops, notifications, remote config, and audit after the support workflows stabilize.
6. Retire the old templates only after feature parity and access control parity are complete.

## Phase Breakdown

### Phase 1

- auth bootstrap
- dashboard wired to real overview data
- users list and user detail wired to real data
- credits, subscriptions, and promo list views wired to real data

### Phase 2

- support actions in User 360
- audit log visibility
- permission-aware UI by role
- backend session replacing local demo auth shell

### Phase 3

- AI Ops dashboards
- notifications control center
- remote config editor
- incident workflows

## Non-Goals For The First Iteration

- websocket live updates
- multi-tenant administration
- custom charting engine
- full design system package
- replacing the existing backend auth stack
