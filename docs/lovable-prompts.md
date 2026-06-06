# Lovable Prompt Pack

This document provides a complete prompt pack for Lovable:

- one `master prompt` for the overall admin portal structure
- one prompt per main screen

Use the master prompt first. After Lovable establishes the shared shell, design system, and routing structure, use the page prompts one by one.

---

## Master Prompt

```text
Design a complete frontend structure for a standalone React admin portal called Rerkdee Admin Portal.

This is an internal operator workspace for a mobile astrology app. It is used by admins to manage users, credits, subscriptions, promo codes, AI configuration, notifications, remote config, audit logs, and admin users.

Important: this is not a marketing site. It must feel like a serious, production-grade operations console.

Primary goals:
- create a new visual system for the entire admin portal
- define the core shell layout and reusable component system first
- establish a consistent structure that all feature pages will inherit
- make the UI look modern, premium, calm, and operationally efficient

Design direction:
- dark, refined, high-clarity product UI
- closer to Linear, Stripe, Vercel, and Notion admin surfaces
- compact and structured, not flashy
- strong typography hierarchy
- low-noise interface with minimal decoration
- dense but readable data presentation
- tables and forms should feel first-class

Avoid:
- generic SaaS dashboard templates
- oversized typography
- decorative gradients everywhere
- bubble-style oversized rounded pills
- card-heavy layout mosaics
- marketing-style hero sections
- toy-like admin chrome

Information architecture that must remain:
- Dashboard
- Users
- Credits
- Subscriptions
- Promo
- AI Ops
- Notifications
- Remote Config
- Audit Log
- Admin Users

Routes that must remain:
- /login
- /
- /users
- /users/:userId
- /credits
- /subscriptions
- /promo
- /ai-ops
- /notifications
- /remote-config
- /audit-log
- /admin-users

Technical constraints:
- React + TypeScript + Vite frontend
- existing backend API contract should remain unchanged
- cookie-based admin session auth stays as-is
- CSRF protection for unsafe actions stays as-is
- role/permission-based navigation stays as-is
- output should be easy to merge into an existing React project

What to design first:
1. app shell
2. left navigation rail
3. top context bar
4. page header pattern
5. reusable panel/section pattern
6. KPI/stat tile pattern
7. table pattern
8. filter and toolbar pattern
9. form controls and action buttons
10. badge, empty state, alert, toast, dialog, and skeleton patterns

Layout requirements:
- fixed or stable left navigation rail on desktop
- compact top context bar
- main workspace area with page header + content layout
- strong spacing system
- desktop-first with usable responsive fallback

Copy direction:
- English-first
- operational, not promotional
- concise section titles
- one-sentence subtitles that explain purpose

Expected output:
- complete visual direction for the portal
- structure for shared layout and reusable components
- clear design system language
- page templates that can be extended screen by screen
- production-quality admin UI, not a concept only

Please produce:
- the overall shell and design system first
- then show how the main page template should look
- then prepare the portal so individual screens can be designed consistently afterward
```

---

## Prompt: Login

```text
Using the established Rerkdee Admin Portal design system, design the Login screen.

Goals:
- secure and professional first impression
- minimal but premium UI
- clear admin-only access flow

Must include:
- brand presence for Rerkdee Admin Portal
- short operational description
- username field
- password field
- sign-in CTA
- error state
- loading state

Design requirements:
- no marketing hero
- no oversized card
- no flashy illustration
- compact and polished auth layout
- should feel trustworthy and internal

Technical notes:
- React screen only
- keep structure easy to connect to existing login API
- preserve cookie-session auth flow
```

---

## Prompt: Dashboard

```text
Using the established Rerkdee Admin Portal design system, design the Dashboard screen.

Goals:
- give operators a fast overview of system state
- surface the most important platform health and demand signals
- help operators know where to investigate next

Must include:
- KPI strip for key metrics
- system health section
- trend chart area
- operational watchlist or alerts area
- space for quick drill-down actions

Content examples:
- AI calls today
- AI calls this month
- active subscriptions
- credits exhausted today
- database status
- AI provider status
- push delivery status

Design requirements:
- dense but readable
- chart should feel integrated with the product UI
- avoid demo-dashboard look
- layout should prioritize scanning and action

Technical notes:
- built to connect to existing dashboard overview endpoints
- should not assume backend contract changes
```

---

## Prompt: Users

```text
Using the established Rerkdee Admin Portal design system, design the Users screen.

Goals:
- make user search and triage efficient
- provide a strong entry point into User 360

Must include:
- page header
- search input
- preset filters
- sort controls
- paginated data table
- clear row structure for email, user id, tier, credits, locale, and last active time

Design requirements:
- table-first screen
- strong scanning hierarchy
- avoid excessive cards
- filters and pagination should feel clean and native to the workspace
- support dense data without feeling cramped

Technical notes:
- built around existing pagination, search, and sort patterns
- should preserve navigation into /users/:userId
```

---

## Prompt: User 360

