# Setup

## Requirements

- Node.js 20+ and pnpm (`corepack enable`)
- Ruby 3.3+ (`rbenv` or `mise`)
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
pnpm gen:api                  # generate types from openapi.yaml
pnpm dev                      # http://localhost:3001  (next dev -p 3001)
# next.config.ts rewrites /api/* → http://localhost:3000
```

## Scripts

```bash
# API
bin/rails s · bin/rails c · bin/rails db:migrate · bin/rails db:seed
bundle exec rspec · bundle exec rubocop · bundle exec brakeman
RAILS_ENV=test bundle exec rake rswag:specs:swaggerize     # regenerate openapi.yaml

# Web
pnpm dev · pnpm build · pnpm start
pnpm lint · pnpm typecheck · ppm test · pnpm gen:api
```

## Environment variables

### API

```
DATABASE_URL=postgres://localhost:5432/clientsphere_development
RAILS_MASTER_KEY=<from config/master.key>
SECRET_KEY_BASE=<generate with rails secret>
RESEND_API_KEY=re_...
APP_HOST=http://localhost:3000
ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY=<generate>
ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY=<generate>
ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT=<generate>
```

### Web

```
API_INTERNAL_URL=http://localhost:3000
```
