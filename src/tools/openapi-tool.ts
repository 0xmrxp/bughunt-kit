import { defineTool } from '@deepseek-ai/dsh-tools'
import { redactSensitive } from '../services/redaction.js'
import { parseOpenApiDocument } from '../services/openapi.js'
import { recordRun } from '../assessment-store.js'

/**
 * `bughunt.openapi-inventory` inventories a user-supplied OpenAPI 3 document.
 * It accepts JSON text only and never fetches remote URLs.
 */
export const openApiTool = defineTool({
  name: 'bughunt.openapi-inventory',
  description: 'Inventory a supplied OpenAPI document: operations, auth, parameters, and risk signals.',
  parameters: {
    document: { type: 'string', required: true, description: 'OpenAPI 3 JSON text already supplied' },
    label: { type: 'string', description: 'Target or document label' },
  },
  output: {
    schema: { type: 'json' },
    render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  },
  async execute(args, exec) {
    if (exec.signal.aborted) throw exec.signal.reason
    if (args.document.length > 2_000_000) {
      throw new Error('document is too large; trim it to the scoped paths first')
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(args.document)
    } catch {
      throw new Error('document must be valid JSON containing an OpenAPI 3 object')
    }
    const inventory = parseOpenApiDocument(parsed)
    const redaction = redactSensitive(args.document)
    const label = args.label ?? 'supplied OpenAPI document'
    recordRun({
      tool: 'bughunt.openapi-inventory',
      at: new Date().toISOString(),
      summary: `${label}: ${inventory.operations.length} operation(s), ${inventory.operations.reduce((total, operation) => total + operation.riskSignals.length, 0)} risk signal(s)`,
    })
    return JSON.parse(JSON.stringify({
      label: args.label ?? 'supplied OpenAPI document',
      ...inventory,
      redactedPatterns: redaction.matches,
    }))
  },
})
