import { motion } from 'framer-motion'
import { Gauge, ShieldCheck, Infinity as InfinityIcon, CircleChevronRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

/**
 * Essentio-style "About split" — left column has the editorial copy + CTA
 * + 3-icon micro-feature grid (mirrors Essentio's "Dust Removal /
 * Continuous Cleaning / Happy Customers" treatment); right column is a
 * rounded product photo on a clean surface.
 *
 * Replaces the dark studio visual with the actual about-split-image so the
 * page reads as a real product photo instead of an abstract panel.
 */

const FEATURES = [
  {
    Icon: Gauge,
    title: 'Instant results',
    body: 'Open the studio, paste a link, get a short URL or QR — no waiting.',
  },
  {
    Icon: ShieldCheck,
    title: 'Private by design',
    body: 'QR and image conversion run entirely in your browser. Files stay yours.',
  },
  {
    Icon: InfinityIcon,
    title: 'Free, no limits',
    body: 'Start in seconds with no signup. Pro plans only when you outgrow free.',
  },
]

export function ToolStrip() {
  return (
    <section>
      <Container full>
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-0 md:gap-0">
          {/* Left — copy + 3-icon grid (Essentio left column with lg:gap-y-42.5) */}
          <div className="flex flex-col gap-y-12.5 lg:gap-y-42.5">
            <div>
              <h2 className="text-4xl font-normal leading-normal text-default-800 mb-10 lg:max-w-4xl md:text-5xl lg:text-6xl md:mb-12.5">
                Sharing tools designed to make every link, code, and image{' '}
                <span className="text-primary">faster, easier</span>, and more private.
              </h2>
              <p className="text-lg leading-relaxed text-default-500 max-w-xl">
                Qiro brings link shortening, QR generation, and image conversion into one focused
                studio — built so the next thing you share is one click away.
              </p>
            </div>

            {/* 3-icon micro-feature grid — Essentio `lg:grid-cols-3 gap-4 md:gap-7.5 mt-auto` */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-7.5">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex flex-col gap-2.5 lg:gap-4">
                  <span className="grid size-7.5 place-items-center lg:size-14">
                    <f.Icon className="size-7.5 text-default-900 lg:size-14 dark:text-white" />
                  </span>
                  <p className="text-base font-bold uppercase leading-tight tracking-normal text-default-800 md:text-lg dark:text-white/85">
                    {f.title}
                  </p>
                  <p className="hidden text-base leading-relaxed text-default-500 lg:block dark:text-white/60">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>

            {/* "More about" pill CTA — Essentio black pill with chevron */}
            <div className="mt-10 flex md:mt-12.5 lg:mt-15">
              <Button
                to="/about"
                size="lg"
                className="group gap-2.5 rounded-full bg-default-900 px-3.75 py-3.5 text-lg font-bold uppercase tracking-normal text-white transition-all duration-300 hover:bg-primary dark:bg-white dark:text-default-900 dark:hover:bg-primary dark:hover:text-white"
              >
                More about
                <CircleChevronRight className="size-6 leading-none transition-transform duration-500 group-hover:-rotate-45" />
              </Button>
            </div>
          </div>

          {/* Right — rounded product photo (Essentio `lg:w-162 lg:h-auto rounded-[40px]`) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative ms-auto float-end"
          >
            <img
              src="/about-split-image.avif"
              alt="Qiro studio surface"
              className="h-full w-full object-cover rounded-2xl lg:w-162 lg:h-auto lg:rounded-[40px]"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  )
}