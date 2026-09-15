/**
 * Admin panel data layer.
 *
 * Admin identity is enforced SERVER-SIDE via RTDB rules: reading `admins`,
 * `usageLog`, `analytics` and writing `proGrants` only succeeds when the
 * caller's uid exists under `admins`. A non-admin simply gets permission
 * errors — there is nothing to bypass client-side.
 *
 * The first admin must be created once in the Firebase console (or by an
 * existing admin): admins/{uid} = { email, createdAt }.
 */
import { get, ref, set, remove, onValue } from 'firebase/database'
import { db } from '@/lib/firebase'

export interface AdminInfo {
  email: string
  createdAt: number
}

export interface UsageRow {
  key: string
  count: number
  updatedAt: number
  isAnon: boolean
}

export interface AnalyticsDay {
  day: string
  tools: Record<string, number>
  total: number
}

export interface LogEntry {
  tool: string
  day: string
  uid: string | null
  ts: number
  usageKey: string
}

export interface ProGrant {
  expiresAt: number
  grantedBy: string
  grantedAt: number
}

/* ── Admin status ─────────────────────────────────────────────────────────── */

/** Reads whether a uid is an admin. */
export async function isAdmin(uid: string): Promise<boolean> {
  const snap = await get(ref(db, `admins/${uid}`))
  return snap.exists()
}

/** Live subscription on the admins node (used to gate the admin UI). */
export function subscribeAdmins(cb: (admins: Record<string, AdminInfo>) => void): () => void {
  return onValue(ref(db, 'admins'), (snap) => cb(snap.val() ?? {}), () => cb({}))
}

/* ── Usage overview ───────────────────────────────────────────────────────── */

/** All usage counters (anon fingerprints + signed-in users). */
export async function fetchAllUsage(): Promise<UsageRow[]> {
  const snap = await get(ref(db, 'usage'))
  const value = (snap.val() ?? {}) as Record<string, { count?: number; updatedAt?: number }>
  return Object.entries(value)
    .map(([key, v]) => ({
      key,
      count: Number(v.count ?? 0),
      updatedAt: Number(v.updatedAt ?? 0),
      isAnon: key.startsWith('anon-'),
    }))
    .sort((a, b) => b.count - a.count)
}

/** Aggregate per-day, per-tool counters. */
export async function fetchAnalytics(): Promise<AnalyticsDay[]> {
  const snap = await get(ref(db, 'analytics'))
  const value = (snap.val() ?? {}) as Record<string, Record<string, number>>
  return Object.entries(value)
    .map(([day, tools]) => ({
      day,
      tools,
      total: Object.values(tools).reduce((s, n) => s + Number(n ?? 0), 0),
    }))
    .sort((a, b) => b.day.localeCompare(a.day))
}

/** Recent detailed log entries, newest first, capped for performance. */
export async function fetchRecentLogs(limit = 200): Promise<LogEntry[]> {
  const snap = await get(ref(db, 'usageLog'))
  const value = (snap.val() ?? {}) as Record<string, Record<string, { tool?: string; day?: string; uid?: string | null; ts?: number }>>
  const rows: LogEntry[] = []
  for (const [usageKey, entries] of Object.entries(value)) {
    for (const entry of Object.values(entries ?? {})) {
      rows.push({
        usageKey,
        tool: String(entry.tool ?? '?'),
        day: String(entry.day ?? ''),
        uid: entry.uid ?? null,
        ts: Number(entry.ts ?? 0),
      })
    }
  }
  return rows.sort((a, b) => b.ts - a.ts).slice(0, limit)
}

/* ── Pro grants (fake payments for now) ───────────────────────────────────── */

export async function fetchProGrants(): Promise<Record<string, ProGrant>> {
  const snap = await get(ref(db, 'proGrants'))
  return snap.val() ?? {}
}

/**
 * Grants Pro to a usage key. Accepts the raw usage key (`user-<uid>` or
 * `anon-<fp>`) — the admin panel resolves emails to keys before calling this.
 */
export async function grantProAdmin(usageKey: string, days: number, grantedBy: string): Promise<void> {
  await set(ref(db, `proGrants/${usageKey}`), {
    expiresAt: Date.now() + days * 24 * 60 * 60 * 1000,
    grantedBy,
    grantedAt: Date.now(),
  })
}

export async function revokeProAdmin(usageKey: string): Promise<void> {
  await remove(ref(db, `proGrants/${usageKey}`))
}

/* ── Short links overview ─────────────────────────────────────────────────── */

export interface LinkRow {
  slug: string
  longUrl: string
  clicks: number
  createdAt: number
  isActive: boolean
}

export async function fetchAllLinks(): Promise<LinkRow[]> {
  const snap = await get(ref(db, 'links'))
  const value = (snap.val() ?? {}) as Record<string, Record<string, unknown>>
  return Object.entries(value)
    .filter(([, v]) => typeof v.longUrl === 'string')
    .map(([slug, v]) => ({
      slug,
      longUrl: String(v.longUrl ?? ''),
      clicks: Number(v.clicks ?? 0),
      createdAt: Number(v.createdAt ?? 0),
      isActive: v.isActive !== false,
    }))
    .sort((a, b) => b.clicks - a.clicks)
}
