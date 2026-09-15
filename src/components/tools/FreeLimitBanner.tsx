import { Lock, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import { FREE_LIMIT, FREE_LIMIT_SIGNED_IN } from '@/hooks/useToolGate'

/**
 * Shown inside a tool once the visitor has spent their free actions.
 * Auth-aware: anonymous visitors are invited to sign in (3 more free
 * actions); signed-in users are invited to upgrade (paywall).
 */
export function FreeLimitBanner({
  onSignIn,
  className,
  message,
}: {
  onSignIn: () => void
  className?: string
  message?: string
}) {
  const { user } = useAuth()
  const defaultSignedOut = `You've used your ${FREE_LIMIT} free actions. Sign in to get ${FREE_LIMIT_SIGNED_IN} more — free.`
  const defaultSignedIn = `You've used all ${FREE_LIMIT_SIGNED_IN} free actions. Upgrade to Pro for unlimited access.`
  const text = message ?? (user ? defaultSignedIn : defaultSignedOut)

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-500/5 px-3.5 py-2.5 dark:border-amber-400/20',
        className,
      )}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-500">
        <Lock className="h-3.5 w-3.5" />
      </span>
      <p className="min-w-0 flex-1 text-[12px] font-medium leading-snug text-amber-700 dark:text-amber-400">
        {text}
      </p>
      <button
        type="button"
        onClick={onSignIn}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple px-3 py-1.5 text-[12px] font-bold text-white shadow-glow-soft transition-all hover:brightness-110"
      >
        {user ? 'Upgrade' : 'Sign in'}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

