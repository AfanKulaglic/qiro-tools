import { Info } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { PlanCard } from './PlanCard'
import { FREE_PLAN, PRO_PLAN, PRICING_NOTE } from '@/data/pricing'

/**
 * Essentio-style pricing preview — uppercase eyebrow + oversized serif
 * title + two side-by-side PlanCards. Used as a teaser where the full
 * Pricing section would be too much.
 */
export function PricingPreview() {
  return (
    <section className="lg:py-37.5 md:py-25 py-15">
      <Container>
        <div className="mb-12 lg:mb-12.5">
          <span className="text-lg font-bold uppercase tracking-tight text-default-800 dark:text-white/70">
            Pricing
          </span>
          <h2 className="mt-2 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
            Start free. Upgrade later if needed.
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-7.5 sm:grid-cols-2">
          <PlanCard plan={FREE_PLAN} index={0} />
          <PlanCard plan={PRO_PLAN} index={1} />
        </div>

        <p className="mx-auto mt-9 flex max-w-2xl items-start gap-2.5 rounded-2xl border border-default-200 bg-default-50 px-5 py-4 text-sm font-medium text-default-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/65">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          {PRICING_NOTE}
        </p>
      </Container>
    </section>
  )
}