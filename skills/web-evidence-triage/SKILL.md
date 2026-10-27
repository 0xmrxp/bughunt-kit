---
name: bughunt-web-evidence-triage
description: "Use after evidence collection: triage HTTP metadata, endpoint inventory, headers, and JavaScript findings into reproducible observations with severity and next safe actions."
whenToUse: "Prefer when you have recon output, JS bundle text, headers, robots/sitemap data, or an OpenAPI document and need triage before reporting."
---

# Web Evidence Triage

## Procedure

1. Sort evidence into configuration, endpoint inventory, authentication boundary, and data-handling observations.
2. Use `bughunt.analyze-js` for supplied JavaScript text instead of guessing endpoint behavior.
3. Mark each observation as confirmed, needs verification, or informational.
4. Retain raw endpoint paths only when they cannot identify a private vulnerability; never publish secrets, tokens, session IDs, or private keys.
5. Recommend the next safe verification action for each confirmed observation.
