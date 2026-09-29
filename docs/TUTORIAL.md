# Tutorial

## Step 1: Set up your account

Sign up with email/password. Your account and workspace are created automatically.

## Step 2: Explore your data

Seeded demo data (Bean & Brew Coffee Supplies) gives you contacts, companies,
deals and activities to explore. Browse Contacts, Companies and Deals from
the sidebar.

Sign-in for the seed data: `sarah@beanandbrew.com` / `password123`.

## Step 3: Filter contacts

Go to Contacts. Use the debounced search box, the status filter
(lead / customer / churned) and the tag filter. "Clear filters" resets
everything. Open a contact to see details, notes and tags.

> Record create/edit forms are not in the UI yet — add records through
> CSV import (Step 9) or the API.

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

Go to Settings → Import/Export. Upload a CSV of contacts. Per-row errors are
reported; re-export to check the result.

## Step 9: Export your data

Same page: export contacts, companies or deals as CSV for backup or
migration. Individual contact export/erase also exist on the API.

## Coming later (see [ROADMAP.md](ROADMAP.md))

- Create/edit forms in the UI
- Automations, email sequences, scheduling (Phase 3)
- Saved-view editing UI, custom-field display in tables (Phase 4)
