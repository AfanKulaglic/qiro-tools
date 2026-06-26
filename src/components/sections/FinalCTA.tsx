import { motion } from 'framer-motion'
import { Link2, QrCode } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

/**
 * Essentio-style full-bleed pre-footer CTA — yellow accent panel with
 * rounded corners, oversized serif headline, and two pill buttons using
 * the Essentio `bg-primary hover:bg-secondary-1` treatment.
 */
export function FinalCTA() {
  return (
    <section className="lg:py-37.5 md:py-25 py-15">
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
            <span className="text-lg font-bold uppercase tracking-tight text-default-900">
              Get started
            </span>
            <h2 className="mx-auto mt-3 max-w-2xl font-serif text-4xl font-normal leading-tight tracking-[-0.01em] text-default-900 sm:text-5xl lg:text-6xl">
              Create your first short link now.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-default-500">
              Paste a link, customize it, copy it, and share it in seconds — no signup, no friction.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
              <Button
                to="/shorten"
                size="lg"
                className="group gap-2.5 rounded-full bg-primary px-7 py-3.75 font-medium uppercase tracking-normal text-white transition-all duration-300 hover:bg-secondary-1 hover:text-white"
              >
                <Link2 className="size-5" />
                Shorten URL
              </Button>
              <Button
                to="/qr-generator"
                size="lg"
                variant="outline"
                className="rounded-full border-default-900/30 px-7 py-3.75 font-medium uppercase tracking-normal text-default-900 hover:border-default-900 hover:bg-default-900 hover:text-white"
              >
                <QrCode className="size-5" />
                Generate QR Code
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}