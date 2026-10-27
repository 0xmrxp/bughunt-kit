# Security Policy

## Authorized use

`bughunt-kit` is for defensive security work on systems you own or are explicitly authorized to assess. Users are responsible for target authorization, scope, rate limits, and applicable law.

The project does not provide credential attacks, exploit delivery, persistence, evasion, destructive actions, denial-of-service features, or stealth controls.

## Reporting a vulnerability in this plugin

Please open a private GitHub security advisory when the repository is published. Do not include secrets, live target credentials, session tokens, or personal data in an issue.

## Data handling

- Tools are designed to process user-supplied evidence.
- Credential-shaped values are redacted before analysis output.
- The v0.1 scaffold has no telemetry and no remote storage service.
- Review reports before sharing them externally.
