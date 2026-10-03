# ClientSphere Tutorial

A complete guide to using your CRM — from first login to advanced automation.

## Getting Started

### Sign up

1. Go to `/signup`
2. Enter your name, email, password (min 8 characters), and workspace name
3. You're logged in immediately — your workspace is ready
4. If your workspace has Google OAuth configured, you can also use
   **Continue with Google** on the signup and login pages

### Explore the demo data

Sign in with the seed account to explore:

```
Email: sarah@beanandbrew.com
Password: password123
```

The demo workspace (Bean & Brew) includes:
- 12 contacts across 8 companies
- 9 deals in various stages (including won/lost)
- 6 tags, plus notes, activities (calls, meetings, tasks, emails), and email history
- A default "Sales Pipeline" with 6 stages
- Demo custom fields: a `Plan` select on contacts and a `Renewal date` on companies

---

## Dashboard

Your home screen answers "am I on track this week?" at a glance. Start your
day here: clear what's overdue in **Tasks due**, then work the deal in
**Needs attention** — e.g. a $1,200 catering quote closing Friday with no
activity in 10 days is your first call, not your tenth email. The widgets:

- **Stats** — total contacts, deals, and activities
- **Pipeline by stage** — visual bar chart of deal value per stage, computed
  for your default pipeline (or the first pipeline if none is default)
- **Outcomes & win rate** — donut chart of open/won/lost deals
- **Deals by source** — pie chart showing where deals come from
- All three charts sit side by side in one row on desktop, stacking on smaller
  screens. They are rendered by the same `DealCharts` component and reflect
  the deals loaded for the default pipeline (up to 100).
- **Tasks due** — open activities sorted by due date, each with its deal
  named; tick the circle to complete inline (Undo appears for 8 seconds),
  click through to detail
- **Needs attention** — top of the page, impossible to miss: the open deal
  scoring highest on overdue close date, staleness, and overdue tasks,
  with the reasons listed ("Close date passed 3 days ago", "2 overdue
  tasks") and a button straight into the deal
- **Recent activity** — latest actions across all records; click through to detail

---

## Contacts

Contacts answer *"who do I know?"* — every person you sell to, support, or
might sell to one day. A contact moves through a lifecycle: it starts as a
**lead** (e.g. Lisa from Green Leaf Café, met at a trade event), becomes a
**customer** when they buy, and ends **churned** if they leave. Set the status
accordingly and the rest of the app (filters, automations, win-back emails)
reacts to it.

### List view

- **Search** — debounced search across name and email
- **Filter by status** — lead, customer, or churned
- **Filter by tag** — pick a tag from the dropdown
- **Clear filters** button resets search/tag/status at once
- Sortable columns (name, email, company), page-size picker (10/25/50), and
  pagination; your filter set is remembered when you come back
- **Whole-row click** — click anywhere on a row (or focus it and press
  Enter/Space) to open the detail page; checkboxes and tag chips are exempt

### Detail page

Click any contact to see:
- Contact info (email, phone, status, company, job title, city, added-on date,
  social links)
- Tags — add/remove with the tag editor
- Custom fields (if defined), e.g. the demo `Plan` select
- Notes — add notes with ⌘/Ctrl + Enter to save

> Lead scoring (`POST /api/v1/contacts/:id/score`, with `lead_score` and
> score reasons in the API) is API-only right now: the contact detail page has
> no score display and no **Re-score** button, even though the `useScoreContact`
> hook exists in the frontend code.

### Create / edit

Click **Add Contact** (opens a modal) or the **Edit** button on any detail page.
The form includes:
- Standard fields (name, email, phone, status, company, job title, city,
  social links)
- Custom fields (automatically appear if defined)
- Validation errors show inline. Contacts support soft delete (discard) plus a
  hard **Delete** with confirmation on the detail page.

---

## Companies

Companies are the account-level view: one company links many contacts and
deals, so "TechStart Inc." shows you Mike *and* Alex, plus the $600 office
service deal, in one place. Set a **main contact** (your primary buyer) so
anyone opening the record knows who to call first. Same pattern as contacts
otherwise:
- List with search and filters
- Whole-row click to open the detail page
- Detail page with notes, tags, social links, main contact, and custom fields

---

## Deals & Pipeline

A deal is a sales opportunity with a dollar amount — it answers *"what money
am I chasing, and how close is it?"* Rule of thumb: **no amount, no deal**.
A first hello is a contact; a logged call with no opportunity is an activity;
a $600 quote waiting on a signature is a deal. Closing means dragging the card
into **Won** (thank-you email and `customer` tag can fire automatically) or
**Lost** (a win-back email can go out 30 days later on its own).

### Deals list

Go to **Deals** for the table view:
- Search by title
- Filter by stage (e.g. everything sitting in Negotiation) and by tag
- Sort by title, amount, or close date (no default sort); paginated with a
  page-size picker; your filter set is remembered when you come back
- Click anywhere on a row to open the detail page

### Pipeline board

Go to **Pipeline** to see a Kanban board:
- Switch pipelines with the dropdown (defaults to your default pipeline)
- Drag cards between stages (mouse or touch)
- Click a card to open the deal
- Visual stage colors and probability indicators
- **Show closed** toggle — Won/Lost columns hide by default so finished
  deals don't clutter the board (preference is remembered in localStorage
  under `pipeline-hide-closed`)

