# Changelog

## 0.4.0 - 2026-10-28

- Added a built-in DSH Web panel through the official `sidebar.panellist` and `main` slots.
- Added client bundle using the required `window.__ModuleLoader__.load({ id, factory })` registration.
- Fixed a client registration failure that prevented DSH Web from activating `bughunt-kit`.
- Panel now shows genuine data: every tool records its run into a process-local store served through the `/bughunt.dashboard` host command.
- Responsive layout: stat grid and tool/skill cards adapt at 760px and 1080px breakpoints.
- Added dashboard regression coverage for the client registration, panel surface, and data flow.
- Panel is defensive-only: no automatic target probing, RPC, signing, broadcasting, or exploit output.

## 0.3.0 - 2026-10-27

- Added local EVM calldata decoding for common token and NFT selectors.
- Added ERC-20 allowance and ERC-721 operator approval risk explanations.
- Added a defensive smart-contract review checklist.
- Added Web3 review skill, fixture, and tests.
- Web3 tools never use RPC, sign, broadcast, or generate exploits.

## 0.2.0 - 2026-10-27

- Added `bughunt.openapi-inventory` for bounded, user-supplied OpenAPI 3 inventory.
- Added API inventory skill and sample OpenAPI fixture.
- Added GitHub Actions CI for typecheck, tests, packaging, and skill frontmatter.
- Added CI status badge to the README.

## 0.1.0 - 2026-10-27

- Initial portfolio scaffold.
- Added authorized assessment scope validation.
- Added JavaScript endpoint and source-map hint analysis.
- Added credential-shaped value redaction.
- Added Markdown report generation.
- Added three bundled methodology skills.
- Added the initial portfolio repository metadata and DSH compatibility declaration.
