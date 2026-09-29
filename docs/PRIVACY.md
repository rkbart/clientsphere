# Privacy

## Data protection responsibilities

ClientSphere is a tool that helps you manage customer data. You are responsible for complying with applicable data protection laws, including:

- **Philippine Data Privacy Act of 2012 (RA 10173)**
- **General Data Protection Regulation (GDPR)** if you handle EU residents' data
- **California Consumer Privacy Act (CCPA)** if you handle California residents' data

## Your responsibilities

- Obtain consent before collecting personal data
- Provide data subjects with access to their data
- Allow data subjects to request deletion
- Implement appropriate security measures
- Report data breaches as required by law

## ClientSphere features for compliance

- **Per-contact export**: Export individual contact data
- **Per-contact erase**: Delete individual contact data
- **Account-level export**: Export all data for an account (CSV)
- **AI privacy**: AI calls are logged (metadata only, not content)

## AI data handling

- AI is opt-in per account; off by default
- UI clearly states: "Selected CRM data is sent to <provider>"
- Optional redaction toggle masks emails/phones before sending — applied
  server-side in both server and browser-direct modes
- Local models (Ollama / LM Studio): browser-direct mode sends prompts
  straight from your browser to localhost — data never leaves the device
- Every AI call is rate limited (30 / IP / 5 min) and logged to `ai_logs`
  (action, provider, model, success, duration — never prompt/completion text)
- API keys are encrypted at rest and never returned by the API

## Self-hosting

If you self-host ClientSphere:
- You control all data
- No data is sent to third parties (unless you configure AI)
- You are responsible for server security, backups, and compliance
- Document your privacy policy for your users

## Contact

For questions about ClientSphere's privacy practices, contact:
- GitHub: [github.com/rkbart](https://github.com/rkbart)
