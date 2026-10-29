window.__ModuleLoader__.load({
  id: 'bughunt-kit',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'bughunt-kit'

    const STR = {
      panel: 'bughunt-kit',
      eyebrow: 'DeepSeek Harness plugin',
      title: 'bughunt-kit',
      subtitle: 'Evidence-first assessment workspace',
      dashboard: 'Assessment dashboard',
      dashboardBody: 'Live counts come from tool runs in this process. Nothing here probes a target on its own.',
      statRuns: 'Tool runs',
      statTools: 'Tools used',
      statActive: 'Active-scope runs',
      statReports: 'Reports',
      toolsTitle: 'Bundled tools',
      skillsTitle: 'Methodology skills',
      guardTitle: 'Guardrails',
      guardBody: 'Passive by default. Rate limited 1-600 requests per minute. Secrets redacted before output. No automatic probing, wallet signing, or exploit output.',
      recentTitle: 'Recent runs',
      empty: 'No activity yet. Run bughunt.scope or bughunt.report in a session to populate this panel.',
      loading: 'Loading dashboard…',
      loadError: 'Dashboard unavailable. The host command did not answer.',
      refresh: 'Refresh',
      reportAt: 'Latest report',
      never: 'none yet',
      commandsHint: 'Populate from a session:',
      scopeCmd: '/bughunt.dashboard',
    }

    const TOOLS = [
      'bughunt.scope', 'bughunt.analyze-js', 'bughunt.openapi-inventory',
      'bughunt.decode-calldata', 'bughunt.approval-risk',
      'bughunt.contract-review', 'bughunt.report',
    ]
    const SKILLS = [
      'bughunt-authorized-assessment', 'bughunt-web-evidence-triage',
      'bughunt-vulnerability-report', 'bughunt-api-inventory', 'bughunt-web3-review',
    ]

    const TOK = {
      bg: 'var(--dsw-alias-bg-base)',
      card: 'var(--dsw-alias-bg-secondary)',
      text: 'var(--dsw-alias-text-primary)',
      muted: 'var(--dsw-alias-text-secondary)',
      border: 'var(--dsw-alias-border-primary)',
      accent: 'var(--dsw-alias-accent-primary, #247bbf)',
      ok: 'var(--dsw-alias-status-success, #1a7f37)',
      warn: 'var(--dsw-alias-status-warning, #9a6700)',
    }

    function useViewport() {
      const get = () => {
        if (typeof window === 'undefined') return { compact: false, narrow: false }
        return { compact: window.innerWidth < 760, narrow: window.innerWidth < 1080 }
      }
      const [vp, setVp] = React.useState(get)
      React.useEffect(() => {
        const onResize = () => setVp(get())
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
      }, [])
      return vp
    }

    function shell(vp) {
      return {
        background: TOK.bg, color: TOK.text, minHeight: '100%',
        padding: vp.compact ? '16px 12px 32px' : '28px 24px 48px',
        boxSizing: 'border-box',
      }
    }
    function wrap() {
      return { maxWidth: 1080, margin: '0 auto', width: '100%', boxSizing: 'border-box' }
    }
    function hero(vp) {
      return {
        border: `1px solid ${TOK.border}`, background: TOK.card, borderRadius: 14,
        padding: vp.compact ? '18px 16px' : '26px 28px',
      }
    }
    function grid(vp) {
      return {
        display: 'grid', gap: 12, marginTop: 14,
        gridTemplateColumns: vp.compact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
      }
    }
    function card() {
      return {
        border: `1px solid ${TOK.border}`, background: TOK.bg, borderRadius: 12,
        padding: '14px 14px 12px', minWidth: 0,
      }
    }
    function twoCol(vp) {
      return {
        display: 'grid', gap: 12, marginTop: 12,
        gridTemplateColumns: vp.narrow ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr)',
      }
    }

    function Stat(props) {
      return h('div', { style: card() },
        h('div', { style: { fontSize: 26, fontWeight: 750, lineHeight: 1.1 } }, String(props.value)),
        h('div', { style: { fontSize: 12, color: TOK.muted, marginTop: 4 } }, props.label),
      )
    }

    function Chip(props) {
      return h('code', {
        style: {
          display: 'inline-block', border: `1px solid ${TOK.border}`, borderRadius: 6,
          padding: '2px 8px', margin: '0 6px 6px 0', fontSize: 12, background: TOK.bg,
        },
      }, props.children)
    }

    function RunRow(props) {
      const run = props.run
      const active = run.mode === 'active'
      return h('li', {
        style: {
          listStyle: 'none', borderTop: `1px solid ${TOK.border}`,
          padding: '10px 2px', fontSize: 13, lineHeight: 1.5,
        },
      },
        h('div', { style: { display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' } },
          h('strong', null, run.tool),
          active ? h('span', {
            style: {
              fontSize: 11, fontWeight: 700, color: TOK.warn,
              border: `1px solid ${TOK.warn}`, borderRadius: 10, padding: '0 8px',
            },
          }, 'ACTIVE') : null,
          h('span', { style: { marginLeft: 'auto', color: TOK.muted, fontSize: 12 } }, run.at),
        ),
        h('div', { style: { color: TOK.muted, marginTop: 2 } }, run.summary),
        run.target ? h('div', { style: { color: TOK.muted, fontSize: 12 } }, run.target) : null,
      )
    }

    function BughuntPanel(props) {
      const vp = useViewport()
      const remote = props.remote
      const sessions = props.sessions
      const [state, setState] = React.useState({ phase: 'loading', data: null })
      const load = React.useCallback(() => {
        setState({ phase: 'loading', data: null })
        Promise.resolve()
          .then(() => {
            const first = sessions && sessions.list ? sessions.list.getSnapshot() : []
            const ids = Array.isArray(first) ? first : (first && first.byId ? Object.keys(first.byId) : [])
            if (!ids.length) return null
            return remote.commands.execute(ids[0], '/bughunt.dashboard', [])
          })
          .then((result) => {
            if (!result || !result.ok || result.value === void 0) {
              setState({ phase: 'empty', data: null })
              return
            }
            try {
              const text = typeof result.value === 'string' ? result.value : result.value.text
              const parsed = JSON.parse(text)
              setState({ phase: 'ready', data: parsed.dashboard || null })
            } catch (e) {
              setState({ phase: 'error', data: null })
            }
          })
          .catch(() => setState({ phase: 'error', data: null }))
      }, [remote, sessions])
      React.useEffect(() => { load() }, [load])

      const dash = state.data
      const runs = dash ? dash.runs : 0
      const toolsUsed = dash ? dash.toolsUsed.length : 0
      const activeRuns = dash ? dash.activeScopeRuns : 0
      const reports = dash ? dash.runsByTool['bughunt.report'] : 0

      return h('div', { 'data-bughunt-panel': true, style: shell(vp) },
        h('div', { style: wrap() },
          h('div', { style: { fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: TOK.muted } }, STR.eyebrow),
          h('div', {
            style: {
              display: 'flex', gap: 12, alignItems: vp.compact ? 'flex-start' : 'center',
              flexDirection: vp.compact ? 'column' : 'row', justifyContent: 'space-between', margin: '8px 0 2px',
            },
          },
            h('h1', { style: { margin: 0, fontSize: vp.compact ? 24 : 30, letterSpacing: '-0.01em' } }, STR.title),
            h('button', {
              type: 'button', onClick: load,
              style: {
                border: `1px solid ${TOK.border}`, background: TOK.bg, color: TOK.text,
                borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer',
              },
            }, STR.refresh),
          ),
          h('p', { style: { color: TOK.muted, margin: '4px 0 0', fontSize: 14 } }, STR.subtitle),
          h('section', { style: hero(vp) },
            h('h2', { style: { fontSize: 15, margin: '0 0 6px' } }, STR.dashboard),
            h('p', { style: { color: TOK.muted, margin: '0 0 4px', fontSize: 13, lineHeight: 1.5 } }, STR.dashboardBody),
            state.phase === 'loading' ? h('p', { style: { color: TOK.muted, fontSize: 13 } }, STR.loading) : null,
            state.phase === 'error' ? h('p', { style: { color: TOK.warn, fontSize: 13 } }, STR.loadError) : null,
            state.phase === 'empty' || (dash && runs === 0)
              ? h('p', { style: { color: TOK.muted, fontSize: 13 } }, `${STR.empty} ${STR.commandsHint} ${STR.scopeCmd}`)
              : null,
            h('div', { style: grid(vp) },
              h(Stat, { value: runs, label: STR.statRuns }),
              h(Stat, { value: toolsUsed, label: STR.statTools }),
              h(Stat, { value: activeRuns, label: STR.statActive }),
              h(Stat, { value: reports, label: STR.statReports }),
            ),
            dash && dash.latestReportAt
              ? h('p', { style: { color: TOK.muted, fontSize: 12, margin: '12px 0 0' } },
                `${STR.reportAt}: ${dash.latestReportAt}`)
              : null,
          ),
          h('div', { style: twoCol(vp) },
            h('section', { style: card() },
              h('h2', { style: { fontSize: 14, margin: '0 0 6px' } }, STR.toolsTitle),
              h('div', null, TOOLS.map((t) => {
                const count = dash ? dash.runsByTool[t] : 0
                return h(Chip, { key: t }, `${t} · ${count}`)
              })),
              h('h2', { style: { fontSize: 14, margin: '14px 0 6px' } }, STR.skillsTitle),
              h('div', null, SKILLS.map((s) => h(Chip, { key: s }, s))),
              h('h2', { style: { fontSize: 14, margin: '14px 0 6px' } }, STR.guardTitle),
              h('p', { style: { color: TOK.muted, fontSize: 13, lineHeight: 1.55, margin: 0 } }, STR.guardBody),
            ),
            h('section', { style: card() },
              h('h2', { style: { fontSize: 14, margin: '0 0 6px' } }, STR.recentTitle),
              !dash || !dash.recent.length
                ? h('p', { style: { color: TOK.muted, fontSize: 13, margin: 0 } }, STR.empty)
                : h('ul', { style: { margin: 0, padding: 0 } },
                  dash.recent.map((run, i) => h(RunRow, { key: `${run.tool}-${run.at}-${i}`, run }))),
            ),
          ),
        ),
      )
    }

    function BughuntPanelIcon(props) {
      const size = (props && props.size) || 18
      return h('span', {
        'aria-hidden': true,
        style: {
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: size, height: size, borderRadius: 6, fontSize: Math.max(9, Math.round(size * 0.52)),
          fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', background: TOK.accent,
        },
      }, 'BH')
    }

    return {
      inject: ['slots', 'layout', 'locale', 'remote', 'remote.commands', 'sessions'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en: { panel: STR.panel } }), 'bughunt-kit: dictionaries')
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: 'bughunt-kit', locale: NS,
          inject: () => ({ remote: ctx.remote, sessions: ctx.sessions }),
        }, BughuntPanel))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: 'bughunt-kit', order: 15, locale: NS,
          label: () => STR.panel,
        }, BughuntPanelIcon))
      },
    }
  },
})
