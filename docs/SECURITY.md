# Security & Privacy

## Security measures

| Area | Measure |
|------|---------|
| Sessions | Bearer tokens returned on login; stored server-side as SHA-256 digests, revoked on logout; sent as `Authorization: Bearer <token>` |
| Tenant isolation | Explicit `account_id` scoping + Pundit `policy_scope` on index actions; `ApplicationPolicy` rejects records from other accounts (403) |
| Authorization | Pundit on every action; roles: owner, admin, member, viewer |
| Secrets | Rails `encrypts` for AI provider keys and webhook secrets; AI key never returned by the API (write-only, `api_key_set` flag) |
| Rate limiting | rack-attack: 30 AI requests per IP per 5 minutes, JSON 429 responder |
| Webhooks | HMAC signature header (`X-Webhook-Signature`), retries with exponential backoff (3 attempts), delivery log with response status |
| Enrichment | No outbound HTTP fetch — enrichment uses LLM knowledge only, so there is no SSRF surface |
| CSV export | Escape cells starting with `=`, `+`, `-`, `@` (formula injection) |
| Passwords | bcrypt |
| AI logging | `ai_logs` stores metadata only (action, provider, model, success, duration, error class) — never prompts or completions |
| Dependencies | Brakeman + bundler-audit run in CI (informational); rubocop on every push |

### Not yet wired (installed but unused)

- `paper_trail` (gem + `versions` table present, no model enables it)
- `ransack`, `ssrf_filter`, `resend`, `jsonapi-serializer`
- Dependabot is not configured

## Privacy

- Per-contact export and erase endpoints (`GET /contacts/:id/export`, `DELETE /contacts/:id/erase`)
- Account-level data export (`GET /export/csv/:type`)
- AI is opt-in per account, off by default; optional PII redaction before any provider call
- Document your responsibilities under applicable data-protection laws (e.g. Philippine Data Privacy Act, GDPR) in `docs/PRIVACY.md`
