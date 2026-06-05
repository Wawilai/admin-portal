# Admin Portal Frontend Tasks

## Goal

Replace local demo auth and mock data with real `admin-api` calls while keeping the current React scaffold stable.

## Phase 1

- [ ] Replace local session bootstrap in `SessionContext.tsx` with `GET /admin-api/auth/me`
- [ ] Replace demo login with `POST /admin-api/auth/login`
- [ ] Replace demo logout with `POST /admin-api/auth/logout`
- [ ] Add authenticated loading and unauthorized states
- [ ] Wire `DashboardPage` to `GET /admin-api/dashboard/overview`
- [ ] Wire `UsersPage` to `GET /admin-api/users`
- [ ] Wire `UserDetailPage` to `GET /admin-api/users/:userId`

## Phase 1.1

- [ ] Add React Query hooks for `dashboard`, `users`, and `user detail`
- [ ] Replace seeded `demo-data.ts` usage on the first connected pages
- [ ] Add empty states and retry states for API failures
- [ ] Add filter and search state for the users list
- [ ] Add formatting helpers for dates, tiers, and statuses

## Phase 2

- [ ] Wire `CreditsPage` to `GET /admin-api/credits/policy`
- [ ] Wire `SubscriptionsPage` to `GET /admin-api/subscriptions`
- [ ] Wire `PromoPage` to `GET /admin-api/promo/codes`
- [ ] Wire `AuditLogPage` to `GET /admin-api/audit-log`
- [ ] Show role-aware navigation and page access

## UX Tasks

- [ ] Add session-expired redirect behavior
- [ ] Add topbar environment badge for local, staging, or production
- [ ] Add global API error toast or inline alert pattern
- [ ] Add table loading skeletons
- [ ] Add detail-page action placeholders for future support tools

## Done Criteria For Frontend MVP

- Admin can sign in from the React login page
- App shell restores session after refresh
- Dashboard shows real backend metrics
- Users list and user detail render real backend data
- No first-path page depends on `demo-data.ts` anymore
