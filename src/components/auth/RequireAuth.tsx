import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Loader2, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { AuthDialog } from './AuthDialog'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'

/**
 * Route guard for the Studio. Access is conditional on a signed-in Firebase user:
 * - while auth state resolves → a neutral full-screen loader (avoids flashing the
 *   gate to users who are actually logged in);
 * - signed out → a locked gate that auto-opens the existing AuthDialog;
 * - signed in → renders the nested studio routes via <Outlet />.
 *
 * This is a client-side gate for UX. Actual data access is still enforced by the
 * Firebase/RTDB security rules, which require auth server-side.
 */
export function RequireAuth() {
  const { user, loading } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)

  // As soon as we know there's no user, prompt sign-in.
  useEffect(() => {
    if (!loading && !user) setDialogOpen(true)
  }, [loading, user])

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-white text-muted dark:bg-ink-950">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative grid min-h-screen place-items-center bg-white px-5 text-[#211A14] dark:bg-ink-950 dark:text-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-radial-glow" />
        <div className="relative w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent-blue/15 text-accent-blue">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Studio je zaključan</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Prijava je obavezna. Prijavi se da koristiš QR, Link i Konverter studio te da čuvaš
            svoju historiju.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3">
            <Button onClick={() => setDialogOpen(true)} size="lg" className="w-full max-w-xs">
              Prijavi se
            </Button>
            <Button to="/" variant="ghost" size="sm">
              Nazad na sajt
            </Button>
          </div>
        </div>

        <AuthDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      </div>
    )
  }

  return <Outlet />
}
