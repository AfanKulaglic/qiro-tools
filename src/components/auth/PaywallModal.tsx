import { ArrowRight, Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Shown when a signed-in user has spent all of their free actions.
 * Routes to the pricing page where Pro can be purchased.
 */
export function PaywallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#15130f]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-black/40 transition-colors hover:bg-black/5 hover:text-black/70 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white/70"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="mb-3 inline-grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple text-white shadow-glow-soft">
          <Check className="h-5 w-5" />
        </span>

        <h2 className="text-lg font-extrabold tracking-tight text-black dark:text-white">
          You've used all 3 free actions
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-black/60 dark:text-white/60">
          Sign-in gave you 3 more — and you used them well. Upgrade to Pro to keep converting,
          shortening and creating without limits.
        </p>

        <ul className="mt-4 space-y-1.5 text-[13px] text-black/70 dark:text-white/70">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            Unlimited use of every tool
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            Files still processed 100% on your device
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            Priority support and new features first
          </li>
        </ul>

        <Link
          to="/pricing"
          onClick={onClose}
          className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple px-4 py-2.5 text-[13px] font-bold text-white shadow-glow-soft transition-all hover:brightness-110"
        >
          View plans
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-xl px-4 py-2 text-[12px] font-semibold text-black/50 transition-colors hover:bg-black/5 hover:text-black/70 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white/70"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
