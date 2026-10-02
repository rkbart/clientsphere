# Security & Privacy

## Security measures

| Area | Measure |
|------|---------|
| Sessions | Bearer tokens returned on login; stored server-side as SHA-256 digests, revoked on logout; sent as `Authorization: Bearer <token>` |
| Tenant isolation | Explicit `account_id` scoping + Pundit `policy_scope` on index actions; `ApplicationPolicy` rejects records from other accounts (403) |
| Authorization | Pundit on every action; roles: owner, admin, member, viewer. Owner count capped at 2 (`OWNER_LIMIT`); only owners may grant/revoke the admin role or invite an admin, so the admin tier can't self-replicate. Workspace-wide settings (AI, email, plugins, pipelines, webhooks, API tokens, import/export) authorize as owner/admin; the UI additionally hides the form |
| Secrets | Rails `encrypts` for AI provider keys and webhook secrets; AI key never returned by the API (write-only, `api_key_set` flag) |
| Rate limiting | rack-attack: 30 AI requests per IP per 5 minutes, JSON 429 responder |
| Webhooks | HMAC signature header (`X-Webhook-Signature`), retries with exponential backoff (3 attempts), delivery log with response status |
| CSV export | Escape cells starting with `=`, `+`, `-`, `@` (formula injection) |
| Passwords | bcrypt |
| Password reset | Single-use token stored as a SHA-256 digest, 2-hour expiry, one live reset per user; request endpoint always returns 201 so it can't enumerate accounts; a successful reset destroys all active sessions for that user |
| Invite tokens | Raw token returned once at creation, only the digest is stored; 7-day expiry; re-inviting revokes the previous token |
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
