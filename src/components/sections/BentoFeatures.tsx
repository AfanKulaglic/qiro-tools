import { motion } from 'framer-motion'
import { ImageDown, Sparkles, BarChart3, ArrowRight } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { cn } from '@/utils/cn'

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
 * Matches Essentio: `lg:rounded-[50px]` desktop, `lg:min-h-114` cards,
 * `feature-image-01/02.avif` backgrounds with dark vignette overlay.
 */
export function BentoFeatures() {
  return (
    <section className="lg:py-37.5 md:py-25 py-15">
      <Container full>
        {/* Row 1 — heading | yellow card | wide image card (spans 2) */}
        <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12.5">
          {/* row1 col1 — heading (no card) */}
          <Cell i={0} className="flex flex-col justify-center sm:col-span-2 lg:col-span-1 lg:py-8">
            <span className="mb-1 text-lg font-bold uppercase tracking-tight text-default-800 dark:text-white/70">
              Key
            </span>
            <h2 className="text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
              Features
            </h2>
            <p className="mt-3 text-base text-default-500 dark:text-white/60">
              Built for everyday sharing — links, codes, and images in one place.
            </p>
          </Cell>

          {/* row1 col2 — yellow accent card */}
          <Cell
            i={1}
            className="flex flex-col justify-between rounded-3xl bg-primary-2 p-6 text-default-900 lg:min-h-114 lg:rounded-[50px] lg:p-10"
          >
            <span className="grid size-23.5 place-items-center rounded-full bg-white lg:size-23.5">
              <Sparkles className="size-6 text-default-900 lg:size-14" />
            </span>
            <div>
              <h3 className="text-2xl font-bold lg:text-3xl">Custom QR styling</h3>
              <p className="mt-2 text-lg text-default-500">
                Colors, logos, and shapes — codes that match your brand.
              </p>
            </div>
          </Cell>

          {/* row1 col3-4 — image-overlay wide card: short links */}
          <Cell
            i={2}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl p-7 text-white sm:col-span-2 lg:min-h-114 lg:rounded-[50px] lg:p-10"
          >
            <img
              src="/feature-image-01.avif"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-70" />
            <div className="relative">
              <h3 className="text-3xl font-bold">Short links that convert</h3>
              <p className="mt-2 max-w-sm text-lg text-white/80">
                Clean, branded links with click tracking built in.
              </p>
            </div>
            <Link
              to="/studio/shorten"
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
          {/* row2 col1-2 — image-overlay wide card: free history */}
          <Cell
            i={3}
            className="group relative flex flex-col justify-end overflow-hidden rounded-3xl p-7 text-white sm:col-span-2 lg:min-h-114 lg:rounded-[50px] lg:p-10"
          >
            <img
              src="/feature-image-02.avif"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-70" />
            <div className="relative flex flex-col gap-1.5">
              <span className="text-lg font-bold uppercase tracking-normal text-white/90">
                100% Free
              </span>
              <h2 className="text-4xl text-white lg:text-6xl">History that saves everything</h2>
              <p className="mt-2 max-w-sm text-lg text-white/70">
                Every link, code, and conversion — one click away again.
              </p>
            </div>
          </Cell>

          {/* row2 col3 — light card: analytics */}
          <Cell
            i={4}
            className="flex flex-col justify-between rounded-3xl bg-default-100 p-6 lg:min-h-114 lg:rounded-[50px] lg:p-10 dark:bg-white/[0.05]"
          >
            <span className="grid size-23.5 place-items-center rounded-full bg-default-800 text-white">
              <BarChart3 className="size-6 lg:size-14" />
            </span>
            <div>
              <h3 className="text-2xl font-bold text-default-900 lg:text-3xl dark:text-white">
                Click analytics
              </h3>
              <p className="mt-2 text-lg text-default-500 dark:text-white/60">
                See what's working at a glance.
              </p>
            </div>
          </Cell>

          {/* row2 col4 — blue card: private conversion */}
          <Cell
            i={5}
            className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-primary p-6 text-white lg:min-h-114 lg:rounded-[50px] lg:p-10"
          >
            <div className="pointer-events-none absolute -right-10 -bottom-10 opacity-20">
              <QRCodeSVG
                value="https://qiro.tools"
                size={120}
                level="L"
                bgColor="transparent"
                fgColor="#ffffff"
              />
            </div>
            <span className="relative grid size-23.5 place-items-center rounded-full bg-white text-primary">
              <ImageDown className="size-6 lg:size-14" />
            </span>
            <div className="relative">
              <h3 className="text-2xl font-bold lg:text-3xl">Private conversion</h3>
              <p className="mt-2 text-lg text-white/80">Images convert in your browser.</p>
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