import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { WHY_FEATURES } from '@/data/features'

/**
 * Essentio-style "why it feels better" — three-column grid of icon-led
 * cards with thick rounded corners (`rounded-3xl`), generous padding, and
 * hover lift. No accent gradient borders; just clean white cards that
 * match the bento treatment from BentoFeatures.
 */
export function WhyFeatures() {
  return (
    <section className="lg:py-37.5 md:py-25 py-15">
      <Container>
        <div className="mb-12 lg:mb-12.5">
          <span className="text-lg font-bold uppercase tracking-tight text-default-800 dark:text-white/70">
            Why Qiro
          </span>
          <h2 className="mt-2 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
            Built for clarity, speed, and trust.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group flex flex-col gap-5 rounded-3xl border border-default-200 bg-white p-7.5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow-soft dark:border-white/10 dark:bg-white/[0.04]"
            >
              <span className="grid size-14 place-items-center rounded-full bg-default-100 text-default-900 transition-colors group-hover:bg-primary group-hover:text-white dark:bg-ink-900 dark:text-white">
                <f.icon className="size-7" />
              </span>
              <h3 className="text-xl font-bold leading-tight text-default-900 dark:text-white">
                {f.title}
              </h3>
              <p className="text-base leading-relaxed text-default-500 dark:text-white/60">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}