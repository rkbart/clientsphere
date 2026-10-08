# Deploy checklist: Render + Neon (+ Vercel)

Free-tier demo path (see `docs/DEPLOYMENT.md`, Option B). Do the steps in
order — Render must exist before Vercel (the web build bakes in the API
URL), and Vercel must exist before the final Render env pass.

## 0. Prerequisites (accounts)

- GitHub repo pushed (Render/Vercel both deploy from it)
- Neon account, Render account, Vercel account
- (Optional now, required later for those features) Resend account,
  Google Cloud project for OAuth

## 1. Neon — create the database

1. Create a new project (region closest to Singapore if offered).
2. Copy the connection string for the **DIRECT endpoint** — the hostname
   WITHOUT `-pooler` in it, keeping `?sslmode=require` at the end.
   The pooled endpoint breaks Solid Queue advisory locks. If you only see
   a pooled string, look for the "Direct connection" toggle.
3. Nothing else to do here — migrations run on Render in step 3.

## 2. Render — API from the blueprint

Free tier has no background workers, so the blueprint creates a single web
service: Solid Queue runs inside Puma (`SOLID_QUEUE_IN_PUMA`) and processes
jobs whenever the service is awake. (If a previous attempt left failed
services behind, delete them first, then re-apply.)

1. Render dashboard → **New → Blueprint** → select the ClientSphere repo
   (it reads `render.yaml` at the root).
2. When prompted for values, fill in:
   - `DATABASE_URL` — the Neon direct string from step 1.
   - Leave `WEB_URL`, `APP_HOST`, `GOOGLE_*`, `RESEND_*`, `GMAIL_*` empty
     for now (filled in steps 4–6). Everything marked generated fills
     itself — **copy `MISSION_CONTROL_PASSWORD` somewhere safe.**
3. Apply. The service builds; `db:migrate` runs as the last build step
   (Render free tier rejects `preDeployCommand`, so migrations live in
   `buildCommand` — `DATABASE_URL` is available to builds).
4. Watch the deploy logs: Puma should log `Listening on ...` and the
   migrate step should end with `migrated`. Then open
   `https://clientsphere-api.onrender.com/up` (your name will differ) —
   expect `{"status":"up"}` (plus a cold-start wait on free tier).
5. If `/up` never comes up, check the logs for: missing `DATABASE_URL`,
   Neon connection errors (wrong endpoint flavour), or a failed migration.

## 3. Vercel — web frontend

1. Vercel dashboard → Add New → Project → import the repo.
2. Set **Root Directory** to `apps/web` (framework auto-detected).
3. Before hitting Deploy, add the env var:
   - `API_INTERNAL_URL` = `https://clientsphere-api.onrender.com`
     (your actual Render API URL). **This is baked in at build time** —
     changing it later requires a redeploy, not just a restart.
4. Deploy. If the install step can't find the root lockfile, switch to
   Root Directory `/` with Build Command `pnpm --filter web build` and
   Output Directory `apps/web/.next` instead.
5. Open the Vercel URL — the login page should render. Login won't fully
   work until step 4 fixes `WEB_URL`, so don't be alarmed yet.

## 4. Back to Render — close the loop

1. In the `clientsphere-settings` env group, set:
   - `WEB_URL` = `https://<your-app>.vercel.app`
   - `APP_HOST` = `https://clientsphere-api.onrender.com`
   - `RESEND_API_KEY` = your Resend key (from dashboard.resend.com)
2. Saving env vars triggers an automatic redeploy of both services.
3. Now test signup + login end-to-end on the Vercel URL.

## 5. Optional integrations (any order)

- **Google OAuth**: Google Cloud Console → Credentials → create an OAuth client
  (type: Web application) → add authorized redirect URI
  `https://clientsphere-api.onrender.com/auth/google_oauth2/callback`
  (your actual API host + `/auth/google_oauth2/callback`, exact match).
  Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI`
  (same URI) on Render and redeploy. Verify with
  `curl https://<api>/api/v1/auth/providers` — expect `{"google":true}`,
  and the login page should then show "Continue with Google".
- **Resend tracking**: in the app, Settings → Email → copy the webhook
  URL into a Resend webhook (needs a verified sending domain first).
- **Resend**: Settings → Email → provider Resend (see
  `docs/TUTORIAL.md`, "Send as your Gmail address"). No tunnel needed —
  Render is public. Set `RESEND_API_KEY` and verify a sending domain first.

## 6. Smoke test the demo

- [ ] Sign up, log in, log out, log back in
- [ ] Google OAuth round-trip (if configured)
- [ ] Create a contact + deal, move a deal across the pipeline board
- [ ] Send an email from a deal page; check the Outbox status
- [ ] Open `https://<api>/jobs` (basic auth) — in-Puma workers are processing jobs
- [ ] Trigger a sequence step and confirm it fires (service awake)

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| First request takes ~1 min, then fine | Free-tier cold start (Render sleeps + Neon autosuspends). Expected. |
| Redirect loop / `ERR_TOO_MANY_REDIRECTS` on the API | Proxy TLS headers; `assume_ssl` covers this — report it if you see it |
| `relation does not exist` errors | Migrations didn't run — check the pre-deploy step logs, rerun via Render Shell: `cd apps/api && bin/rails db:migrate` |
| Jobs stuck in `pending` | Web service asleep (free tier) or crashed — check deploy logs + `/jobs` |
| Google login: `redirect_uri_mismatch` | URI in Google Console must match `GOOGLE_REDIRECT_URI` exactly (scheme, host, path) |
| Vercel pages show API errors | `API_INTERNAL_URL` was wrong/missing at build time — fix the var and **redeploy** (rebuild), don't just restart |
| Resend `test mode` delivery failures | Verify a sending domain, or ensure
  the workspace has a Resend API key set (Settings → Email). Gmail is not
  available on Render free tier (SMTP blocked). |
