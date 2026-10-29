import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { analyzeJsTool } from './tools/analyze-js-tool.js'
import { openApiTool } from './tools/openapi-tool.js'
import { approvalRiskTool, contractReviewTool, decodeCalldataTool } from './tools/web3-tools.js'
import { reportTool } from './tools/report-tool.js'
import { scopeTool } from './tools/scope-tool.js'
import { dashboardResult, DASHBOARD_COMMAND } from './assessment-remote.js'
import { createBughuntSkillsProvider } from './skills.js'

/** Cordis plugin name; it matches the bundle patch row. */
export const name = 'bughunt-kit'
/** Services used by this plugin. */
export const inject = ['skills', 'tools']

/** Mount the scoped, evidence-first assessment tools and bundled methodology. */
export function apply(ctx: Context): void {
  ctx.tools.register(scopeTool)
  ctx.tools.register(analyzeJsTool)
  ctx.tools.register(openApiTool)
  ctx.tools.register(decodeCalldataTool)
  ctx.tools.register(approvalRiskTool)
  ctx.tools.register(contractReviewTool)
  ctx.tools.register(reportTool)
  ctx.skills.registerProvider(() => createBughuntSkillsProvider())
  try {
    const commands = (ctx as unknown as { commands?: { register: (entry: unknown) => unknown } }).commands
    if (commands) {
      commands.register({
        name: DASHBOARD_COMMAND,
        description: 'Read the bughunt-kit dashboard: tool run counts, guardrail posture, and recent runs.',
        input: {},
        recordInput: false,
        handler: () => ({ kind: 'success' as const, text: JSON.stringify(dashboardResult()) }),
      })
      ctx.logger.info('bughunt-kit: registered dashboard command')
    }
  } catch (error) {
    ctx.logger.warn(`bughunt-kit: dashboard command unavailable: ${String(error)}`)
  }
  ctx.logger.info('bughunt-kit: registered scoped assessment tools and skills')
}
