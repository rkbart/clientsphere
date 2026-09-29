# Roadmap

## Phase 1: Core CRM (Weeks 1–4)

- [x] Auth & tenancy (email/password, sessions, account scoping, policy guards)
- [x] Contacts & companies (CRUD, search, filters, tags, soft delete)
- [x] Deals (pipelines, stages, kanban with drag-drop, won/lost)
- [x] Activities & notes (log calls/meetings, tasks, notes on any record)
- [x] Dashboard (open deals by stage, tasks due, recent activity)
- [x] CSV import/export (basic mapping, error report)
- [x] Foundations (hand-written typed client, CI, Docker Compose, seeds; Swagger UI deferred)
- [ ] Create/edit forms for contacts, companies, deals, activities (backend CRUD ready; UI pending)

## Phase 2: Intelligence (Weeks 5–8)

- [x] AI settings (server-side encrypted keys, presets, test connection, privacy toggle)
- [x] AI chat (scoped-context assistant)
- [x] Email drafting (draft from contact/deal context)
- [x] Lead scoring (rules-based with reasons)
- [x] Suggestions (next-best-action on dashboard and deal page)
- [x] Enrichment (company info from domain, user-confirmed)
- [x] Local mode (browser-direct for Ollama / LM Studio)

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
