import test from 'node:test'
import assert from 'node:assert/strict'

const store = await import('../lib/assessment-store.js')

test('dashboard records tool runs and latest report', () => {
  store.resetDashboard()
  store.recordRun({ tool: 'bughunt.scope', at: '2026-01-01T00:00:00.000Z', target: 'https://example.com/', mode: 'passive', summary: 'owned' })
  store.recordRun({ tool: 'bughunt.report', at: '2026-01-01T00:01:00.000Z', target: 'https://example.com/', summary: '# report' })
  const snapshot = store.dashboardSnapshot()
  assert.equal(snapshot.runs, 2)
  assert.deepEqual(snapshot.toolsUsed, ['bughunt.scope', 'bughunt.report'])
  assert.equal(snapshot.latestReportAt, '2026-01-01T00:01:00.000Z')
  assert.equal(snapshot.recent.length, 2)
  assert.equal(snapshot.recent[0].tool, 'bughunt.report')
})

test('dashboard counts active scope runs separately', () => {
  store.resetDashboard()
  store.recordRun({ tool: 'bughunt.scope', at: '2026-01-01T00:00:00.000Z', mode: 'active', summary: 'x' })
  store.recordRun({ tool: 'bughunt.scope', at: '2026-01-01T00:01:00.000Z', mode: 'passive', summary: 'y' })
  assert.equal(store.dashboardSnapshot().activeScopeRuns, 1)
})

test('dashboard result exposes commands for the panel', async () => {
  store.resetDashboard()
  const remote = await import('../lib/assessment-remote.js')
  assert.equal(remote.DASHBOARD_COMMAND, 'bughunt.dashboard')
  const result = remote.dashboardResult()
  assert.deepEqual(result.commands, ['bughunt.scope', 'bughunt.report'])
  assert.equal(typeof result.dashboard.runs, 'number')
})
