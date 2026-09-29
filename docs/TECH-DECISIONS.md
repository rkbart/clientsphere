# Tech Decisions

## Why Rails (backend)

- Built for CRUD — the exact use case of a CRM
- ActiveRecord: convention over configuration, migrations, associations
- Devise/bcrypt for auth, Pundit for authorization
- Solid Queue/Cable/Cache — no Redis needed, runs in Puma
- Action Cable for WebSocket/realtime
- Active Admin / Mission Control for ops visibility
- Mature ecosystem, battle-tested for production apps

## Why Next.js (frontend)

- App Router: file-based routing, server components
- API proxy rewrites — same-origin requests, no CORS
- React ecosystem: largest library of components
- Vercel free tier for deployment
- TypeScript-first, excellent DX

## Why Tailwind CSS + shadcn/ui

- Utility-first: no CSS framework conflicts
- shadcn/ui: production-ready, accessible components
- Customizable, copy-paste, no vendor lock-in

## Why Zustand (state)

- Lightweight, simple API
- No boilerplate compared to Redux
- Good for small-medium apps
- Persist middleware for auth

## Why TanStack Query (data fetching)

- Caching, background refetch
- Optimistic updates
- Pagination support
- Type-safe with openapi-fetch

## Why Solid Queue/Cable/Cache (no Redis)

- No extra infrastructure to manage
- Runs inside Puma process
- Single database for everything
- Simpler deployment, lower cost

## Why cookies over JWT

- httpOnly cookies: not accessible via JavaScript (XSS protection)
- Same-origin via Next rewrites: no CORS needed
- CSRF protection built-in
- No token storage in localStorage

## Why monorepo

- API contract and client types in same commit
- CI can verify generated types are current
- Single clone, single CI pipeline
- Render and Vercel deploy from subdirectories

## Why OpenAPI-generated types

- Single source of truth (Rails specs)
- No manual type mirroring that drifts
- CI fails if generated file is out of date
- Type-safe API calls with openapi-fetch

## Why acts_as_tenant

- Automatic `account_id` scoping on every query
- Simple implementation, battle-tested gem
- Works with ActiveRecord associations

## Why rules-based lead scoring

- Honest and explainable
- No "ML" black box
- LLM only explains/suggests, doesn't score
- Faster, cheaper, more predictable

## Known tradeoffs

- Free tier limits: 512MB RAM, 0.5GB DB, 10s Vercel functions
- Render sleeps after ~15min idle
- No real-time WebSocket on free tier (Solid Cable needs always-on)
- Single database may become bottleneck at scale
