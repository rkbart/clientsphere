# API

## Base URL

```
Production: https://your-app.onrender.com/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication

httpOnly cookie sessions. All requests scoped to session's active account.

```
POST   /auth/signup
POST   /auth/login
DELETE /auth/logout
GET    /auth/me
POST   /auth/switch_account
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
GET    /ai/settings
PATCH  /ai/settings
POST   /ai/test_connection
POST   /ai/chat
POST   /ai/draft_email
POST   /ai/suggest_next_action
POST   /ai/enrich
POST   /ai/summarize_deal
```

## Import/Export

```
POST   /import/csv
GET    /import/:id
GET    /export/csv/:type
```

## Query Parameters

```
?page=1&per_page=25           # Pagination (max 100)
?q=john                       # Search
?status=active&tag=hot-lead   # Filtering
?sort=created_at&order=desc   # Sorting
```

## API Documentation

Swagger UI served at `/api-docs` (rswag).
