# ClientSphere Tutorial

A complete guide to using your CRM — from first login to advanced automation.

## Getting Started

### Sign up

1. Go to `/signup`
2. Enter your name, email, password (min 8 characters), and workspace name
3. You're logged in immediately — your workspace is ready

### Explore the demo data

Sign in with the seed account to explore:

```
Email: sarah@beanandbrew.com
Password: password123
```

The demo workspace (Bean & Brew Coffee Supplies) includes:
- 11 contacts across 8 companies
- 9 deals in various stages (including won/lost)
- Tags, notes, activities, and email history
- A default sales pipeline with 6 stages

---

## Dashboard

Your home screen shows:

- **Stats** — total contacts, deals, and activities
- **Pipeline by stage** — visual bar chart of deal value per stage
- **Outcomes & win rate** — donut chart of open/won/lost deals
- **Deals by source** — pie chart showing where deals come from
- **Tasks due** — open activities sorted by due date
- **Next best action** — AI-suggested next step for your most urgent deal
- **Recent activity** — latest actions across all records

---

## Contacts

### List view

- **Search** — debounced search across name and email
- **Filter by status** — lead, customer, or churned
- **Filter by tag** — click a tag to filter
- **Saved views** — save filter combinations for quick access

### Detail page

Click any contact to see:
- Contact info (email, phone, status, lead score)
- Lead score reasons (click **Re-score** to recalculate)
- Custom fields (if defined)
- Tags — add/remove with the tag chips
- Notes — add notes with ⌘/Ctrl + Enter to save
- AI features — draft email, insights, next action

### Create / edit

Click **Add Contact** or the **Edit** button on any detail page. The form includes:
- Standard fields (name, email, phone, status, company)
- Custom fields (automatically appear if defined)
- Validation errors show inline

---

## Companies

Same pattern as contacts:
- List with search and filters
- Detail page with notes, tags, and custom fields
- **Enrich Company** (AI) — previews suggested fields from the company domain; apply only what you want

---

## Deals & Pipeline

### Pipeline board

Go to **Pipeline** to see a Kanban board:
- Drag cards between stages (mouse or touch)
- Click a card to open the deal
- Visual stage colors and probability indicators

### Deal detail

- Title, amount, currency, source
- Pipeline and stage
- Linked contact and company
- Expected close date and probability
- Custom fields, notes, tags
- AI features — draft email, summarize, next action

### Create a deal

Click **Add Deal**. You must select a pipeline and stage. The form includes:
- Standard fields (title, amount, probability, dates)
- Custom fields (automatically appear)
- Contact and company links

---

## Activities & Calendar

### Activities list

Go to **Activities** to see all calls, meetings, tasks, and emails:
- Filter by kind (call, meeting, task, email, other)
- Filter by completion status
- Click to edit or complete

### Calendar view

Go to **Calendar** for a month grid:
- Activities shown on their due date
- Color dots indicate activity type
- Click an activity to edit it
- Navigate months with arrows or arrow keys
- **Today** button jumps to current month

### Log an activity

Click **Log Activity** from the activities or calendar page:
- Choose kind (call, meeting, task, email, other)
- Add subject, description, due date
- Link to a contact, company, or deal
- Assign to a team member

---

## Notes & Tags

### Notes

On any contact, company, or deal detail page:
- Type in the Notes section
- Press ⌘/Ctrl + Enter to save
- Notes are visible on the record's timeline

### Tags

- **Add** — type a tag name in the tag section and press Enter
- **Remove** — click the × on any tag chip
- **Filter** — use the tag filter on list pages to find records by tag

---

## AI Features

### Setup

Go to **Settings → AI**:
1. Pick a provider (Groq for free API key, or Ollama for local)
2. Enter your API key (if required)
3. Choose a model
4. Click **Test connection** to verify
5. Click **Save**
6. Toggle **Enable AI** on

### Privacy modes

- **Server** — AI calls go through your server (API key stored encrypted)
- **Local** — for Ollama/LM Studio, calls go browser-direct (data never leaves your device)

### What you can do

- **AI Assistant** (`/ai`) — chat with your CRM data; ask questions like "What deals are closing this week?"
- **Draft Email** — on contact/deal pages, generate contextual emails
- **AI Insights** — next-best-action suggestions on records
- **Re-score** — recalculate lead scores with AI
- **Enrich Company** — AI-suggested company fields from domain
- **Summarize Deal** — AI summary of deal context

---

## Custom Fields

Go to **Settings → Custom Fields** to define extra fields per record type:

1. Select entity type (Contact, Company, or Deal)
2. Click **New Field**
3. Choose label, key (snake_case), and type:
   - Text, text area, number, currency, percentage
   - Boolean (checkbox), date, datetime
   - Email, phone, URL
   - Select (dropdown), multi-select
4. For select types, enter comma-separated choices
5. Toggle **Required** if needed
6. Set **Position** for ordering

Custom fields automatically appear on create/edit forms and detail pages. List endpoints accept `?custom[key]=value` for filtering.

---

## Custom Objects

Go to **Settings → Custom Objects** to define entirely new record types:

1. Click **New Object**
2. Enter a name and icon (emoji)
3. Add fields (same types as custom fields)
4. Save

