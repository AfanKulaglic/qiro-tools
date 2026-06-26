import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'

/**
 * Essentio-style pre-footer CTA banner — full-bleed image with dark
 * vignette, rounded lower edge, white serif headline, pill CTA, and a
 * -mb-25 overlap into the footer below. Uses cta-bg-image.avif so the
 * surface reads as a moody editorial photo, not a flat gradient.
 */
export function FeatureBanner() {
  return (
    <section className="relative lg:pt-25 pt-15 lg:pb-55 pb-40 flex items-center justify-center overflow-hidden text-center -mb-25">
      {/* Background image — Essentio `absolute inset-0 w-full h-full object-cover` */}
      <img
        src="/cta-bg-image.avif"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Vignette — Essentio `bg-linear-to-b from-black via-transparent to-black opacity-70` */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-70" />

      <Container full className="relative lg:max-w-4xl max-w-2xl text-white">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-medium leading-tight text-white lg:text-6xl lg:mb-75 md:mb-25 mb-7.5 md:text-5xl">
            Everyday sharing, elevated{' '}
            <span className="text-primary-2">with intelligent tools.</span>
          </h2>
          <p className="mb-7.5 text-lg text-default-200">
            Discover how Qiro brings links, QR codes, and image conversion into one fast, private
            studio — built to make every share effortless.
          </p>
          <div className="flex justify-center">
            <a
              href="/studio"
              className="group inline-flex items-center gap-2.5 bg-primary hover:bg-secondary-1 text-white px-3.75 py-3.5 rounded-full transition-all duration-300"
            >
              <ArrowRight className="size-6 leading-none transition-transform duration-500 group-hover:-rotate-45" />
              <span className="text-lg font-bold uppercase tracking-normal">Open the Studio</span>
            </a>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}