```text
Using the established Rerkdee Admin Portal design system, design the User 360 screen for route /users/:userId.

Goals:
- give support operators a complete operational view of one user
- make the most important identity, entitlement, and activity data visible quickly
- support future support actions cleanly

Must include:
- identity summary
- subscription and entitlement state
- credits and remaining quota
- promo code history
- device footprint
- recent feature usage
- push-enabled state
- support action area

Design requirements:
- structured sections, not too many nested cards
- important user state should be visible above the fold
- should feel like a support cockpit
- clear distinction between user facts and operator actions

Technical notes:
- should be easy to wire to existing user detail backend response
- leave room for future actions like grant credit, extend subscription, revoke subscription, reset companion history
```

---

## Prompt: Credits

```text
Using the established Rerkdee Admin Portal design system, design the Credits screen.

Goals:
- allow operators to inspect credit policy and make manual adjustments safely
- make quota-related operations feel precise and auditable

Must include:
- current policy summary
- free daily quota visibility
- credit adjustment form
- supporting operational table or summary area
- success/error feedback states

Design requirements:
- emphasize trust and precision
- keep forms simple and deliberate
- not overly card-based
- clear distinction between policy editing and per-user actions

Technical notes:
- should connect cleanly to existing credit policy and adjust endpoints
- maintain room for audit-related cues
```

---

## Prompt: Subscriptions

```text
Using the established Rerkdee Admin Portal design system, design the Subscriptions screen.

Goals:
- help operators manage premium access accurately
- support both single-record and bulk workflows

Must include:
- subscription list table
- preset filters
- sorting controls
- grant subscription form
- single-row actions
- bulk selection and bulk revoke flow
- clear status treatment for active, expired, trial, and promo-derived access

Design requirements:
- table-first layout
- row selection should be extremely clear
- destructive actions should feel controlled and deliberate
- support dense operational workflows without visual clutter

Technical notes:
- should align with existing subscription endpoints and bulk revoke logic
- preserve confirmation flow patterns
```

---

## Prompt: Promo

```text
Using the established Rerkdee Admin Portal design system, design the Promo screen.

Goals:
- let operators create and manage promo codes efficiently
- make code status and redemption behavior easy to inspect

Must include:
- create promo code flow
- promo list table
- code, reward, redemption, max use, expiry, and status columns
- single deactivate action
- bulk deactivate flow

Design requirements:
- clean operational layout
- creation flow should feel fast and lightweight
- table should be easy to scan for live vs inactive codes
- bulk actions should be obvious but safe

Technical notes:
- should connect to current promo endpoints and bulk deactivate logic
```

---

## Prompt: AI Ops

```text
Using the established Rerkdee Admin Portal design system, design the AI Ops screen.

Goals:
- create a technical control surface for AI configuration and future observability
- make the screen feel like a serious operational console

Must include:
- current API key status
- masked key display
- model selector
- update configuration form
- section for future AI metrics and failure monitoring

Content examples:
- calls by feature and tier
- p50 and p95 latency
- model routing
- provider health
- prompt rollout visibility

Design requirements:
- should feel more like a control room than a generic settings page
- keep the form clean and compact
- create clear space for future charts/tables without feeling empty now

Technical notes:
- must align with current AI config backend routes
- do not assume major backend changes
```

---

## Prompt: Notifications

```text
Using the established Rerkdee Admin Portal design system, design the Notifications screen.

Goals:
- establish the future notification operations surface
- support campaign management, audience targeting, and delivery review

Must include:
- campaign list area
- audience preset area
- delivery summary area
- test send flow area
- empty state and placeholder patterns for not-yet-connected modules

Design requirements:
- keep it operational, not promotional
- emphasize workflow clarity
- should feel ready to scale into a full notifications control center

Technical notes:
- design should be easy to connect to existing and future notification endpoints
```

---

## Prompt: Remote Config

```text
Using the established Rerkdee Admin Portal design system, design the Remote Config screen.

Goals:
- allow operators to update app-facing configuration safely
- make high-impact config changes feel explicit and controlled

Must include:
- grouped config fields
- save flow
- clear sectioning for current editable config
- room for future config history and rollout context

Content examples:
- Android store URL
- iOS store URL
- Web store URL
- future feature flags and maintenance settings

Design requirements:
- should feel like configuration infrastructure, not a generic form page
- visual grouping must help reduce mistakes
- save state and feedback should be clear

Technical notes:
- built for current config endpoints
- should be extensible for more config keys later
```

---

## Prompt: Audit Log

```text
Using the established Rerkdee Admin Portal design system, design the Audit Log screen.

Goals:
- make admin traceability readable and usable at scale
- help operators quickly inspect who changed what and when

Must include:
- audit table
- search
- preset filters
- sort controls
- pagination
- clear display of actor, role, action, target, and timestamp

Design requirements:
- strongly table-oriented
- should feel calm and legible even with dense rows
- important risk signals should stand out without overwhelming the page

Technical notes:
- should fit current audit-log endpoint behavior
- should not require backend contract changes
```

---

## Prompt: Admin Users

```text
Using the established Rerkdee Admin Portal design system, design the Admin Users screen.

Goals:
- manage internal operators in a clean and trustworthy way
- support creation, password reset, and deletion flows without confusion

Must include:
- admin user list
- create admin user form
- change password flow
- delete flow
- role visibility

Design requirements:
- should feel more security-oriented than promotional
- actions must be clear and deliberate
- support table + form workflows cleanly

Technical notes:
- should align with current admin-users endpoints
- preserve room for future role/permission expansion
```