### Manage pipelines

Go to **Settings → Pipelines**:
- Create pipelines — each starts with the default 6 stages
  (New 10%, Contacted 25%, Proposal 50%, Negotiation 75%, Won 100%, Lost 0%)
- Rename, set default, delete (pipelines holding deals can't be deleted)
- Edit stages: rename, change kind (open/won/lost), probability, color;
  add new ones (appended at the end, position = max + 1)

### Deal detail

- Title, amount, currency, source (dropdown: referral, website, cold outreach,
  social, event, partner, or **Others** for a custom value)
- Pipeline and stage
- Linked contact and company
- Expected close date and probability
- Overdue-tasks card (always visible, with an all-clear empty state; tasks
  complete inline with 8-second undo and the card expands in place past 10 rows)
- Custom fields, notes, tags
- Compose email from templates (only when the deal has a linked contact),
  rule-based deal summary (`GET /api/v1/deals/:id/summary`)

### Create a deal

Click **Add Deal**. You must select a pipeline and stage. The form includes:
- Standard fields (title, amount, probability, dates)
- Custom fields (automatically appear)
- Contact and company links

**Probability** (0–100) defaults to the stage average (New 10%, Contacted
25%, Proposal 50%, Negotiation 75%) and follows the stage when the deal
moves — until you type your own number, which always wins. The weighted
forecast is amount × probability, e.g. $10,000 at 50% ≈ $5,000.

---

## Activities & Calendar

Activities are the touches that move deals forward — every call, meeting,
task, and email, logged against the contact, company, or deal it belongs to.
If a deal goes quiet, its activity history tells you exactly where it stalled
("proposal sent 12 days ago, nothing since" means call today, not next week).
Log the touch *when it happens*; the dashboard, summaries, and automations
all read this timeline.

### Activities list

Go to **Activities** to see all calls, meetings, tasks, and emails:
- Search subject and description
- Filter by kind (call, meeting, task, email, other)
- Filter by status (open, completed, overdue), and scope to one deal
- Your filter set is remembered when you come back
- Sort by subject, type, or due date; paginated
- Tick checkboxes to select rows, then **Mark complete** to finish them
  all at once
- Click anywhere on a row to open its detail page: complete/reopen, edit,
  delete, linked contact/company/deal (checkboxes are exempt from navigation)

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

Notes are the running timeline ("called Tuesday, wants a quote by Friday");
tags are lightweight labels (`hot-lead`, `catering`) you filter and automate
on — e.g. an automation that emails every contact tagged `new-lead`.

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

## Email

### What you can do

- **Compose Email** — on the deal page (shown whenever the deal has a linked
  contact), pick a template, edit, and send
- **Outbox** — every outbound email with status filter; edit drafts inline,
  retry failures (retry saves your edits first). Drafts pile up here
  automatically when no provider is configured.
- **Delivery tracking** — Settings → Email holds the Resend key and the
  webhook URL to paste into Resend; Outbox rows flip sent → delivered →
  opened as events arrive (tunnel needed for local testing)
- **Deal Summary** — rule-based status (stage, value, close date, activity, staleness)

> There is no **Re-score** button in the contact UI — lead scoring is API-only
> (see Contacts above).

---

## Custom Fields

Go to **Settings → Custom Fields** to define extra fields per record type.
Only Contact, Company, and Deal are supported entity types:

1. Select entity type (Contact, Company, or Deal)
2. Click **New Field** (owner/admin only — members and viewers see the list
   read-only)
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

Custom objects live at **Settings → Custom Objects** (`/settings/custom-objects`),
which is reachable by direct URL — it currently has no card on the Settings
overview page. Owners and admins get full create/edit/delete controls; members
and viewers can read definitions but see no add/edit/delete buttons.

1. Click **New Object**, give it a name and an icon (emoji, defaults to 📦)
2. Add fields: each field has a name, a type
   (`text`, `number`, `boolean`, `date`, `select`), and an optional
   **required** flag. Blank-named fields are ignored on save.
3. Records are stored as JSON with full CRUD API support
   (`/api/v1/custom_object_definitions` and nested `/records`).

Custom objects let you track anything — projects, invoices, tickets, etc.
There is one API detail worth knowing: the tutorial previously pointed at
`POST /api/v1/custom_objects`, but the real route is
`POST /api/v1/custom_object_definitions`.

---



## Automations

Automations follow one mental model: **when** something happens (trigger) →
**only if** conditions hold → **then** do things (actions). Example: *when* a
deal is won, *then* send the thank-you email and tag the contact `customer` —
no manual step, no forgotten follow-up. Start from a template and tweak it;
start simple (one trigger, one action) and build up.

### Templates

On **Automations → New Automation**, a collapsible **Start from a template**
card offers ready-made blueprints (welcome email, new-lead follow-up,
big-deal alert, deal-won thank-you, lost-deal win-back, overdue nudge).
Click one to select it (highlighted with a checkmark) — the create form below
loads its trigger, delay, conditions and actions. Pick another template to
swap the form, or **Start blank** to clear it. Rename, tweak, then save.

### Visual workflow builder

Go to **Automations** and click **New Automation** (or start from a template).
Click anywhere on an automation row to edit it (pause/delete buttons are
exempt):

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

Sequences are multi-step drip campaigns for when one email isn't enough —
e.g. a 3-touch onboarding series (day 0 welcome, day 3 tips, day 7 check-in)
for every new customer, instead of remembering to follow up by hand. For a
single send, use **Compose Email** on the deal page instead.

Go to **Sequences** (`/sequences` — reachable by direct URL or the topbar
title; there is currently no sidebar link, so bookmark it or type the URL) to
create multi-step email drips:

1. Click **New Sequence** — give it a name, then add steps. The sequences
   table is whole-row clickable (delete button exempt). Each step has its
   own edit/delete controls:
   - Subject and body (supports `{{first_name}}`, `{{last_name}}`, `{{email}}`, `{{company}}`)
   - Delay before sending (days; `0` sends immediately)
2. The detail page has an **Active/Paused** toggle (a checkbox bound to
   `is_active`).
3. Enroll contacts from the detail page with the **Contact to enroll** picker
   (you must add at least one step first). Enrollments are listed with a
   status badge (`active`, `paused`, `completed`, `unsubscribed`); active ones
   can be unsubscribed inline.
4. Each email includes an unsubscribe link (signed, per-enrollment). There is
   also a public unsubscribe page at `/unsubscribe/[token]` that needs no login.

---

## Outbox

Go to **Outbox** (sidebar, `/emails`) to see every outbound email in one place:
- Filter by status: **draft** (waiting on a provider), **sent**, **delivered**,
  **opened**, **failed**
- Click anywhere on a row to read it; drafts open editable — fix the address,
  subject, or body, save, and retry (the **Retry** button is exempt from
  row navigation)
- **Retry** on a draft or failure re-sends through your provider
- Delivery tracking (`delivered`/`opened`) needs the Resend webhook
  configured in **Settings → Email**

---

## Webhooks & Plugins

### Webhooks

Go to **Settings → Webhooks**:
1. Click **New Webhook**
2. Enter a URL
3. Enter events as a comma-separated list (defaults to `automation.executed`;
   the form requires at least one event)
4. Save (the **Active** checkbox is on by default)

Deliveries are signed with HMAC-SHA256 and logged. Failed deliveries retry 3 times with exponential backoff.

### Plugins

Go to **Settings → Plugins**:
1. Click **New Plugin**
2. Enter a name and webhook URL
3. Tick trigger events
4. Save (the **Active** checkbox is on by default; the list shows an
   Active/Inactive badge per plugin)

Plugins fire on matching events and deliver JSON payloads to your webhook URL.

---

## Team Management

Go to **Settings → Team**:

### Invite members

1. Enter their email
2. Choose a role (owners see admin/member/viewer; admins can only invite
   member/viewer — only an owner can invite someone as admin)
3. Click **Send invite**
4. They receive an email with an accept link (or copy the link directly)

Invitees click the link and are logged in automatically — links expire
after 7 days. Pending invitations show on the Team page until accepted,
and can be revoked. Only owners and admins can invite; only owners can
promote someone to owner.

### Manage roles

- **Owner** — full access, can't be removed
- **Admin** — full access, can manage team
- **Member** — can create/edit records
- **Viewer** — read-only access

Change roles or remove members from the team table. Your own row shows "(you)"
and has no remove button — you can't remove yourself, and an account must always
keep at least one owner. To hand over ownership, promote someone else to owner
first.

Two rules keep responsibility clear:

- **At most 2 owners.** Once both slots are taken, the owner option greys out
  for everyone else. Demote an owner to free a slot.
- **Owners alone manage admins.** Only an owner can set the admin role — for
  existing members and for new invites. An admin can promote people to member or
  viewer, but not to admin, and can't change anyone's admin role either way.

### First login for new members

When someone accepts an invitation they land straight in the CRM with your
workspace data — contacts, companies and deals are already there. Because we
never email a password, the first screen asks them to set:

1. The name their team will see (their email name is just a placeholder)
2. A password, so they can sign in again

It only appears once, and only for invited members. Anyone who signs up
themselves picks a password already, so they're never asked — and using
**Forgot password?** clears it too.

### Forgotten password

On the sign-in page, click **Forgot password?** and enter your email. We send a
link that works once and expires after 2 hours. Choosing a new password signs
you out everywhere else.

---

## Import / Export

Go to **Settings → Import/Export**:

### Import contacts

1. Upload a CSV file (a 5-row preview is shown before you commit)
2. Map columns to fields (auto-matches common headers like "First Name";
   only `first_name`, `last_name`, `email`, `phone` are supported —
   unknown headers default to unmapped)
3. Choose **Skip** or **Update** for existing emails (blanks never overwrite
   on update)
4. Click **Import contacts**
5. Review the per-row error report

### Export data

Click **Export Contacts**, **Export Companies**, or **Export Deals** to download CSV files.

> Import/Export is owner/admin only — members and viewers see a locked notice
> instead of the form.

---

## API & Integrations

### API tokens

Go to **Settings → API Tokens**:
1. Click **New Token**
2. Name it and optionally set an expiry
3. Copy the token (shown once)
4. Use as `Authorization: Bearer csk_…` against the versioned API
   (e.g. `GET /api/v1/contacts`)

### GraphQL

> The `/graphql` endpoint exists in the Rails routes, but there is no tutorial
> coverage for it and no corresponding frontend UI — treat it as out of scope
> until it is documented in [API.md](API.md).

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

Go to **Settings → Profile** to view your account info (name, email,
workspace, member-since date with avatar). The page is currently read-only —
there is no edit form, despite what older versions of this tutorial said.

### Who can change settings

Every settings page links back here. Settings that affect the whole workspace —
**Email, Plugins, Pipelines, Webhooks, API Tokens and
Import/Export** — can only be changed by an **owner or admin**. For members and
viewers those cards are shown locked, and opening the page directly explains why.

Personal settings (**Profile**), viewing the **Team** list, and viewing
**Custom Fields** stay available to everyone. Members and viewers can read
custom fields and custom objects but get no add/edit/delete controls there —
those definitions are owner/admin only, matching what the API allows. Changing
roles, inviting, and removing members remain owner/admin actions.

> **Custom Objects** (`/settings/custom-objects`) works the same way — readable
> by everyone, editable by owners/admins only — but it has no card on the
> Settings overview, so navigate to the URL directly.

### About

The sidebar also links to **About** (`/about`): stack credits, the GitHub repo
link, and a Buy-Me-a-Coffee button. Read-only, same for every role.

---

## Tips

- **Keyboard**: Tab through forms, ⌘/Ctrl + Enter saves notes, Escape closes menus
- **Mobile**: The sidebar becomes a hamburger menu; tables scroll horizontally
- **Search**: Use the search box on any list page — it's debounced for performance
- **Filters**: Combine search, status, and tags for powerful filtering
- **Automations**: Start simple — one trigger, one action — then build up

---

## Getting help

- **API docs**: `/api-docs` (Swagger UI)
- **Integrations guide**: [INTEGRATIONS.md](INTEGRATIONS.md)
- **Setup guide**: [SETUP.md](SETUP.md)
- **Deployment guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Security**: [SECURITY.md](SECURITY.md)
- **Privacy**: [PRIVACY.md](PRIVACY.md)
