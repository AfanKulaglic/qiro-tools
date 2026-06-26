import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { StudioSidebar } from './StudioSidebar'

/**
 * Workspace shell for the Studio: a persistent left rail on desktop, a slide-in
 * drawer on mobile. Deliberately renders none of the marketing chrome — the
 * Studio is its own focused workspace.
 */
export function StudioLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { pathname } = useLocation()

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-white text-[#211A14] dark:bg-ink-950 dark:text-white">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#E8E0D6] bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/40 md:block">
        <StudioSidebar />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E8E0D6] bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/70 md:hidden">
        <Logo />
        <button
          onClick={() => setDrawerOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-xl border border-[#E8E0D6] text-muted dark:border-white/12"
          aria-label="Otvori meni"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-[90] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-72 border-r border-[#E8E0D6] bg-white dark:border-white/10 dark:bg-ink-950"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-xl border border-[#E8E0D6] text-muted dark:border-white/12"
                aria-label="Zatvori meni"
              >
                <X className="h-5 w-5" />
              </button>
              <StudioSidebar onNavigate={() => setDrawerOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace canvas */}
      <main className="md:pl-64">
        <Outlet />
      </main>
    </div>
  )
}
