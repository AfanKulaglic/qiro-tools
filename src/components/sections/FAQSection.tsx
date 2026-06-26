import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Accordion } from '@/components/ui/Accordion'
import { FAQ_PREVIEW } from '@/data/faq'

/**
 * Essentio-style FAQ band — uppercase eyebrow + oversized serif heading
 * + a clean accordion in a rounded white card. The "See all" CTA uses the
 * Essentio pill style: bg-black on light, hover:bg-primary.
 */
export function FAQSection() {
  return (
    <section className="lg:py-37.5 md:py-25 py-15">
      <Container>
        <div className="mb-12 lg:mb-12.5">
          <span className="text-lg font-bold uppercase tracking-tight text-default-800 dark:text-white/70">
            FAQ
          </span>
          <h2 className="mt-2 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
            Questions, answered.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-default-500 dark:text-white/60">
            The essentials about how Qiro works — links, QR codes, image conversion, and pricing.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-default-200 bg-white px-6 shadow-card sm:px-8 dark:border-white/10 dark:bg-white/[0.04]">
            <Accordion items={FAQ_PREVIEW} />
          </div>
          <div className="mt-8 flex justify-center">
            <a
              href="/faq"
              className="group inline-flex items-center gap-2.5 rounded-full bg-black px-7 py-3.5 text-base font-bold uppercase tracking-normal text-white transition-all duration-300 hover:bg-primary dark:bg-ink-900 dark:hover:bg-primary"
            >
              See all FAQs
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}