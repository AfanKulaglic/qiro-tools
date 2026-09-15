import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink } from 'react-router-dom'
import {
  X,
  Sparkles,
  Layers,
  Tag,
  LifeBuoy,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AuthButton } from '@/components/auth/AuthButton'
import { TOOLS_BY_CATEGORY } from '@/data/tools'
import { cn } from '@/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface NavLinkItem {
  label: string
  to: string
  icon: LucideIcon
  description?: string
}

const PAGES: NavLinkItem[] = [
  { label: 'Features', to: '/features', icon: Sparkles },
  { label: 'Use Cases', to: '/use-cases', icon: Layers },
  { label: 'Pricing', to: '/pricing', icon: Tag },
  { label: 'Help', to: '/help', icon: LifeBuoy },
]

/**
 * Mobile menu — right-side drawer panel with warm Essentio tokens.
 *
 * Slides in from the right as a full-height panel. Uses the same warm
 * palette (#FBFBF8 surface, #E8E0D6 borders, accent-yellow highlights)
 * as the rest of the site. Each section (Tools, Explore) is visually
 * separated with subtle eyebrow labels and staggered entry animations.
 *
 * Touch targets are ≥ 48px throughout. The backdrop is a gentle dim that
 * respects the page's editorial aesthetic.
 */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Lock body scroll while open so the page doesn't move behind the panel.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          {/* Backdrop — warm tinted dim; tap to close */}
          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-[#211A14]/40 backdrop-blur-[2px] dark:bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Panel — slides from the right, full height */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-y-0 right-0 flex w-[85vw] max-w-[380px] flex-col border-l border-[#E8E0D6]/50 bg-[#FBFBF8] shadow-[-20px_0_60px_-20px_rgba(33,26,20,0.15)] dark:border-white/[0.06] dark:bg-ink-950 dark:shadow-[-20px_0_60px_-20px_rgba(0,0,0,0.5)]"
          >
            {/* ── Header ── */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#E8E0D6]/60 px-5 dark:border-white/[0.06]">
              <Link to="/" onClick={onClose} className="inline-flex items-center gap-2.5" aria-label="Qiro home">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-blue via-accent-cyan to-accent-purple shadow-glow-soft">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                    <path
                      d="M9 15l6-6M10 7h2.2a3.3 3.3 0 0 1 0 6.6H10M14 17h-2.2a3.3 3.3 0 0 1 0-6.6H14"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="text-base font-extrabold tracking-tight text-[#211A14] dark:text-white">Qiro</span>
              </Link>
              <button
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#E8E0D6] text-[#211A14]/60 transition-all duration-200 hover:bg-[#211A14]/[0.04] hover:text-[#211A14] dark:border-white/[0.1] dark:text-white/60 dark:hover:bg-white/[0.06] dark:hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-5 pb-4">
              {/* Section: Tools — grouped by category */}
              {TOOLS_BY_CATEGORY.map((group, gi) => (
                <div key={group.category} className={gi > 0 ? 'mt-4' : ''}>
                  <SectionLabel>{group.category}</SectionLabel>
                  <nav className="mt-2 flex flex-col gap-1">
                    {group.tools.map((t, i) => (
                      <motion.div
                        key={t.to}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 + (gi * 2 + i) * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <NavLink
                          to={t.to}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `group flex items-center gap-3.5 rounded-2xl px-3.5 py-3 transition-all duration-200 ${
                              isActive
                                ? 'bg-accent-blue/[0.08] dark:bg-accent-blue/[0.12]'
                                : 'hover:bg-[#211A14]/[0.03] dark:hover:bg-white/[0.04]'
                            }`
                          }
                        >
                          <span className={cn(
                            'grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-inset',
                            t.tint, t.accent, t.ring,
                          )}>
                            <t.Icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-semibold text-[#211A14] dark:text-white">
                              {t.navLabel}
                            </span>
                            <span className="block truncate text-[12px] text-[#211A14]/50 dark:text-white/45">
                              {t.hint}
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 text-[#211A14]/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#211A14]/40 dark:text-white/20 dark:group-hover:text-white/40" />
                        </NavLink>
                      </motion.div>
                    ))}
                  </nav>
                </div>
              ))}

              {/* Divider */}
              <div className="my-5 h-px bg-[#E8E0D6]/70 dark:bg-white/[0.06]" />

              {/* Section: Explore */}
              <SectionLabel>Explore</SectionLabel>
              <nav className="mt-2 flex flex-col gap-1">
                {PAGES.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <NavLink
                      to={link.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-3.5 rounded-2xl px-3.5 py-3.5 transition-all duration-200 ${
                          isActive
                            ? 'bg-accent-yellow/20 dark:bg-accent-yellow/10'
                            : 'hover:bg-[#211A14]/[0.03] dark:hover:bg-white/[0.04]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-all duration-200 ${
                              isActive
                                ? 'bg-accent-yellow text-[#211A14]'
                                : 'bg-[#211A14]/[0.04] text-[#211A14]/60 dark:bg-white/[0.06] dark:text-white/60'
                            }`}
                          >
                            <link.icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1 text-[15px] font-medium text-[#211A14] dark:text-white">
                            {link.label}
                          </span>
                          <ChevronRight className="h-4 w-4 text-[#211A14]/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#211A14]/40 dark:text-white/20 dark:group-hover:text-white/40" />
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* Divider */}
              <div className="my-5 h-px bg-[#E8E0D6]/70 dark:bg-white/[0.06]" />

              {/* Preferences row */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.4 }}
                className="flex items-center gap-2.5 rounded-2xl border border-[#E8E0D6]/60 bg-white/60 p-3 dark:border-white/[0.06] dark:bg-white/[0.03]"
              >
                <div className="flex-1 pl-1">
                  <AuthButton />
                </div>
                <ThemeToggle />
              </motion.div>
            </div>

            {/* ── Sticky CTA ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.4 }}
              className="shrink-0 border-t border-[#E8E0D6]/60 bg-[#FBFBF8]/95 p-4 backdrop-blur-xl dark:border-white/[0.06] dark:bg-ink-950/95"
            >
              <Button
                to="/qr-generator"
                size="lg"
                className="w-full rounded-xl !bg-[#211A14] !text-white hover:!bg-[#211A14]/90 dark:!bg-accent-yellow dark:!text-[#211A14] dark:hover:!bg-accent-yellow/90"
                onClick={onClose}
              >
                <LayoutDashboard className="h-4 w-4" />
                Open Qiro
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Small uppercase eyebrow used to separate sections inside the mobile panel. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 pb-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#211A14]/40 dark:text-white/35">
      <span className="h-1 w-1 rounded-full bg-accent-blue" />
      {children}
    </div>
  )
}
