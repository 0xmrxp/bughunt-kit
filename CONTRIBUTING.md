# Contributing

## Workflow

1. Create a feature branch from `main`.
2. Keep tools narrow, deterministic, and authorized-only.
3. Add or update tests for every behavior change.
4. Run `npm test` and `npm run typecheck` before opening a pull request.
5. Document security-relevant decisions in `docs/threat-model.md`.

## Release checklist

- Update `package.json` and `CHANGELOG.md`.
- Verify DSH compatibility in `dsh.compatibility`.
- Test a clean profile installation:
  ```bash
  dsh plugin --profile web add ./bughunt-kit
  ```
- Run `npm pack --dry-run` before publishing.
