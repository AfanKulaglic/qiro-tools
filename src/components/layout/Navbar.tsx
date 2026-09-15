import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, ArrowRight, ChevronDown, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AuthButton } from '@/components/auth/AuthButton'
import { MobileMenu } from './MobileMenu'
import { TOOLS_BY_CATEGORY } from '@/data/tools'
import { cn } from '@/utils/cn'

type NavItem = { label: string; to: string; dropdown?: boolean }

const NAV: NavItem[] = [
  { label: 'Tools', to: '/shorten', dropdown: true },
  { label: 'Features', to: '/features' },
  { label: 'Use Cases', to: '/use-cases' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Help', to: '/help' },
]

/**
 * Essentio-consistent navbar — floating pill on scroll, transparent over hero.
 *
 * Desktop: centered floating bar with warm neutral tokens (#FBFBF8 surface,
 * #E8E0D6 borders, #211A14 text) matching the page's editorial palette.
 * Glassmorphism + subtle shadow when scrolled. Tools dropdown inherits the
 * same warm treatment with accent-yellow hover highlights.
 *
 * Mobile: collapses to hamburger → opens a right-side drawer panel
 * (see MobileMenu). Full dark-mode parity.
 */
export function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  // At the top of a page the bar is transparent; text colour must adapt to
  // what's behind it — white over the dark home hero, dark ink elsewhere.
  const overDark = location.pathname === '/'

  // Graceful close — lets the cursor travel into the dropdown without it
  // slamming shut on the 1px gap between trigger and menu.
  const openTools = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setToolsOpen(true)
  }
  const scheduleCloseTools = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setToolsOpen(false), 140)
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 w-full transition-all duration-500 ease-out',
          scrolled
            ? 'top-3 mx-auto max-w-5xl rounded-2xl border border-[#E8E0D6]/60 bg-[#FBFBF8]/92 shadow-[0_8px_32px_-8px_rgba(33,26,20,0.12),0_1px_0_0_rgba(255,255,255,0.7)_inset] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-ink-950/88 dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_1px_0_0_rgba(255,255,255,0.04)_inset]'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between gap-6 transition-all duration-500',
            scrolled ? 'h-14 px-5' : 'container-full h-16',
          )}
        >
          {/* Logo — uses inline for scroll-aware colour swap */}
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Qiro home">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent-blue via-accent-cyan to-accent-purple shadow-glow-soft transition-transform duration-300 hover:scale-105">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path
                  d="M9 15l6-6M10 7h2.2a3.3 3.3 0 0 1 0 6.6H10M14 17h-2.2a3.3 3.3 0 0 1 0-6.6H14"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span
              className={cn(
                'text-lg font-extrabold tracking-tight transition-colors duration-300',
                scrolled
                  ? 'text-[#211A14] dark:text-white'
                  : overDark
                    ? 'text-white'
                    : 'text-[#211A14] dark:text-white',
              )}
            >
              Qiro
            </span>
          </Link>

          {/* Desktop nav — hidden below md */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV.map((item) =>
              item.dropdown ? (
                <div
                  key={item.to}
                  className="relative"
                  onMouseEnter={openTools}
                  onMouseLeave={scheduleCloseTools}
                  onFocus={openTools}
                  onBlur={scheduleCloseTools}
                >
                  <button
                    type="button"
                    className={cn(
                      'group inline-flex h-9 items-center gap-1 rounded-xl px-3 text-[14px] font-semibold tracking-[-0.01em] transition-all duration-200',
                      scrolled
                        ? 'text-[#211A14]/70 hover:bg-[#211A14]/[0.05] hover:text-[#211A14] dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white'
                        : overDark
                          ? 'text-white/80 hover:bg-white/[0.1] hover:text-white'
                          : 'text-[#211A14]/70 hover:bg-[#211A14]/[0.05] hover:text-[#211A14] dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white',
                    )}
                    aria-expanded={toolsOpen}
                    aria-haspopup="menu"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        'h-3 w-3 transition-transform duration-200',
                        toolsOpen && 'rotate-180',
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {toolsOpen && (
                      <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-1/2 top-full z-10 w-[34rem] max-w-[92vw] -translate-x-1/2 pt-3"
                      >
                        <div className="overflow-hidden rounded-2xl border border-[#E8E0D6]/60 bg-[#FBFBF8]/95 p-3 shadow-[0_24px_64px_-20px_rgba(33,26,20,0.2),0_1px_0_0_rgba(255,255,255,0.7)_inset] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-ink-950/95 dark:shadow-[0_24px_64px_-20px_rgba(0,0,0,0.6),0_1px_0_0_rgba(255,255,255,0.04)_inset]">
                          <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                            {TOOLS_BY_CATEGORY.map((group) => (
                              <div key={group.category}>
                                <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#211A14]/40 dark:text-white/35">
                                  {group.category}
                                </p>
                                {group.tools.map((t) => (
                                  <NavLink
                                    key={t.to}
                                    to={t.to}
                                    role="menuitem"
                                    className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all duration-200 hover:bg-[#211A14]/[0.04] dark:hover:bg-white/[0.06]"
                                  >
                                    <span className={cn(
                                      'grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ring-1 ring-inset transition-transform duration-200 group-hover:scale-105',
                                      t.tint, t.accent, t.ring,
                                    )}>
                                      <t.Icon className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block text-[13px] font-semibold leading-tight text-[#211A14] dark:text-white">
                                        {t.navLabel}
                                      </span>
                                      <span className="block truncate text-[11px] text-[#211A14]/50 dark:text-white/50">
                                        {t.hint}
                                      </span>
                                    </span>
                                  </NavLink>
                                ))}
                              </div>
                            ))}
                          </div>

                          <div className="my-2 h-px bg-[#E8E0D6]/70 dark:bg-white/[0.06]" />

                          <NavLink
                            to="/qr-generator"
                            role="menuitem"
                            className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-accent-yellow/15 to-accent-yellow/5 px-3 py-2.5 transition-all duration-200 hover:from-accent-yellow/25 hover:to-accent-yellow/10 dark:from-accent-yellow/10 dark:to-accent-yellow/[0.03]"
                          >
                            <span className="inline-flex items-center gap-2 text-[13px] font-bold text-[#211A14] dark:text-white">
                              <Sparkles className="h-3.5 w-3.5 text-accent-blue" />
                              Open Qiro
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-[#211A14]/40 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-white/40" />
                          </NavLink>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'relative inline-flex h-9 items-center rounded-xl px-3 text-[14px] font-semibold tracking-[-0.01em] transition-all duration-200',
                      scrolled
                        ? isActive
                          ? 'text-[#211A14] dark:text-white'
                          : 'text-[#211A14]/70 hover:bg-[#211A14]/[0.05] hover:text-[#211A14] dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white'
                        : overDark
                          ? isActive
                            ? 'text-white'
                            : 'text-white/80 hover:bg-white/[0.1] hover:text-white'
                          : isActive
                            ? 'text-[#211A14] dark:text-white'
                            : 'text-[#211A14]/70 hover:bg-[#211A14]/[0.05] hover:text-[#211A14] dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="navUnderline"
                          className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-accent-blue to-accent-cyan"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ),
            )}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <div className="hidden sm:inline-flex">
              <AuthButton
                signInClassName={cn(
                  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm px-3.5 py-2 transition-all duration-300',
                  scrolled
                    ? '!bg-[#211A14] !text-white hover:!bg-[#211A14]/90 dark:!bg-accent-yellow dark:!text-[#211A14] dark:hover:!bg-accent-yellow/90'
                    : overDark
                      ? '!bg-white/15 !text-white hover:!bg-white/25 backdrop-blur-sm'
                      : '!bg-[#211A14]/[0.06] !text-[#211A14] hover:!bg-[#211A14]/[0.12] dark:!bg-white/10 dark:!text-white dark:hover:!bg-white/[0.18]',
                )}
              />
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className={cn(
                'grid h-10 w-10 place-items-center rounded-xl transition-all duration-200 md:hidden',
                scrolled
                  ? 'border border-[#E8E0D6] bg-transparent text-[#211A14] hover:bg-[#211A14]/[0.04] dark:border-white/[0.1] dark:text-white dark:hover:bg-white/[0.06]'
                  : overDark
                    ? 'border border-white/20 bg-white/[0.08] text-white backdrop-blur-sm hover:bg-white/[0.15]'
                    : 'border border-[#E8E0D6] bg-white/60 text-[#211A14] backdrop-blur-sm hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white',
              )}
              aria-label="Open menu"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
