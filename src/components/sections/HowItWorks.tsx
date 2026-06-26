import { motion } from 'framer-motion'
import { ClipboardPaste, SlidersHorizontal, Share2 } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const STEPS = [
  {
    icon: ClipboardPaste,
    title: 'Paste your link',
    description: 'Drop in any long URL or the content you want to encode.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Customize alias or QR style',
    description: 'Add a memorable alias or tune your QR colors and size.',
  },
  {
    icon: Share2,
    title: 'Copy, download, or share',
    description: 'Grab your short link, QR code, or converted image instantly.',
  },
]

/**
 * Essentio-style "How it works" — three numbered steps in a row, each with
 * a yellow (primary-2) circle holding the step number, the action icon
 * sitting inside a white circle on top, and a connector line linking them
 * on desktop.
 */
export function HowItWorks() {
  return (
    <section className="lg:py-37.5 md:py-25 py-15">
      <Container>
        <div className="mb-12 lg:mb-12.5">
          <span className="text-lg font-bold uppercase tracking-tight text-default-800 dark:text-white/70">
            How it works
          </span>
          <h2 className="mt-2 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
            From long link to share-ready asset in seconds.
          </h2>
        </div>

        <div className="relative mt-16">
          {/* Connector line behind the icons (desktop only) */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-primary-2/60 to-transparent md:block" />

          <div className="grid gap-12 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative text-center"
              >
                <div className="relative mx-auto mb-7.5 grid size-14 place-items-center rounded-full bg-white shadow-card dark:bg-ink-900">
                  <step.icon className="size-7 text-default-900 dark:text-white" />
                  <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-primary-2 text-base font-bold text-default-900">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold leading-tight text-default-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2.5 max-w-xs text-base leading-relaxed text-default-500 dark:text-white/60">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}