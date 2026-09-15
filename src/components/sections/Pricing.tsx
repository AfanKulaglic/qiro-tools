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
 * Service-oriented pricing. The page's primary decision surface: a
 * segmented switch picks a service (Link / QR / Convert) or the
 * discounted All-in-one bundle; each service shows a Free tier + Pro.
 *
 * The billing toggle (Monthly / 6 months) lives inside the Pro card
 * instead of as a global switch — it's only relevant for paid tiers,
 * and placing it there keeps the first screen focused on the choice
 * that actually matters (which service). The Free card skips the
 * toggle entirely.
 */
export function Pricing({
  intro,
  defaultService = 'link',
}: {
  intro?: { eyebrow: string; title: string; subtitle: string }
  defaultService?: ServicePackage['key']
} = {}) {
  const [activeKey, setActiveKey] = useState<ServicePackage['key']>(defaultService)

  const active = SERVICE_PACKAGES.find((p) => p.key === activeKey)!

  return (
    <section className="lg:pt-15 md:pt-12.5 pt-10 lg:pb-25 md:pb-17.5 pb-12.5">
      <Container>
        {/* Single intro: eyebrow + headline + sub-paragraph.
            Kept compact so the service tabs are visible above the fold. */}
        <div className="mb-8 text-center lg:mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-default-200 bg-white px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-default-800 shadow-card dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
            <span className="size-1.5 rounded-full bg-primary" />
            {intro?.eyebrow ?? 'Pricing'}
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
            {intro?.title ?? 'A package per service — or all of them for less.'}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-default-500 dark:text-white/60">
            {intro?.subtitle ??
              'Pick a tool to start. Subscribe to one, or take the All-in-one bundle. The free tier stays free forever.'}
          </p>
        </div>

        {/* Service tabs — the only global control. */}
        <div
          role="tablist"
          aria-label="Choose service"
          className="mx-auto flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-full border border-default-200 bg-white p-1.5 shadow-card dark:border-white/10 dark:bg-white/[0.04]"
        >
          {SERVICE_PACKAGES.map((p) => {
            const isActive = p.key === activeKey
            return (
              <button
                key={p.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveKey(p.key)}
                className={cn(
                  'relative isolate overflow-hidden rounded-full px-4 py-2 text-sm transition-colors sm:px-5',
                  isActive
                    ? 'font-semibold !text-white'
                    : 'font-medium text-default-500 hover:text-default-900 dark:text-white/60 dark:hover:text-white',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="pricingTab"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span
                  className={cn(
                    'relative z-10 flex items-center gap-1.5',
                    isActive ? 'font-semibold !text-white' : 'font-medium',
                  )}
                >
                  {p.bundle && <Sparkles className="h-3.5 w-3.5" />}
                  {p.tabLabel}
                </span>
              </button>
            )
          })}
        </div>

        {/* Cards */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-7 flex flex-col items-center text-center">
                <span className="inline-flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-primary">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {active.name}
                </span>
                <p className="mt-2 max-w-md text-base text-muted">{active.tagline}</p>
              </div>

              {active.bundle ? (
                <div className="mx-auto max-w-md">
                  <PriceCard tier={active.tiers[0]} period="monthly" saveNote={active.saveNote} />
                  <p className="mt-5 text-center text-sm text-muted">
                    All eight Pro plans separately would be{' '}
                    <span className="font-semibold text-default-900 line-through dark:text-white">
                      €{SEPARATE_PRO_MONTHLY}/mo
                    </span>{' '}
                    — All-in-one is{' '}
                    <span className="font-semibold text-accent-green">
                      €{active.tiers[0].monthly}/mo
                    </span>
                    .
                  </p>
                </div>
              ) : (
                <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
                  {active.tiers.map((t) => (
                    <PriceCard key={t.name} tier={t} />
                  ))}
                </div>
              )}

              {/* Undercuts-competition note — shown for every service. */}
              {active.vsNote && (
                <p className="mx-auto mt-6 max-w-md text-center text-xs font-medium text-default-500 dark:text-white/50">
                  ⚡ {active.vsNote}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Build-your-own bundle — grouped presets + custom selection.
            Same card language as the price cards: rounded-3xl, soft
            border, shadow-card, pill controls. */}
        <BundleBuilder />
      </Container>
    </section>
  )
}

/** Internal billing toggle — mounted inside the Pro card so the global
 *  UI stays focused on choosing a service. */
function BillingToggle({
  period,
  onChange,
}: {
  period: BillingPeriod
  onChange: (p: BillingPeriod) => void
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-default-200 bg-default-50 p-1 text-xs dark:border-white/10 dark:bg-white/5">
      {(['monthly', 'halfyear'] as BillingPeriod[]).map((p) => {
        const isActive = p === period
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-pressed={isActive}
            className={cn(
              'relative rounded-full px-2.5 py-1 font-medium transition-colors',
              isActive ? 'text-default-900 dark:text-white' : 'text-muted',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="billingPill"
                className="absolute inset-0 -z-10 rounded-full bg-primary-2 shadow-sm"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="flex items-center gap-1">
              {p === 'monthly' ? 'Monthly' : '6 months'}
              {p === 'halfyear' && (
                <span className="rounded-full bg-accent-green/15 px-1 py-px text-[0.6rem] font-semibold text-accent-green">
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
  period: initialPeriod,
  saveNote,
}: {
  tier: Tier
  period?: BillingPeriod
  saveNote?: string
}) {
  // Free tiers ignore the toggle entirely — no period state needed.
  const isPaid = tier.monthly > 0
  const [period, setPeriod] = useState<BillingPeriod>(initialPeriod ?? 'monthly')

  const { amount, note } = formatTierPrice(tier, period)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative flex flex-col rounded-3xl border bg-white p-7.5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow lg:p-10 dark:bg-white/[0.04]',
        tier.highlight
          ? 'gradient-border border-transparent'
          : 'border-default-200 dark:border-white/10',
      )}
    >
      {saveNote && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple px-3 py-1 text-xs font-semibold text-white shadow-glow-soft">
            <Sparkles className="size-3" />
            {saveNote}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <h3 className="text-base font-bold text-default-900 dark:text-white">{tier.name}</h3>
        {tier.highlight && !saveNote && (
          <span className="rounded-full bg-primary-2 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-default-900">
            Recommended
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end gap-1.5">
        <span className="text-4xl font-extrabold tracking-tight text-default-900 dark:text-white">
          {amount}
        </span>
        <span className="pb-1 text-xs text-faint">{note}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{tier.blurb}</p>

      {isPaid && (
        <div className="mt-5">
          <BillingToggle period={period} onChange={setPeriod} />
        </div>
      )}

      <ul className="mt-6 flex-1 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-muted">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-green/15 text-accent-green">
              <Check className="size-3" strokeWidth={3} />
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
    </motion.div>
  )
}

/* Per-service Pro monthly price, derived from SERVICE_PACKAGES so the
   builder always stays in sync with the cards above. */
const PRO_MONTHLY: Record<string, { label: string; monthly: number }> = Object.fromEntries(
  SERVICE_PACKAGES.filter((p) => !p.bundle).map((p) => [
    p.key,
    { label: p.name, monthly: p.tiers.find((t) => t.monthly > 0)!.monthly },
  ]),
)

/** Logical groupings — one click fills the selection with a themed set. */
const GROUP_PRESETS: { name: string; blurb: string; keys: string[] }[] = [
  {
    name: 'Marketing Kit',
    blurb: 'Links, QR codes & campaign tracking',
    keys: ['link', 'qr', 'utm'],
  },
  {
    name: 'Media Suite',
    blurb: 'Every converter in one place',
    keys: ['convert', 'video', 'audio', 'gif'],
  },
  {
    name: 'Creator Studio',
    blurb: 'Images, video & clean backgrounds',
    keys: ['bg', 'convert', 'video'],
  },
]

/**
 * Custom bundle builder: pick any combination of Pro tools (or use a
 * grouped preset); the discount grows with how many tools you stack —
 * the fixed All-in-one bundle stays the best per-tool deal, so picking
 * all eight nudges you toward it instead of quietly beating it.
 */
function BundleBuilder() {
  const allKeys = Object.keys(PRO_MONTHLY)
  const [selected, setSelected] = useState<string[]>(GROUP_PRESETS[0].keys)
  const [period, setPeriod] = useState<BillingPeriod>('monthly')

  const toggle = (k: string) =>
    setSelected((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))

  const sum = selected.reduce((s, k) => s + PRO_MONTHLY[k].monthly, 0)
  const discount = selected.length >= 4 ? 0.2 : selected.length >= 2 ? 0.1 : 0
  const monthly = Math.round(sum * (1 - discount) * 10) / 10
  const halfYear = Math.round(monthly * 5 * 10) / 10
  const fullPrice = period === 'monthly' ? monthly : halfYear
  const everythingSelected = selected.length === allKeys.length

  return (
    <div className="mt-16 lg:mt-20">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-default-200 bg-white px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-default-800 shadow-card dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
          <span className="size-1.5 rounded-full bg-primary" />
          Build your own
        </span>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-default-900 sm:text-4xl dark:text-white">
          Mix only what you need
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-base text-muted">
          Start from a grouped bundle or pick tools one by one — the more you stack, the bigger
          the discount.
        </p>
      </div>

      <div className="mx-auto max-w-3xl rounded-3xl border border-default-200 bg-white p-7.5 shadow-card lg:p-10 dark:border-white/10 dark:bg-white/[0.04]">
        {/* Grouped presets */}
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-faint">Bundles</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {GROUP_PRESETS.map((g) => {
            const isActive =
              g.keys.length === selected.length && g.keys.every((k) => selected.includes(k))
            return (
              <button
                key={g.name}
                onClick={() => setSelected(g.keys)}
                className={cn(
                  'rounded-2xl border p-4 text-left transition-all duration-200',
                  isActive
                    ? 'border-primary bg-primary/5 shadow-glow-soft'
                    : 'border-default-200 hover:border-primary/40 dark:border-white/10',
                )}
              >
                <span
                  className={cn(
                    'text-sm font-bold',
                    isActive ? 'text-primary' : 'text-default-900 dark:text-white',
                  )}
                >
                  {g.name}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">{g.blurb}</span>
                <span className="mt-2 flex items-center gap-1.5">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-faint">
                    {g.keys.length} tools
                  </span>
                  <span className="text-xs font-bold text-default-900 dark:text-white">
                    €
                    {Math.round(
                      g.keys.reduce((s, k) => s + PRO_MONTHLY[k].monthly, 0) *
                        (g.keys.length >= 4 ? 0.8 : 0.9) *
                        10,
                    ) / 10}
                    /mo
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Custom selection */}
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.12em] text-faint">
          Or pick tools individually
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {allKeys.map((k) => {
            const on = selected.includes(k)
            return (
              <button
                key={k}
                onClick={() => toggle(k)}
                aria-pressed={on}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors',
                  on
                    ? 'border-transparent bg-gradient-to-r from-accent-blue to-accent-purple font-semibold text-white shadow-glow-soft'
                    : 'border-default-200 text-default-500 hover:border-primary/40 hover:text-default-900 dark:border-white/10 dark:text-white/60 dark:hover:text-white',
                )}
              >
                {on && <Check className="size-3.5" strokeWidth={3} />}
                {PRO_MONTHLY[k].label}
                <span className={cn('text-xs', on ? 'text-white/80' : 'text-faint')}>
                  €{PRO_MONTHLY[k].monthly}
                </span>
              </button>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 flex flex-col gap-5 rounded-2xl bg-default-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:bg-white/5">
          <div>
            <p className="text-sm text-muted">
              {selected.length === 0
                ? 'Select at least one tool'
                : `${selected.length} tool${selected.length > 1 ? 's' : ''} · Pro`}
              {discount > 0 && (
                <span className="ml-2 rounded-full bg-accent-green/15 px-2 py-0.5 text-xs font-semibold text-accent-green">
                  −{discount * 100}% bundle discount
                </span>
              )}
            </p>
            <div className="mt-1.5 flex items-end gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-default-900 dark:text-white">
                {selected.length === 0 ? '€0' : `€${fullPrice}`}
              </span>
              <span className="pb-1 text-xs text-faint">
                {period === 'monthly' ? '/month' : 'every 6 months'}
              </span>
            </div>
            {discount > 0 && selected.length > 0 && (
              <p className="mt-1.5 text-xs text-muted">
                <span className="line-through">€{sum}/mo</span> without the bundle —{' '}
                <span className="font-semibold text-accent-green">
                  you save €{Math.round((sum - monthly) * 10) / 10}/mo
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <BillingToggle period={period} onChange={setPeriod} />
            <Button
              to="/contact"
              variant="primary"
              size="lg"
              className="w-full rounded-full sm:w-auto"
            >
              Get this bundle
            </Button>
          </div>
        </div>

        {everythingSelected && (
          <p className="mt-4 text-center text-xs font-medium text-default-500 dark:text-white/50">
            ⚡ Taking all eight? The All-in-one bundle at €14/mo is the better deal.
          </p>
        )}
      </div>
    </div>
  )
}