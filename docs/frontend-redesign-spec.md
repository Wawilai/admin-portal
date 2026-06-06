# Admin Portal Frontend Redesign Spec

## Goal

Redesign the entire `admin_portal` frontend so it feels modern, premium, calm, and operationally efficient.

The new frontend should replace the current visual layer while preserving the existing React app architecture and the current FastAPI `admin-api` backend contract.

This spec is intended to be handed to Lovable as the design and build brief for a full frontend refresh.

## Product Context

This portal is the internal operations console for the Rerkdee mobile app. It is used by admins to:

- inspect platform health
- troubleshoot user access
- manage credits, subscriptions, and promo codes
- configure AI behavior
- review audit trails
- manage notifications and remote config

This is not a marketing site. It is a dense product workspace for operators.

## Design Direction

### Visual Thesis

Build a dark, high-clarity operator workspace with strong hierarchy, restrained color, crisp typography, and minimal ornamental UI.

The product should feel closer to:

- Linear
- Vercel dashboard
- Stripe internal tools
- Notion admin surfaces

Avoid anything that feels like:

- generic SaaS template
- dashboard card mosaic
- oversized typography
- decorative “premium” gradients with weak information hierarchy
- toy-like admin panels

### Experience Thesis

The UI should optimize for:

- fast scanning
- confidence under load
- clean table workflows
- clear state and action visibility
- consistency across modules

Every screen should answer:

1. Where am I?
2. What is the current state?
3. What action can I take next?

## Non-Negotiable UX Principles

- English-first copy across the entire portal
- One clear navigation system only
- Dense but readable information
- Minimal card usage; use layout and spacing first
- Tables must feel first-class, not an afterthought
- Filters, pagination, and bulk actions must be obvious
- Dangerous actions must feel deliberate and safe
- Visual hierarchy must come from type, spacing, and contrast, not decoration
- Mobile should remain usable, but desktop is the primary target

## Information Architecture

Keep this navigation structure:

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

Keep these routes:

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
/admin-users
```

Do not invent extra entry points or duplicate workflows.

## Layout System

### Overall Shell

Use a 3-part app layout:

1. Left navigation rail
2. Top context/action bar
3. Main workspace area

### Left Navigation Rail

Requirements:

- compact and elegant
- fixed on desktop
- visually quiet
- strong active state
- clear grouping and spacing
- icon + label navigation

Should include:

- brand block
- primary navigation
- current environment indicator
- current signed-in admin context

Do not make the sidebar oversized or visually heavy.

### Top Bar

Requirements:

- page context, not marketing chrome
- compact breadcrumb or section path
- environment badge
- operator info
- top-level actions only if truly global

Avoid:

- too many pills
- oversized buttons
- redundant labels

### Main Workspace

Requirements:

- page heading
- one-sentence operational subtitle
- action area on the right when relevant
- content below organized into sections, tables, metrics, and forms

Use generous spacing, but avoid empty theatrical layouts.

## Visual System

### Typography

Use at most 2 typefaces:

- primary sans for all UI
- optional secondary display face only if extremely restrained

Preferred behavior:

- all UI can be done with one strong sans family
- headings should be compact and controlled
- no oversized serif headlines

Hierarchy target:

- page title: strong but not loud
- section title: compact and utility-first
- labels: small, uppercase optional, highly legible
- table text: neutral and dense
- helper text: muted, short, readable

Typography should feel:

- crisp
- orderly
- premium
- not bulky

### Color

Use a dark theme with:

- deep neutral background
- slightly lifted workspace surfaces
- one warm accent or one cool accent, not many
- semantic states for success, warning, error, info

Guidelines:

- avoid too many gradients
- avoid saturated blue everywhere
- avoid gold overuse
- use accent color mainly for focus, active state, and primary action

### Shape and Surfaces

Requirements:

- medium radius, not bubble UI
- thin borders
- subtle depth
- panels should feel structured, not glossy

Avoid:

- huge rounded pills everywhere
- overly thick borders
- soft toy-like components

### Motion

Use only restrained motion:

- hover elevation for actionable elements
- subtle page/section fade-in
- table/toolbar transitions only where they help orientation

No decorative motion for its own sake.

## Core Components To Redesign

Lovable should redesign these primitives first so the rest of the portal inherits a coherent system:

- app shell
- sidebar
- top bar
- page header
- panel/section container
- stat tiles
- table
- toolbar
- filters
- select/input/button system
- pagination
- badges
- empty states
- inline alerts
- confirm dialog
- toast
- loading skeletons

The final UI should feel system-driven, not page-by-page improvised.

## Page-by-Page Requirements

### 1. Login

Goals:

- feel secure and modern
- minimal visual noise
- strong brand presence
- clear login form

Must include:

- brand
- short explanation
- username and password fields
- submit CTA
- error state

Avoid:

- giant hero copy
- generic auth card styling

### 2. Dashboard

Goals:

- show platform state in one glance
- help operators identify issues quickly

Must include:

- KPI strip
- system health section
- usage trend visualization
- operational watchlist or action queue

Design notes:

- metrics should be readable and compact
- charts should feel integrated, not demo-like
- layout should support scanning left-to-right

### 3. Users

Goals:

- make search, filtering, and entry into User 360 effortless

Must include:

- search
- preset filters
- sortable table
- pagination
- strong row scanning

Design notes:

- table is the product here
- row density should be balanced, not airy
- user identifier hierarchy should be clear

### 4. User 360

Goals:

- create a support operator cockpit for one user

Must include:

- identity block
- credits state
- subscription state
- promo history
- devices
- recent usage
- support actions

Design notes:

- use sections, not too many nested cards
- key user state should be visible above the fold

### 5. Credits

Goals:

- adjust quota policy confidently
- inspect credit issues quickly

Must include:

- policy summary
- adjustment form
- affected users or summary table

### 6. Subscriptions

Goals:

- manage entitlement state accurately

Must include:

- filters
- bulk revoke workflow
- single-row actions
- clear active/expired/trial states

Design notes:

- dangerous actions must be obvious but controlled
- selection state must be extremely clear

### 7. Promo

Goals:

- create and deactivate promo codes efficiently

Must include:

- create code flow
- promo list
- redemption-related columns
- bulk deactivate

### 8. AI Ops

Goals:

- manage AI model/config state
- become the future home for AI observability

Must include:

- current model and key status
- editable configuration form
- placeholders or space for usage/error metrics

Design notes:

- should feel like a technical control room, not a settings card

### 9. Notifications

Goals:

- eventually manage campaign operations

Current redesign can establish:

- campaign table structure
- delivery status patterns
- empty/loading states

### 10. Remote Config

Goals:

- make configuration changes feel safe and explicit

Must include:

- grouped config fields
- clear save flow
- space for change history later

### 11. Audit Log

Goals:

- make traceability readable at scale

Must include:

- search
- preset filters
- sortable table
- actor / action / target clarity

### 12. Admin Users

Goals:

- manage internal operators cleanly

Must include:

- user list
- create admin flow
- change password flow
- delete flow

## Data and Backend Constraints

The redesign must preserve compatibility with the existing backend integration shape.

Important constraints:

- frontend remains React + TypeScript + Vite
- use existing route structure
- use existing `admin-api` patterns
- session auth stays cookie-based
- unsafe requests use CSRF
- list endpoints use pagination
- permissions remain role-based

Do not redesign in a way that assumes:

- GraphQL
- WebSocket-first live updates
- backend route changes
- major entity renaming

## Technical Constraints For Implementation

Lovable output should fit into this structure:

```text
admin_portal/src/
  app/
  components/
    layout/
    ui/
  features/
    auth/
  lib/
  pages/
  styles.css
