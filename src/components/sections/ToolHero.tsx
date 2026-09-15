import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'

type Accent = 'cyan' | 'blue' | 'purple' | 'peach' | 'coral' | 'yellow' | 'sage' | 'green'

const ACCENT_GRADIENT: Record<Accent, string> = {
  cyan: 'from-accent-cyan via-accent-blue to-accent-purple',
  blue: 'from-accent-blue via-accent-cyan to-accent-purple',
  purple: 'from-accent-purple via-accent-blue to-accent-cyan',
  peach: 'from-accent-peach via-accent-coral to-accent-purple',
  coral: 'from-accent-coral via-accent-peach to-accent-purple',
  yellow: 'from-accent-yellow via-accent-peach to-accent-coral',
  sage: 'from-accent-sage via-accent-blue to-accent-cyan',
  green: 'from-accent-green via-accent-cyan to-accent-blue',
}

/**
 * Compact marketing hero used at the top of each tool home page (QR, links,
 * converter). Eyebrow chip + bold title + subtitle, sitting on a soft radial
 * glow — styled to match HeroSection / StudioPanel.
 */
export function ToolHero({
  eyebrow,
  title,
  subtitle,
  accent = 'blue',
}: {
  eyebrow: string
  title: ReactNode
  subtitle?: ReactNode
  accent?: Accent
}) {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(50%_50%_at_50%_0%,rgba(39,129,236,0.08),transparent_70%)] dark:bg-[radial-gradient(50%_50%_at_50%_0%,rgba(39,129,236,0.12),transparent_70%)]" />

      <div className="container-max relative pb-8 pt-14 text-center sm:pb-10 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Eyebrow chip */}
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent-blue/20 bg-accent-blue/5 px-3.5 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent-blue dark:text-accent-cyan" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-blue dark:text-accent-cyan">
              {eyebrow}
            </span>
          </div>

          {/* Title with gradient accent line */}
          <h1 className="mx-auto max-w-3xl text-balance text-3xl font-extrabold tracking-tight text-[#211A14] dark:text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <div className={cn('mx-auto mt-5 h-1 w-24 rounded-full bg-gradient-to-r opacity-70', ACCENT_GRADIENT[accent])} />

          {subtitle && (
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
