import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  QrCode,
  Link2,
  ImageDown,
  History,
  ArrowLeft,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AuthButton } from '@/components/auth/AuthButton'
import { cn } from '@/utils/cn'

interface StudioNavItem {
  label: string
  to: string
  icon: LucideIcon
  /** Service accent — keeps each studio recognisable while staying consistent. */
  accent: string
  end?: boolean
}

const NAV: StudioNavItem[] = [
  { label: 'Pregled', to: '/studio', icon: LayoutDashboard, accent: 'text-accent-blue', end: true },
  { label: 'QR kodovi', to: '/studio/qr', icon: QrCode, accent: 'text-accent-cyan' },
  { label: 'Linkovi', to: '/studio/shorten', icon: Link2, accent: 'text-accent-blue' },
  { label: 'Konverter', to: '/studio/convert', icon: ImageDown, accent: 'text-accent-purple' },
  { label: 'Historija', to: '/studio/history', icon: History, accent: 'text-muted' },
]

/**
 * Shared studio navigation. Rendered both in the persistent desktop rail and the
 * mobile drawer; `onNavigate` lets the drawer close itself on selection.
 */
export function StudioSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#211A14]/[0.05] text-[#211A14] dark:bg-white/10 dark:text-white'
                  : 'text-muted hover:bg-[#211A14]/[0.04] hover:text-[#211A14] dark:hover:bg-white/[0.06] dark:hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'h-[18px] w-[18px] transition-colors',
                    isActive ? item.accent : 'text-faint group-hover:text-current',
                  )}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-3 py-4">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="mb-3 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-[#211A14]/[0.04] hover:text-[#211A14] dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Nazad na sajt
        </NavLink>
        <div className="flex items-center justify-between rounded-xl border border-[#E8E0D6] px-3 py-2 dark:border-white/10">
          <AuthButton />
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
