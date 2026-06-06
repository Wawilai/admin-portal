# Feature Access Control — Design Document

## 1. Context and Problem

The app currently controls feature access through hardcoded logic in Flutter:

```dart
// router.dart — hardcoded per screen
PremiumGate(featureKey: 'fab.compat', child: CompatibilityScreen())

// premium_gate.dart — hardcoded check
if (_svc.hasPremiumAccess) return widget.child;

// subscription_status.dart — hardcoded tier mapping
bool get hasPremiumAccess => isPremium || isTrial;
```

**Consequences:**

- Changing which tier unlocks a feature requires a Flutter release and store review
- Store tier (Apple/Google) and feature entitlement are coupled in code — cannot be adjusted independently
- No per-feature granularity: a user is either in "all features" or "no features"
- Admin portal cannot reflect or change feature availability in any meaningful way
- A/B testing, soft launches, or tier expansions ("make horoscope free for 2 weeks") are impossible without a code push

---

## 2. Goals

- Admin can change which tiers unlock which features from the portal, live, without a Flutter release
- Store tier negotiation (Apple/Google IAP) remains the source of truth for the user's active tier — the feature policy only controls what that tier can access
- Flutter falls back to safe defaults when the config is unavailable (offline)
- The system is additive: existing `PremiumGate` and `AiGate` are replaced gradually with the new `FeatureGate`, not rewritten all at once

---

## 3. Scope

### In scope

- Feature-level access policy stored on backend, editable from Admin Portal
- Flutter reads policy from `AppConfigService` (already fetches `/v1/app-config`)
- `FeatureGate` widget replaces `PremiumGate` in router
- Admin Portal Remote Config page shows and edits feature policies
- Backend seeds sensible defaults so the app works before admin has touched anything

### Out of scope

- Real-time push of config changes to open app sessions (cache TTL is sufficient)
- Per-user feature overrides (use promo/subscription for that)
- Feature flags for non-access purposes (UI experiments, kill switches) — separate concern

---

## 4. Architecture

### 4.1 Separation of concerns

```
┌──────────────────────────────────────────────────────────────────┐
│  Store (Apple / Google)                                          │
│  Source of truth for: is the user premium? is trial active?     │
│  Outputs: subscription tier  →  free | trial | premium          │
└──────────────────────────┬───────────────────────────────────────┘
                           │ tier
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  Feature Policy  (app_config DB, editable from Admin Portal)     │
│  Source of truth for: what can each tier do?                     │
│  feature.horoscope.access = "premium,trial"                     │
│  feature.compat.access    = "free,premium,trial"                │
└──────────────────────────┬───────────────────────────────────────┘
                           │ allowed tiers per feature
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  FeatureGate (Flutter widget)                                    │
│  Combines tier + policy → allow or show paywall                  │
└──────────────────────────────────────────────────────────────────┘
```

The store controls **who the user is**. The policy controls **what they can do**.
Changing the policy does not require a store change or a Flutter release.

### 4.2 Feature key namespace

Each feature is identified by a stable string key:

| Feature key        | Screen                  |
|--------------------|-------------------------|
| `compat`           | Compatibility           |
| `horoscope`        | Daily Horoscope         |
| `dream`            | Dream Interpretation    |
| `lagna`            | Lagna Prophecy          |
| `brahma`           | Brahma Chati            |
| `annual`           | Annual Fortune          |
| `companion.ai`     | AI Companion chat       |
| `zodiac_weekly`    | Zodiac Weekly           |
| `cosmic_card`      | Cosmic Card             |

### 4.3 Config key format

Stored in the existing `app_config` table:

```
feature.{key}.access = comma-separated list of allowed tiers
```

Examples:

```
feature.compat.access       = premium,trial
feature.horoscope.access    = premium,trial
feature.dream.access        = premium,trial
feature.lagna.access        = premium,trial
feature.brahma.access       = premium,trial
feature.annual.access       = premium,trial
feature.companion.ai.access = free,premium,trial
feature.zodiac_weekly.access = free,premium,trial
feature.cosmic_card.access  = free,premium,trial
```

`free` in the list means the feature is available to all users (gated by credit if it uses AI, not by subscription tier).

---

## 5. Backend Changes

### 5.1 Seed defaults (`db.py` — `_ensure_app_config_table`)

Add `ON CONFLICT DO NOTHING` inserts for each `feature.*.access` key so the system has working defaults from day one without admin intervention.

### 5.2 Expose in `/v1/app-config` (`main.py`)

The existing endpoint returns `store_url_*`. Extend the response to include all `feature.*` keys:

```json
{
  "store_url_android": "...",
  "store_url_ios": "...",
  "store_url_web": "...",
  "features": {
    "compat":          { "access": ["premium", "trial"] },
    "horoscope":       { "access": ["premium", "trial"] },
    "dream":           { "access": ["premium", "trial"] },
    "lagna":           { "access": ["premium", "trial"] },
    "brahma":          { "access": ["premium", "trial"] },
    "annual":          { "access": ["premium", "trial"] },
    "companion.ai":    { "access": ["free", "premium", "trial"] },
    "zodiac_weekly":   { "access": ["free", "premium", "trial"] },
    "cosmic_card":     { "access": ["free", "premium", "trial"] }
  }
}
```

Reads all `feature.*` keys in a single `SELECT key, value FROM app_config WHERE key LIKE 'feature.%'` query.

### 5.3 Admin API `PATCH /admin-api/config`

Extend the existing remote config patch endpoint to accept feature access updates:

