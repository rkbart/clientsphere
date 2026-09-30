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
  `MISSION_CONTROL_USER` / `MISSION_CONTROL_PASSWORD` (for the `/jobs` dashboard)
- Env vars (web): `API_INTERNAL_URL` (used by the Next rewrite)
- Build (Render, root dir `apps/api`): `bundle install && SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile && bin/rails db:migrate`; start: `bundle exec puma -C config/puma.rb`, plus a background worker running `bin/jobs start`
- Web (Vercel, root dir `apps/web`): framework auto-detected; set `API_INTERNAL_URL` to the Render URL

### AI on free tier

Local providers (Ollama / LM Studio) are reached **browser-direct** from the
user's machine, so they work even when your server is hosted elsewhere.
Remote providers are called server-side as usual.

## Scaling path

| Limit hit | Move to |
|-----------|---------|
| Cold starts / sleeping jobs | Paid always-on instance (Render Starter ~$7/service/month) or small VPS |
| Database size | Larger Neon plan or your own Postgres |
| Job volume | Scale the `worker` service (more processes via `JOB_CONCURRENCY`, or more replicas) |
| Real scale | Container platform of your choice |
