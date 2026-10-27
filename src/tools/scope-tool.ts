import { defineTool } from '@deepseek-ai/dsh-tools'
import type { AssessmentScope } from '../types/assessment.js'
import { validateScope } from '../services/scope.js'

/**
 * `bughunt.scope` makes the authorization boundary explicit before anything else
 * runs. The tool does not contact the target; it normalizes and returns scope.
 */
export const scopeTool = defineTool({
  name: 'bughunt.scope',
  description: 'Register the authorized assessment scope before passive checks run.',
  parameters: {
    target: { type: 'string', required: true, description: 'Absolute http(s) target URL' },
    authorization: {
      type: 'string',
      required: true,
      description: 'owned, written-permission, or bug-bounty-program',
    },
    allowedPaths: {
      type: 'array',
      required: true,
      description: 'Path prefixes covered by the authorization',
    },
    mode: { type: 'string', description: 'passive or active; passive is default' },
    maxRequestsPerMinute: { type: 'integer', description: 'Rate limit from 1 to 600' },
  },
  output: {
    schema: { type: 'json' },
    render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  },
  async execute(args, exec) {
    if (exec.signal.aborted) throw exec.signal.reason
    const authorization = args.authorization
    if (authorization !== 'owned' && authorization !== 'written-permission' && authorization !== 'bug-bounty-program') {
      throw new Error('authorization must be owned, written-permission, or bug-bounty-program')
    }
    const allowedPaths = args.allowedPaths
    if (!Array.isArray(allowedPaths) || allowedPaths.some((path) => typeof path !== 'string')) {
      throw new Error('allowedPaths must be an array of strings')
    }
    const stringPaths = allowedPaths as string[]
    const scope = validateScope({
      target: args.target,
      authorization,
      allowedPaths: stringPaths,
      mode: args.mode === 'active' ? 'active' : 'passive',
      maxRequestsPerMinute: args.maxRequestsPerMinute ?? 30,
    } satisfies AssessmentScope)
    return { ...scope }
  },
})
