---
name: bughunt-authorized-assessment
description: "Use before any assessment work: declare scope and authorization, keep checks passive and evidence-first, rate-limit every request, redact secrets, and refuse unauthorized or destructive targets."
whenToUse: "Prefer at the start of every assessment task, security review, reconnaissance request, or bug-bounty workflow."
---

# Authorized Assessment

This methodology is defensive and authorized-only. Do not use it against systems you do not own or lack explicit written permission to test.

## Boundary

- Allowed targets only: systems you own, systems with written permission, or an in-scope bug-bounty program asset.
- Refuse credential attacks, social engineering, phishing, malware, persistence, evasion, denial of service, destructive changes, and third-party production assets outside scope.
- Passive mode is the default. Active probing needs explicit approval and must stay inside the registered allowed paths.

## Procedure

1. Register scope with `bughunt.scope`, including target, authorization basis, allowed paths, mode, and rate limit.
2. Collect evidence passively before drawing conclusions: metadata, configuration responses, and explicitly supplied JavaScript.
3. Redact credential-shaped values before saving evidence or writing findings.
4. Map every claim to evidence plus safe reproduction steps.
5. End every assessment with remediation and severity-ranked reporting through `bughunt.report`.
