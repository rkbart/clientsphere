# Features

## Core CRM

### Contacts
- List with search (debounced), status/tag filters, pagination
- Detail pages with notes, tags, AI cards
- Status field: lead / customer / churned (filter + column)
- Tags for categorization (filter by tag, attach/detach chips on detail)
- Soft delete (discard)
- Unique email per account
- Lead scoring with explainable reasons + Re-score button
- Create/edit forms (full-page, server 422 displayed inline)

### Companies
- List with search, detail pages
- Linked contacts and deals
- Enrichment from domain (user-confirmed)
- Soft delete
- Create/edit forms (full-page, server 422 displayed inline)

### Deals
- Pipelines with customizable stages (API)
- Kanban board with drag-drop (mouse and touch)
- Won/lost tracking
- Expected close dates
- Deal value tracking
- Create/edit forms: not yet in the UI (API available)

### Activities
- Activity records: calls, meetings, tasks, emails
- Due dates and completion tracking
- Assigned to team members
- Surfaced in the dashboard (tasks due, recent activity)
- Logging UI on the Activities page (new + edit)

### Notes
- Polymorphic notes on any record
- Shared notes section on contact/company/deal detail
- Author tracking

## Dashboard

- Stat cards: contacts, deals, activities
- Pipeline-by-stage bars (value + count per stage)
- Tasks due widget (overdue/today highlighting)
- Recent activity feed
- Next best action widget (AI) for the most urgent open deal

## Views

### Table View
- Sortable columns
- Search and filter
- Pagination
- "Clear filters" resets search/tag/status at once

### Kanban Board
- Drag-drop deal cards between stages (mouse and touch)
- Visual pipeline overview

## AI Features

### AI Settings
- Provider presets (Ollama, LM Studio, OpenRouter, Groq, Gemini, DeepSeek,
  OpenAI, Anthropic, custom endpoint)
- Write-only API key (encrypted server-side, never returned by the API)
- Test connection, Enable toggle, Redact-PII toggle, Server/Local mode badge

### AI Chat
- Conversational assistant with CRM context
- Context assembled server-side, keyword-matched to the question
- Scoped to account data

### Email Drafting
- Generate professional emails (purpose: follow-up, introduction, proposal,
  check-in)
- Context from contact + its open deals/activities, or from a deal's contact
- Editable, copyable draft

### Lead Scoring
- Rules-based scoring with reasons
- Explainable results; Re-score button on contact detail

### Suggestions
- Next best action on dashboard, deal page and contact page
- Deal summaries on demand

### Enrichment
- Company info from domain (LLM knowledge)
- Preview diff, user confirms before saving

### Local Mode
- Browser-direct for Ollama/LM Studio (chat + drafting)
- Data never leaves the device

## Automation (Phase 3 — in progress)

### Automations
- Form-based trigger/action rules (engine + models in place)
- Triggers: contact created/updated, deal created/stage-changed/won/lost,
  activity completed/overdue (overdue fired hourly by the scheduler)
- Actions: create tasks, send email, tag, move stages, call webhooks
- Enable/disable toggle
- UI: list, create/edit form, detail with runs
- Zapier/Make/n8n: see [INTEGRATIONS.md](INTEGRATIONS.md)

### Email Sequences
- Steps with delays, enrollment
- Sending via EmailService (Resend when configured, else draft record)
- Unsubscribe: per-enrollment signed link + public page, stop on unsubscribe
- Stop on reply: planned

### Webhooks
- Signed deliveries (`X-Webhook-Signature`)
- Retries with exponential backoff (3 attempts)
- Delivery log
- UI: list, create/edit form, detail with deliveries

### Jobs & Scheduling
- Solid Queue on the same Postgres (no extra infra), worker via `bin/jobs`
- Dashboard at `/jobs` (Mission Control, HTTP basic auth, closed by default)
- Recurring maintenance (finished-job cleanup, hourly, `config/recurring.yml`)
- Sequence chains self-schedule their next step and survive restarts

## Customization

### Custom Fields
- 13 field types (text, number, boolean, date, select, etc.)
- Stored in `custom_data` jsonb, validated per definition (type, required, choices)
- CRUD via Settings → Custom Fields
- Values captured in create/edit forms, shown on detail pages, exact-match
  `?custom[key]=value` filters on list endpoints

### Custom Objects
- User-defined record types with custom fields (Settings → Custom Objects)
- JSON-based field storage, CRUD API
- Polymorphic records linked to accounts

### Saved Views
- Save filters, sort, columns
- Per entity type

## Teams

### Roles & Permissions
- Owner, admin, member, viewer
- Pundit policies on every action

### Invitations
- Invitation records with expiring tokens (7-day default)
- Role assignment on acceptance
- Email delivery via Resend when configured, invite link + copy button otherwise

## Import/Export

### CSV Import
- Inline processing with per-row error report (capped at 50, row numbers)
- Column mapping UI with header auto-match ("First Name" → first_name)
- Dedupe on email: skip or update (blanks never overwrite)
- Supported fields: first_name, last_name, email, phone

### CSV Export
- Contacts, companies, deals (Settings → Import/Export)
- Formula injection prevention (escapes `=`, `+`, `-`, `@`)

## Interface

### Dashboard analytics
- Pipeline value by stage (bar chart), outcomes donut + win rate, deals by
  source (Recharts, theme-aware)

### Dark mode
- System default with persisted override, top-bar toggle
- Full token set + badge/error-surface retunes

### Responsive layout
- Mobile-first: below `lg` (1024px) — including half-width browser
  windows — the sidebar becomes a slide-in drawer (backdrop, Escape to
  close, scroll lock)
- Sticky topbar with hamburger and current page title on mobile
- Tables scroll horizontally; page headers and grids stack on narrow
  viewports

### Motion & accessibility
- Fast, purposeful motion: 120–300ms, strong ease-out curves, interruptible
  press feedback (`scale(0.97)`)
- Staggered entrances for grouped content (50ms steps)
- `prefers-reduced-motion` respected: fades kept, movement removed
- Visible focus rings (`:focus-visible`), semantic landmarks, aria labels
  on icon-only buttons
- Skip-to-content link, dialog semantics on the mobile nav drawer,
  `aria-current` on active nav, labeled form controls
- Body text contrast ≥ 4.5:1 in both themes; 32px header icon targets

### Design system
- Warm-monochrome tokens and shared component classes
  (`.card`, `.btn-*`, `.input`, `.badge-*`) — see
  [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)

## Security

- Token-based sessions (server-side token digests, revoked on logout)
- Tenant isolation: `account_id` scoping + Pundit policies with a
  cross-tenant guard (`ApplicationPolicy` rejects other accounts' records)
- Rate limiting on AI endpoints (30 requests / IP / 5 min)
- Encrypted secrets (AI keys, webhook secrets via ActiveRecord encryption)
- Passwords hashed with bcrypt
