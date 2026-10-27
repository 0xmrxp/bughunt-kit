# Architecture

`bughunt-kit` ships as a single additive Cordis bundle. `cordis.patch.yml` registers one plugin row; `src/index.ts` owns the plugin lifecycle.

## Components

- `src/tools/scope-tool.ts`: normalizes scope and rate limits. It never contacts the target.
- `src/tools/analyze-js-tool.ts`: analyzes user-supplied JavaScript text. It does not fetch URLs or execute scripts.
- `src/tools/openapi-tool.ts`: inventories a supplied OpenAPI 3 JSON contract without network access.
- `src/tools/web3-tools.ts`: exposes local calldata, approval-risk, and checklist tools.
- `src/tools/report-tool.ts`: renders evidence supplied by prior steps into Markdown.
- `src/services/*`: pure helpers for validation, redaction, OpenAPI, Web3 inventory, and report formatting.
- `src/skills.ts`: file-based bundled skill provider for the three methodology skills.
- `skills/*`: authorization, evidence triage, and report-writing methodology.

## Design choices

- No implicit network access in v0.1.
- Every sensitive-shaped value is redacted before it leaves the services layer.
- Tools declare JSON-compatible outputs so results can be persisted, audited, and rendered safely.
- AbortSignal is honored on every execution path.
