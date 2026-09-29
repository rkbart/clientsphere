# Deployment

## Option A — Self-host (recommended)

`docker compose up` runs Rails (Puma), Next.js and Postgres on any VPS or
home server. Always on, so delayed jobs (webhook retries, sequence steps)
run on schedule.

Cost: your server only.

## Option B — Free-tier demo

```
Vercel (web)  ──►  Render free web service (Rails)  ──►  Neon free Postgres
```

### Caveats

- Render free web services spin down after ~15 minutes idle; the next request can take up to about a minute
- Delayed jobs (ActiveJob async adapter) **only run while the app is awake**
- Free instance hours are capped monthly
- Vercel Hobby is intended for personal, non-commercial use
- Free tiers and limits change — re-verify before launch

### Config

- Env vars (API): `DATABASE_URL`, `SECRET_KEY_BASE`, `ACTIVE_RECORD_ENCRYPTION_*` keys
- Env vars (web): `API_INTERNAL_URL` (used by the Next rewrite)
- Build (Render, root dir `apps/api`): `bundle install && bin/rails db:migrate`; start: `bundle exec puma -C config/puma.rb`
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
| Job volume | Dedicated worker process (ActiveJob adapter with an external backend) |
| Real scale | Container platform of your choice |
