# Features

## Core CRM

### Contacts
- List with search (debounced), status/tag filters, sortable columns, pagination
- Detail pages with notes and tags
- Status field: lead / customer / churned (filter + column)
- Tags for categorization (filter by tag, attach/detach chips on detail)
- Soft delete (discard)
- Unique email per account
- Lead scoring with explainable reasons + Re-score button
- Add/edit via modal dialogs (server 422 displayed inline)

### Companies
- List with search (name/domain/industry), sortable columns, pagination
- Detail pages with notes, tags, social links, main contact
- Linked contacts and deals
- Soft delete
- Add/edit via modal dialogs (server 422 displayed inline)

### Deals
- Multiple pipelines (Sales, Catering & Events, …) managed in Settings,
  each with its own stages; single default
- Kanban board with drag-drop (mouse and touch), pipeline switcher,
  hide-closed toggle. Each drop reports in an inline banner — naming the deal
  and destination stage — with Undo to send it back to the column and slot it
  came from, and Dismiss. A rejected move (e.g. a stage from another pipeline)
  shows the reason instead of failing silently
- Guarded deletes (pipelines/stages holding deals refuse with 422)
- Settings → Pipelines reports the last action in an inline banner with Undo
  and Dismiss. Undo is offered where the change is reversible — create pipeline
  (deletes it), rename, set default (restores the previous default), add stage
  (deletes it), save stage (restores prior values). Deletes show the banner
  without Undo, since recreating would issue new ids. The banner clears once an
  undo completes or is dismissed
- Won/lost tracking
- Expected close dates
- Source dropdown with canonical options (referral, website, cold outreach,
  social, event, partner) plus an "Others" entry that reveals a free-text
  input; the column stays free text, so a value we don't recognise on an older
  deal opens in that input rather than being rewritten to a default
- Deal value tracking with stage-driven probability (0–100 validated,
  manual overrides preserved, weighted forecast)
- List with search, stage/tag filters, sortable columns, pagination
- Add/edit via modal dialogs (server 422 displayed inline)
- Detail page: details card (amount, close date, probability, source,
  linked company/contact), status card, overdue-tasks card (always
  visible, with an all-clear empty state), rule-based summary, email
  composer, tags, custom fields, notes
- Overdue-tasks card opens itself when tasks exist, completes inline
  with 8-second undo, and expands in place past 10 rows

### Activities
- Activity records: calls, meetings, tasks, emails
- Due dates and completion tracking
- Assigned to team members
- Surfaced in the dashboard (tasks due, recent activity)
- Logging UI on the Activities page (new + edit)
- Detail page with complete/reopen toggle, edit modal, delete,
  linked records
- List with search, kind/status/deal filters (incl. overdue), sortable
  columns, pagination; filter sets are remembered per page
- Bulk select with select-all; Mark complete finishes up to 100 at once
  (per-record authorization, partial success reported)

### Notes
- Polymorphic notes on any record
- Shared notes section on contact/company/deal detail
- Author tracking

## Dashboard

- Stat cards: contacts, deals, activities
- Pipeline-by-stage bars (value + count per stage)
- Tasks due widget (overdue/today highlighting)
- Recent activity feed
- Needs-attention card (top of page): highest-scoring open deal by
  close urgency + staleness + overdue tasks, with reasons listed

## Views

### Table View
- Sortable columns
- Search and filter
- Pagination
- "Clear filters" resets search/tag/status at once

### Kanban Board
- Drag-drop deal cards between stages (mouse and touch)
- Visual pipeline overview

## Communication & Scoring

### Email Composer
- Available on every deal; a linked contact prefills To and personalizes
  templates, otherwise you type the recipient yourself
- Template gallery (follow-up, introduction, proposal, check-in,
  thank-you, win-back) with per-contact personalization
- Editable subject/body, copyable, and sends via the email provider
- Plain-text bodies are rendered as paragraphs on delivery (blank line →
  paragraph, single newline → line break) and escaped before being sent as HTML
- Confirmation dialog after send or draft; the form clears
- `GET /emails/templates`, `POST /emails/deliver`

### Outbox
- Every outbound email in one list with status filter
  (draft/sent/delivered/opened/failed)
- Read full content; edit drafts inline (to/cc/bcc, subject, body)
- Retry drafts and failures (`POST /emails/:id/redeliver`); the Retry control is
  disabled on rows with no `to` recipient, and the endpoint returns 422 rather
  than asking the provider to reject the send
- Drafts pile up here automatically when no provider is configured

### Email settings & tracking
- Settings → Email: per-workspace provider — Resend API key or a company
  Gmail address + app password (SMTP) — plus sender address and webhook
  secret (all secrets encrypted, write-only, owner/admin only; workspace
  settings override env vars)
- Delivery tracking via Resend webhooks (`email.delivered` → delivered,
  `email.opened` → opened, `email.bounced` → failed); forward-only,
  signature-verified, per-account URL. Gmail sends record delivery with a
  client-stamped Message-ID instead (no tracking callbacks)
- Account-less mail (password resets) uses the global `RESEND_API_KEY`, or
  `GMAIL_ADDRESS` + `GMAIL_APP_PASSWORD` when no Resend key is set

### Lead Scoring
- Rules-based scoring with reasons
- Explainable results; Re-score button on contact detail

### Deal summary (rule-based)
- Stage, value (+ probability-weighted), close date, last touch
  (recency only, e.g. "2 days ago"); `GET /deals/:id/summary`
