import { Container } from '@/components/ui/Container'
import { Accordion } from '@/components/ui/Accordion'

/**
 * Pricing-page FAQ — grouped by topic so visitors can scan to the
 * questions they actually have. Mirrors FAQSection structure (eyebrow
 * + serif heading + rounded accordion panel) but uses a two-column
 * grid of accordions on desktop for visual density.
 */

const GROUPS: Array<{ title: string; items: Array<{ q: string; a: string }> }> = [
  {
    title: 'Plans & pricing',
    items: [
      {
        q: 'Can I pay for just one service?',
        a: 'Yes. Each tool — Link, QR, and Convert — is its own service with a free tier and a Pro plan. Subscribe only to what you use.',
      },
      {
        q: 'How does the All-in-one bundle work?',
        a: 'All-in-one unlocks every Pro feature across all three tools for one price — cheaper than subscribing to each Pro separately (€9/mo vs €12/mo combined).',
      },
      {
        q: 'What is the 6-month option?',
        a: 'Instead of paying monthly, you can pay once for 6 months at a lower effective monthly rate (about 17% off).',
      },
      {
        q: 'Do prices include VAT?',
        a: 'Listed prices exclude VAT. VAT is added at checkout based on your billing country, in line with EU rules.',
      },
    ],
  },
  {
    title: 'Free tier & signup',
    items: [
      {
        q: 'Is the free tier really free?',
        a: 'Yes. Every visitor gets 3 free actions across all tools, and signing in grants 3 more — genuinely free, no payment details. Conversions run locally in your browser. Pro removes the usage cap.',
      },
      {
        q: 'Do I need an account to use the free tools?',
        a: 'Not for your first 3 actions. An account is only needed afterwards — and signing in immediately grants 3 more free actions before any payment is required.',
      },
      {
        q: 'Will my free tier change in the future?',
        a: 'The free tier is part of the product, not a trial. If we ever change it, existing usage stays grandfathered and we will give 30 days notice.',
      },
    ],
  },
  {
    title: 'Billing & cancellations',
    items: [
      {
        q: 'Can I cancel anytime?',
        a: 'Yes. Monthly subscriptions cancel at the end of the current period. 6-month plans cancel at the end of the 6-month term. No retention calls, no clawbacks.',
      },
      {
        q: 'What happens to my data if I cancel?',
        a: 'Your short links and history stay readable for 30 days after cancellation, then are permanently deleted. Export them anytime from Qiro before you cancel.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'Within 14 days of any paid charge, drop us a line and we refund in full — no questions asked. After 14 days we issue a pro-rated refund for the unused portion of the term.',
      },
    ],
  },
  {
    title: 'Privacy & security',
    items: [
      {
        q: 'Do my files get uploaded to a server?',
        a: 'No. QR generation and image conversion happen entirely in your browser. The file never leaves your device, and we have no way to see it.',
      },
      {
        q: 'Where are short links stored?',
        a: 'Short links and click counts are stored on Firebase (Google Cloud) infrastructure in the EU. We do not sell or share click data with third parties.',
      },
      {
        q: 'Can I use Qiro for client work?',
        a: 'Yes. Pro and All-in-one plans include commercial use. Use Qiro to shorten, brand, and QR-encode anything you ship to a client.',
      },
    ],
  },
]

export function PricingFAQ() {
  return (
    <section className="lg:py-25 md:py-17.5 py-12.5">
      <Container>
        <div className="mb-10 lg:mb-12.5">
          <span className="text-lg font-bold uppercase tracking-tight text-default-800 dark:text-white/70">
            FAQ
          </span>
          <h2 className="mt-2 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
            Pricing questions, answered.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-default-500 dark:text-white/60">
            Grouped so you can jump to the section that matters — plans, billing, free tier, or how
            your files are handled.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {GROUPS.map((group) => (
            <div
              key={group.title}
              className="rounded-3xl border border-default-200 bg-white p-6 shadow-card sm:p-8 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <h3 className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-primary">
                {group.title}
              </h3>
              <Accordion items={group.items} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}