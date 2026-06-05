# Admin Portal Backend Tasks

## Goal

Ship the first production-ready `admin-api` endpoints needed by the React admin portal while keeping the legacy `/admin/*` template routes working.

## Phase 1

- [x] Add `astro_engine/api/admin_api.py` as a JSON router mounted under `/admin-api`
- [x] Reuse existing admin session cookie for `GET /admin-api/auth/me`
- [x] Add `POST /admin-api/auth/login` for JSON-based login
- [x] Add `POST /admin-api/auth/logout` for JSON-based logout
- [x] Add `GET /admin-api/dashboard/overview`
- [x] Add `GET /admin-api/users`
- [x] Add `GET /admin-api/users/{user_id}`
- [x] Include the new router in `astro_engine/api/main.py`
- [ ] Normalize API errors to JSON with clear `detail` messages

## Phase 1.1

- [ ] Add `GET /admin-api/credits/policy`
- [ ] Add `GET /admin-api/subscriptions`
- [ ] Add `GET /admin-api/promo/codes`
- [ ] Add `GET /admin-api/audit-log`
- [ ] Add pagination query params for list endpoints
- [x] Add search support for `/admin-api/users`

## Data Tasks

- [ ] Confirm which table is the source of truth for user locale
- [ ] Confirm whether zodiac and element should come from profile data or stay nullable
- [ ] Confirm whether device state should come from FCM registrations
- [ ] Add a stable query for recent AI usage by user and feature

## Security Tasks

- [ ] Add role information to the session model or an admin session lookup
- [ ] Add permission checks for unsafe endpoints
- [ ] Add CSRF strategy for cookie-authenticated admin mutations
- [ ] Add audit log writes for all future write endpoints

## Done Criteria For Backend MVP

- React portal can bootstrap session from `GET /admin-api/auth/me`
- React dashboard can load real overview data
- React users list can load real data
- React user detail can show real subscription, credit, and usage information
- Legacy `/admin/*` pages still work during migration
