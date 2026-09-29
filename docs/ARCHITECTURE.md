# Architecture

## High-level flow

```
Browser
  │  Bearer token: /api/v1/*   (Authorization header)
  ▼
Next.js (apps/web)  ── rewrites /api/* ──►  Rails API (apps/api)
                                              │  Session tokens (digest-stored)
                                              │  Pundit + account scoping
                                              │  rack-attack (AI rate limit)
                                              │  Ai services (server-side) ──► provider
                                              │  Ai::Prompts /ai/prompts ──► browser ──► local model
                                              ▼
                                           PostgreSQL
```

## Layers

### Frontend (apps/web)

- **Next.js App Router** — file-based routing, server components, proxy rewrites
- **React 18** — UI library
- **Tailwind CSS + design tokens** — utility styling over semantic CSS
  custom properties in `globals.css` (color, radius, shadow, easing,
  duration) plus component classes (`card`, `btn-*`, `input`, `badge-*`);
  see [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)
- **Responsive shell** — fixed sidebar rail at `lg+` (1024px), slide-in
  drawer below (covers half-width browser views); tables scroll
  horizontally on narrow viewports
- **TanStack Query** — server state, caching, background refetch
- **Zustand** — client state (sidebar, auth, persisted token)
- **openapi-fetch** — typed API calls against the hand-written schema
  (`src/lib/api/schema.ts`)
- **@hello-pangea/dnd** — accessible, touch-capable kanban drag-drop
- **Vendored agent skills** — `.agents/skills/` (design taste + animation)
  guide UI changes

### Backend (apps/api)

- **Rails 8.1 API mode** — RESTful API, `Api::V1` namespace
- **PostgreSQL** — primary data store
- **Pundit** — authorization policies (incl. cross-tenant guard)
- **Kaminari** — pagination (`page`/`per_page`, cap 100)
- **Discard** — soft delete (`discarded_at`)
- **rack-attack** — AI endpoint throttling
- **ActiveJob (async adapter)** — in-process delayed jobs (webhook retries,
  sequence steps); no external worker
- **Ai services** — `Ai::Client` (provider adapters), `Ai::Context`
  (scoped record retrieval), `Ai::Prompts` (prompt assembly), `AiLog`
  (metadata-only usage log)
- **Services** — `Leads::Scorer`, `Automations::Engine`, `Webhooks::Deliverer`,
  `Imports::CsvImporter`, `Exports::CsvExporter`

### Database

- **PostgreSQL** — single database for all data
- No Redis required

## State management

### Frontend

- **TanStack Query** — server data (contacts, deals, etc.)
- **Zustand** — UI state (sidebar) + auth (token persisted to localStorage)

### Backend

- **Bearer token sessions** — token issued on login, stored as SHA-256
  digest server-side, revoked on logout
- **Current attributes** — request-scoped account and user

## Routing

### Frontend

- **Next.js App Router** — file-based routing in `src/app/`
- **API proxy** — `/api/*` rewrites to `API_INTERNAL_URL`

### Backend

- **Rails routes** — `/api/v1/*` namespaced under `Api::V1`
- **RESTful** — standard CRUD for all resources

## Key constraints

- Free tier limits: Vercel 10s functions, Render 512MB RAM, Neon 0.5GB storage
- Render spins down after ~15min idle — delayed jobs only run while awake
- Vercel Hobby is for personal/non-commercial use
- Single database — Postgres hosts app data

## Performance

- Server-side rendering for initial page load
- TanStack Query caching + invalidation instead of full refetches
- Motion animates only `transform`/`opacity` with named-property
  transitions; `prefers-reduced-motion` drops all movement
- Local AI inference speed depends on your machine (prompt caps:
  `max_tokens: 1024`)
