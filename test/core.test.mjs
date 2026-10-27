import test from 'node:test'
import assert from 'node:assert/strict'
import { redactSensitive } from '../lib/services/redaction.js'
import { validateScope } from '../lib/services/scope.js'
import { renderMarkdownReport } from '../lib/services/report.js'

test('redacts credential-shaped values', () => {
  const result = redactSensitive('apiKey=super-secret-value and private-key=0x' + 'a'.repeat(64))
  assert.equal(result.matches >= 2, true)
  assert.equal(result.value.includes('super-secret-value'), false)
  assert.equal(result.value.includes('[REDACTED]'), true)
})

test('rejects a scope without absolute target', () => {
  assert.throws(() => validateScope({
    target: 'localhost',
    authorization: 'owned',
    allowedPaths: ['/'],
    mode: 'passive',
    maxRequestsPerMinute: 30,
  }))
})

test('renders a finding report', () => {
  const report = renderMarkdownReport({
    target: 'https://demo.test',
    mode: 'passive',
    generatedAt: '2026-01-01T00:00:00.000Z',
    executiveSummary: 'One informational observation.',
    findings: [{
      id: 'BH-001',
      title: 'Missing security header',
      severity: 'low',
      asset: 'https://demo.test',
      evidence: 'Header was absent in the supplied response.',
      reproduction: ['Request the authorized demo page.', 'Inspect response headers.'],
      impact: 'Reduces browser-side defense in depth.',
      remediation: 'Configure the header at the edge.',
      references: ['OWASP Secure Headers'],
    }],
  })
  assert.match(report, /BH-001/)
  assert.match(report, /LOW: Missing security header/)
})
