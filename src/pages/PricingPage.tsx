import { Info } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Pricing } from '@/components/sections/Pricing'
import { WhyPro } from '@/components/sections/WhyPro'
import { ComparisonMatrix } from '@/components/sections/ComparisonMatrix'
import { PricingFAQ } from '@/components/sections/PricingFAQ'
import { PricingCTA } from '@/components/sections/PricingCTA'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PRICING_NOTE } from '@/data/pricing'

/**
 * Pricing page — the canonical place where a visitor decides whether to
 * pay. Section order is chosen to push the visitor from broad context to
 * specific decision to clear next step:
 *
 *   1. Pricing           — per-service plan picker (service tabs + cards)
 *   2. Info banner       — fair-use + browser-side disclaimer (single line)
 *   3. WhyPro            — six-icon benefit grid explaining Pro value
 *   4. ComparisonMatrix  — full feature comparison across all plans
 *   5. PricingFAQ        — grouped accordion (plans / billing / privacy)
 *   6. PricingCTA        — yellow pre-footer band pointing at All-in-one
 *
 * The global Footer is rendered by MarketingLayout — don't add a second
 * <Footer /> here.
 */
export default function PricingPage() {
  useDocumentTitle(
    'Pricing — Qiro',
    'Per-service pricing for Qiro. A free tier and an affordable Pro for every tool — short links, QR codes, converters, GIFs, UTM builder, background removal — or the discounted All-in-one bundle.',
  )

  return (
    <>
      <Pricing />

      <Container className="max-w-3xl">
        <p className="-mt-6 flex items-start gap-2.5 rounded-2xl border border-default-200 bg-default-50 px-5 py-4 text-sm text-default-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/65">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          {PRICING_NOTE}
        </p>
      </Container>

      <WhyPro />
      <ComparisonMatrix />
      <PricingFAQ />
      <PricingCTA />
    </>
  )
}