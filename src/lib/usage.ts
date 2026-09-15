import { get, ref, runTransaction } from 'firebase/database'
import { db } from '@/lib/firebase'
import { logUsage, type ToolId } from '@/lib/analytics'

/**
 * Server-side usage accounting.
 *
 * Every gated action consumes one "free action" that is counted in Firebase
 * Realtime Database — NOT in localStorage — so clearing browser storage,
 * switching devices or using private windows cannot reset the counter.
 * `database.rules.json` only ever allows the count to *increase by one*, so
 * even a tampering client (devtools) cannot reset or inflate their quota.
 *
 * Identities:
 *  - Signed-in users:  key = `user-<firebase uid>` (rules require auth match)
 *  - Anonymous users:  key = deterministic device fingerprint (`anon-...`),
 *    stable across incognito windows and cache clears because it is derived
 *    from browser/platform signals, not from stored state.
 */

/** localStorage mirror for instant UI before the server value arrives. */
export function localUsageCacheKey(usageKey: string): string {
  return `qiro:usage:${usageKey}`
}

/* ── Fingerprint ─────────────────────────────────────────────────────────── */

let cachedFp: string | null = null

/** FNV-1a 32-bit hash. */
function fnv1a(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Cheap canvas signal — adds entropy that survives cache clears. */
function canvasSignal(): number {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 120
    canvas.height = 30
    const ctx = canvas.getContext('2d')
    if (!ctx) return 0
    ctx.textBaseline = 'alphabetic'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(0, 0, 100, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('qiro-fp-\u{1F512}', 2, 15)
    const data = ctx.getImageData(0, 0, 120, 30).data
    let sum = 0
    for (let i = 0; i < data.length; i += 97) sum = (sum + data[i]) | 0
    return sum >>> 0
  } catch {
    return 0
  }
}

/**
 * Deterministic, storage-free device fingerprint. Same browser profile
 * produces the same value even in private/incognito windows.
 */
export function deviceFingerprint(): string {
  if (cachedFp) return cachedFp
  const nav = navigator as Navigator & { deviceMemory?: number }
  const signals = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    String(navigator.hardwareConcurrency ?? 0),
    String(nav.deviceMemory ?? 0),
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? '',
    String(canvasSignal()),
  ]
  const joined = signals.join('|')
  cachedFp = `anon-${fnv1a(joined).toString(36)}${fnv1a(joined.split('').reverse().join('')).toString(36)}`
  return cachedFp
}

/* ── Server read / consume ───────────────────────────────────────────────── */

/** Current usage count for a key (0 if the record does not exist yet). */
export async function getUsageCount(usageKey: string): Promise<number> {
  const snap = await get(ref(db, `usage/${usageKey}/count`))
  const value = snap.val()
  return typeof value === 'number' && value > 0 ? value : 0
}

/**
 * Atomically consumes one action. The RTDB rules only accept count === prev+1
 * (or 1 for the very first write), so this cannot be used to reset anything.
 * Resolves with the authoritative server count.
 */
export async function consumeUse(usageKey: string, tool?: ToolId, uid?: string | null): Promise<number> {
  const result = await runTransaction(ref(db, `usage/${usageKey}/count`), (current: unknown) =>
    typeof current === 'number' && current > 0 ? current + 1 : 1,
  )
  const value = result.snapshot.val()
  const count = typeof value === 'number' && value > 0 ? value : 1

  // Best-effort analytics — never blocks or fails the user's action.
  if (tool) logUsage({ usageKey, tool, uid })

  return count
}

/** Whether a usage key has an active (non-expired) Pro grant. */
export async function hasActivePro(usageKey: string): Promise<boolean> {
  const snap = await get(ref(db, `proGrants/${usageKey}/expiresAt`))
  const expiresAt = snap.val()
  return typeof expiresAt === 'number' && expiresAt > Date.now()
}

/**
 * Grants a Pro plan to a usage key. Admin-only (enforced by RTDB rules) — used
 * by the admin panel to activate an email after (manual) payment.
 */
export async function grantPro(usageKey: string, days: number, grantedBy: string): Promise<void> {
  const { set } = await import('firebase/database')
  const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000
  await set(ref(db, `proGrants/${usageKey}`), { expiresAt, grantedBy, grantedAt: Date.now() })
}

/** Removes a Pro grant (admin action). */
export async function revokePro(usageKey: string): Promise<void> {
  const { set } = await import('firebase/database')
  await set(ref(db, `proGrants/${usageKey}`), null)
}
