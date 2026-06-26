import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, ArrowRight, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AuthButton } from '@/components/auth/AuthButton'
import { MobileMenu } from './MobileMenu'
import { cn } from '@/utils/cn'

const NAV = [
  { label: 'Tools', to: '/shorten', dropdown: true },
  { label: 'Features', to: '/features' },
  { label: 'Use Cases', to: '/use-cases' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Help', to: '/help' },
]

const TOOLS = [
  { label: 'URL Shortener', to: '/shorten' },
  { label: 'QR Generator', to: '/qr-generator' },
  { label: 'Image Converter', to: '/image-converter' },
  { label: 'Otvori studio →', to: '/studio' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Essentio header — transparent over hero, white pill once scrolled. */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 w-full border-b transition-all duration-300',
          scrolled
            ? 'border-zinc-200 bg-white/90 text-zinc-700 backdrop-blur-xl'
            : 'border-transparent bg-transparent text-white',
        )}
      >
        <div className="container-full flex items-center justify-between gap-25 py-2.5">
          <Logo />

          <nav className="hidden items-center md:flex">
            {NAV.map((item) =>
              item.dropdown ? (
                <div
                  key={item.to}
                  className="group relative"
                  onMouseEnter={() => setToolsOpen(true)}
                  onMouseLeave={() => setToolsOpen(false)}
                >
                  <button
                    className={cn(
                      'flex items-center gap-1 px-3.75 py-3.75 text-lg font-medium uppercase transition-colors',
                      scrolled ? 'text-zinc-700 hover:text-primary' : 'text-white/90 hover:text-accent-yellow',
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform', toolsOpen && 'rotate-180')}
                    />
                  </button>
                  {toolsOpen && (
                    <div className="absolute left-1/2 top-full w-56 -translate-x-1/2 pt-3">
                      <div className="rounded-xl border border-zinc-200 bg-white p-2 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.25)]">
                        {TOOLS.map((t) => (
                          <NavLink
                            key={t.to}
                            to={t.to}
                            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-accent-blue/[0.06] hover:text-accent-blue"
                          >
                            {t.label}
                            <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'px-3.75 py-3.75 text-lg font-medium uppercase transition-colors',
                      scrolled
                        ? isActive
                          ? 'text-primary'
                          : 'text-zinc-700 hover:text-primary'
                        : isActive
                          ? 'text-accent-yellow'
                          : 'text-white/90 hover:text-accent-yellow',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className={cn(scrolled ? 'text-zinc-700' : 'text-white')}>
              <ThemeToggle />
            </div>
            <span className={cn('hidden text-lg uppercase font-medium sm:inline-flex', scrolled ? 'text-zinc-700' : 'text-white/90')}>
              <AuthButton />
            </span>
            <Button
              to="/studio"
              size="sm"
              className={cn(
                'hidden rounded-full px-5.75 py-3.75 text-lg font-medium uppercase sm:inline-flex',
                scrolled
                  ? 'bg-primary text-white hover:bg-secondary-1'
                  : 'bg-accent-yellow text-default-900 hover:bg-white',
              )}
            >
              Open studio
              <ArrowRight className="h-4 w-4" />
            </Button>
            <button
              onClick={() => setMobileOpen(true)}
              className={cn(
                'grid size-8.5 place-items-center rounded-full md:hidden',
                scrolled ? 'bg-primary text-white' : 'bg-white text-primary',
              )}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
