import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthPrompt } from '@/hooks/useAuthPrompt'
import { consumeUse, deviceFingerprint, getUsageCount, hasActivePro, localUsageCacheKey } from '@/lib/usage'
import type { ToolId } from '@/lib/analytics'

/** Maps the UI tool key to the analytics ToolId used in the admin panel. */
const TOOL_IDS: Record<ToolKey, ToolId> = {
  qr: 'qr-generator',
  shorten: 'shorten',
  convert: 'image-converter',
  video: 'video-converter',
  audio: 'audio-converter',
  gif: 'gif-maker',
  utm: 'utm-builder',
  bg: 'background-remover',
  enhance: 'image-enhancer',
  pdf: 'pdf-editor',
}

export type ToolKey = 'qr' | 'shorten' | 'convert' | 'video' | 'audio' | 'gif' | 'utm' | 'bg' | 'enhance' | 'pdf'

/**
 * Free actions a visitor gets WITHOUT an account — shared across all tools.
 */
export const FREE_LIMIT = 3
/**
 * Additional free actions a signed-in user gets (fresh counter), shared
 * across all tools. After these are spent the paywall applies.
 */
export const FREE_LIMIT_SIGNED_IN = 3

function readCache(usageKey: string): number {
  try {
    return Number(localStorage.getItem(localUsageCacheKey(usageKey)) ?? 0) || 0
  } catch {
    return 0
  }
}

function writeCache(usageKey: string, count: number): void {
  try {
    localStorage.setItem(localUsageCacheKey(usageKey), String(count))
  } catch {
    /* storage unavailable — server remains authoritative */
  }
}

/**
 * Free-usage gate for a tool's primary action (download / create / convert).
 *
 * The counter is ONE shared pool per person across every tool and lives in
 * Firebase Realtime Database (see `src/lib/usage.ts`), so it survives cache
 * clears, private windows and device switches.
 *
 * - Anonymous visitors: FREE_LIMIT actions, then the sign-in dialog.
 * - Signed-in users: a fresh FREE_LIMIT_SIGNED_IN actions, then the paywall.
 *
 * `gate()` returns true when the action may proceed (and records the use
 * server-side); otherwise it opens the appropriate dialog and returns false.
 */
export function useToolGate(tool: ToolKey) {
  const { user } = useAuth()
  const { promptSignIn, promptPaywall } = useAuthPrompt()
  const toolId = TOOL_IDS[tool]

  // One shared pool per person — the tool argument is kept for API
  // compatibility but the count is deliberately NOT per-tool.
  const usageKey = user ? `user-${user.uid}` : deviceFingerprint()

  const [count, setCount] = useState<number>(() => readCache(usageKey))
  const [ready, setReady] = useState(false)
  const [pro, setPro] = useState(false)

  useEffect(() => {
    let alive = true
    setCount(readCache(usageKey))
    setReady(false)
    setPro(false)
    Promise.all([getUsageCount(usageKey), hasActivePro(usageKey)])
      .then(([serverCount, proActive]) => {
        if (!alive) return
        setCount(serverCount)
        writeCache(usageKey, serverCount)
        setPro(proActive)
      })
      .catch(() => {
        /* offline — keep serving the cached count */
      })
      .finally(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [usageKey])

  const limit = user ? FREE_LIMIT_SIGNED_IN : FREE_LIMIT
  const used = Math.max(0, count)
  const locked = !pro && used >= limit
  const remaining = pro ? Infinity : Math.max(0, limit - used)

  /** Call before a gated action. Returns true if it may proceed. */
  const gate = useCallback((): boolean => {
    if (!pro && used >= limit) {
      // Signed-in users who exhausted their quota see the paywall; anonymous
      // visitors are invited to sign in (which grants a fresh quota).
      if (user) promptPaywall()
      else promptSignIn()
      return false
    }
    const next = used + 1
    // Optimistic update for instant UI; the server value reconciles right after.
    setCount(next)
    writeCache(usageKey, next)
    void consumeUse(usageKey, toolId, user?.uid ?? null)
      .then((serverCount) => {
        setCount(serverCount)
        writeCache(usageKey, serverCount)
      })
      .catch(() => {
        /* offline — cached count still advances */
      })
    return true
  }, [used, limit, pro, user, usageKey, toolId, promptPaywall, promptSignIn])

  /** Opens sign-in (anonymous) or the paywall (signed-in). */
  const prompt = useCallback((): void => {
    if (user) promptPaywall()
    else promptSignIn()
  }, [user, promptPaywall, promptSignIn])

  return { gate, lockedForAnon: locked, remaining, ready, promptSignIn: prompt }
}

