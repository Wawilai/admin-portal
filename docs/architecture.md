# React Admin Portal Architecture

## Objective

Build a standalone React admin portal for the mobile app, separate from the FastAPI backend, so admin UX and backend operations can evolve independently.

This portal should replace the current server-rendered admin templates over time without forcing a risky backend rewrite.

## Related Docs

- [API Contract](/d:/Lab/MobileAPP/admin_portal/docs/api-contract.md:1)
- [Roadmap](/d:/Lab/MobileAPP/admin_portal/docs/roadmap.md:1)

## Why Separate The Admin Portal

- Independent deployment and rollback for admin UI
- Better UX for dense tables, filters, charts, and support workflows
- Clear separation between presentation and operational APIs
- Easier role-based access control, audit logging, and frontend testing
- Incremental migration away from Jinja templates in `astro_engine/api/templates`

## Target Topology

```text
admin.yourdomain.com              React admin portal
api.yourdomain.com/admin-api      FastAPI admin JSON API
api.yourdomain.com/v1             Mobile app API
```

## Project Boundaries

### Frontend Responsibilities

- authentication bootstrap and route guards
- dashboard and operational workflows
- filters, search, pagination, and presentation logic
- optimistic UI for low-risk admin actions
- permission-aware navigation

### Backend Responsibilities

- admin authentication and session lifecycle
- permission enforcement
- data aggregation and support actions
- audit log creation for all unsafe mutations
- operational health, metrics, and policy storage

## Recommended Frontend Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- TanStack Table
- Recharts
- Zustand only for small UI state if needed

## Recommended Backend Shape

- keep existing FastAPI service as source of truth
- add JSON routes under `/admin-api/*`
- leave legacy `/admin/*` template routes active during migration
- centralize permission checks in reusable admin dependencies

## User Roles

- `super_admin`
  - full access
- `ops_admin`
  - users, credits, subscriptions, support actions
- `marketing_admin`
  - promo, notifications, banners, remote config copy
- `analyst`
  - read-only access to dashboards, exports, and AI operations

## Information Architecture

### Core Navigation

- Dashboard
- Users
- Credits
- Subscriptions
- Promo
- AI Ops
- Notifications
- Remote Config
- Audit Log

### Route Map

```text
/login
/
/users
/users/:userId
/credits
/subscriptions
/promo
/ai-ops
/notifications
/remote-config
/audit-log
```

### Module Responsibilities

#### Dashboard

- daily and monthly AI volume
- premium and promo entitlement health
- high-level system health
- quick links into incidents and support queues

#### Users

- search users by id, email, device, or promo code
- open User 360 detail
- inspect recent activity and entitlement state

#### User 360

- identity and profile
- subscription and promo source
- credits and free quota state
- devices and push state
- recent feature usage
- operator actions such as credit grant or subscription extension

#### Credits

- free daily quota policy
- manual balance adjustments
- users with abnormal depletion patterns

#### Subscriptions

- paid, promo, and trial entitlements
- expiry visibility
- correction tools for support

#### Promo

- create and deactivate codes
- redemption monitoring
- abuse review

#### AI Ops

- calls by feature
- latency and failure rates
- prompt version rollout
- model routing and provider health

#### Notifications

- campaigns
- test sends
- audience presets
- delivery results

#### Remote Config

- feature flags
- maintenance mode
- app version requirements
- prompt version and quota settings

#### Audit Log

- every unsafe action by operator
- actor, target, before/after snapshot references

## Frontend Project Structure

```text
admin_portal/
  docs/
    architecture.md
    api-contract.md
    roadmap.md
  src/
    app/
      App.tsx
      providers.tsx
      router.tsx
    components/
      layout/
      ui/
    features/
      auth/
    lib/
      api.ts
      formatters.ts
      types.ts
    pages/
    styles.css
```

### Structure Notes

- `app/` owns bootstrap, providers, and routing
- `components/` contains reusable shell and UI primitives
- `features/auth/` owns session state and route guards
- `lib/` contains API client, shared types, and formatting helpers
- `pages/` contains route-level screens

## Authentication Model

Preferred production model:

- backend-managed session in `httpOnly` cookies
- `GET /admin-api/auth/me` hydrates session on app load
- frontend blocks protected routes until session check completes
- CSRF protection on unsafe requests

Required routes:

- `POST /admin-api/auth/login`
- `POST /admin-api/auth/logout`
- `GET /admin-api/auth/me`

For concrete request and response shapes, see [API Contract](/d:/Lab/MobileAPP/admin_portal/docs/api-contract.md:1).

## Recommendation

Proceed with the standalone React admin portal now, backed by incremental FastAPI `admin-api` endpoints. This gives the team immediate UX and operational gains while keeping backend migration risk low.
