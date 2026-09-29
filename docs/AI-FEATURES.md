# AI Features

## Architecture: server-side by default, browser-direct for local models

| Mode | Used for | Where keys live | Where data goes |
|------|----------|-----------------|-----------------|
| **Server** (default) | Chat, drafting, suggestions, enrichment, summaries | `ai_settings.api_key`, encrypted (`encrypts`) | Rails → chosen provider |
| **Browser-direct** (local models only) | Chat, drafting with Ollama / LM Studio / custom local endpoints | Not needed | Browser → localhost; never leaves the device |

Both modes assemble CRM context **server-side** (`Ai::Context`, `Ai::Prompts`),
so what gets sent is one audited place. Browser-direct fetches the assembled
prompt pair from `POST /ai/prompts` and then sends it straight from the
browser to the local provider — the Rails server never forwards your CRM data
to any remote API in that mode.

## Providers

One OpenAI-compatible client (configurable `base_url`) plus one Anthropic client.

| Preset | Notes |
|--------|-------|
| Ollama, LM Studio | Local, private (browser-direct or server → host) |
| OpenRouter | Includes free-tier models |
| Groq, Google Gemini | Free tiers (limits change — check provider) |
| DeepSeek, OpenAI | Pay-as-you-go |
| Anthropic | Pay-as-you-go |
| Custom | Any OpenAI-compatible endpoint |

## Functions

| Function | Endpoint | Notes |
|----------|----------|-------|
| Settings | `GET/PATCH /ai/settings` | Write-only key: never returned, blank keeps stored key; `api_key_set` flag |
| Test connection | `POST /ai/test_connection` | `{ success, message }` |
| Browser-direct prompts | `POST /ai/prompts` | Assembled + redaction-masked prompt pair; no provider call |
| Chat with CRM context | `POST /ai/chat` | Keyword-matches contacts/deals/tasks (pool 100, top 5) + totals, account-scoped |
| Draft email | `POST /ai/draft_email` | Contact + its open deals/recent activities; optional `deal_id` adds that deal's context |
| Suggest next action | `POST /ai/suggest_next_action` | Record payload + recent activities; single sentence |
| Enrich company | `POST /ai/enrich` | LLM knowledge only (no outbound fetch); preview diff, user confirms before PATCH |
| Summarize deal | `POST /ai/summarize_deal` | Deal payload + last 10 activities → 3 bullet points |
| Lead score | `POST /contacts/:id/score` | Rules-based; not an LLM call |

## Where AI shows up in the UI

- **Settings → AI** — provider, model, key, endpoint, Enable toggle, redaction, Test connection
- **`/ai` chat page** — scoped-context assistant
- **Contact detail** — Draft Email card + Next action insight + Re-score button
- **Deal detail** — Draft Email (when the deal has a contact) + suggest/summarize
- **Company detail** — Enrich from domain with Apply/Discard confirmation
- **Dashboard** — Next best action widget (most urgent open deal)

## Lead scoring (rules-based)

Score 0–100 from weights:
- Recency of last activity
- Number of activities in 30 days
- Open deal value
- Stage progress
- Email engagement
- Missing key fields (penalty)

Each score stores `score_reasons` for explainability. Recompute on demand with
the **Re-score** button on a contact (`POST /contacts/:id/score`) — no
background job involved.

## Privacy controls

- AI is opt-in per account (`enabled`, default off); usage endpoints return
  `422` until configured and enabled
- UI states: "Selected CRM data is sent to <provider>"
- Optional redaction toggle masks emails/phones server-side before sending —
  applied even in browser-direct mode (`Ai::Client#prepare`)
- Rate limited: 30 AI requests per IP per 5 minutes (rack-attack)
- Every provider call is logged to `ai_logs` (metadata only: action, provider,
  model, success, duration, error class — never prompt/completion content)

## Settings page

Provider selector (with local/free badges) → API key (write-only, shows "Saved") → model preset or custom id → base URL override (custom/local) → Server/Local mode badge → Enable AI toggle → Redact PII toggle → Test connection → Save
