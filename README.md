# bughunt-kit

> Portfolio project by [@0xmrxp](https://github.com/0xmrxp), built for DeepSeek Harness plugin development.

[![CI](https://github.com/0xmrxp/bughunt-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/0xmrxp/bughunt-kit/actions/workflows/ci.yml)
[![DSH Plugin](https://img.shields.io/badge/DSH-plugin-0f766e)](https://github.com/topics/dsh-plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Authorized web security assessment workflows for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).

> **Authorized use only.** Use this plugin only against systems you own, systems covered by written permission, or assets explicitly in scope for a bug-bounty program.

## Why this project

`bughunt-kit` is an evidence-first DSH plugin for turning an authorized assessment into a scoped, reproducible, redacted report. The first release intentionally favors safe passive analysis over exploit automation.

## Demo

The repository includes a reproducible local fixture and a browser-recorded walkthrough:

![bughunt-kit demo](docs/assets/bughunt-kit-demo.gif)

The demo shows the complete safe path: an owned local fixture, passive scope registration, evidence collection, redaction, endpoint triage, and Markdown report generation. It does not probe a public target and contains no exploit payloads.

Run it locally:

```bash
npm run demo:serve
# open http://127.0.0.1:18080 in a browser
# click "Run demo"
```

To regenerate screenshots and the GIF with Playwright:

```bash
PLAYWRIGHT_BROWSERS_PATH=/tmp/bughunt-playwright-browsers npm run demo:capture
```

See [`demo/README.md`](demo/README.md) for the fixture details.

## What v0.2 provides

Everything in v0.1, plus:

- `bughunt.openapi-inventory`: inventory a supplied OpenAPI 3 JSON document into operations, servers, auth schemes, parameters, response codes, and review leads.
- `bughunt-api-inventory`: a methodology skill for safe API contract review.
- OpenAPI analysis is bounded to 2 MB, accepts user-supplied JSON only, and never fetches or probes an API automatically.

The original v0.1 tools remain available:

- `bughunt.scope`: declare authorization, target paths, mode, and request budget before work starts.
- `bughunt.analyze-js`: extract endpoint and source-map hints from JavaScript text already supplied to the tool; no implicit fetching.
- `bughunt.report`: render collected evidence into a structured Markdown report.
- Four bundled skills: authorization boundary, evidence triage, API inventory, and vulnerability reporting.
- Secret-shaped values are redacted before analysis output is returned.

## Install from a checkout

```bash
dsh plugin --profile web add ./bughunt-kit
```

After installation, restart the DSH profile or use the host's plugin reload action.

## Example workflow

```text
Use the bughunt-authorized-assessment skill. The target is my local demo fixture.
Register a passive scope, analyze the supplied JavaScript bundle, and produce a
redacted Markdown report. Do not send requests outside the declared scope.
```

The tools are deliberately narrow. `bughunt.analyze-js` accepts text; it does not download a URL or execute JavaScript. Network reconnaissance and browser workflows should be explicitly composed by the user with a separate authorized tool and a declared scope.

## Architecture

```text
scope declaration
      ↓
passive evidence supplied by the user
      ↓
redaction + structured triage
      ↓
severity-ranked Markdown report
```

The Cordis bundle is additive. It registers tools and a skill provider without modifying DSH core configuration.

## Development

```bash
npm install
npm test
npm run typecheck
npm run smoke
npm pack --dry-run
```

Every push and pull request runs the same checks in GitHub Actions: typecheck, tests, package smoke test, and SKILL.md frontmatter validation.

The package declares `dsh.bundle.patch`, so a published package can be installed with:

```bash
dsh plugin --profile web add bughunt-kit
```

## Compatibility

The initial scaffold targets DSH `0.2.1-rc.2` and Node.js 20+. Update the compatibility matrix and run the smoke test before each release.

## Roadmap

- v0.1: scoped passive evidence and report MVP
- v0.2: OpenAPI inventory and API trust-boundary review
- v0.3: local Web3 calldata and approval-risk explanation
- v0.4: optional Web UI for assessment history and evidence counts

## License

MIT. See [LICENSE](LICENSE) and [SECURITY.md](SECURITY.md).
