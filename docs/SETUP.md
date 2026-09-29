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
```

Seeded login: `sarah@beanandbrew.com` / `password123`.

API types are hand-written in `apps/web/src/lib/api/schema.ts` (no codegen step).

## Scripts

```bash
# API
bin/rails s · bin/rails c · bin/rails db:migrate · bin/rails db:seed
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
```

The `ACTIVE_RECORD_ENCRYPTION_*` keys encrypt AI provider keys and webhook
secrets. Development falls back to built-in defaults; set real values in
production.

### Web

```
API_INTERNAL_URL=http://localhost:3000   # target of the /api/* rewrite
```
