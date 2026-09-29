# Features

## Core CRM

### Contacts
- Full CRUD with search and filtering
- Tags for categorization
- Soft delete (discard)
- Unique email per account
- Lead scoring with explainable reasons

### Companies
- Full CRUD with search
- Linked contacts and deals
- Soft delete

### Deals
- Pipelines with customizable stages
- Kanban board with drag-drop
- Won/lost tracking
- Expected close dates
- Deal value tracking

### Activities
- Log calls, meetings, tasks, emails
- Due dates and completion tracking
- Assign to team members

### Notes
- Polymorphic notes on any record
- Author tracking

## Views

### Table View
- Sortable columns
- Search and filter
- Pagination

### Kanban Board
- Drag-drop deal cards between stages
- Visual pipeline overview

## AI Features

### AI Chat
- Conversational assistant with CRM context
- Scoped to account data

### Email Drafting
- Generate professional emails
- Context from contact/deal records

### Lead Scoring
- Rules-based scoring with reasons
- Explainable results

### Suggestions
- Next best action recommendations
- Based on activity and deal stage

### Enrichment
- Company info from domain
- User-confirmed before saving

### Local Mode
- Browser-direct for Ollama/LM Studio
- Data never leaves the device

## Automation

### Automations
- Form-based trigger/action rules
- Create tasks, send emails, tag, move stages, call webhooks
- Enable/disable toggle

### Email Sequences
- Steps with delays
- Enrollment and unsubscribe
- Stop on reply/unsubscribe

### Webhooks
- Signed deliveries
- Retries with backoff
- Delivery log

## Customization

### Custom Fields
- 12-15 field types
- Stored in `custom_data` jsonb
- Shown in forms, tables, filters

### Saved Views
- Save/share filters, sort, columns
- Per entity type

## Teams

### Roles & Permissions
- Owner, admin, member, viewer
- Pundit policies on every action

### Invitations
- Email invitations
- Role assignment
- Token-based acceptance

## Import/Export

### CSV Import
- Background processing
- Per-row error report
- Size and row caps

### CSV Export
- Streamed for large datasets
- Formula injection prevention

## Security

- httpOnly cookie sessions
- CSRF protection
- Tenant isolation
- Rate limiting
- SSRF protection
- Encrypted secrets
- Audit logging
