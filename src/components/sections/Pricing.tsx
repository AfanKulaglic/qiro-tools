import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import {
  SERVICE_PACKAGES,
  SEPARATE_PRO_MONTHLY,
  formatTierPrice,
  type BillingPeriod,
  type ServicePackage,
  type Tier,
} from '@/data/pricing'

/**
 * Service-oriented pricing. A segmented switch picks a service (Link / QR /
 * Convert) or the discounted All-in-one bundle; a billing toggle flips between
 * monthly and a cheaper 6-month price. Each service keeps a Free tier + Pro;
 * the bundle unlocks every Pro for less than buying them separately.
 *
 * `heading` is optional so the standalone /pricing page can supply its own.
 */
export function Pricing({ heading = true }: { heading?: boolean }) {
  const [activeKey, setActiveKey] = useState<ServicePackage['key']>('link')
  const [period, setPeriod] = useState<BillingPeriod>('monthly')

  const active = SERVICE_PACKAGES.find((p) => p.key === activeKey)!

  return (
    <section className="lg:py-37.5 md:py-25 py-15">
      <Container>
        {heading && (
          <div className="mb-12 text-center lg:mb-17.5">
            <span className="text-lg font-bold uppercase tracking-normal text-default-800 dark:text-white/70">
              Pricing
            </span>
            <h2 className="mt-3 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
              Pick one service, or take them all
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-default-500 dark:text-white/60">
              Every studio is its own service with a free tier and Pro. Need more than one?
              The All-in-one bundle is cheaper than paying for each separately.
            </p>
          </div>
        )}

        {/* Controls: service tabs + billing toggle */}
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-wrap justify-center gap-1.5 rounded-full border border-black/[0.06] bg-white p-1.5 dark:border-white/10 dark:bg-white/[0.04]">
            {SERVICE_PACKAGES.map((p) => {
              const isActive = p.key === activeKey
              return (
                <button
                  key={p.key}
                  onClick={() => setActiveKey(p.key)}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5',
                    isActive
                      ? 'text-white'
                      : 'text-muted hover:text-[#0F172A] dark:hover:text-white',
                    p.bundle && !isActive && 'text-accent-blue',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="pricingTab"
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="flex items-center gap-1.5">
                    {p.bundle && <Sparkles className="h-3.5 w-3.5" />}
                    {p.tabLabel}
                  </span>
                </button>
              )
            })}
          </div>

          <BillingToggle period={period} onChange={setPeriod} />
        </div>

        {/* Cards */}
        <div className="mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-7 text-center">
                <h3 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white">
                  {active.name}
                </h3>
                <p className="mt-1 text-sm text-muted">{active.tagline}</p>
              </div>

              {active.bundle ? (
                <div className="mx-auto max-w-md">
                  <PriceCard tier={active.tiers[0]} period={period} saveNote={active.saveNote} />
                  <p className="mt-5 text-center text-sm text-muted">
                    Three separate Pro plans would be{' '}
                    <span className="font-semibold text-[#0F172A] line-through dark:text-white">
                      €{SEPARATE_PRO_MONTHLY}/mo
                    </span>{' '}
                    — All-in-one is{' '}
                    <span className="font-semibold text-accent-green">€9/mo</span>.
                  </p>
                </div>
              ) : (
                <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
                  {active.tiers.map((t) => (
                    <PriceCard key={t.name} tier={t} period={period} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  )
}

function BillingToggle({
  period,
  onChange,
}: {
  period: BillingPeriod
  onChange: (p: BillingPeriod) => void
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-black/[0.06] bg-white p-1 text-sm dark:border-white/10 dark:bg-white/[0.04]">
      {(['monthly', 'halfyear'] as BillingPeriod[]).map((p) => {
        const isActive = p === period
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              'relative rounded-full px-4 py-1.5 font-medium transition-colors',
              isActive ? 'text-[#0F172A] dark:text-white' : 'text-muted',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="billingPill"
                className="absolute inset-0 -z-10 rounded-full bg-black/[0.05] dark:bg-white/10"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="flex items-center gap-1.5">
              {p === 'monthly' ? 'Monthly' : '6 months'}
              {p === 'halfyear' && (
                <span className="rounded-full bg-accent-green/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-accent-green">
                  −17%
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function PriceCard({
  tier,
  period,
  saveNote,
}: {
  tier: Tier
  period: BillingPeriod
  saveNote?: string
}) {
  const { amount, note } = formatTierPrice(tier, period)
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-3xl border p-7 shadow-card',
        tier.highlight
          ? 'gradient-border border-transparent bg-white shadow-glow dark:bg-white/[0.05]'
          : 'border-black/[0.06] bg-white dark:border-white/10 dark:bg-white/[0.04]',
      )}
    >
      {saveNote && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-gradient-to-r from-accent-blue to-accent-purple px-3 py-1 text-xs font-semibold text-white shadow-glow-soft">
            {saveNote}
          </span>
        </div>
      )}

      <h4 className="text-base font-bold text-[#0F172A] dark:text-white">{tier.name}</h4>
      <div className="mt-3 flex items-end gap-1.5">
        <span className="text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
          {amount}
        </span>
        <span className="pb-1 text-xs text-faint">{note}</span>
      </div>
      <p className="mt-3 text-sm text-muted">{tier.blurb}</p>

      <ul className="mt-6 flex-1 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-muted">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-green/15 text-accent-green">
              <Check className="h-3 w-3" />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-7">
        <Button
          to={tier.ctaTo}
          variant={tier.highlight ? 'primary' : 'secondary'}
          size="lg"
          className="w-full rounded-full"
        >
          {tier.cta}
        </Button>
      </div>
    </div>
  )
}
