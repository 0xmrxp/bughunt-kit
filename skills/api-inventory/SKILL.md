---
name: bughunt-api-inventory
description: "Use when a user supplies an OpenAPI 3 document for authorized review. Inventory operations, authentication schemes, parameters, request bodies, response codes, and risk signals without fetching or probing the API."
whenToUse: "Prefer after scope declaration and before API security review when an OpenAPI JSON document or exported contract is available."
---

# OpenAPI Inventory

1. Confirm the document belongs to the authorized target and is limited to approved paths.
2. Run `bughunt.openapi-inventory` on the supplied JSON text; this tool does not fetch URLs.
3. Review operations with missing security declarations, state-changing methods, sensitive paths, and credential-shaped parameters.
4. Treat an inventory signal as a review lead, not proof of a vulnerability.
5. Continue with safe API authorization and input-validation review; never send mutation requests without explicit scope and approval.
