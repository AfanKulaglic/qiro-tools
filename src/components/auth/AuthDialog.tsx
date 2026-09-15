import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth, authErrorMessage } from '@/hooks/useAuth'

type Mode = 'signin' | 'signup'

const COPY: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  signin: {
    title: 'Welcome back',
    subtitle: 'Sign in to open Qiro and sync your links, QR codes and images.',
    cta: 'Sign in',
  },
  signup: {
    title: 'Create account',
    subtitle: 'Free account — everything syncs across all your devices.',
    cta: 'Create account',
  },
}

export function AuthDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const switchMode = (m: Mode) => {
    setMode(m)
    setError('')
    setBusy(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signin') await signInWithEmail(email.trim(), password)
      else await signUpWithEmail(email.trim(), password, name.trim() || undefined)
      onClose()
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const google = async () => {
    setError('')
    setBusy(true)
    try {
      await signInWithGoogle()
      onClose()
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const copy = COPY[mode]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative w-full max-w-md overflow-hidden rounded-3xl p-7"
          >
            {/* soft brand glow behind the header */}
            <div className="pointer-events-none absolute inset-x-0 -top-16 h-40 bg-radial-glow" />

            <button
              onClick={onClose}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-faint transition-colors hover:bg-black/[0.04] hover:text-[#211A14] dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Brand mark */}
            <div className="relative mb-5 flex justify-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent-blue via-accent-cyan to-accent-purple shadow-glow-soft">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                  <path
                    d="M9 15l6-6M10 7h2.2a3.3 3.3 0 0 1 0 6.6H10M14 17h-2.2a3.3 3.3 0 0 1 0-6.6H14"
                    stroke="#fff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>

            <div className="relative text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <h2 className="text-xl font-bold tracking-tight text-[#211A14] dark:text-white">
                    {copy.title}
                  </h2>
                  <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
                    {copy.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Segmented mode switch */}
            <div className="relative mt-6 grid grid-cols-2 gap-1 rounded-xl bg-black/[0.04] p-1 dark:bg-white/[0.05]">
              {(['signin', 'signup'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={cnTab(mode === m)}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="authPill"
                      className="absolute inset-0 -z-10 rounded-lg bg-white shadow-sm dark:bg-white/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {m === 'signin' ? 'Sign in' : 'Sign up'}
                </button>
              ))}
            </div>

            {/* Google */}
            <button
              onClick={google}
              disabled={busy}
              className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#E8E0D6] bg-white px-4 py-2.5 text-sm font-medium text-[#211A14] transition-colors hover:bg-[#211A14]/[0.03] disabled:opacity-50 dark:border-white/12 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="my-4 flex items-center gap-3 text-xs text-faint">
              <div className="h-px flex-1 bg-[#E8E0D6] dark:bg-white/10" />
              or
              <div className="h-px flex-1 bg-[#E8E0D6] dark:bg-white/10" />
            </div>

            <form onSubmit={submit} className="space-y-3">
              <AnimatePresence initial={false}>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <Field
                      icon={UserIcon}
                      placeholder="Name (optional)"
                      value={name}
                      onChange={setName}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Field
                icon={Mail}
                type="email"
                placeholder="ti@email.com"
                value={email}
                onChange={setEmail}
                required
              />
              <Field
                icon={Lock}
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={setPassword}
                required
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-faint transition-colors hover:text-[#211A14] dark:hover:text-white"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={busy}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple px-4 py-3 text-sm font-semibold text-white shadow-glow-soft transition-all hover:brightness-110 disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {copy.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-xs leading-relaxed text-faint">
              By continuing you accept{' '}
              <a href="/terms" className="text-muted underline-offset-2 hover:underline">
                Terms
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-muted underline-offset-2 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Segmented-tab class for the active / inactive state. */
function cnTab(active: boolean): string {
  return [
    'relative z-10 rounded-lg py-2 text-sm font-medium transition-colors',
    active ? 'text-[#211A14] dark:text-white' : 'text-muted hover:text-[#211A14] dark:hover:text-white',
  ].join(' ')
}

function Field({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  trailing,
}: {
  icon: typeof Mail
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  trailing?: ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-[#E8E0D6] bg-white px-3.5 py-2.5 transition-colors focus-within:border-accent-blue/60 dark:border-white/12 dark:bg-white/[0.04]">
      <Icon className="h-4 w-4 shrink-0 text-faint" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-[#211A14] outline-none placeholder:text-faint dark:text-white"
      />
      {trailing}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}
