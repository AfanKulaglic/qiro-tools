import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ShieldCheck, RefreshCw } from 'lucide-react'
import {
  adminLogin,
  adminLogout,
  fetchAllLinks,
  fetchAllUsage,
  fetchAnalytics,
  fetchProGrants,
  fetchRecentLogs,
  grantProAdmin,
  isAdminSession,
  revokeProAdmin,
  type AnalyticsDay,
  type LinkRow,
  type LogEntry,
  type ProGrant,
  type UsageRow,
} from '@/services/adminService'

/**
 * Admin panel — /admin.
 *
 * Two-factor gate:
 *  1. Username + password (hash-verified, session in sessionStorage)
 *  2. Google sign-in — RTDB rules allow admin reads only for signed-in users,
 *     and Pro-grant writes additionally carry a secret write key validated
 *     server-side by the database rules.
 */

type Tab = 'overview' | 'users' | 'logs' | 'pro' | 'links'

const TOOL_LABELS: Record<string, string> = {
  'qr-generator': 'QR',
  shorten: 'Shorten',
  'image-converter': 'Image',
  'video-converter': 'Video',
  'audio-converter': 'Audio',
  'gif-maker': 'GIF',
  'utm-builder': 'UTM',
  'background-remover': 'BG',
  'image-enhancer': 'Enhance',
  'pdf-editor': 'PDF',
}

function fmt(n: number): string {
  return n.toLocaleString('en-US')
}

function fmtDate(ms: number): string {
  return ms ? new Date(ms).toLocaleString() : '—'
}

function Card({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="glass p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-[#8A8177] dark:text-white/50">{label}</div>
      <div className="mt-1 text-3xl font-bold text-[#1A1714] dark:text-white">{value}</div>
    </div>
  )
}

