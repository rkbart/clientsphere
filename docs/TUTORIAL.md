# Tutorial

## Step 1: Set up your account

Sign up with email/password. Your account and workspace are created automatically.

## Step 2: Explore your data

Seeded demo data (Bean & Brew Coffee Supplies) gives you contacts, companies,
deals and activities to explore. Browse Contacts, Companies and Deals from
the sidebar.

Sign-in for the seed data: `sarah@beanandbrew.com` / `password123`.

## Step 3: Filter contacts and save the view

Go to Contacts. Use the debounced search box, the status filter
(lead / customer / churned) and the tag filter. "Clear filters" resets
everything. Open a contact to see details, notes and tags.

With filters set, click **Save view**, give it a name, and optionally share
it with the team. Re-apply it anytime from the view dropdown. Manage or
rename views in Settings → Saved Views.

## Step 3b: Custom fields

Settings → Custom Fields defines typed extra fields per record type (text,
number, date, select, …). They appear automatically on create/edit forms
and on detail pages, and list endpoints accept `?custom[key]=value` filters.

## Step 4: Work the pipeline

> "Add Contact/Company/Deal" buttons open full-page forms; each detail
> page has an Edit button. Validation errors show inline.

## Step 4: Work the pipeline

Go to Pipeline. Drag deal cards between stages (works with mouse and
touch). Open a deal to see stage, pipeline, value and notes.

## Step 5: Take notes and tag records

On any contact, company or deal detail page: add notes in the Notes
section, and attach/detach tags with the tag chips.

## Step 6: Configure AI

Go to Settings → AI. Pick a provider (Groq for free, or Ollama for local),
add your API key if the provider needs one, choose a model, then **Test
connection** and **Save**. Turn on **Enable AI** — the page shows whether
your data goes through the server (Server) or straight to a local model
from your browser (Local).

## Step 7: Use AI features

- **AI Assistant** (`/ai` in the sidebar): ask questions about your CRM data
- **Contact page**: "Draft Email" card + "AI Insights" (next action) +
  "Re-score" button
- **Deal page**: draft an email to the deal's contact, suggest next action,
  summarize the deal
- **Company page**: "Enrich Company" previews suggested fields — apply only
  what you want
- **Dashboard**: "Next best action" widget for your most urgent open deal

## Step 8: Import existing data

Go to Settings → Import/Export. Upload a CSV of contacts: map each column
to a field (headers like "First Name" auto-match), choose Skip vs Update
for existing emails, and review the per-row error report. Export buttons
on the same page download contacts, companies or deals.

## Step 9: Export your data

Same page: export contacts, companies or deals as CSV for backup or
migration. Individual contact export/erase also exist on the API.

## Step 10: Automate and integrate

- **Automations** (`/automations`): trigger/action rules (create tasks, tag,
  move stages, call webhooks) with a run history
- **Sequences** (`/sequences`): multi-step email drips with unsubscribe links
- **Webhooks** (Settings → Webhooks): signed deliveries with a log
- **Jobs** (`http://localhost:3000/jobs`, basic auth): Solid Queue dashboard
- **API tokens** (Settings → API Tokens): `csk_…` tokens for scripts, used as
  `Authorization: Bearer` — see the live reference at `/api-docs`
- **Team** (Settings → Team): invite members by email, manage roles

## Step 11: Make it yours

- Toggle dark mode from the top bar (follows your OS setting by default)
- Dashboard analytics: pipeline value by stage, win rate, deals by source
- "Continue with Google" appears once `GOOGLE_CLIENT_ID/SECRET` are set
  (see [SETUP.md](SETUP.md))

## Coming later (see [ROADMAP.md](ROADMAP.md))

- Visual workflow builder, custom objects, GraphQL API
- Email/calendar sync, Zapier/Make, plugin system
