# Deployment

## Option A — Self-host

`docker compose up` runs Rails (Puma), a Solid Queue worker (`bin/jobs`),
Next.js and Postgres on any VPS or home server. Always on, so delayed jobs
(webhook retries, sequence steps) run on schedule. The worker is a separate
`worker` service in `docker-compose.yml` — scale it independently if job
volume grows.

Cost: your server only.

## Option B — Free-tier demo (current plan)

```
Vercel (web)  ──►  Render free web service (Rails, jobs run in-process)  ──►  Neon free Postgres
```

Apply `render.yaml` from the repo root (Render dashboard → New →
Blueprint): it creates the API service with build/start commands, health
checks, and generated secrets pre-wired. Free tier has no background
workers, so Solid Queue runs inside Puma (`SOLID_QUEUE_IN_PUMA`, async
mode) — jobs process whenever the web service is awake. The web frontend
is deployed separately on Vercel (root directory `apps/web`).

### Caveats

- Render free services spin down after ~15 minutes idle; the next request can take up to about a minute
- Delayed jobs persist in Postgres via Solid Queue, but they only run while
  the web service is awake — schedules and retries stall while it sleeps.
  (Upgrade path: paid plan + a dedicated `worker` service running
  `bin/jobs start`, Solid Queue picks up the same database.)
- Neon free projects autosuspend when idle (fast wake) and have storage/compute caps
- Free instance hours are capped monthly
- Vercel Hobby is intended for personal, non-commercial use
- Free tiers and limits change — re-verify before launch

### Config

- **Neon `DATABASE_URL`: use the DIRECT endpoint, not the pooled one.**
  The pooled (`-pooler`) hostname runs PgBouncer in transaction mode, which
  breaks Solid Queue's advisory locks (jobs misfire). Copy the direct URL
  (no `-pooler`, keeps `?sslmode=require`) into Render as `DATABASE_URL`
- Env vars (API + worker, see the `clientsphere-settings` group in
  `render.yaml`): `DATABASE_URL`, `SECRET_KEY_BASE` (generated),
  `ACTIVE_RECORD_ENCRYPTION_*` keys (generated — the codebase falls back to
  insecure dev defaults, so real values are mandatory),
  `MISSION_CONTROL_USER` / `MISSION_CONTROL_PASSWORD` (for the `/jobs` dashboard),
  `WEB_URL` (your Vercel URL — used in email links and as the OAuth landing page),
  `APP_HOST` (your Render API URL — shown as the Resend webhook URL in Settings → Email),
  `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` (optional OAuth —
  e.g. `https://<api-host>.onrender.com/auth/google_oauth2/callback`; the URI
  must be registered verbatim in Google Cloud Console and must equal
  `GOOGLE_REDIRECT_URI` exactly — the Vercel app URL also works since
  `/auth/*` rewrites to the API),
  `RESEND_API_KEY` / `EMAIL_FROM_ADDRESS` / `GMAIL_ADDRESS` / `GMAIL_APP_PASSWORD`
  (optional global email credentials — per-workspace settings win)
- Env vars (web): `API_INTERNAL_URL` (your Render API URL, used by the Next
  rewrite). **Set it before the first Vercel build** — rewrites are baked in
  at build time, not read at runtime
- If not using the blueprint: build (Render, root dir `apps/api`):
  `bundle install && SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile && bin/rails db:migrate`
  (migrations run at build time — free tier rejects `preDeployCommand`);
  start: `bundle exec puma -C config/puma.rb`,
  plus a background worker running `bin/jobs start`
- Web (Vercel, root dir `apps/web`): framework auto-detected; set
  `API_INTERNAL_URL` to the Render URL. With pnpm workspaces, if the install
  step can't find the root lockfile, fall back to root directory `/` with
  build command `pnpm --filter web build` and output directory `apps/web/.next`

## Scaling path

| Limit hit | Move to |
|-----------|---------|
| Cold starts / sleeping jobs | Paid always-on instance (Render Starter ~$7/service/month) or small VPS running `docker-compose.yml` |
| Database size | Larger Neon plan or your own Postgres |
| Job volume | Scale the `worker` service (more processes via `JOB_CONCURRENCY`, or more replicas) |
| Real scale | Container platform of your choice |
