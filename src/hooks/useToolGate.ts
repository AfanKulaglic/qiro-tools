import { useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthPrompt } from '@/hooks/useAuthPrompt'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/utils/storage'

export type ToolKey = 'qr' | 'shorten' | 'convert' | 'video' | 'audio' | 'gif' | 'utm' | 'bg' | 'enhance' | 'pdf'

type UsageMap = Record<ToolKey, number>

const EMPTY_USAGE: UsageMap = { qr: 0, shorten: 0, convert: 0, video: 0, audio: 0, gif: 0, utm: 0, bg: 0, enhance: 0, pdf: 0 }

/** Anonymous visitors get this many free actions per tool before sign-in. */
export const FREE_LIMIT = 1

/** Tools in open beta — fully usable without an account for now. */
const BETA_NO_GATE: ToolKey[] = ['pdf']

/**
 * Free-usage gate for a tool's primary action (download / create / convert).
 *
 * - Signed-in users are never limited.
 * - Anonymous users get FREE_LIMIT actions (tracked in localStorage). The first
 *   action is allowed and counted; once the quota is spent, `gate()` opens the
 *   sign-in dialog and returns false so the caller aborts.
 */
export function useToolGate(tool: ToolKey) {
  const { user } = useAuth()
  const { promptSignIn } = useAuthPrompt()
  const [usage, setUsage] = useLocalStorage<UsageMap>(STORAGE_KEYS.freeUsage, EMPTY_USAGE)

  const used = usage[tool] ?? 0
  const beta = BETA_NO_GATE.includes(tool)
  const lockedForAnon = !beta && !user && used >= FREE_LIMIT
  const remaining = beta || user ? Infinity : Math.max(0, FREE_LIMIT - used)

  /** Call before a gated action. Returns true if it may proceed. */
  const gate = useCallback((): boolean => {
    if (user || BETA_NO_GATE.includes(tool)) return true
    if ((usage[tool] ?? 0) < FREE_LIMIT) {
      setUsage({ ...EMPTY_USAGE, ...usage, [tool]: (usage[tool] ?? 0) + 1 })
      return true
    }
    promptSignIn()
    return false
  }, [user, usage, tool, setUsage, promptSignIn])

  return { gate, lockedForAnon, remaining, promptSignIn }
}
