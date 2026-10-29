/**
 * Client-callable Host entry for the bughunt dashboard.
 *
 * Exposes the same in-memory dashboard every tool maintains, so the Web panel
 * renders genuine activity counts instead of a static shell. The payload is
 * read-only, process-local, bounded, and contains no secrets.
 *
 * @module bughunt-kit/assessment-remote
 */

import { dashboardSnapshot, type AssessmentDashboard } from './assessment-store.js'

/** Command name shared by the Host command registry and the client panel. */
export const DASHBOARD_COMMAND = 'bughunt.dashboard'

/** Remote namespace the Web panel calls directly — no session required. */
export const DASHBOARD_REMOTE = 'bughuntDashboard'

export interface DashboardResult {
  dashboard: AssessmentDashboard
  commands: readonly string[]
}

/** Build the dashboard payload returned to the Web panel. */
export function dashboardResult(): DashboardResult {
  return {
    dashboard: dashboardSnapshot(),
    commands: ['bughunt.scope', 'bughunt.report'],
  }
}
