import { defineTool } from '@deepseek-ai/dsh-tools'
import type { AssessmentFinding } from '../types/assessment.js'
import { renderMarkdownReport } from '../services/report.js'

function isFinding(value: unknown): value is AssessmentFinding {
  if (typeof value !== 'object' || value === null) return false
  const finding = value as Record<string, unknown>
  return (
    typeof finding['id'] === 'string' &&
    typeof finding['title'] === 'string' &&
    typeof finding['asset'] === 'string' &&
    typeof finding['evidence'] === 'string' &&
    Array.isArray(finding['reproduction']) &&
    typeof finding['impact'] === 'string' &&
    typeof finding['remediation'] === 'string'
  )
}

/**
 * `bughunt.report` turns already-collected evidence into a Markdown assessment.
 * It formats text only and performs no network access or exploitation.
 */
export const reportTool = defineTool({
  name: 'bughunt.report',
  description: 'Format collected evidence into a Markdown security assessment report.',
  parameters: {
    target: { type: 'string', required: true, description: 'Assessed target URL' },
    mode: { type: 'string', description: 'passive or active' },
    executiveSummary: { type: 'string', required: true, description: 'Short summary' },
    findings: { type: 'array', description: 'Finding entries as JSON' },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args, exec) {
    if (exec.signal.aborted) throw exec.signal.reason
    const findings = Array.isArray(args.findings) ? args.findings.filter((finding) => isFinding(finding)) : []
    return renderMarkdownReport({
      target: args.target,
      mode: args.mode === 'active' ? 'active' : 'passive',
      generatedAt: new Date().toISOString(),
      executiveSummary: args.executiveSummary,
      findings,
    })
  },
})
