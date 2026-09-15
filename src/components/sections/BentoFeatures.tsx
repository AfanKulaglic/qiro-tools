import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { cn } from '@/utils/cn'
import { DEFAULT_STORY, type BentoStory } from '@/data/toolStory'

const reveal = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

/**
 * 4-column / 2-row asymmetric bento, Essentio-style:
 *   row 1: [heading] [yellow card] [dark wide card ×2]
 *   row 2: [dark wide card ×2] [light card] [blue card]
 *
 * Layout/design is fixed; all copy, icons and imagery come from `story` so each
 * tool page tells its own story (defaults to the generic home content).
 */
export function BentoFeatures({ story = DEFAULT_STORY.bento }: { story?: BentoStory }) {
  const { featureA, showcase, highlight, featureB, featureC } = story
  return (
    <section className="lg:py-37.5 md:py-25 py-15">
      <Container full>
        {/* Row 1 — heading | yellow card | wide image card (spans 2) */}
        <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12.5">
          {/* row1 col1 — heading (no card) */}
          <Cell i={0} className="flex flex-col justify-center sm:col-span-2 lg:col-span-1 lg:py-8">
            <span className="mb-1 text-lg font-bold uppercase tracking-tight text-default-800 dark:text-white/70">
              {story.eyebrow}
            </span>
            <h2 className="text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
              {story.title}
            </h2>
            <p className="mt-3 text-base text-default-500 dark:text-white/60">{story.intro}</p>
          </Cell>

          {/* row1 col2 — yellow accent card */}
          <Cell
            i={1}
            className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-accent-peach/80 to-accent-yellow/60 p-6 text-default-900 lg:min-h-114 lg:rounded-[50px] lg:p-10"
          >
            <span className="grid size-23.5 place-items-center rounded-full bg-white/90 shadow-glow-soft lg:size-23.5">
              <featureA.Icon className="size-6 text-accent-coral lg:size-14" />
            </span>
            <div>
              <h3 className="text-2xl font-bold lg:text-3xl">{featureA.title}</h3>
              <p className="mt-2 text-lg text-default-600">{featureA.desc}</p>
            </div>
          </Cell>

          {/* row1 col3-4 — image-overlay wide card with CTA */}
          <Cell
            i={2}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl p-7 text-white sm:col-span-2 lg:min-h-114 lg:rounded-[50px] lg:p-10"
          >
            <img src={showcase.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-70" />
            <div className="relative">
              <h3 className="text-3xl font-bold">{showcase.title}</h3>
              <p className="mt-2 max-w-sm text-lg text-white/80">{showcase.desc}</p>
            </div>
            <Link
              to={showcase.ctaTo}
              className="relative inline-flex w-fit items-center gap-2.5 text-primary-2 text-lg font-bold uppercase tracking-normal"
            >
              Open
              <ArrowRight className="size-6 transition-transform group-hover:-translate-x-0.5 group-hover:rotate-45 duration-500" />
            </Link>
          </Cell>
        </div>

        {/* Inter-row breathing room — Essentio `lg:mb-12.5 mb-7.5` */}
        <div className="lg:mb-12.5 mb-7.5" />

        {/* Row 2 — wide image card (spans 2) | light card | blue card */}
        <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12.5">
          {/* row2 col1-2 — image-overlay wide card */}
          <Cell
            i={3}
            className="group relative flex flex-col justify-end overflow-hidden rounded-3xl p-7 text-white sm:col-span-2 lg:min-h-114 lg:rounded-[50px] lg:p-10"
          >
            <img src={highlight.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-70" />
            <div className="relative flex flex-col gap-1.5">
              <span className="text-lg font-bold uppercase tracking-normal text-white/90">{highlight.eyebrow}</span>
              <h2 className="text-4xl text-white lg:text-6xl">{highlight.title}</h2>
              <p className="mt-2 max-w-sm text-lg text-white/70">{highlight.desc}</p>
            </div>
          </Cell>

          {/* row2 col3 — light icon card */}
          <Cell
            i={4}
            className="flex flex-col justify-between rounded-3xl bg-default-100 p-6 lg:min-h-114 lg:rounded-[50px] lg:p-10 dark:bg-white/[0.05]"
          >
            <span className="grid size-23.5 place-items-center rounded-full bg-default-800 text-white">
              <featureB.Icon className="size-6 lg:size-14" />
            </span>
            <div>
              <h3 className="text-2xl font-bold text-default-900 lg:text-3xl dark:text-white">{featureB.title}</h3>
              <p className="mt-2 text-lg text-default-500 dark:text-white/60">{featureB.desc}</p>
            </div>
          </Cell>

          {/* row2 col4 — blue-to-cyan icon card */}
          <Cell
            i={5}
            className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-accent-blue to-accent-cyan p-6 text-white lg:min-h-114 lg:rounded-[50px] lg:p-10"
          >
            <div className="pointer-events-none absolute -right-10 -bottom-10 opacity-15">
              <QRCodeSVG value="https://qiro.tools" size={120} level="L" bgColor="transparent" fgColor="#ffffff" />
            </div>
            {/* Warm coral accent blob */}
            <div className="pointer-events-none absolute -left-12 -top-12 w-48 h-48 blob bg-accent-coral/10 blur-3xl" />
            <span className="relative grid size-23.5 place-items-center rounded-full bg-white/90 text-accent-blue shadow-glow-soft">
              <featureC.Icon className="size-6 lg:size-14" />
            </span>
            <div className="relative">
              <h3 className="text-2xl font-bold lg:text-3xl">{featureC.title}</h3>
              <p className="mt-2 text-lg text-white/75">{featureC.desc}</p>
            </div>
          </Cell>
        </div>
      </Container>
    </section>
  )
}

function Cell({
  i,
  className,
  children,
}: {
  i: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      variants={reveal}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className={cn('min-h-[15rem] lg:min-h-114', className)}
    >
      {children}
    </motion.div>
  )
}
