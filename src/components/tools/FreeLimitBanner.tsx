import { Lock, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Shown inside a tool once an anonymous visitor has spent their single free
 * action. Invites sign-in / registration to keep using the tool.
 */
export function FreeLimitBanner({
  onSignIn,
  className,
  message = 'You\'ve used your free usage. Sign in or register for unlimited access.',
}: {
  onSignIn: () => void
  className?: string
  message?: string
}) {
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
        {message}
      </p>
      <button
        type="button"
        onClick={onSignIn}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple px-3 py-1.5 text-[12px] font-bold text-white shadow-glow-soft transition-all hover:brightness-110"
      >
        Sign in
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
