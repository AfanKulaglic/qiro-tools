import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AuthDialog } from '@/components/auth/AuthDialog'

interface AuthPromptValue {
  /** Opens the global sign-in / sign-up dialog. */
  promptSignIn: () => void
}

const AuthPromptContext = createContext<AuthPromptValue | null>(null)

/**
 * Mounts a single, app-wide <AuthDialog> and exposes an imperative
 * `promptSignIn()` so any component (e.g. a tool that hit its free-usage limit)
 * can ask the visitor to sign in without owning its own dialog state.
 *
 * Kept separate from <AuthProvider> to avoid an import cycle with useAuth.
 */
export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const promptSignIn = useCallback(() => setOpen(true), [])
  const value = useMemo<AuthPromptValue>(() => ({ promptSignIn }), [promptSignIn])

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <AuthDialog open={open} onClose={() => setOpen(false)} />
    </AuthPromptContext.Provider>
  )
}

export function useAuthPrompt(): AuthPromptValue {
  const ctx = useContext(AuthPromptContext)
  if (!ctx) throw new Error('useAuthPrompt must be used within <AuthPromptProvider>')
  return ctx
}