Custom objects let you track anything — projects, invoices, tickets, etc. Records are stored as JSON with full CRUD API support.

---

## Saved Views

Save any filter combination for quick access:

1. Set filters on the contacts list (search, status, tag)
2. Click **Save view**
3. Name it and optionally share with the team
4. Re-apply from the view dropdown anytime

Manage views in **Settings → Saved Views** — rename, toggle sharing, or delete.

---

## Automations

### Templates

On **Automations → New Automation**, a collapsible **Start from a template**
card offers ready-made blueprints (welcome email, new-lead follow-up,
big-deal alert, deal-won thank-you, lost-deal win-back, overdue nudge).
Click one to select it (highlighted with a checkmark) — the create form below
loads its trigger, delay, conditions and actions. Pick another template to
swap the form, or **Start blank** to clear it. Rename, tweak, then save.

### Visual workflow builder

Go to **Automations** and click **New Automation** (or start from a template):

1. **Name** your workflow
2. **Trigger** — choose when it fires:
   - Contact created/updated
   - Deal created, stage changed, won, or lost
   - Activity completed or overdue
3. **Conditions** (optional) — all must match:
   - Minimum deal amount
   - Status equals
   - Has tag
4. **Actions** — add one or more:
   - Create task (with subject, description, due days)
   - Send email (with subject and body)
   - Add tag
   - Move stage (select pipeline and stage)
   - Call webhook (select a webhook)
5. Drag actions to reorder them
6. **Delay (days)** (optional) — wait this many days after the trigger fires
   before running the actions (e.g. send a follow-up email 3 days after a
   contact is created). Leave at 0 to run immediately.
7. Toggle **Active** to enable/disable

### Run history

Each automation shows recent runs with status (completed, failed, running) and any error messages.

---

## Email Sequences

Go to **Sequences** to create multi-step email drips:

1. Click **New Sequence**
2. Add steps with:
   - Subject and body (supports `{{first_name}}`, `{{last_name}}`, `{{email}}`, `{{company}}`)
   - Delay before sending (days)
3. Enroll contacts manually or via automation
4. Each email includes an unsubscribe link (signed, per-enrollment)

---

## Webhooks & Plugins

### Webhooks

Go to **Settings → Webhooks**:
1. Click **New Webhook**
2. Enter a URL
3. Select events to subscribe to (or leave empty for all)
4. Save

Deliveries are signed with HMAC-SHA256 and logged. Failed deliveries retry 3 times with exponential backoff.

### Plugins

Go to **Settings → Plugins**:
1. Click **New Plugin**
2. Enter a name and webhook URL
3. Select trigger events
4. Save

Plugins fire on matching events and deliver JSON payloads to your webhook URL.

---

## Team Management

Go to **Settings → Team**:

### Invite members

1. Enter their email
2. Choose a role (admin, member, viewer)
3. Click **Send invite**
4. They receive an email with an accept link (or copy the link directly)

### Manage roles

- **Owner** — full access, can't be removed
- **Admin** — full access, can manage team
- **Member** — can create/edit records
- **Viewer** — read-only access

Change roles or remove members from the team table.

---

## Import / Export

Go to **Settings → Import/Export**:

### Import contacts

1. Upload a CSV file
2. Map columns to fields (auto-matches common headers like "First Name")
3. Choose **Skip** or **Update** for existing emails
4. Click **Import contacts**
5. Review the per-row error report

### Export data

Click **Export Contacts**, **Export Companies**, or **Export Deals** to download CSV files.

---

## API & Integrations

### API tokens

Go to **Settings → API Tokens**:
1. Click **New Token**
2. Name it and optionally set an expiry
3. Copy the token (shown once)
4. Use as `Authorization: Bearer csk_…`

### GraphQL

Send POST requests to `/graphql` with a JSON body:

```json
{
  "query": "{ contacts { edges { node { firstName email } } } }"
}
```

### REST API

Full reference at `/api-docs` (Swagger UI). All endpoints accept Bearer tokens and return JSON.

### Zapier / Make / n8n

See [INTEGRATIONS.md](INTEGRATIONS.md) for webhook triggers and API action examples.

---

## Settings

### Dark mode

Click the sun/moon icon in the top bar. Follows your OS setting by default; your choice is saved.

### Profile

Go to **Settings → Profile** to update your name and email.

### AI provider

Go to **Settings → AI** to configure or change your AI provider.

---

## Tips

- **Keyboard**: Tab through forms, ⌘/Ctrl + Enter saves notes, Escape closes menus
- **Mobile**: The sidebar becomes a hamburger menu; tables scroll horizontally
- **Search**: Use the search box on any list page — it's debounced for performance
- **Filters**: Combine search, status, and tags for powerful filtering
- **Views**: Save frequently-used filter combinations as saved views
- **AI**: Start with the AI Assistant to ask questions about your data
- **Automations**: Start simple — one trigger, one action — then build up

---

## Getting help

- **API docs**: `/api-docs` (Swagger UI)
- **Integrations guide**: [INTEGRATIONS.md](INTEGRATIONS.md)
- **Setup guide**: [SETUP.md](SETUP.md)
- **Deployment guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Security**: [SECURITY.md](SECURITY.md)
- **Privacy**: [PRIVACY.md](PRIVACY.md)
