# Dependencies

## Backend (apps/api)

| Package | Used for |
|---------|----------|
| `rails` 8.1 | Framework (API mode) |
| `pg` | PostgreSQL adapter |
| `bcrypt` | Password hashing |
| `pundit` | Authorization |
| `acts_as_tenant` | Multi-tenancy |
| `solid_queue` | Background jobs (in Puma) |
| `solid_cable` | WebSocket/realtime |
| `solid_cache` | Caching |
| `mission_control-jobs` | Job dashboard |
| `ransack` | Search/filtering |
| `kaminari` | Pagination |
| `discard` | Soft delete |
| `paper_trail` | Audit logging |
| `rack-attack` | Rate limiting |
| `ssrf_filter` | SSRF protection |
| `rswag-api` + `rswag-ui` | API documentation |
| `openai` | OpenAI API client |
| `anthropic` | Anthropic API client |
| `resend` | Transactional email |
| `jsonapi-serializer` | JSON serialization |

## Frontend (apps/web)

| Package | Used for |
|---------|----------|
| `next` | Framework (App Router) |
| `react` / `react-dom` | UI library |
| `@tanstack/react-query` | Server state, caching |
| `zustand` | Client state |
| `openapi-fetch` | Typed API calls |
| `react-hook-form` + `zod` | Forms and validation |
| `@hello-pangea/dnd` | Drag-drop (kanban) |
| `lucide-react` | Icons |
| `cmdk` | Command menu |
| `recharts` | Charts |
| `date-fns` | Date formatting |
| `tailwindcss` | Styling |
| `class-variance-authority` | Component variants |
| `clsx` + `tailwind-merge` | Class utilities |

## Dev dependencies

| Package | Used for |
|---------|----------|
| `typescript` | Type checking |
| `oxlint` | Linting |
| `vitest` | Testing |
| `openapi-typescript` | Generate API types |
| `rspec-rails` | Backend testing |
| `rubocop-rails-omakase` | Ruby linting |
| `brakeman` | Security scanning |
| `bundler-audit` | Dependency auditing |
