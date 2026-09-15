import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AuthDialog } from '@/components/auth/AuthDialog'
import { PaywallModal } from '@/components/auth/PaywallModal'

interface AuthPromptValue {
  /** Opens the global sign-in / sign-up dialog. */
  promptSignIn: () => void
  /** Opens the paywall dialog (free quota exhausted for a signed-in user). */
  promptPaywall: () => void
}

const AuthPromptContext = createContext<AuthPromptValue | null>(null)

/**
 * Mounts a single, app-wide <AuthDialog> and <PaywallModal> and exposes
 * imperative openers so any component (e.g. a tool that hit its free-usage
 * limit) can ask the visitor to sign in or upgrade without owning dialog state.
 *
 * Kept separate from <AuthProvider> to avoid an import cycle with useAuth.
 */
export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)

  const promptSignIn = useCallback(() => setAuthOpen(true), [])
  const promptPaywall = useCallback(() => setPaywallOpen(true), [])
  const value = useMemo<AuthPromptValue>(
    () => ({ promptSignIn, promptPaywall }),
    [promptSignIn, promptPaywall],
  )

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </AuthPromptContext.Provider>
  )
}

export function useAuthPrompt(): AuthPromptValue {
  const ctx = useContext(AuthPromptContext)
  if (!ctx) throw new Error('useAuthPrompt must be used within <AuthPromptProvider>')
  return ctx
}
