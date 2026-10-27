import type { AssessmentReport } from '../types/assessment.js'

/** Render a compact Markdown report with no hidden network or filesystem side effects. */
export function renderMarkdownReport(report: AssessmentReport): string {
  const lines = [
    '# Authorized Web Security Assessment',
    '',
    `- Target: ${report.target}`,
    `- Mode: ${report.mode}`,
    `- Generated: ${report.generatedAt}`,
    '',
    '## Executive summary',
    '',
    report.executiveSummary,
    '',
    '## Findings',
    '',
  ]

  if (report.findings.length === 0) {
    lines.push('No findings were recorded by the configured checks.')
    return `${lines.join('\n')}\n`
  }

  for (const finding of report.findings) {
    lines.push(`### ${finding.severity.toUpperCase()}: ${finding.title}`)
    lines.push('', `- ID: ${finding.id}`, `- Asset: ${finding.asset}`, '', '**Evidence**', '', finding.evidence, '', '**Safe reproduction**', '')
    lines.push(...finding.reproduction.map((step, index) => `${index + 1}. ${step}`))
    lines.push('', '**Impact**', '', finding.impact, '', '**Remediation**', '', finding.remediation, '')
  }

  return `${lines.join('\n')}\n`
}
