# Database

## Provider

PostgreSQL (Neon free tier for demo, self-hosted for production)

- 0.5GB storage (free tier)
- 100 CU-hours/month
- Auto-suspend on idle
- Branching for dev/staging

## Conventions

- Every business table has `account_id` (NOT NULL, indexed, FK)
- Foreign keys to optional relations are nullable
- Money uses `decimal(12,2)`
- Soft delete uses `discarded_at`
- Enums are integers mapped in Rails
- Custom field values in `custom_data jsonb` column with GIN index

## Core tables

### Tenancy & auth
- `accounts` — organizations
- `users` — people
- `memberships` — user ↔ account with role
- `invitations` — pending invites
- `sessions` — auth sessions

### Core CRM
- `contacts` — people in your CRM
- `companies` — organizations
- `pipelines` — deal pipelines
- `stages` — pipeline stages (open/won/lost)
- `deals` — opportunities

### Work tracking
- `activities` — calls, meetings, tasks, emails
- `notes` — polymorphic notes
- `emails` — email records
- `tags` + `taggings` — polymorphic tagging

### Customization
- `custom_field_definitions` — field definitions
- `saved_views` — saved filters/sorts

### Automation
- `automations` + `automation_runs`
- `email_sequences` + `email_sequence_steps` + `sequence_enrollments`

### Integrations
- `webhooks` + `webhook_deliveries`

### Jobs & cache (Solid Queue / Cache / Cable, same database)
- `solid_queue_*` — jobs, executions, recurring tasks, semaphores, batches
- `solid_cache_entries` — Rails cache store (production)
- `solid_cable_messages` — Action Cable adapter (production)

### AI
- `ai_settings` — per-account AI config (encrypted `api_key`, `enabled`, `redact_pii`)
- `ai_logs` — metadata-only usage log (action, provider, model, success, duration)
- `ai_conversations` + `ai_messages` — reserved for future chat persistence (not used yet)

### Audit
- `versions` — paper_trail on contact, company, deal, activity, note, email, automation

## Migrations

- Use `null: true` for optional relations
- Add `account:references` everywhere
- Use `decimal{12,2}` for money
- Add partial unique indexes where needed

## Indexes

- `account_id` on every business table
- `lower(email)` partial unique index on contacts
- `lower(name)` unique index on tags
- GIN index on `custom_data` jsonb columns