- Overdue tasks live in their own card above the summary (always
  visible, all-clear empty state when none), each completable inline
  with undo; `GET /activities` supports `?deal_id=&kind=task&overdue=true`
- Stale flag (no touch in 14+ days)

## Automation (Phase 3 — complete)

### Automations
- Form-based trigger/action rules (engine + models in place)
- Triggers: contact created/updated, deal created/stage-changed/won/lost,
  activity completed/overdue (overdue fired hourly by the scheduler)
- Actions: create tasks, send email, tag, move stages, call webhooks
- Delay: optional `delay_days` per automation — the job is scheduled with
  `wait_until` at trigger time and runs after the delay (0 = immediate)
- Enable/disable toggle
- Templates: 6 ready-made blueprints (`GET /automations/templates`) in a
  collapsible gallery — selecting one highlights it and loads the builder,
  re-select to swap, rename and customize before saving
- UI: list, create/edit form, detail with runs; saving confirms in a dialog
  before navigating away
- Zapier/Make/n8n: see [INTEGRATIONS.md](INTEGRATIONS.md)

### Email Sequences
- Steps with delays, enrollment
- Sending via EmailService (workspace provider — Resend or Gmail — when configured, else draft record)
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
- User-defined record types with custom fields (API only; settings card removed)
- JSON-based field storage, CRUD API
- Polymorphic records linked to accounts

### Plugins
- Webhook plugins that fire on CRM events (Settings → Plugins)
- Trigger on contact/deal/activity events
- Delivers JSON payloads to plugin webhook URLs

## Teams

### Roles & Permissions
- Owner, admin, member, viewer
- Pundit policies on every action
- At most 2 owners per workspace (`OWNER_LIMIT` env overrides); the Team
  table disables the owner option once the cap is reached
- Only owners may grant or revoke the admin role, and only owners may invite
  someone as admin — admins manage member/viewer only
- Workspace-wide settings (email, plugins, webhooks, pipelines,
  API tokens, import/export) are owner/admin only; the API returns 403 and the
  UI shows a locked card plus a notice if opened directly by URL
- Bulk import/export authorize as workspace operations, not record edits, so
  members and viewers cannot upload or download the whole workspace
- Reading custom field and custom object definitions is open to every role;
  creating, editing and deleting them is owner/admin only, and the UI hides
  those controls for members and viewers

### Workspaces
- Unlimited creation: any signed-in user can create a workspace and becomes
  its owner; the session switches into it immediately (Settings → Workspaces,
  or the topbar switcher menu)
- Switching from the topbar list invalidates all tenant-scoped caches so the
  new workspace's data loads
- Joining someone else's workspace remains invite-only — no self-serve join
- Deletion is owner-only, confirmed via dialog, and never allowed on the last
  workspace (a signed-in user must always have a tenant)
- Deleting cascades every record under the workspace; members left behind are
  locked out exactly like Team-removal (sessions/tokens revoked, login
  refused), and everyone pinned to it is repointed to their oldest survivor
- Settings → Workspaces lists your workspaces with switch/create/delete

### Invitations
- Invitation records with expiring tokens (7-day default)
- Role assignment on acceptance; pending list with revoke
- Re-inviting an email reissues the pending invite with a fresh token
- Only owners can promote to owner
- Members cannot remove themselves (API returns 422) and the last owner can
  never be removed; the Team table hides the remove button on your own row
- Removing a member revokes every session, API token and pending password
  reset immediately and clears their pinned workspace; password login is
  refused once they hold no memberships (same generic error, no enumeration)
- Removed emails can be re-invited and rejoin through the normal accept flow
- Onboarding replays only for users who hold **no** workspace at accept time
  (removed-then-reinvited members). An existing user with their own workspace
  who accepts another workspace's invite joins without the setup modal
- Email delivery via the workspace provider (Resend or Gmail) when configured, invite link + copy button otherwise

### First login
- Invitees arrive with a server-generated password, so acceptance pins them to
  the workspace and prompts a one-time setup modal: readonly invited email,
  display name, optional contact phone, and a new password
- Saving shows a success dialog ("You're all set") reusing the shared
  `ResultModal` before they enter the workspace
- Fresh Google signups get an extra **Workspace name** field: Google
  auto-creates a "<name>'s workspace" nobody chose, so onboarding offers a
  rename. The backend only honors it for the solo owner of a workspace —
  teammates on a shared workspace never see the field, and forged requests
  are ignored
- Email is identity (invitation + login key) and is never editable — not in
  onboarding, not in Profile settings
- Phone stays editable later under Settings → Profile
- Existing accounts and self-signups are never prompted
- Completing a password reset also clears the prompt

### Password reset
- "Forgot password" email with a single-use link (2-hour expiry)
- Response never reveals whether an address exists
- Requesting another reset supersedes any outstanding one
- Resetting invalidates all active sessions

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
  windows — the sidebar stays a collapsed icon rail; a footer toggle
  reveals it as a temporary overlay (backdrop, Escape to close, scroll
  lock) that collapses again when a destination is picked. The desktop
  rail collapses the same way, and the preference persists
- Sticky topbar with workspace switcher, user, theme and logout
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
- Rate limiting on auth and import endpoints
- Encrypted secrets (webhook secrets via ActiveRecord encryption)
- Passwords hashed with bcrypt
