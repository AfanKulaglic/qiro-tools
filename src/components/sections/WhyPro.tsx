import { motion } from 'framer-motion'
import { Zap, ShieldCheck, Gauge, Headphones, Repeat, Wallet } from 'lucide-react'
import { Container } from '@/components/ui/Container'

/**
 * Essentio-style "Why go Pro" benefit grid — three large icon-led cards
 * explaining the value of moving from Free to Pro (or taking All-in-one).
 * Mirrors the spacing/typography pattern used by FAQSection and
 * HowItWorks so the pricing page reads as part of the same design system.
 */

const BENEFITS = [
  {
    icon: Zap,
    title: 'Instant, no friction',
    body: 'Every action finishes in under a second. No spinners, no waiting for a server — QR codes generate and images convert right in your browser.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    body: 'QR and image conversion run locally. Files never leave your device. Short links use Firebase infrastructure and respect fair-use quotas.',
  },
  {
    icon: Gauge,
    title: 'Scales with you',
    body: 'Start on Free with no signup. Upgrade to a single Pro when you outgrow it, or take All-in-one to unlock every tool at once.',
  },
  {
    icon: Repeat,
    title: 'Pay only when it pays off',
    body: 'No annual contracts. Cancel anytime, keep your data. The 6-month option trims the price by ~17% if you commit longer.',
  },
  {
    icon: Wallet,
    title: 'Bundle saves 25%',
    body: 'Three separate Pro plans would be €12/mo. All-in-one unlocks everything for €9/mo — and one bill covers the whole toolkit.',
  },
  {
    icon: Headphones,
    title: 'Real support, not bots',
    body: 'Stuck on a feature or have a custom need? Drop us a line — a real person reads every message and replies within one business day.',
  },
]

export function WhyPro() {
  return (
    <section className="lg:py-25 md:py-17.5 py-12.5">
      <Container>
        <div className="mb-10 lg:mb-12.5">
          <span className="text-lg font-bold uppercase tracking-tight text-default-800 dark:text-white/70">
            Why Pro
          </span>
          <h2 className="mt-2 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
            What you actually get when you upgrade.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-default-500 dark:text-white/60">
            Pro is the same product you already use, just without limits and with the controls serious
            creators need.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="group relative flex flex-col gap-3.5 rounded-3xl border border-default-200 bg-white p-7.5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card lg:p-10 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-primary-2 text-default-900 transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                <b.icon className="size-7" />
              </span>
              <h3 className="text-xl font-bold leading-tight text-default-900 dark:text-white">
                {b.title}
              </h3>
              <p className="text-base leading-relaxed text-default-500 dark:text-white/65">{b.body}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
