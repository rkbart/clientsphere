# Security & Privacy

## Security measures

| Area | Measure |
|------|---------|
| Sessions | Bearer tokens returned on login; stored server-side as SHA-256 digests, revoked on logout; sent as `Authorization: Bearer <token>` |
| Tenant isolation | Explicit `account_id` scoping + Pundit `policy_scope` on index actions; `ApplicationPolicy` rejects records from other accounts (403) |
| Authorization | Pundit on every action; roles: owner, admin, member, viewer. Owner count capped at 2 (`OWNER_LIMIT`); only owners may grant/revoke the admin role or invite an admin, so the admin tier can't self-replicate. Workspace-wide settings (email, plugins, pipelines, webhooks, API tokens, import/export) authorize as owner/admin; the UI additionally hides the form |
| Secrets | Rails `encrypts` for webhook secrets (write-only, never returned by the API) |
| Rate limiting | rack-attack on auth and import endpoints, JSON 429 responder |
| Webhooks | HMAC signature header (`X-Webhook-Signature`), retries with exponential backoff (3 attempts), delivery log with response status |
| CSV export | Escape cells starting with `=`, `+`, `-`, `@` (formula injection) |
| Outbound email | Composed bodies are HTML-escaped (`ERB::Util.html_escape`) before being sent as the provider's `html` part, so a message body can't inject markup into a sent email |
| Passwords | bcrypt |
| Password reset | Single-use token stored as a SHA-256 digest, 2-hour expiry, one live reset per user; request endpoint always returns 201 so it can't enumerate accounts; a successful reset destroys all active sessions for that user |
| Invite tokens | Raw token returned once at creation, only the digest is stored; 7-day expiry; re-inviting revokes the previous token |
| Dependencies | Brakeman + bundler-audit run in CI (informational); rubocop on every push |

### Not yet wired (installed but unused)

- `paper_trail` (gem + `versions` table present, no model enables it)
- `ransack`, `ssrf_filter`, `resend`, `jsonapi-serializer`
- Dependabot is not configured

## Privacy

- Per-contact export and erase endpoints (`GET /contacts/:id/export`, `DELETE /contacts/:id/erase`)
- Account-level data export (`GET /export/csv/:type`)
- Document your responsibilities under applicable data-protection laws (e.g. Philippine Data Privacy Act, GDPR) in `docs/PRIVACY.md`
