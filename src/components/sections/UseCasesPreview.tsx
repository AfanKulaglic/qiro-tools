import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { USE_CASES } from '@/data/useCases'

/**
 * Essentio-style use-case grid — three columns of large rounded cards,
 * each with an oversized icon disc and generous breathing room. The
 * pattern mirrors the reference's "Effortless cleaning" / "Save big" /
 * "Self-charging" bento cards (see BentoFeatures for the same shape).
 */
export function UseCasesPreview() {
  return (
    <section className="lg:py-37.5 md:py-25 py-15">
      <Container>
        <div className="mb-12 lg:mb-12.5">
          <span className="text-lg font-bold uppercase tracking-tight text-default-800 dark:text-white/70">
            Use cases
          </span>
          <h2 className="mt-2 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
            Made for real businesses and daily work.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((uc, i) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group flex flex-col justify-between rounded-3xl border border-default-200 bg-white p-7.5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow-soft dark:border-white/10 dark:bg-white/[0.04]"
            >
              <span className="mb-7.5 grid size-14 place-items-center rounded-full bg-primary-2 text-default-900 transition-colors group-hover:bg-primary group-hover:text-white">
                <uc.icon className="size-7" />
              </span>
              <div>
                <h3 className="text-xl font-bold leading-tight text-default-900 dark:text-white">
                  {uc.title}
                </h3>
                <p className="mt-2.5 text-base leading-relaxed text-default-500 dark:text-white/60">
                  {uc.tagline}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button to="/use-cases" variant="outline" size="lg" className="rounded-full px-7 uppercase">
            Explore use cases
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Container>
    </section>
  )
}