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
PATCH  /users/me                 # name, phone, password, welcome_seen, account_name (email immutable)
```

## Workspaces

```
GET    /accounts                 # your workspaces only (oldest first)
POST   /accounts                 # body: account { name }; caller becomes owner + switches in
PATCH  /accounts/:id             # rename (member)
DELETE /accounts/:id             # owner only; cascades all records; 422 on last workspace
```

Creation is unlimited. Joining remains invite-only. Deleting a workspace
revokes sessions/tokens of everyone left behind (same lockout as Team
removal) and repoints users to their oldest remaining workspace.

## Password Resets

Public endpoints (no session). `create` always returns 201 so it never reveals
whether an address exists. Tokens expire after 2 hours and are single-use.

```
POST   /password_resets          # body: email
PATCH  /password_resets/:token/update   # body: password, password_confirmation
```

A successful reset destroys every active session for that user.

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
GET    /companies              # List (q, sort, direction, page, per_page)
POST   /companies
GET    /companies/:id          # Show (includes tags)
PATCH  /companies/:id
DELETE /companies/:id          # Soft delete
```

Sort: `name` (default), `domain`, `industry`, `annual_revenue` — `direction=asc|desc`

## Deals

```
GET    /deals                 # List (q, stage_id, pipeline_id, tag_id, sort, direction, page, per_page)
POST   /deals
GET    /deals/:id             # Show (includes stage, company, tags)
PATCH  /deals/:id
DELETE /deals/:id             # Soft delete
PATCH  /deals/:id/move        # Stage change
GET    /deals/:id/summary      # Rule-based summary + facts
GET    /deals/attention         # Highest-scoring open deal (?pipeline_id=)
```

Sort: `title`, `amount`, `expected_close_date` — `direction=asc|desc` (default: pipeline position)

## Pipelines & Stages

```
GET    /pipelines
POST   /pipelines
GET    /pipelines/:id
PATCH  /pipelines/:id
DELETE /pipelines/:id

GET    /pipelines/:pipeline_id/stages
POST   /pipelines/:pipeline_id/stages
PATCH  /pipelines/:pipeline_id/stages/:id
DELETE /pipelines/:pipeline_id/stages/:id
```

## Activities

```
GET    /activities          # List (q, kind, deal_id, assignee_id, completed, overdue, due_from, due_to, sort, direction, page, per_page; each row includes deal {id, title})
POST   /activities
POST   /activities/bulk_complete  # Body: activity_ids[] (max 100); per-record auth, partial success {completed, failed}
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
GET    /emails/templates      # ?contact_id= for per-contact personalization
POST   /emails/deliver        # body: deal_id?, subject, body, to_addresses?
                              #   contact_id? — omit it and pass to_addresses
                              #   instead; 422 if neither is present
POST   /emails/:id/redeliver  # retry a draft/failed email; 422 if no recipient
GET    /email_settings        # owner/admin; secrets never returned
PATCH  /email_settings        # body: from_address, resend_api_key, webhook_secret
POST   /webhooks/resend/:account_id  # Resend tracking events (Svix-signed)
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
