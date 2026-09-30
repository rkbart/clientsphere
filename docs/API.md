# API

Interactive reference: `http://localhost:3000/api-docs` (Swagger UI, served
from `apps/api/openapi/v1/swagger.yaml`). Regenerate after route changes with
`bin/rails openapi:generate` in `apps/api`. The reference below is the
human-maintained overview.

## Base URL

```
Production: https://your-app.onrender.com/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication

Bearer token sessions or personal access tokens (`csk_…`, Settings → API
Tokens). Login returns a token; send it on every request:

```
Authorization: Bearer <token>
```

Tokens are stored server-side as digests (revoked on logout). All requests are
scoped to the session's active account.

```
POST   /auth/signup
POST   /auth/login
DELETE /auth/logout
GET    /auth/me
POST   /auth/switch_account
```

## Invitations & Memberships

```
POST   /invitations
POST   /invitations/accept        # body: token
GET    /memberships
PATCH  /memberships/:id           # role change
DELETE /memberships/:id
```

## Contacts

```
GET    /contacts              # List (filters, search, pagination)
POST   /contacts              # Create
GET    /contacts/:id          # Show
PATCH  /contacts/:id          # Update
DELETE /contacts/:id          # Soft delete
POST   /contacts/import       # CSV import
GET    /contacts/:id/export   # CSV export
DELETE /contacts/:id/erase    # Permanent delete
POST   /contacts/:id/score    # Lead scoring
```

## Companies

```
GET    /companies
POST   /companies
GET    /companies/:id
PATCH  /companies/:id
DELETE /companies/:id
```

## Deals

```
GET    /deals
POST   /deals
GET    /deals/:id
PATCH  /deals/:id
DELETE /deals/:id
PATCH  /deals/:id/move        # Stage change
```

## Pipelines & Stages

```
GET    /pipelines
POST   /pipelines
GET    /pipelines/:id
PATCH  /pipelines/:id
DELETE /pipelines/:id

GET    /pipelines/:pipeline_id/stages
POST   /pipelines/:pipeline_id/stages
PATCH  /stages/:id
DELETE /stages/:id
```

## Activities

```
GET    /activities
POST   /activities
GET    /activities/:id
PATCH  /activities/:id
DELETE /activities/:id
```

## Notes

```
GET    /notes
POST   /notes
GET    /notes/:id
PATCH  /notes/:id
DELETE /notes/:id
```

## Emails

```
GET    /emails
POST   /emails
GET    /emails/:id
PATCH  /emails/:id
DELETE /emails/:id
```

## Tags

```
GET    /tags
POST   /tags
DELETE /tags/:id
POST   /contacts/:id/tags
DELETE /contacts/:id/tags/:tag_id
POST   /companies/:id/tags
DELETE /companies/:id/tags/:tag_id
POST   /deals/:id/tags
DELETE /deals/:id/tags/:tag_id
```

## Custom Fields

```
GET    /custom_field_definitions
POST   /custom_field_definitions
GET    /custom_field_definitions/:id
PATCH  /custom_field_definitions/:id
DELETE /custom_field_definitions/:id
```

## Saved Views

```
GET    /saved_views
POST   /saved_views
GET    /saved_views/:id
PATCH  /saved_views/:id
DELETE /saved_views/:id
```

## Automations

```
GET    /automations
POST   /automations
GET    /automations/:id
PATCH  /automations/:id
DELETE /automations/:id
POST   /automations/:id/toggle
GET    /automations/:id/runs
```

## Email Sequences

```
GET    /email_sequences
POST   /email_sequences
GET    /email_sequences/:id
PATCH  /email_sequences/:id
DELETE /email_sequences/:id
POST   /email_sequences/:id/enroll

GET    /email_sequences/:email_sequence_id/steps
POST   /email_sequences/:email_sequence_id/steps
PATCH  /email_sequence_steps/:id
DELETE /email_sequence_steps/:id
```

## Webhooks

```
GET    /webhooks
POST   /webhooks
GET    /webhooks/:id
PATCH  /webhooks/:id
DELETE /webhooks/:id
GET    /webhooks/:id/deliveries
```

## AI

```
GET    /ai/settings             # Read config (api_key never returned; api_key_set flag instead)
PATCH  /ai/settings             # Write config (blank api_key keeps the stored key)
POST   /ai/test_connection      # { success, message }
POST   /ai/prompts              # Server-assembled prompts for browser-direct mode
POST   /ai/chat                 # Scoped-context assistant
POST   /ai/draft_email          # body: contact_id, purpose, deal_id?
POST   /ai/suggest_next_action  # body: record_type, record_id
POST   /ai/enrich               # body: domain
POST   /ai/summarize_deal       # body: deal_id
```

Usage endpoints return `422 { error }` when AI is unconfigured or disabled.
Errors from the provider come back as `422 { error: "AI request failed (…)" }`.

## Import/Export

```
POST   /import/csv
GET    /import/:id
GET    /export/csv/:type        # type: contacts | companies | deals
```

## Query Parameters

```
?page=1&per_page=25                # Pagination (max 100)
?q=john                            # Search (name/email/domain ILIKE)
?status=lead|customer|churned      # Contact status filter
?tag_id=<uuid>                   # Tag filter (contacts)
?sort=created_at&order=desc        # Sorting
```

## API Documentation

Request/response types are hand-written in
`apps/web/src/lib/api/schema.ts` and consumed with `openapi-fetch`.
There is no generated OpenAPI document (rswag was dropped; see
[TECH-DECISIONS.md](TECH-DECISIONS.md)).
