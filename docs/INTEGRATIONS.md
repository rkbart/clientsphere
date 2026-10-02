# Integrations (Zapier / Make / n8n / custom)

Two directions, no plugins needed.

## ClientSphere → Zapier/Make (triggers)

Point an automation at your Zapier **Catch Hook**, Make **Custom Webhook**,
or n8n **Webhook** node:

1. In Zapier/Make, create a Catch Hook / Webhook trigger and copy its URL.
2. In ClientSphere go to Settings → Webhooks → New Webhook, paste the URL.
   Subscribe to `automation.executed` (or leave events empty for all).
3. Create an automation (`/automations`) with one of these triggers and a
   **Call webhook** action pointing at that webhook:
   - `contact_created`, `contact_updated`
   - `deal_created`, `deal_stage_changed`, `deal_won`, `deal_lost`
   - `activity_completed`, `activity_overdue` (fired hourly by the scheduler)

Each delivery POSTs JSON with a shared-secret HMAC signature:

```json
{
  "event": "automation.executed",
  "data": { "id": "…", "first_name": "Ada", "...": "full record JSON" },
  "timestamp": "2026-09-30T05:00:00Z"
}
```

Headers: `Content-Type: application/json`,
`X-Webhook-Signature: <hex HMAC-SHA256 of the raw body>`.

Verify in a Code step (Node.js):

```js
const crypto = require("crypto");
const expected = crypto.createHmac("sha256", inputData.secret)
  .update(inputData.rawBody).digest("hex");
return { valid: expected === inputData.signature };
```

Deliveries retry 3 times with exponential backoff; every attempt is logged
under Settings → Webhooks → [webhook] → Deliveries.

## Zapier/Make → ClientSphere (actions)

Use a personal access token (Settings → API Tokens, `csk_…`) with Code /
HTTP steps. Full reference with auth marking: `/api-docs`.

```bash
# Create a contact
curl -X POST https://YOUR-API/api/v1/contacts \
  -H "Authorization: Bearer csk_…" \
  -H "Content-Type: application/json" \
  -d '{"contact": {"first_name": "Ada", "email": "ada@example.com"}}'

# Move a deal (same shape for PATCH /api/v1/deals/:id)
curl -X POST https://YOUR-API/api/v1/deals/DEAL_ID/move \
  -H "Authorization: Bearer csk_…" \
  -H "Content-Type: application/json" \
  -d '{"stage_id": "STAGE_ID"}'

# Log a call (triggers automations downstream)
curl -X POST https://YOUR-API/api/v1/activities \
  -H "Authorization: Bearer csk_…" \
  -H "Content-Type: application/json" \
  -d '{"activity": {"kind": "call", "subject": "Intro call", "contact_id": "CONTACT_ID"}}'
```

## Plugins (Settings → Plugins)

Plugins are plain webhook URLs that fire directly on CRM events — no
automation needed. Anything with an HTTP endpoint works: Slack or Discord
webhooks, Make, n8n, Zapier catch hooks, or your own app.

1. Go to Settings → Plugins → New Plugin.
2. Enter a name, the webhook URL, and tick trigger events
   (`contact_created`, `deal_won`, …).
3. Save and keep it Active.

Each event POSTs JSON (no signature — use the signed Webhooks above when
you need verification or retries):

```json
{
  "event": "deal_won",
  "plugin": "Slack notifier",
  "data": { "id": "…", "title": "Big deal", "...": "full record JSON" },
  "timestamp": "2026-09-30T05:00:00Z"
}
```

Tips:

- Tokens are workspace-pinned and revocable; give each Zap its own token.
- Dedupe on your side with the record `id` from trigger payloads.
- Imports (`POST /api/v1/import/csv`, multipart) accept a `mapping` JSON
  field and `dedupe=skip|update` for bulk upserts.
- Prefer polling `GET` list endpoints with `?page=` over scraping the UI;
  `per_page` caps at 100.
