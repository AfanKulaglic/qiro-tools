import { motion } from 'framer-motion'
import { CircleChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
}

/**
 * Essentio-style hero — full-bleed image with rounded lower edge, dark
 * vignette overlay, centered oversized serif headline, pill CTA. Uses
 * hero-main.png so the section reads as a moody editorial photo.
 */
export function HeroSection() {
  return (
    <section className="relative w-full lg:py-55 md:pt-35 md:pb-25 flex items-center justify-center overflow-hidden rounded-b-[50px] bg-black md:rounded-b-[86px]">
      {/* Background image — Essentio `absolute inset-0 w-full h-full object-cover` */}
      <img
        src="/hero-main.png"
        alt="Qiro studio surface"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark vignette — Essentio `bg-linear-to-b from-black via-transparent to-black opacity-70` */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-70" />

      {/* Content container — Essentio `relative z-10 container text-center text-white` */}
      <Container full className="relative z-10 text-center text-white">
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="show"
          className="mx-auto inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-green shadow-[0_0_10px_rgba(34,197,94,0.9)]" />
          Links · QR · Images — one studio
        </motion.div>

        {/* Headline — Essentio `lg:text-8xl text-white font-normal leading-tight mb-5` */}
        <motion.h1
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="show"
          className="mx-auto mt-7 max-w-5xl font-serif text-5xl font-normal leading-[1.02] tracking-[-0.01em] text-white sm:text-7xl lg:text-8xl"
        >
          Shorten, generate &amp;{' '}
          <span className="text-accent-yellow">convert</span>
          <br className="hidden sm:block" /> in one clean studio.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate="show"
          className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-lg"
        >
          Branded short links, downloadable QR codes, and private in-browser
          image conversion — together in a single, distraction-free workspace.
        </motion.p>

        {/* Buttons — Essentio pill CTA */}
        <motion.div
          variants={fadeUp}
          custom={3}
          initial="hidden"
          animate="show"
          className="mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-3"
        >
          <Button
            to="/studio"
            size="lg"
            className="group gap-2.5 bg-primary px-7 py-3.75 rounded-full font-medium uppercase tracking-normal text-white transition-all duration-300 hover:bg-accent-cyan hover:text-white"
          >
            <CircleChevronRight className="size-6 leading-none transition-transform duration-500 group-hover:-rotate-45" />
            <span>Open the Studio</span>
          </Button>
          <Button
            to="/features"
            variant="outline"
            size="lg"
            className="rounded-full border-white/30 px-7 text-white hover:border-white hover:bg-white/10 hover:text-white"
          >
            See features
          </Button>
        </motion.div>
      </Container>
    </section>
  )
}
