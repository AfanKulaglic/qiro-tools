import { Info } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Accordion } from '@/components/ui/Accordion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Pricing } from '@/components/sections/Pricing'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PRICING_NOTE } from '@/data/pricing'

const PRICING_FAQ = [
  {
    q: 'Can I pay for just one service?',
    a: 'Yes. Each studio — Link, QR, and Convert — is its own service with a free tier and a Pro plan. Subscribe only to what you use.',
  },
  {
    q: 'How does the All-in-one bundle work?',
    a: 'All-in-one unlocks every Pro feature across all three studios for one price — cheaper than subscribing to each Pro separately.',
  },
  {
    q: 'Is the free tier really free?',
    a: 'Yes. Every service has a free tier you can use without paying. QR generation and image conversion run locally in your browser.',
  },
  {
    q: 'What is the 6-month option?',
    a: 'Instead of paying monthly, you can pay once for 6 months at a lower effective monthly rate (about 17% off).',
  },
]

export default function PricingPage() {
  useDocumentTitle(
    'Pricing — Qiro',
    'Per-service pricing for Qiro. Free tier and Pro for Link, QR, and Convert — or take the discounted All-in-one bundle.',
  )

  return (
    <PageShell
      badge="Pricing"
      title="A package per service — or all of them for less."
      subtitle="Each studio is its own service. Subscribe to one, or save with the All-in-one bundle."
      wide
    >
      <Pricing heading={false} />

      <p className="mx-auto -mt-6 flex max-w-3xl items-start gap-2.5 rounded-2xl border border-[#E8E0D6] dark:border-white/10 bg-white/50 dark:bg-white/[0.02] px-5 py-4 text-sm text-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-blue" />
        {PRICING_NOTE}
      </p>

      <div className="mt-20">
        <SectionHeader title="Pricing FAQ" align="center" />
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-[#E8E0D6] dark:border-white/10 bg-white dark:bg-white/[0.04] px-6 shadow-card sm:px-8">
          <Accordion items={PRICING_FAQ} />
        </div>
      </div>
    </PageShell>
  )
}
