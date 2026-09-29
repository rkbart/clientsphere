# Architecture

## High-level flow

```
Browser
  │  same-origin requests: /api/v1/*   (httpOnly session cookie)
  ▼
Next.js (apps/web)  ── rewrites /api/* ──►  Rails API (apps/api)
                                              │  Auth (sessions), Pundit, acts_as_tenant
                                              │  Solid Queue (jobs, in Puma)
                                              │  Solid Cable (realtime)
                                              │  AI service (server-side, encrypted keys)
                                              ▼
                                           PostgreSQL
                                           (app data + queue + cable + cache)
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
- **Zustand** — client state (sidebar, theme, auth)
- **openapi-fetch** — typed API calls against generated schema
- **Vendored agent skills** — `.agents/skills/` (design taste + animation)
  guide UI changes

### Backend (apps/api)

- **Rails 8.1 API mode** — RESTful API
- **PostgreSQL** — primary data store
- **Solid Queue** — background jobs (runs in Puma)
- **Solid Cable** — WebSocket/realtime (runs in Puma)
- **Solid Cache** — caching (runs in Puma)
- **Pundit** — authorization policies
- **acts_as_tenant** — multi-tenancy scoping

### Database

- **PostgreSQL** — single database for all data
- No Redis required — Solid Queue/Cable/Cache use Postgres

## State management

### Frontend

- **TanStack Query** — server data (contacts, deals, etc.)
- **Zustand** — UI state (sidebar, theme) + auth (persisted to localStorage)

### Backend

- **Rails sessions** — httpOnly cookie auth
- **Current attributes** — request-scoped account and user

## Routing

### Frontend

- **Next.js App Router** — file-based routing in `src/app/`
- **API proxy** — `/api/*` rewrites to Rails backend

### Backend

- **Rails routes** — `/api/v1/*` namespaced under `Api::V1`
- **RESTful** — standard CRUD for all resources

## Key constraints

- Free tier limits: Vercel 10s functions, Render 512MB RAM, Neon 0.5GB storage
- Render spins down after ~15min idle — automations only run while awake
- Vercel Hobby is for personal/non-commercial use
- Single database — Postgres hosts app data, jobs, cable, cache

## Performance

- Server-side rendering for initial page load
- Optimistic updates for CRUD operations
- Connection pooling via Neon
- Solid Queue jobs run in-process (no external worker)
- Motion animates only `transform`/`opacity` with named-property
  transitions; `prefers-reduced-motion` drops all movement
