# Deployment

## Option A — Self-host (recommended)

`docker compose up` runs Rails (Puma with Solid Queue inside), Next.js and Postgres on any VPS or home server. Always on, so automations and sequences run on schedule.

Cost: your server only.

## Option B — Free-tier demo

```
Vercel (web)  ──►  Render free web service (Rails)  ──►  Neon free Postgres
```

### Caveats

- Render free web services spin down after ~15 minutes idle; the next request can take up to about a minute
- Automations, sequences and webhook retries **only run while the app is awake**
- Free instance hours are capped monthly
- Vercel Hobby is intended for personal, non-commercial use
- Free tiers and limits change — re-verify before launch

### Config

- Solid Queue, Cable and Cache: point all at primary database (single DB) on Neon free; set `SOLID_QUEUE_IN_PUMA=true`
- Env vars (API): `DATABASE_URL`, `RAILS_MASTER_KEY`, `SECRET_KEY_BASE`, `APP_HOST`, `RESEND_API_KEY`, `ACTIVE_RECORD_ENCRYPTION_*` keys
- Env vars (web): `API_INTERNAL_URL` (used by the Next rewrite)
- Build (Render, root dir `apps/api`): `bundle install && bin/rails db:migrate`; start: `bundle exec puma -C config/puma.rb`
- Web (Vercel, root dir `apps/web`): framework auto-detected; set `API_INTERNAL_URL` to the Render URL

## Scaling path

| Limit hit | Move to |
|-----------|---------|
| Cold starts / sleeping jobs | Paid always-on instance (Render Starter ~$7/service/month) or small VPS |
| Database size | Larger Neon plan or your own Postgres |
| Heavy job load | Separate worker process (Solid Queue supports it) |
| Real scale | Container platform of your choice |
