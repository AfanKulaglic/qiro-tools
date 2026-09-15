import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { DEFAULT_STORY, type BannerStory } from '@/data/toolStory'

/**
 * CTA banner with soul — full-bleed image, organic blob decorations, animated
 * gradient text, noise overlay. Layout/design is fixed; copy, CTA and the
 * background image come from `props` (defaults to the generic home banner).
 */
export function FeatureBanner({
  eyebrow = DEFAULT_STORY.banner.eyebrow,
  lead = DEFAULT_STORY.banner.lead,
  highlight = DEFAULT_STORY.banner.highlight,
  tail = DEFAULT_STORY.banner.tail,
  subtitle = DEFAULT_STORY.banner.subtitle,
  ctaLabel = DEFAULT_STORY.banner.ctaLabel,
  ctaTo = DEFAULT_STORY.banner.ctaTo,
  image = DEFAULT_STORY.banner.image,
}: Partial<BannerStory>) {
  return (
    <section className="relative lg:pt-25 pt-15 lg:pb-55 pb-40 flex items-center justify-center overflow-hidden text-center -mb-25">
      <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />

      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black opacity-80" />

      {/* Organic decorative blobs */}
      <div className="pointer-events-none absolute top-[20%] -left-20 w-64 h-64 blob bg-accent-coral/10 blur-[100px] animate-drift dark:bg-accent-coral/15" />
      <div className="pointer-events-none absolute bottom-[10%] -right-16 w-72 h-72 blob bg-accent-blue/8 blur-[120px] animate-float-slow dark:bg-accent-blue/12" />

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light noise-bg" />

      <Container full className="relative z-10 lg:max-w-4xl max-w-2xl text-white">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-accent-peach/80">
            <Sparkles className="h-3 w-3" />
            {eyebrow}
          </span>
          <h2 className="mt-4 text-4xl font-serif leading-tight text-white lg:text-6xl lg:mb-12 md:mb-8 mb-6 md:text-5xl">
            {lead}{' '}
            <span className="bg-gradient-to-r from-accent-blue via-accent-coral to-accent-peach bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-pan">
              {highlight}
            </span>
            {' '}{tail}
          </h2>
          <p className="mb-8 text-lg text-white/60 max-w-xl mx-auto">{subtitle}</p>
          <div className="flex justify-center">
            <a
              href={ctaTo}
              className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-accent-blue to-accent-cyan text-white px-7 py-3.5 rounded-full transition-all duration-300 hover:shadow-[0_0_32px_-8px_rgba(39,129,236,0.5)] hover:scale-[1.02] active:scale-[0.98] shadow-glow-soft"
            >
              <ArrowRight className="size-6 leading-none transition-transform duration-500 group-hover:-rotate-45" />
              <span className="text-lg font-bold uppercase tracking-normal">{ctaLabel}</span>
            </a>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
