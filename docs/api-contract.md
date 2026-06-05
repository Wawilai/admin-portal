# React Admin Portal API Contract

## Scope

This document defines the initial FastAPI `admin-api` contract expected by the React admin portal.

For system structure and product boundaries, see [Architecture](/d:/Lab/MobileAPP/admin_portal/docs/architecture.md:1).

## Response Conventions

- timestamps use ISO8601 UTC strings
- lists use `page`, `pageSize`, `total`, `items`
- filters travel as query params
- sorting uses `sortBy` and `sortOrder`
- enums remain stable and UI maps labels

Example paginated response:

```json
{
  "page": 1,
  "pageSize": 20,
  "total": 245,
  "items": []
}
```

## Authentication

Preferred production model:

- backend-managed session in `httpOnly` cookies
- CSRF protection for unsafe requests
- server-resolved role and permissions

Routes:

- `POST /admin-api/auth/login`
- `POST /admin-api/auth/logout`
- `GET /admin-api/auth/me`

Example `GET /admin-api/auth/me` response:

```json
{
  "user": {
    "id": "admin_001",
    "email": "ops@example.com",
    "role": "ops_admin",
    "displayName": "Ops Admin"
  },
  "permissions": [
    "users.read",
    "users.write",
    "credits.read",
    "credits.write",
    "subscriptions.read",
    "subscriptions.write"
  ]
}
```

## Route Groups

### Dashboard

- `GET /admin-api/dashboard/overview`
- `GET /admin-api/dashboard/ai-usage`
- `GET /admin-api/dashboard/system-health`

Example overview response:

```json
{
  "aiCallsToday": 1834,
  "aiCallsMonth": 46821,
  "activeSubscriptions": 1237,
  "totalUsers": 28194,
  "creditsExhaustedToday": 347,
  "dbStatus": "ok",
  "aiStatus": "warning",
  "pushStatus": "ok"
}
```

### Users

- `GET /admin-api/users`
- `GET /admin-api/users/:userId`
- `GET /admin-api/users/:userId/usage`
- `GET /admin-api/users/:userId/devices`
- `POST /admin-api/users/:userId/actions/grant-credit`
- `POST /admin-api/users/:userId/actions/extend-subscription`
- `POST /admin-api/users/:userId/actions/revoke-subscription`
- `POST /admin-api/users/:userId/actions/reset-companion-history`

Example user detail response:

```json
{
  "userId": "uid_001",
  "email": "nicha@example.com",
  "locale": "th",
  "tier": "premium",
  "credits": 22,
  "remainingToday": 9999,
  "zodiac": "dragon",
  "element": "wood",
  "pushEnabled": true,
  "promoCodes": ["RERK001"],
  "devices": [
    {
      "label": "Android Pixel 8",
      "lastSeenAt": "2026-06-05T09:42:00Z"
    }
  ],
  "recentUsage": [
    {
      "feature": "companion_chat",
      "count": 18
    }
  ]
}
```

### Credits

- `GET /admin-api/credits/policy`
- `PATCH /admin-api/credits/policy`
- `GET /admin-api/credits/users`
- `POST /admin-api/credits/users/:userId/adjust`

### Subscriptions

- `GET /admin-api/subscriptions`
- `POST /admin-api/subscriptions`
- `PATCH /admin-api/subscriptions/:userId`
- `POST /admin-api/subscriptions/:userId/revoke`
- `DELETE /admin-api/subscriptions/:userId`

### Promo

- `GET /admin-api/promo/codes`
- `POST /admin-api/promo/codes`
- `PATCH /admin-api/promo/codes/:codeId`
- `POST /admin-api/promo/codes/:codeId/deactivate`
- `GET /admin-api/promo/redemptions`

### AI Ops

- `GET /admin-api/ai/usage`
- `GET /admin-api/ai/features`
- `GET /admin-api/ai/errors`
- `GET /admin-api/ai/models`
- `PATCH /admin-api/ai/config`
- `POST /admin-api/ai/test`

### Notifications

- `GET /admin-api/notifications/campaigns`
- `POST /admin-api/notifications/campaigns`
- `POST /admin-api/notifications/test-send`
- `GET /admin-api/notifications/audiences`
- `GET /admin-api/notifications/delivery-stats`

### Remote Config

- `GET /admin-api/config`
- `PATCH /admin-api/config`
- `GET /admin-api/config/history`

### Audit

- `GET /admin-api/audit-log`

## Audit Requirements

Every unsafe admin action should create an audit row with:

- actor id
- actor role
- action type
- target entity type
- target entity id
- before snapshot reference
- after snapshot reference
- IP address
- timestamp
