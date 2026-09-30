# Setup

## Requirements

- Node.js 20+ and pnpm (`corepack enable`)
- Ruby 3.4 (`rbenv` or `mise`)
- PostgreSQL 15+ (or a Neon connection string)
- Docker (optional, for self-host / compose)

## Quick start

```bash
git clone https://github.com/rkbart/clientsphere.git
cd clientsphere

# API
cd apps/api
bundle install
bin/rails db:setup            # create, migrate, seed
bin/rails server              # http://localhost:3000

# Web (new terminal)
cd apps/web
pnpm install
pnpm dev                      # http://localhost:3001  (next dev -p 3001)
# next.config.ts rewrites /api/* → http://localhost:3000

# Worker (new terminal — processes sequences, webhooks, automations)
cd apps/api
bin/jobs start
```

Seeded login: `sarah@beanandbrew.com` / `password123`.

Job dashboard: `http://localhost:3000/jobs` (HTTP basic auth via
`MISSION_CONTROL_USER` / `MISSION_CONTROL_PASSWORD`, else 401).

Seeded login: `sarah@beanandbrew.com` / `password123`.

API types are hand-written in `apps/web/src/lib/api/schema.ts` (no codegen step).

## Scripts

```bash
# API
bin/rails s · bin/rails c · bin/rails db:migrate · bin/rails db:seed
bin/jobs start                                # Solid Queue worker (sequences, webhooks, automations)
bin/rails openapi:generate                    # regenerate apps/api/openapi/v1/swagger.yaml
bundle exec rubocop · bundle exec brakeman · bundle exec bundler-audit check
bundle exec rspec                       # request specs (scaffold, currently minimal)

# Web
pnpm dev · pnpm build · pnpm start
pnpm lint · pnpm typecheck · pnpm test  # oxlint · tsc --noEmit · vitest
```

## Environment variables

### API

```
DATABASE_URL=postgres://localhost:5432/clientsphere_development
SECRET_KEY_BASE=<generate with rails secret>          # dev generates one automatically
ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY=<generate>
ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY=<generate>
ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT=<generate>
MISSION_CONTROL_USER=admin                 # /jobs dashboard login (dev only)
MISSION_CONTROL_PASSWORD=<generate>
```

### Google OAuth (optional)

1. Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   (type: Web application). Authorized redirect URI (dev):
   `http://localhost:3000/auth/google_oauth2/callback`
2. Set:
   ```
   GOOGLE_CLIENT_ID=<client-id>
   GOOGLE_CLIENT_SECRET=<client-secret>
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google_oauth2/callback  # prod: your API host + /auth/google_oauth2/callback
   WEB_URL=http://localhost:3001                                           # where users land after Google
   ```
3. Restart the API. Login/signup pages show "Continue with Google" only when
   configured. Google users link by email (invited users keep their workspace)
   or get a personal workspace on first sign-in.

The `ACTIVE_RECORD_ENCRYPTION_*` keys encrypt AI provider keys and webhook
secrets. Development falls back to built-in defaults; set real values in
production.

### Web

```
API_INTERNAL_URL=http://localhost:3000   # target of the /api/* rewrite
```
