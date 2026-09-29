# Tech Decisions

## Why Rails (backend)

- Built for CRUD — the exact use case of a CRM
- ActiveRecord: convention over configuration, migrations, associations
- Custom session-token auth + Pundit for authorization (no Devise)
- Mature ecosystem, battle-tested for production apps

## Why Next.js (frontend)

- App Router: file-based routing, server components
- API proxy rewrites — same-origin requests, no CORS
- React ecosystem: largest library of components
- Vercel free tier for deployment
- TypeScript-first, excellent DX

## Why a hand-rolled design system (not shadcn/ui)

- Tailwind + semantic CSS custom properties in `globals.css`
- Shared component classes (`.card`, `.btn-*`, `.input`, `.badge-*`) —
  copy-paste simple, zero dependency churn
- Full control of motion tokens and reduced-motion behavior
- See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)

## Why Zustand (state)

- Lightweight, simple API
- No boilerplate compared to Redux
- Persist middleware for the auth token

## Why TanStack Query (data fetching)

- Caching, background refetch, invalidation
- Pagination support
- Type-safe with openapi-fetch

## Why Bearer tokens (not cookies, not JWT-in-cookies)

- Simple SPA flow: login returns a token, client sends
  `Authorization: Bearer …`
- Server stores only a SHA-256 digest — tokens are revocable (logout)
- No CORS/CSRF surface because all requests go through the same-origin
  Next rewrite
- Tradeoff: the token lives in localStorage (XSS risk); acceptable for a
  self-hosted CRM, and mitigated by revocation and short-lived sessions

## Why a hand-written API schema (not rswag/openapi codegen)

- Full control of the TypeScript surface the web app consumes
- No codegen pipeline to break in CI
- `src/lib/api/schema.ts` mirrors routes 1:1 with `openapi-fetch`
- Tradeoff: the schema can drift from Rails — keep it updated with routes
  (candidate for a drift-check script later)

## Why explicit account scoping (not acts_as_tenant)

- `account_id` scoping is visible in every query — easy to audit
- `ApplicationPolicy` enforces a cross-tenant guard centrally
- `policy_scope` on index actions keeps lists tenant-safe
- No gem magic hiding `current_account` switches

## Why rules-based lead scoring

- Honest and explainable
- No "ML" black box
- LLM only explains/suggests, doesn't score
- Faster, cheaper, more predictable

## Why browser-direct for local AI

- Local models (Ollama / LM Studio) should never require a server hop
- Context assembly still happens server-side (`/ai/prompts`), so "what gets
  sent" stays in one audited place
- Works with a hosted backend + local models (the free-tier scenario)

## Why no Redis / Solid Queue (for now)

- Nothing in Phases 1–2 needs durable queues: jobs are short-lived
  (webhook retries, sequence delays) and run on the ActiveJob async adapter
- One fewer service to operate on free tiers
- Tradeoff: delayed jobs only run while the app is awake; revisit with a
  real queue when Phase 3 scheduling hardens

## Known tradeoffs

- Free tier limits: 512MB RAM, 0.5GB DB, 10s Vercel functions
- Render sleeps after ~15min idle — delayed jobs pause with it
- No real-time WebSocket layer
- Single database may become bottleneck at scale
- Local AI inference speed is bound to the user's hardware
