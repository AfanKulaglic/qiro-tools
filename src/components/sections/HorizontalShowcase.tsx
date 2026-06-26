import { motion } from 'framer-motion'
import { Link2, QrCode, ImageDown } from 'lucide-react'
import { Container } from '@/components/ui/Container'

/**
 * Essentio client testimonials strip — three centered columns, each with
 * an icon disc, an oversized serif quote, and a soft caption. Light,
 * wide-set; sits between the dark hero and the heavier sections below.
 *
 * Substitutes the Qiro "sticky horizontal scroll" showcase with a static
 * three-up grid that mirrors Essentio's client + testimonial section.
 */

const ITEMS = [
  {
    Icon: Link2,
    quote:
      'Qiro replaced three different tabs I used to keep open. Short links and QR codes from the same place — finally.',
    name: 'Marketing teams',
    role: 'agencies',
  },
  {
    Icon: QrCode,
    quote:
      'The QR generator is clean and the export is instantly print-ready. No watermark nonsense — exactly what my café needed.',
    name: 'Restaurants & cafés',
    role: 'small business',
  },
  {
    Icon: ImageDown,
    quote:
      'I convert product photos to WebP all day. Knowing nothing gets uploaded is a real relief for client work.',
    name: 'Freelance designers',
    role: 'creative studios',
  },
]

export function HorizontalShowcase() {
  return (
    <section className="lg:py-37.5 md:py-25 py-15">
      <Container full>
        <div className="grid grid-cols-1 items-start gap-12 text-center sm:grid-cols-2 lg:grid-cols-3 lg:gap-33.75">
          {ITEMS.map((it, i) => (
            <motion.div
              key={it.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group flex flex-col items-center"
            >
              <span className="mb-8 grid size-14 place-items-center rounded-full bg-default-100 text-default-900 transition-colors group-hover:bg-primary group-hover:text-white md:mb-10 dark:bg-white/[0.06] dark:text-white">
                <it.Icon className="size-7" />
              </span>
              <p className="text-lg leading-relaxed text-default-400 dark:text-white/60">
                &ldquo;{it.quote}&rdquo;
              </p>
              <h3 className="mt-6 text-lg font-bold text-default-900 dark:text-white">
                {it.name}
              </h3>
              <p className="mt-1 text-sm uppercase tracking-normal text-default-500 dark:text-white/45">
                {it.role}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}