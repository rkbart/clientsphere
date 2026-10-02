# AI Features

Provider configuration lives in **Settings → AI**, ready for future AI
features. No AI features are currently enabled in the UI — chat, drafting,
insights, suggestions, summaries, and enrichment were removed in favor of
deterministic, rule-based equivalents.

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
| Lead score | `POST /contacts/:id/score` | Rules-based; not an LLM call |

## Where AI shows up in the UI

- **Settings → AI** — provider, model, key, endpoint, Enable toggle, redaction, Test connection
- **Contact detail** — Re-score button

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

- AI is opt-in per account (`enabled`, default off)
- Optional redaction toggle masks emails/phones server-side before sending
- Rate limited: 30 AI requests per IP per 5 minutes (rack-attack)
- Every provider call is logged to `ai_logs` (metadata only: action, provider,
  model, success, duration, error class — never prompt/completion content)

## Settings page

Provider selector (with local/free badges) → API key (write-only, shows "Saved") → model preset or custom id → base URL override (custom/local) → Server/Local mode badge → Enable AI toggle → Redact PII toggle → Test connection → Save
