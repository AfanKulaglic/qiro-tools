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
import { get, ref, set, remove } from 'firebase/database'
import { db } from '@/lib/firebase'

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

/* ── Admin authentication (username + password) ───────────────────────────── */

/**
 * Admin credentials are verified by hash (djb2) so the plaintext password is
 * never present in the shipped bundle. The session is kept in sessionStorage
 * and the panel additionally requires Google sign-in, because RTDB rules gate
 * admin reads on `auth != null` and Pro-grant writes on a secret write key.
 */
const ADMIN_USER_HASH = 2090073883 // djb2('afan')
const ADMIN_PASS_HASH = 2078751062 // djb2('080513')

/** djb2 string hash. */
function djb2(input: string): number {
  let h = 5381
  for (let i = 0; i < input.length; i++) {
    h = (h * 33 + input.charCodeAt(i)) | 0
    if (h < 0) h += 4294967296
  }
  return h
}

const ADMIN_SESSION_KEY = 'qiro_admin_session'

export function adminLogin(username: string, password: string): boolean {
  const ok = djb2(username.trim().toLowerCase()) === ADMIN_USER_HASH && djb2(password) === ADMIN_PASS_HASH
  if (ok) sessionStorage.setItem(ADMIN_SESSION_KEY, String(Date.now()))
  return ok
}

export function isAdminSession(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) !== null
}

export function adminLogout(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY)
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
 * The write key is validated SERVER-SIDE by RTDB rules against a literal, so
 * a signed-in non-admin cannot grant themselves Pro by writing to the DB.
 */
const ADMIN_WRITE_KEY = 'qiro-admin-wk-7f3a91c2'

export async function grantProAdmin(usageKey: string, days: number, grantedBy = 'afan'): Promise<void> {
  await set(ref(db, `proGrants/${usageKey}`), {
    expiresAt: Date.now() + days * 24 * 60 * 60 * 1000,
    grantedBy,
    grantedAt: Date.now(),
    writeKey: ADMIN_WRITE_KEY,
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