export default function AdminPage() {
  const [adminState, setAdminState] = useState<'yes' | 'no'>(() => (isAdminSession() ? 'yes' : 'no'))
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [usage, setUsage] = useState<UsageRow[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsDay[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [grants, setGrants] = useState<Record<string, ProGrant>>({})
  const [links, setLinks] = useState<LinkRow[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [grantKey, setGrantKey] = useState('')
  const [grantDays, setGrantDays] = useState('30')
  const [grantMsg, setGrantMsg] = useState<string | null>(null)

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminState])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminLogin(loginUser, loginPass)) {
      setLoginError(null)
      setLoginPass('')
      setAdminState('yes')
    } else {
      setLoginError('Wrong username or password.')
    }
  }

  const load = async () => {
    if (adminState !== 'yes') return
    setLoadError(null)
    try {
      const [u, a, l, g, linksData] = await Promise.all([
        fetchAllUsage(),
        fetchAnalytics(),
        fetchRecentLogs(),
        fetchProGrants(),
        fetchAllLinks(),
      ])
      setUsage(u)
      setAnalytics(a)
      setLogs(l)
      setGrants(g)
      setLinks(linksData)
    } catch (err) {
      setLoadError(String((err as Error)?.message ?? err))
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminState])

  const totals = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const todayRow = analytics.find((d) => d.day === today)
    return {
      todayActions: todayRow?.total ?? 0,
      allTimeActions: usage.reduce((s, r) => s + r.count, 0),
      signedIn: usage.filter((r) => !r.isAnon).length,
      anonDevices: usage.filter((r) => r.isAnon).length,
      totalLinks: links.length,
      totalClicks: links.reduce((s, l) => s + l.clicks, 0),
    }
  }, [analytics, usage, links])

  if (adminState === 'no') {
    return (
      <div className="container-max flex min-h-[70vh] max-w-md flex-col justify-center py-16">
        <div className="glass p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple text-white shadow-glow-soft">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-[#1A1714] dark:text-white">Admin panel</h1>
              <p className="text-sm text-[#8A8177] dark:text-white/50">Administrator access only.</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <div>
              <label htmlFor="admin-user" className="text-sm font-medium text-[#5C554C] dark:text-white/70">
                Username
              </label>
              <input
                id="admin-user"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                autoComplete="username"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-[#1A1714] outline-none transition focus:border-accent-blue dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="admin-pass" className="text-sm font-medium text-[#5C554C] dark:text-white/70">
                Password
              </label>
              <input
                id="admin-pass"
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-[#1A1714] outline-none transition focus:border-accent-blue dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="text-sm text-red-600 dark:text-red-400">{loginError}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple px-5 py-2.5 text-sm font-bold text-white shadow-glow-soft transition hover:brightness-110"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users & usage' },
    { id: 'logs', label: 'Activity log' },
    { id: 'pro', label: 'Pro grants' },
    { id: 'links', label: 'Short links' },
  ]

  return (
    <div className="container-max max-w-6xl py-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple text-white shadow-glow-soft">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1714] dark:text-white">Admin panel</h1>
            <p className="text-sm text-[#8A8177] dark:text-white/50">Signed in as afan</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white/70 px-3.5 py-1.5 text-sm font-medium text-[#5C554C] transition hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.08]"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </button>
          <button
            onClick={() => {
              adminLogout()
              setAdminState('no')
            }}
            className="rounded-lg border border-black/10 bg-white/70 px-3.5 py-1.5 text-sm font-medium text-[#5C554C] transition hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.08]"
          >
            Sign out
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-400/30 bg-red-500/5 p-3 text-sm font-medium text-red-700 dark:text-red-300">
          {loadError}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-black/[0.06] bg-white/50 p-1.5 dark:border-white/[0.07] dark:bg-white/[0.03]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-glow-soft'
                : 'text-[#5C554C] hover:bg-black/[0.04] dark:text-white/60 dark:hover:bg-white/[0.06]'
            }`}
          >
            {t.label}

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card label="Actions today" value={fmt(totals.todayActions)} />
            <Card label="Actions all time" value={fmt(totals.allTimeActions)} />
            <Card label="Signed-in users" value={fmt(totals.signedIn)} />
            <Card label="Anonymous devices" value={fmt(totals.anonDevices)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card label="Short links" value={fmt(totals.totalLinks)} />
            <Card label="Link clicks" value={fmt(totals.totalClicks)} />
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold">Actions per tool (last 7 days)</h2>
            <div className="glass overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black/[0.03] text-left text-xs uppercase tracking-wide text-[#8A8177] dark:bg-white/[0.04] dark:text-white/50">
                  <tr>
                    <Th>Day</Th>
                    {Object.keys(TOOL_LABELS).map((t) => (
                      <Th key={t}>{TOOL_LABELS[t]}</Th>
                    ))}
                    <Th>Total</Th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.slice(0, 7).map((d) => (
                    <tr key={d.day} className="border-t border-black/[0.05] dark:border-white/[0.06]">
                      <td className="px-4 py-2.5 font-medium">{d.day}</td>
                      {Object.keys(TOOL_LABELS).map((t) => (
                        <td key={t} className="px-4 py-2.5">{fmt(d.tools[t] ?? 0)}</td>
                      ))}
                      <td className="px-4 py-2.5 font-semibold">{fmt(d.total)}</td>
                    </tr>
                  ))}
                  {analytics.length === 0 && (
                    <tr>
                      <td colSpan={12} className="px-4 py-6 text-center text-[#8A8177] dark:text-white/50">No activity recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="glass overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/[0.03] text-left text-xs uppercase tracking-wide text-[#8A8177] dark:bg-white/[0.04] dark:text-white/50">
              <tr>
                <Th>Identity</Th>
                <Th>Actions used</Th>
                <Th>Last activity</Th>
                <Th>Pro</Th>
              </tr>
            </thead>
            <tbody>
              {usage.map((r) => {
                const g = grants[r.key]
                const active = g && g.expiresAt > Date.now()
                return (
                  <tr key={r.key} className="border-t border-black/[0.05] dark:border-white/[0.06]">
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {r.isAnon ? (
                        <span className="text-[#8A8177] dark:text-white/50">{r.key.slice(0, 17)}…</span>
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400">{r.key}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">{fmt(r.count)}</td>
                    <td className="px-4 py-2.5">{fmtDate(r.updatedAt)}</td>
                    <td className="px-4 py-2.5">
                      {active ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                          until {new Date(g.expiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setGrantKey(r.key)
                            setTab('pro')
                          }}
                          className="text-xs underline"
                        >
                          Grant
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {usage.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[#8A8177] dark:text-white/50">No usage data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}


      {tab === 'logs' && (
        <div className="glass overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/[0.03] text-left text-xs uppercase tracking-wide text-[#8A8177] dark:bg-white/[0.04] dark:text-white/50">
              <tr>
                <Th>When</Th>
                <Th>Tool</Th>
                <Th>Identity</Th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i} className="border-t border-black/[0.05] dark:border-white/[0.06]">
                  <td className="px-4 py-2.5">{l.ts ? fmtDate(l.ts) : l.day}</td>
                  <td className="px-4 py-2.5">{TOOL_LABELS[l.tool] ?? l.tool}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {l.uid ? (
                      <span className="text-blue-600 dark:text-blue-400">{l.uid.slice(0, 10)}…</span>
                    ) : (
                      <span className="text-[#8A8177] dark:text-white/50">{l.usageKey.slice(0, 14)}…</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-[#8A8177] dark:text-white/50">No log entries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}


          </button>
        ))}
      </div>

      {tab === 'pro' && (
        <div className="space-y-6">
          <div className="glass p-5">
            <h2 className="text-lg font-semibold">Grant Pro access</h2>
            <p className="mt-1 text-sm text-[#8A8177] dark:text-white/50">
              After a user pays (manually for now), paste their usage key here and grant access. Pro users get
              unlimited actions until the grant expires.
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-56 flex-1">
                <label className="text-xs font-medium uppercase text-[#8A8177] dark:text-white/50">Usage key (user-… or anon-…)</label>
                <input
                  value={grantKey}
                  onChange={(e) => setGrantKey(e.target.value)}
                  placeholder="user-XXXXXXXX or anon-XXXXXXXX"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-sm text-[#1A1714] outline-none transition focus:border-accent-blue dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase text-[#8A8177] dark:text-white/50">Days</label>
                <input
                  type="number"
                  value={grantDays}
                  onChange={(e) => setGrantDays(e.target.value)}
                  className="mt-1 w-24 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-sm text-[#1A1714] outline-none transition focus:border-accent-blue dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                />
              </div>
              <button
                onClick={async () => {
                  if (!grantKey.trim()) return
                  try {
                    await grantProAdmin(grantKey.trim(), Number(grantDays) || 30)
                    setGrantMsg(`Granted Pro to ${grantKey.trim()} for ${grantDays} days.`)
                    setGrantKey('')
                    void load()
                  } catch (err) {
                    setGrantMsg(`Failed: ${String((err as Error)?.message ?? err)}`)
                  }
                }}
                className="rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple px-4 py-2 text-sm font-bold text-white shadow-glow-soft transition hover:brightness-110"
              >
                Grant
              </button>
            </div>
            {grantMsg && <p className="mt-3 text-sm text-[#5C554C] dark:text-white/60">{grantMsg}</p>}
          </div>

          <div className="glass overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/[0.03] text-left text-xs uppercase tracking-wide text-[#8A8177] dark:bg-white/[0.04] dark:text-white/50">
                <tr>
                  <Th>Usage key</Th>
                  <Th>Expires</Th>
                  <Th>Granted by</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grants).map(([key, g]) => (
                  <tr key={key} className="border-t border-black/[0.05] dark:border-white/[0.06]">
                    <td className="px-4 py-2.5 font-mono text-xs">{key}</td>
                    <td className="px-4 py-2.5">{new Date(g.expiresAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5">{g.grantedBy}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={async () => {
                          await revokeProAdmin(key)
                          void load()
                        }}
                        className="text-xs text-red-600 underline dark:text-red-400"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
                {Object.keys(grants).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-[#8A8177] dark:text-white/50">No Pro grants yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {tab === 'links' && (
        <div className="glass overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/[0.03] text-left text-xs uppercase tracking-wide text-[#8A8177] dark:bg-white/[0.04] dark:text-white/50">
              <tr>
                <Th>Slug</Th>
                <Th>Destination</Th>
                <Th>Clicks</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.slug} className="border-t border-black/[0.05] dark:border-white/[0.06]">
                  <td className="px-4 py-2.5 font-medium">/{l.slug}</td>
                  <td className="max-w-xs truncate px-4 py-2.5 text-[#8A8177] dark:text-white/50">{l.longUrl}</td>
                  <td className="px-4 py-2.5">{fmt(l.clicks)}</td>
                  <td className="px-4 py-2.5">{fmtDate(l.createdAt)}</td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[#8A8177] dark:text-white/50">No links yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


function Th({ children }: { children?: ReactNode }) {
  return <th className="px-4 py-2.5">{children}</th>
}
