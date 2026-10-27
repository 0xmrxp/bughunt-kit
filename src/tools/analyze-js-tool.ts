import { defineTool } from '@deepseek-ai/dsh-tools'
import { redactSensitive } from '../services/redaction.js'

const ENDPOINT_PATTERN = /\/[A-Za-z0-9_./?=&%:-]{3,}/g
const SOURCE_MAP_PATTERN = /\/[A-Za-z0-9_./-]+\.map\b/gi

/**
 * `bughunt.analyze-js` parses JavaScript text already retrieved by the agent and
 * extracts endpoint- or map-shaped strings. It never fetches URLs by itself.
 */
export const analyzeJsTool = defineTool({
  name: 'bughunt.analyze-js',
  description: 'Extract endpoints and source-map hints from supplied JavaScript text.',
  parameters: {
    file: { type: 'string', required: true, description: 'Label or bundle filename' },
    content: { type: 'string', required: true, description: 'JavaScript text already retrieved' },
  },
  output: {
    schema: { type: 'json' },
    render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  },
  async execute(args, exec) {
    if (exec.signal.aborted) throw exec.signal.reason
    if (args.content.length > 500_000) {
      throw new Error('content is too large; supply a smaller bundle slice')
    }

    const endpoints = new Set<string>()
    for (const match of args.content.match(ENDPOINT_PATTERN) ?? []) {
      if (match.includes('/api/') || match.includes('/graphql') || match.includes('.json') || match.startsWith('/v')) {
        endpoints.add(match)
      }
    }
    const sourceMaps = Array.from(new Set(args.content.match(SOURCE_MAP_PATTERN) ?? []))
    const redaction = redactSensitive(args.content)

    return {
      file: args.file,
      endpoints: Array.from(endpoints).slice(0, 100),
      sourceMaps: sourceMaps.slice(0, 25),
      redactedSecretPatterns: redaction.matches,
    }
  },
})
