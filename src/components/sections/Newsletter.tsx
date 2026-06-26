import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Container } from '@/components/ui/Container'

/**
 * Dark two-column newsletter band (heading left, inline form right) that sits
 * directly above the footer and flows into it visually — Essentio layout.
 */
export function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setDone(true)
  }

  return (
    <section className="bg-ink-950 pt-16 dark:bg-ink-900">
      <Container>
        <div className="grid items-center gap-8 border-b border-white/10 pb-16 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-light leading-tight tracking-[-0.02em] text-white sm:text-4xl">
              Get the latest on smarter sharing
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
              Occasional product updates and new studio features. No spam, unsubscribe anytime.
            </p>
          </div>

          <div className="lg:justify-self-end lg:text-right">
            {done ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-green/15 px-5 py-3 text-sm font-medium text-accent-green">
                <Check className="h-4 w-4" />
                You&apos;re on the list — thanks!
              </div>
            ) : (
              <>
                <form
                  onSubmit={submit}
                  className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:justify-end"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-accent-blue/60 sm:w-72"
                  />
                  <button
                    type="submit"
                    className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple px-6 py-3 text-sm font-semibold text-white shadow-glow-soft transition-all hover:brightness-110"
                  >
                    Subscribe
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </form>
                <p className="mt-3 text-xs text-white/40">
                  By subscribing you accept our{' '}
                  <a href="/privacy" className="underline-offset-2 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
