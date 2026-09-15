import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

/**
 * Essentio-style pre-footer CTA tuned for the pricing page. Same visual
 * language as FinalCTA (yellow accent panel, oversized serif headline,
 * two pill buttons) but the copy points at the bundle offer instead of
 * the free tools.
 */
export function PricingCTA() {
  return (
    <section className="lg:py-25 md:py-17.5 py-12.5">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-primary-2 px-6 py-16 text-center sm:px-12 sm:py-20 lg:rounded-[50px]"
        >
          <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-grid opacity-10" />
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-default-900/15 bg-white/70 px-3 py-1 text-sm font-bold uppercase tracking-tight text-default-900">
              <Sparkles className="size-4" />
              All-in-one · save 25%
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl font-serif text-4xl font-normal leading-tight tracking-[-0.01em] text-default-900 sm:text-5xl lg:text-6xl">
              Three Pro plans, one bill.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-default-500">
              Unlock every Pro feature across Link, QR, and Convert for €9/mo — cheaper than buying
              each Pro separately.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
              <Button
                to="/qr-generator"
                size="lg"
                className="group gap-2.5 rounded-full bg-primary px-7 py-3.75 font-medium uppercase tracking-normal text-white transition-all duration-300 hover:bg-secondary-1 hover:text-white"
              >
                Get All-in-one
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                to="/contact"
                size="lg"
                variant="outline"
                className="rounded-full border-default-900/30 px-7 py-3.75 font-medium uppercase tracking-normal text-default-900 hover:border-default-900 hover:bg-default-900 hover:text-white"
              >
                Talk to us
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}