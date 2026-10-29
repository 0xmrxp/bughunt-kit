/**
 * In-memory dashboard: every bughunt tool records its run into a single Host
 * record so the Web panel can render live counts, recent runs, guardrail
 * posture, and the latest generated report per process.
 *
 * @module bughunt-kit/assessment-store
 */

export type AssessmentStoreToolName =
  | 'bughunt.scope'
  | 'bughunt.analyze-js'
  | 'bughunt.openapi-inventory'
  | 'bughunt.decode-calldata'
  | 'bughunt.approval-risk'
  | 'bughunt.contract-review'
  | 'bughunt.report'

export interface AssessmentStoreRun {
  tool: AssessmentStoreToolName
  at: string
  target?: string
  mode?: 'passive' | 'active'
  summary: string
}

export interface AssessmentDashboard {
  runs: number
  toolsUsed: AssessmentStoreToolName[]
  runsByTool: Record<AssessmentStoreToolName, number>
  activeScopeRuns: number
  latestReportAt: string | null
  latestReportPreview: string | null
  recent: AssessmentStoreRun[]
}

const MAX_RECENT = 12

const EMPTY_COUNTS: Record<AssessmentStoreToolName, number> = {
  'bughunt.scope': 0,
  'bughunt.analyze-js': 0,
  'bughunt.openapi-inventory': 0,
  'bughunt.decode-calldata': 0,
  'bughunt.approval-risk': 0,
  'bughunt.contract-review': 0,
  'bughunt.report': 0,
}

interface AssessmentStore {
  runs: AssessmentStoreRun[]
}

function state(): AssessmentStore {
  const store = globalThis as unknown as { __bughuntDashboard?: AssessmentStore }
  if (!store.__bughuntDashboard) store.__bughuntDashboard = { runs: [] }
  return store.__bughuntDashboard
}

/** Record one tool run; secrets must already be redacted by the tool layer. */
export function recordRun(run: AssessmentStoreRun): void {
  const store = state()
  store.runs.push(run)
  if (store.runs.length > 200) store.runs.splice(0, store.runs.length - 200)
}

/** Build the read-only dashboard payload served to the Web panel. */
export function dashboardSnapshot(): AssessmentDashboard {
  const store = state()
  const runsByTool: Record<AssessmentStoreToolName, number> = { ...EMPTY_COUNTS }
  for (const run of store.runs) {
    if (run.tool in runsByTool) runsByTool[run.tool] += 1
  }
  const toolsUsed = (Object.keys(runsByTool) as AssessmentStoreToolName[]).filter(
    (tool) => runsByTool[tool] > 0,
  )
  const reports = store.runs.filter((run) => run.tool === 'bughunt.report')
  const latestReport = reports.length > 0 ? reports[reports.length - 1] : undefined
  return {
    runs: store.runs.length,
    toolsUsed,
    runsByTool,
    activeScopeRuns: store.runs.filter(
      (run) => run.tool === 'bughunt.scope' && run.mode === 'active',
    ).length,
    latestReportAt: latestReport?.at ?? null,
    latestReportPreview: latestReport?.summary ?? null,
    recent: [...store.runs].slice(-MAX_RECENT).reverse(),
  }
}

/** Reset dashboard state; used only by tests. */
export function resetDashboard(): void {
  state().runs.length = 0
}
