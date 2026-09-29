# AI Features

## Architecture: Server-side by default

| Mode | Used for | Where keys live | Where data goes |
|------|----------|-----------------|-----------------|
| **Server** (default) | Chat, drafting, suggestions, enrichment, summaries | `account_ai_settings.api_key`, encrypted | Rails → chosen provider |
| **Browser-direct** (local models only) | Chat, drafting with Ollama / LM Studio | Not needed | Browser → localhost; never leaves the device |

This removes API keys from localStorage and keeps CRM context assembly in one audited place.

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
| Chat with CRM context | `/ai/chat` | Retrieves only relevant records (scoped to account) |
| Draft email | `/ai/draft_email` | Uses contact/deal fields the user selects |
| Suggest next action | `/ai/suggest_next_action` | From recent activity + stage |
| Enrich company | `/ai/enrich` | SSRF-guarded fetch + LLM extraction; user confirms |
| Summarize deal | `/ai/summarize_deal` | Timeline → summary |
| Lead score | `/contacts/:id/score` | Rules-based; LLM only phrases advice |

## Lead scoring (rules-based)

Score 0–100 from configurable weights:
- Recency of last activity
- Number of activities in 30 days
- Open deal value
- Stage progress
- Email engagement
- Missing key fields (penalty)

Each score stores `score_reasons` for explainability. Recomputed by Solid Queue job on relevant events.

## Privacy controls

- AI is opt-in per account (`enabled`); off by default
- UI states: "Selected CRM data is sent to <provider>"
- Optional redaction toggle (mask emails/phones before sending)
- Every AI call is rate limited and logged (metadata only, not content)

## Settings page

Provider selector (with local/free badges) → API key (write-only, shows "saved") → model preset or custom id → base URL override (custom/local) → Test connection → Mode badge (Server / Local) → Save