```

Preferred implementation rules:

- reusable UI primitives
- clear separation between shell, primitives, and pages
- no bloated design system abstraction
- keep code easy to merge into current project

## Copy Guidelines

Use operational copy, not landing-page copy.

Good examples:

- `System Overview`
- `Recent AI Failures`
- `Subscription State`
- `Promo Redemption Risk`
- `Grant Manual Credit`

Avoid:

- hype copy
- vague aspirational taglines
- executive-marketing language

Subtitles should be one sentence and answer why the section matters.

## Accessibility Requirements

- strong contrast in all states
- visible focus states
- keyboard-friendly forms and tables where practical
- readable sizes for dense data
- dangerous actions clearly labeled

## Deliverables Requested From Lovable

Ask Lovable to provide:

1. A full visual redesign of the admin portal frontend
2. A reusable component system for the portal
3. Updated page layouts for all current routes
4. Responsive behavior for desktop and tablet/mobile fallback
5. Clean React-friendly output that can be merged into the existing `admin_portal` project

## Prompt Starter For Lovable

Use this prompt:

```text
Redesign a full internal admin portal for a mobile astrology app called Rerkdee.

This is not a marketing site. It is a serious operator workspace for managing users, credits, subscriptions, promo codes, AI configuration, notifications, remote config, and audit logs.

Style direction:
- dark, modern, premium, minimal
- crisp typography
- calm but high-clarity information hierarchy
- closer to Linear / Stripe / Vercel admin tools
- avoid generic SaaS dashboard cards
- avoid oversized typography and decorative UI
- use dense but readable tables
- use minimal color accents and restrained motion

Layout requirements:
- left navigation rail
- top context bar
- main workspace area
- compact page headers
- reusable panel, toolbar, table, and form components

Pages to redesign:
- Login
- Dashboard
- Users
- User 360
- Credits
- Subscriptions
- Promo
- AI Ops
- Notifications
- Remote Config
- Audit Log
- Admin Users

Constraints:
- React + TypeScript + Vite
- existing route structure must remain
- backend API contract should not be changed
- cookie session auth and CSRF remain as-is
- design should be easy to integrate into an existing React project

Output should feel like a polished production admin tool, not a generic template.
```

## Success Criteria

The redesign is successful if:

- the portal looks clearly more professional than the current version
- operators can scan and act faster
- tables and forms feel first-class
- the UI is visually consistent across all modules
- the result can be integrated without backend rewrites
