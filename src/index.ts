import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { analyzeJsTool } from './tools/analyze-js-tool.js'
import { openApiTool } from './tools/openapi-tool.js'
import { reportTool } from './tools/report-tool.js'
import { scopeTool } from './tools/scope-tool.js'
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
  ctx.tools.register(reportTool)
  ctx.skills.registerProvider(() => createBughuntSkillsProvider())
  ctx.logger.info('bughunt-kit: registered scoped assessment tools and skills')
}
