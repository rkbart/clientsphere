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
- Create/edit forms: not yet in the UI (API + CSV import available)

### Companies
- List with search, detail pages
- Linked contacts and deals
- Enrichment from domain (user-confirmed)
- Soft delete
- Create/edit forms: not yet in the UI (API + CSV import available)

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
- Logging UI: not yet in the UI (API available)

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

## Automation (Phase 3 — backend scaffolded, UI in progress)

### Automations
- Form-based trigger/action rules (engine + models in place)
- Create tasks, tag, move stages, call webhooks
- Enable/disable toggle
- UI: coming in Phase 3 (page shows a placeholder)

### Email Sequences
- Steps with delays, enrollment
- Stop on reply/unsubscribe: planned
- Email sending itself is not wired yet

### Webhooks
- Signed deliveries (`X-Webhook-Signature`)
- Retries with exponential backoff (3 attempts)
- Delivery log

## Customization

### Custom Fields
- 13 field types (text, number, boolean, date, select, etc.)
- Stored in `custom_data` jsonb
- CRUD via Settings → Custom Fields
- Showing values in forms/tables/filters: Phase 4

### Saved Views
- Save filters, sort, columns
- Per entity type

## Teams

### Roles & Permissions
- Owner, admin, member, viewer
- Pundit policies on every action

### Invitations
- Invitation records with expiring tokens
- Role assignment on acceptance
- Email delivery not wired yet (token returned via API)

## Import/Export

### CSV Import
- Inline processing with per-row error report
- Import status queryable via `GET /import/:id`

### CSV Export
- Contacts, companies, deals (Settings → Import/Export)
- Formula injection prevention (escapes `=`, `+`, `-`, `@`)

## Interface

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
