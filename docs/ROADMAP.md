# Roadmap

## Phase 1: Core CRM (Weeks 1–4)

- [ ] Auth & tenancy (email/password, sessions, acts_as_tenant, tenant-isolation specs)
- [ ] Contacts & companies (CRUD, search, filters, tags, soft delete)
- [ ] Deals (pipelines, stages, kanban with drag-drop, won/lost)
- [ ] Activities & notes (log calls/meetings, tasks, notes on any record)
- [ ] Dashboard (open deals by stage, tasks due, recent activity)
- [ ] CSV import/export (basic mapping, error report)
- [ ] Foundations (OpenAPI-generated client, CI, Docker Compose, seeds, Swagger UI)

## Phase 2: Intelligence (Weeks 5–8)

- [ ] AI settings (server-side encrypted keys, presets, test connection, privacy toggle)
- [ ] AI chat (scoped-context assistant)
- [ ] Email drafting (draft from contact/deal context)
- [ ] Lead scoring (rules-based with reasons)
- [ ] Suggestions (next-best-action on dashboard and deal page)
- [ ] Enrichment (company info from domain, user-confirmed)
- [ ] Local mode (browser-direct for Ollama / LM Studio)

## Phase 3: Automation (Weeks 9–12)

- [ ] Automations (form-based trigger/action rules)
- [ ] Email sequences (steps with delays, enrollment, unsubscribe)
- [ ] Webhooks (signed deliveries, retries, delivery log)
- [ ] Job visibility (Mission Control dashboard)
- [ ] Scheduling (Solid Queue recurring tasks)

## Phase 4: Customization & Teams (Weeks 13–16)

- [ ] Custom fields (12-15 types, jsonb storage)
- [ ] Saved views (save/share filters, sort, columns)
- [ ] Roles & invitations (RBAC UI, email invitations)
- [ ] Google OAuth
- [ ] API docs (Swagger UI polished, API tokens)

## Phase 5: Polish (Weeks 17–20)

- [ ] Dashboard charts (Recharts: pipeline value, win rate, sources)
- [ ] Import polish (field mapping UI, dedupe on email)
- [ ] Mobile responsive
- [ ] Dark mode
- [ ] Accessibility (keyboard navigation, contrast pass)
- [ ] Docs & onboarding (tutorial, sample data, self-host guide)

## Future ideas

- Visual workflow builder
- Custom objects
- GraphQL API
- React Native app
- IMAP/Google/Microsoft email sync
- Calendar integration
- Zapier/Make
- Plugin system
- Hosted multi-account SaaS offering
