# ClientSphere

## Project

- **Backend**: Rails 8.1 API mode (Ruby 3.3+) in `apps/api`
- **Frontend**: Next.js App Router (TypeScript) in `apps/web`
- **Database**: PostgreSQL (also hosts Solid Queue, Solid Cable, Solid Cache)
- **Package manager**: pnpm (monorepo workspace)
- **Multi-tenancy**: `acts_as_tenant` with `account_id` on every business table
- **Auth**: httpOnly cookie sessions (no JWT in browser)
- **AI**: Server-side by default; browser-direct only for local models (Ollama/LM Studio)
- **Types**: OpenAPI (rswag) → `openapi-typescript` generated client

## Conventions

- Every business model `belongs_to :account`
- Optional foreign keys: `null: true` in migrations
- Money: `decimal(12,2)`
- Soft delete: `discarded_at` via `discard` gem
- Polymorphic: `notable_type`/`notable_id` for notes; `taggable_type`/`taggable_id` for tags
- Custom fields: stored in `custom_data jsonb` column, not separate value table
- API responses: paginated with `?page=&per_page=` (max 100)
- Ransack: only `ransackable_attributes` allow-listed

## Commands

```bash
# API
cd apps/api
bin/rails s                    # Start server
bin/rails c                    # Console
bin/rails db:migrate           # Run migrations
bin/rails db:seed              # Seed data
bundle exec rspec              # Run tests
bundle exec rubocop            # Lint
bundle exec brakeman           # Security scan

# Web
cd apps/web
pnpm dev                       # Dev server
pnpm build                     # Production build
pnpm lint                      # Lint (oxlint)
pnpm typecheck                 # Type check
pnpm test                      # Run tests
pnpm gen:api                   # Regenerate API types from openapi.yaml
```

## Security

- Sessions: httpOnly, Secure, SameSite=Lax
- CSRF: protection on state-changing requests
- Tenant isolation: request specs for every resource
- Rate limiting: rack-attack on auth, AI, import endpoints
- Secrets: `encrypts` for AI keys and webhook secrets
- Webhooks: HMAC signature, ssrf_filter, retries
- CSV export: formula injection prevention
