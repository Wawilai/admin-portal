# Admin Portal Frontend Tasks

## Goal

Replace local demo auth and mock data with real `admin-api` calls while keeping the current React scaffold stable.

## Phase 1

- [x] Replace local session bootstrap in `SessionContext.tsx` with `GET /admin-api/auth/me`
- [x] Replace demo login with `POST /admin-api/auth/login`
- [x] Replace demo logout with `POST /admin-api/auth/logout`
- [x] Add authenticated loading and unauthorized states
- [x] Wire `DashboardPage` to `GET /admin-api/dashboard/overview`
- [x] Wire `UsersPage` to `GET /admin-api/users`
- [x] Wire `UserDetailPage` to `GET /admin-api/users/:userId`

## Phase 1.1

- [x] Add React Query hooks for `dashboard`, `users`, and `user detail`
- [x] Replace seeded `demo-data.ts` usage on the first connected pages
- [x] Add empty states and retry states for API failures
- [x] Add filter and search state for the users list
- [x] Add formatting helpers for dates, tiers, and statuses

## Phase 2

- [x] Wire `CreditsPage` to `GET /admin-api/credits/policy`
- [x] Wire `SubscriptionsPage` to `GET /admin-api/subscriptions`
- [x] Wire `PromoPage` to `GET /admin-api/promo/codes`
- [x] Wire `AuditLogPage` to `GET /admin-api/audit-log`
- [x] Show role-aware navigation and page access
- [x] Wire `AiOpsPage` to `GET/PATCH /admin-api/ai/config`
- [x] Wire `RemoteConfigPage` to `GET/PATCH /admin-api/config`
- [x] Add `AdminUsersPage` wired to `admin-api`

## UX Tasks

- [x] Add session-expired redirect behavior
- [x] Add topbar environment badge for local, staging, or production
- [x] Add global API error toast or inline alert pattern
- [x] Add table loading skeletons
- [x] Add detail-page action placeholders for future support tools
- [x] Add pagination UI for list endpoints that already support `page/pageSize`
- [x] Sync list filters and pagination state with the URL
- [x] Add preset filters and server-driven sort controls for core ops lists
- [x] Add search and audit-focused filters for `Audit Log` and `Admin Users`
- [x] Add bulk actions for `Subscriptions` and `Promo Codes`
- [x] Clear selection on filter, sort, or page change in `Subscriptions` and `Promo`

## Done Criteria For Frontend MVP

- Admin can sign in from the React login page
- App shell restores session after refresh
- Dashboard shows real backend metrics
- Users list and user detail render real backend data
- No first-path page depends on `demo-data.ts` anymore