```json
{
  "features": {
    "compat": { "access": ["free", "premium", "trial"] }
  }
}
```

Validates that:
- Feature key is in the known set
- Each tier value is one of `free`, `trial`, `premium`
- Writes `feature.{key}.access = "free,premium,trial"` to `app_config`
- Appends an audit log entry

---

## 6. Flutter Changes

### 6.1 `AppConfigService` — new method

```dart
// Returns the tiers allowed for a feature.
// Falls back to ['premium', 'trial'] when config is unavailable (safe default).
Set<String> accessTiersFor(String featureKey);

// Convenience: returns true if the user's current tier is in the allowed set.
bool canAccess(String featureKey);
```

`canAccess` reads the user's tier from `PurchaseService`:

```dart
bool canAccess(String featureKey) {
  final allowed = accessTiersFor(featureKey);
  if (allowed.contains('free')) return true;
  final tier = PurchaseService.instance.status.tierName; // 'free'|'trial'|'premium'
  return allowed.contains(tier);
}
```

Config is already cached in `SharedPreferences` and refreshed in the background — `canAccess` is synchronous.

### 6.2 `FeatureGate` widget

Replaces `PremiumGate`. Same visual behaviour (paywall overlay when locked), but reads policy from `AppConfigService` instead of hardcoding `hasPremiumAccess`.

```dart
class FeatureGate extends StatelessWidget {
  const FeatureGate({
    required this.feature,   // 'compat' | 'horoscope' | ...
    required this.child,
    this.featureLabelKey,    // l10n key for the paywall title
  });
}
```

### 6.3 Router — swap `PremiumGate` → `FeatureGate`

```dart
// Before
PremiumGate(featureKey: 'fab.compat', child: CompatibilityScreen())

// After
FeatureGate(feature: 'compat', featureLabelKey: 'fab.compatibility', child: CompatibilityScreen())
```

One-line change per route. The feature key and the l10n key are independent.

### 6.4 `AiGate` — no change required

`AiGate` controls credit consumption, not feature access. It continues to work exactly as before. A user who passes `FeatureGate` still goes through `AiGate` before AI is called.

### 6.5 Offline / cache-miss behaviour

If `AppConfigService` has no cached config (first install, no network):
- `accessTiersFor` returns the compile-time default: `{'premium', 'trial'}`
- This is the safe direction: deny access rather than grant it unintentionally

---

## 7. Admin Portal Changes

### 7.1 Remote Config page — Feature Access section

New section below Store URLs:

```
┌─────────────────────────────────────────────────────┐
│ Feature Access                                      │
│ Control which subscription tiers unlock each        │
│ feature. Changes take effect within 6 hours         │
│ (client cache TTL).                                 │
├─────────────────────────────────────────────────────┤
│ Compatibility         [✓] Free [✓] Trial [✓] Premium│
│ Daily Horoscope       [ ] Free [✓] Trial [✓] Premium│
│ Dream Interpretation  [ ] Free [✓] Trial [✓] Premium│
│ Lagna Prophecy        [ ] Free [✓] Trial [✓] Premium│
│ Brahma Chati          [ ] Free [✓] Trial [✓] Premium│
│ Annual Fortune        [ ] Free [✓] Trial [✓] Premium│
│ AI Companion          [✓] Free [✓] Trial [✓] Premium│
│ Zodiac Weekly         [✓] Free [✓] Trial [✓] Premium│
│ Cosmic Card           [✓] Free [✓] Trial [✓] Premium│
├─────────────────────────────────────────────────────┤
│                              [Save Feature Access]  │
└─────────────────────────────────────────────────────┘
```

Three checkboxes per row. Saving sends `PATCH /admin-api/config` with the updated features map.

**Validation rule in UI:** Premium must always be checked if Trial is checked (trial is a superset of premium in the current tier model).

### 7.2 `GET /admin-api/config` response extension

Admin API returns the current feature map alongside store URLs so the UI can populate the checkboxes on load.

---

## 8. Delivery Sequence

Steps are ordered so the system remains functional at each stage:

| Step | What | Risk if skipped |
|------|------|-----------------|
| 1 | Seed `feature.*` defaults in `db.py` | App falls back to compile-time defaults — safe |
| 2 | Extend `/v1/app-config` with `features` block | Flutter still reads old format — no breakage |
| 3 | `AppConfigService.canAccess()` + `FeatureGate` widget | Old `PremiumGate` still works in parallel |
| 4 | Swap `PremiumGate` → `FeatureGate` in router (one per route) | Each swap is independent — partial migration is fine |
| 5 | Extend `PATCH /admin-api/config` to accept feature updates | Remote Config page shows read-only until this ships |
| 6 | Admin Portal Feature Access section | Admin uses direct DB edit until this ships |

Steps 1–2 are backend only (Railway redeploy, no Flutter release needed).
Steps 3–4 require a Flutter build.
Steps 5–6 require an Admin Portal build.

---

## 9. Decisions

| # | Question | Decision |
|---|----------|----------|
| 1 | `free` tier + AI feature: pass FeatureGate then still consume credit via AiGate? | **Yes** — FeatureGate and AiGate are independent layers |
| 2 | Trial expires mid-session → lock immediately without restart? | **Yes** — acceptable UX |
| 3 | 6-hour cache TTL for admin changes? | **Accepted** |
| 4 | Support `basic` and `pro` tiers in feature access vocabulary? | **Cancelled** — only `free`, `trial`, `premium` |
