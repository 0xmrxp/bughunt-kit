# Threat model

## In scope

- Authorized assessors working on systems they own or have explicit permission to test.
- Evidence supplied explicitly by the user or locally available fixtures.
- Reporting derived from that evidence.
- OpenAPI contracts supplied as bounded JSON documents.

## Out of scope and refused

- Credential attacks, password spraying, and session hijacking.
- Exploit payloads or code execution against targets.
- Malware, persistence, evasion, or stealth behavior.
- Denial of service, resource exhaustion, or destructive modification.
- Production third-party systems outside documented authorization.

## Controls

- Scope is mandatory before triage and reporting.
- Passive mode is the default.
- Rate limits are part of scope.
- Secret-shaped values are redacted by design.
- Reports use safe reproduction steps instead of payloads.
- OpenAPI inventory never fetches server URLs or sends API requests.
- Documents over 2 MB are rejected to bound parser resource use.
