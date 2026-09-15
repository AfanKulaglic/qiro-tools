/**
 * Realtime Database usage-log + analytics.
 *
 * Every gated action is recorded twice:
 *  1. `usage/{key}/count` — monotonic counter (see usage.ts) enforcing the
 *     free quota.
 *  2. `usageLog/{key}/{pushId}` — one small entry per action with tool, day
 *     and (for signed-in users) the uid, so the admin panel can show who used
 *     what and when.
 *  3. `analytics/{YYYY-MM-DD}/{tool}` — a per-day, per-tool counter used for
 *     aggregate charts in the admin panel.
 *
 * Admins (UIDs listed under `admins` in the DB) have full read access via the
 * rules, so no extra client-side privileges are needed beyond auth.
 */

import { ref, push, runTransaction, serverTimestamp } from 'firebase/database'
import { db } from '@/lib/firebase'

/** Known tool identifiers used across the app's gated actions. */
export type ToolId =
  | 'qr-generator'
  | 'shorten'
  | 'image-converter'
  | 'video-converter'
  | 'audio-converter'
  | 'gif-maker'
  | 'utm-builder'
  | 'background-remover'
  | 'image-enhancer'
  | 'pdf-editor'

const dayKey = (): string => new Date().toISOString().slice(0, 10)

interface LogInput {
  usageKey: string
  tool: ToolId
  uid?: string | null
}

/** Records one action in usageLog + analytics. Fire-and-forget (never blocks the UI). */
export function logUsage({ usageKey, tool, uid }: LogInput): void {
  const entry = {
    tool,
    day: dayKey(),
    uid: uid ?? null,
    ts: serverTimestamp(),
  }

  void push(ref(db, `usageLog/${usageKey}`), entry).catch(() => {
    /* analytics must never break the user's action */
  })

  void runTransaction(ref(db, `analytics/${dayKey()}/${tool}`), (current: unknown) =>
    typeof current === 'number' && current > 0 ? current + 1 : 1,
  ).catch(() => {
    /* ignore */
  })
}
