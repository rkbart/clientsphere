# Roadmap

## Phase 1: Core CRM (Weeks 1–4)

- [x] Auth & tenancy (email/password, sessions, account scoping, policy guards)
- [x] Contacts & companies (CRUD, search, filters, tags, soft delete)
- [x] Deals (pipelines, stages, kanban with drag-drop, won/lost)
- [x] Activities & notes (log calls/meetings, tasks, notes on any record)
- [x] Dashboard (open deals by stage, tasks due, recent activity)
- [x] CSV import/export (basic mapping, error report)
- [x] Foundations (hand-written typed client, CI, Docker Compose, seeds; Swagger UI deferred)
- [x] Create/edit forms for contacts, companies, deals, activities (modal dialogs + detail Edit buttons)

## Phase 2: Intelligence (Weeks 5–8)

- [x] AI settings (server-side encrypted keys, presets, test connection, privacy toggle)
- [x] AI chat (scoped-context assistant)
- [x] Email drafting (draft from contact/deal context)
- [x] Lead scoring (rules-based with reasons)
- [x] Suggestions (next-best-action on dashboard and deal page)
- [x] Enrichment (company info from domain, user-confirmed)
- [x] Local mode (browser-direct for Ollama / LM Studio)

## Phase 3: Automation (Weeks 9–12)

- [x] Automations (form-based trigger/action rules)
- [x] Email sequences (steps with delays, enrollment, unsubscribe)
- [x] Webhooks (signed deliveries, retries, delivery log)
- [x] Job visibility (Mission Control dashboard)
- [x] Scheduling (Solid Queue recurring tasks)

## Phase 4: Customization & Teams (Weeks 13–16)

- [x] Custom fields (13 types, jsonb storage, values in forms/detail/filters)
- [x] Saved views (removed — orphaned UI, unused by list pages)
- [x] Roles & invitations (RBAC UI, email invitations, last-owner guard)
- [x] Google OAuth (env-gated; needs live credentials to verify end to end)
- [x] API docs (generated Swagger UI, API tokens)

## Phase 5: Polish (Weeks 17–20)

- [x] Dashboard charts (Recharts: pipeline value, win rate, sources)
- [x] Import polish (field mapping UI, dedupe on email)
- [x] Mobile responsive (drawer shell, stacking grids, scrollable tables)
- [x] Dark mode (system default, persisted toggle)
- [x] Accessibility (skip link, dialog semantics, contrast pass, labels)
- [x] Docs & onboarding (tutorial, sample data, self-host guide)

## Future ideas

- [x] Calendar integration (month view of activities, due-date filters)
- [x] Zapier/Make (signed webhook triggers + API-token actions, [guide](INTEGRATIONS.md))
- [x] Visual workflow builder (drag-and-drop automation editor)
- [x] Custom objects (user-defined record types with custom fields)
- [x] Plugin system (webhook plugins for CRM events)
- [x] GraphQL API
- React Native app
- IMAP/Google/Microsoft email sync
- Hosted multi-account SaaS offering
