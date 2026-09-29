# Security & Privacy

## Security measures

| Area | Measure |
|------|---------|
| Sessions | httpOnly, Secure, SameSite=Lax cookie; same-origin via Next rewrites; CSRF protection on state-changing requests |
| Tenant isolation | `acts_as_tenant` on every model; request specs that prove account A cannot read/write account B for **every** resource |
| Authorization | Pundit on every action; roles: owner, admin, member, viewer |
| Secrets | Rails `encrypts` for AI keys and webhook secrets; never returned by the API |
| Rate limiting | rack-attack on login, signup, invitations, AI, import |
| Webhooks | HMAC signature header, retries with backoff, `ssrf_filter` to block private/internal targets, delivery log |
| Enrichment fetch | Same SSRF guard, response size and timeout limits |
| CSV import | Size and row caps, background processing, per-row error report |
| CSV export | Escape cells starting with `=`, `+`, `-`, `@` (formula injection) |
| Search | Ransack allow-lists only |
| Audit | paper_trail on core models |
| Dependencies | Dependabot + `bundler-audit` + `pnpm audit` in CI; Brakeman |

## Privacy

- Per-contact export and erase endpoints
- Account-level data export
- Privacy note for AI
- Document your responsibilities under applicable data-protection laws (e.g. Philippine Data Privacy Act, GDPR) in `docs/PRIVACY.md`
