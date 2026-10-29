import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const client = await readFile(new URL('../client.js', import.meta.url), 'utf8')

test('client module registers the exact package id', () => {
  assert.match(client, /window\.__ModuleLoader__\.load\(/)
  assert.match(client, /id:\s*['"]bughunt-kit['"]/)
  assert.match(client, /factory\(require\)/)
  assert.match(client, /inject:\s*\['slots', 'layout', 'locale', 'remote', 'remote\.commands', 'sessions'\]/)
  assert.doesNotMatch(client, /remote\.bughuntDashboard'/)
})

test('client module contributes a main panel and sidebar entry', () => {
  assert.match(client, /ctx\.slots\.inject\('main'/)
  assert.match(client, /ctx\.slots\.inject\('sidebar\.panellist'/)
  assert.match(client, /key:\s*'bughunt-kit'/)
  assert.match(client, /id:\s*'bughunt-kit'/)
  assert.match(client, /locale:\s*NS/)
})

test('client panel is responsive and renders content', () => {
  assert.match(client, /window\.innerWidth/)
  assert.match(client, /repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(client, /data-bughunt-panel/)
  assert.match(client, /Assessment dashboard/)
})

test('client panel reads live dashboard data', () => {
  assert.match(client, /bughuntDashboard/)
  assert.match(client, /dashboard\.read\(\{\}\)/)
  assert.match(client, /remote\.commands\.execute/)
  assert.match(client, /\/bughunt\.dashboard/)
  assert.match(client, /dash\.recent\.map/)
})

test('client registration wires remote and sessions', () => {
  const registrations = []
  const window = { __ModuleLoader__: { load: (r) => registrations.push(r) } }
  const React = { createElement: () => ({}), useState: (v) => [v, () => {}], useEffect: () => {}, useCallback: (fn) => fn }
  new Function('window', 'require', client)(window, (name) => {
    if (name === 'react') return React
    throw new Error(name)
  })
  const seen = []
  registrations[0].factory((name) => React).apply({
    effect: (fn) => { fn(); return () => {} },
    locale: { register: (...a) => seen.push(['locale', a[0]]) },
    remote: { marker: true },
    sessions: { marker: true },
    slots: {
      inject: (slot, fn) => { seen.push([slot, fn().options]); return () => {} },
      register: (options) => ({ options }),
    },
  })
  const main = seen.find(([slot]) => slot === 'main')
  assert.ok(main, 'main slot registered')
  assert.equal(main[1].key, 'bughunt-kit')
  assert.deepEqual(main[1].inject(), { remote: { marker: true }, sessions: { marker: true } })
})
