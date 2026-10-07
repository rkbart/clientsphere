# Deployment

## Option A — Self-host (recommended)

`docker compose up` runs Rails (Puma), a Solid Queue worker (`bin/jobs`),
Next.js and Postgres on any VPS or home server. Always on, so delayed jobs
(webhook retries, sequence steps) run on schedule. The worker is a separate
`worker` service in `docker-compose.yml` — scale it independently if job
volume grows.

Cost: your server only.

## Option B — Free-tier demo

```
Vercel (web)  ──►  Render free web service (Rails)  ──►  Neon free Postgres
```

### Caveats

- Render free web services spin down after ~15 minutes idle; the next request can take up to about a minute
- Delayed jobs persist in Postgres via Solid Queue, but still need a running
  worker — add a Render background worker running `bin/jobs start`, or they
  only run while a worker is awake
- Free instance hours are capped monthly
- Vercel Hobby is intended for personal, non-commercial use
- Free tiers and limits change — re-verify before launch

### Config

- Env vars (API): `DATABASE_URL`, `SECRET_KEY_BASE`, `ACTIVE_RECORD_ENCRYPTION_*` keys,
  `MISSION_CONTROL_USER` / `MISSION_CONTROL_PASSWORD` (for the `/jobs` dashboard),
  `WEB_URL` (public web origin, used in email links — set to your Vercel/frontend URL),
  `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` (optional OAuth)
- Env vars (web): `API_INTERNAL_URL` (used by the Next rewrite)
- Build (Render, root dir `apps/api`): `bundle install && SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile && bin/rails db:migrate`; start: `bundle exec puma -C config/puma.rb`, plus a background worker running `bin/jobs start`
- Web (Vercel, root dir `apps/web`): framework auto-detected; set `API_INTERNAL_URL` to the Render URL

## Option C — Free-tier Docker + Neon (always-on)

```
Oracle Always Free VM (api + worker + web via docker compose) ──► Neon free Postgres
```

The only $0 setup where the whole stack — including the Solid Queue
worker — stays up around the clock. Both Dockerfiles use official
multi-arch base images (`ruby:3.3-slim`, `node:20-slim`) with no platform
pins, so `docker compose build` runs natively on the Ampere ARM VM.

### Provision the VM

- Sign up for Oracle Cloud Free Tier (card + phone for verification — not
  charged unless you upgrade). Pick the home region carefully: Always Free
  resources only exist there, and A1 capacity is scarce in some regions
  ("out of capacity" — retry later or try another region)
- Provision one Ampere A1 VM (currently 2 OCPUs / 12 GB total for Always
  Free — halved June 2026, re-verify), Ubuntu 22.04/24.04
- Open ingress: Oracle VCN security list **and** the VM's own iptables both
  block by default — allow 80/443 (and 22 for SSH)
- Install Docker + the compose plugin, clone the repo

### Point compose at Neon

- Create a Neon project and copy the **pooled** connection string, keeping
  `?sslmode=require` on the end (Neon refuses non-SSL connections)
- Export it for compose: `DATABASE_URL` (api + worker both read it — see
  `docker-compose.yml`), plus `SECRET_KEY_BASE` (or `RAILS_MASTER_KEY`),
  `MISSION_CONTROL_USER` / `MISSION_CONTROL_PASSWORD`,
  `RESEND_API_KEY` / `EMAIL_FROM_ADDRESS`, and `WEB_URL` set to the VM's
  public origin (used in email links). `GOOGLE_*` optional, as in Option B
- Skip the local Postgres service — start only what you need:
  `docker compose up -d --no-deps api worker web`
  (`--no-deps` keeps the `postgres` service down despite `depends_on`)
- Migrate against Neon: `docker compose exec api bin/rails db:migrate`
- `API_INTERNAL_URL` stays `http://api:3000` — internal compose DNS,
  unchanged

### Serve it

- For a demo, opening port 3001 directly works; for anything real, put
  Caddy or Nginx on 80/443 for TLS in front of `web:3001`
- The worker runs `bin/jobs start` continuously, so webhook retries and
  sequence steps fire on schedule — the thing Option B can't do for free

### Caveats

- Oracle may reclaim compute instances that sit idle for weeks — log in
  occasionally or keep a cheap uptime ping against the public URL
- Neon free projects autosuspend when idle (fast wake, usually unnoticed)
  and have storage/compute caps — re-verify before launch
- Free tiers and limits change — re-verify before launch

## Scaling path

| Limit hit | Move to |
|-----------|---------|
| Cold starts / sleeping jobs | Paid always-on instance (Render Starter ~$7/service/month) or small VPS |
| Oracle capacity / idle reclamation | Small VPS (Hetzner, DigitalOcean) running the same compose file |
| Database size | Larger Neon plan or your own Postgres |
| Job volume | Scale the `worker` service (more processes via `JOB_CONCURRENCY`, or more replicas) |
| Real scale | Container platform of your choice |
