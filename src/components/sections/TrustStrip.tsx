import { motion } from 'framer-motion'
import { Link2, QrCode, ImageDown } from 'lucide-react'
import { Container } from '@/components/ui/Container'

/**
 * Essentio-style "Built for" trust strip — single-line headline over a
 * centered row of icon-led audience chips. Light, restrained, sits well
 * between heavier editorial sections.
 */
const AUDIENCE = [
  { icon: Link2, label: 'Marketing teams' },
  { icon: QrCode, label: 'Restaurants & cafés' },
  { icon: ImageDown, label: 'E-commerce' },
  { icon: Link2, label: 'Event organizers' },
  { icon: QrCode, label: 'Print designers' },
  { icon: ImageDown, label: 'Freelancers' },
]

export function TrustStrip() {
  return (
    <section className="border-y border-default-200 bg-white/60 py-10 dark:border-white/10 dark:bg-white/[0.02]">
      <Container>
        <p className="text-center text-base text-default-500 dark:text-white/55">
          Built for the people who share things on the web every day —
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {AUDIENCE.map((a, i) => (
            <motion.span
              key={`${a.label}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="inline-flex items-center gap-2 rounded-full border border-default-200 bg-white px-4 py-2 text-base font-medium text-default-800 transition-colors hover:border-primary/40 hover:text-primary dark:border-white/12 dark:bg-white/[0.04] dark:text-white/80"
            >
              <a.icon className="h-4 w-4 text-primary" />
              {a.label}
            </motion.span>
          ))}
        </div>
      </Container>
    </section>
  )
}