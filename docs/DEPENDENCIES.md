# Dependencies

## Backend (apps/api)

| Package | Used for |
|---------|----------|
| `rails` 8.1 | Framework (API mode) |
| `pg` | PostgreSQL adapter |
| `bcrypt` | Password hashing |
| `pundit` | Authorization |
| `kaminari` | Pagination |
| `discard` | Soft delete |
| `rack-attack` | AI endpoint rate limiting |
| `openai` | OpenAI-compatible provider client |
| `anthropic` | Anthropic provider client |
| `http` | Webhook HTTP delivery |
| `rack-cors` | CORS headers |
| `rails-i18n` | Locale data |
| `bootsnap` | Boot time caching |

Installed but not yet wired: `acts_as_tenant`, `ransack`, `paper_trail`,
`ssrf_filter`, `resend`, `jsonapi-serializer`.

## Frontend (apps/web)

| Package | Used for |
|---------|----------|
| `next` | Framework (App Router) |
| `react` / `react-dom` | UI library |
| `@tanstack/react-query` | Server state, caching |
| `zustand` | Client state (auth, UI) |
| `openapi-fetch` | Typed API calls |
| `react-hook-form` + `zod` | Forms and validation |
| `@hello-pangea/dnd` | Drag-drop (kanban, touch-capable) |
| `lucide-react` | Icons |
| `cmdk` | Command menu |
| `recharts` | Charts |
| `date-fns` | Date formatting |
| `tailwindcss` | Styling |
| `class-variance-authority` | Component variants |
| `clsx` + `tailwind-merge` | Class utilities |

Installed but not yet wired: `axios`.

## Dev dependencies

| Package | Used for |
|---------|----------|
| `typescript` | Type checking |
| `oxlint` | Linting |
| `vitest` + `@testing-library/*` | Frontend testing |
| `openapi-typescript` | Available for future codegen (`pnpm gen:api`) |
| `rspec-rails`, `factory_bot_rails`, `faker` | Backend testing |
| `capybara`, `selenium-webdriver`, `shoulda-matchers`, `database_cleaner-active_record` | Backend test helpers |
| `rubocop-rails-omakase` | Ruby linting |
| `brakeman` | Security scanning (CI, non-blocking) |
| `bundler-audit` | Dependency auditing (CI, non-blocking) |
