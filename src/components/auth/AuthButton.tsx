import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, History, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { AuthDialog } from './AuthDialog'

export function AuthButton() {
  const { user, loading, signOut } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  if (loading) {
    return <span className="h-8 w-8 animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setDialogOpen(true)}
          className="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:text-[#211A14] dark:hover:text-white"
        >
          Sign in
        </button>
        <AuthDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      </>
    )
  }

  const label = user.displayName || user.email || 'Account'
  const initial = (user.displayName || user.email || '?').charAt(0).toUpperCase()

  return (
    <div
      className="relative"
      onMouseEnter={() => setMenuOpen(true)}
      onMouseLeave={() => setMenuOpen(false)}
    >
      <button
        className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-accent-blue to-accent-purple text-sm font-semibold text-white"
        aria-label="Account menu"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full w-56 pt-2">
          <div className="glass rounded-2xl p-2 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-2.5 px-3 py-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-blue to-accent-purple text-xs font-semibold text-white">
                {initial}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[#211A14] dark:text-white">
                  {label}
                </span>
                {user.email && (
                  <span className="block truncate text-xs text-faint">{user.email}</span>
                )}
              </span>
            </div>
            <div className="my-1 h-px bg-[#E8E0D6] dark:bg-white/10" />
            <Link
              to="/studio/history"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-black/[0.04] hover:text-[#211A14] dark:hover:bg-white/10 dark:hover:text-white"
            >
              <History className="h-4 w-4" />
              My history
            </Link>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-black/[0.04] hover:text-[#211A14] dark:hover:bg-white/10 dark:hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Compact icon used by mobile menu, etc. */
export function AccountIcon() {
  return <UserIcon className="h-5 w-5" />
}
