/**
 * Host Remote service backing the bughunt Web panel.
 *
 * Exposes the process-local dashboard through an optional `bughuntDashboard`
 * Remote namespace. Registration is best-effort: if the Typert protocol
 * package is unavailable the plugin still boots and the panel falls back to
 * the `/bughunt.dashboard` host command.
 *
 * @module bughunt-kit/assessment-service
 */

import type { DashboardResult } from './assessment-remote.js'
import { dashboardResult } from './assessment-remote.js'

/** Lazily load TypertRemoteService so the plugin boots without it. */
async function loadBase(): Promise<new (...args: never[]) => { ctx: unknown }> {
  const mod = (await import('@deepseek-ai/dsh-typert-protocol')) as unknown as {
    TypertRemoteService: new (...args: never[]) => { ctx: unknown }
  }
  return mod.TypertRemoteService
}

let cachedBase: Promise<new (...args: never[]) => { ctx: unknown }> | null = null

/** Build the service class once the protocol package resolves. */
export async function createBughuntDashboardService(): Promise<
  (new (ctx: unknown) => { read(): Promise<{ ok: true; value: DashboardResult }> }) | null
> {
  try {
    cachedBase ??= loadBase()
    const Base = await cachedBase
    return class BughuntDashboardService extends Base {
      constructor(ctx: unknown) {
        super(ctx as never, 'bughuntDashboard' as never)
      }

      async read(): Promise<{ ok: true; value: DashboardResult }> {
        return { ok: true, value: dashboardResult() }
      }
    } as unknown as new (ctx: unknown) => {
      read(): Promise<{ ok: true; value: DashboardResult }>
    }
  } catch {
    return null
  }
}
