import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'

/**
 * Essentio-style inline-image CTA — centered editorial headline with a
 * small `cta-image.avif` tile tucked between the words. The image replaces
 * Qiro's gradient orb so the section reads like the Essentio reference.
 *
 * Below the headline, two CTA pill images act as the platform entries —
 * mirrors Essentio's `lg:p-10 md:p-5` flex of two pill graphics.
 */
export function AppCTA() {
  return (
    <section className="lg:py-37.5 md:py-20 py-15">
      <Container full>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          {/* Split heading layout (Essentio `leading-none mb-4 md:mb-7.5`) */}
          <div className="mb-6 flex flex-col items-center lg:mb-10">
            <h2 className="text-4xl leading-none text-default-900 mb-4 md:mb-7.5 md:text-5xl lg:text-6xl">
              Open the studio,
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-6 lg:gap-x-10">
              <h2 className="text-4xl leading-none text-default-900 md:text-5xl lg:text-6xl">
                keep it
              </h2>

              {/* Inline app preview image — Essentio `w-15 h-15 md:w-25 md:h-25 lg:w-50 lg:h-50` */}
              <div className="relative h-15 w-15 shrink-0 md:h-25 md:w-25 lg:h-50 lg:w-50">
                <img
                  src="/cta-image.avif"
                  alt="Qiro studio UI"
                  className="h-full w-full rounded-2xl object-cover lg:rounded-[60px]"
                />
              </div>

              <h2 className="text-4xl leading-none text-default-900 md:text-5xl lg:text-6xl">
                in your browser
              </h2>
            </div>
          </div>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-default-500 lg:mb-12.5 mb-7.5">
            No installs, no accounts to start, no files leaving your device. Open the studio and
            your links, codes, and images are one click away.
          </p>

          {/* Essentio-style CTA pills — two pill buttons (acts like app store tiles) */}
          <div className="flex flex-wrap items-stretch justify-center gap-5 md:gap-7.5 lg:p-10 md:p-5">
            <a
              href="/studio/shorten"
              className="group flex items-center gap-3 rounded-2xl bg-default-900 px-5 py-3 text-white transition-all hover:bg-primary md:px-6 md:py-3.5"
            >
              <span className="text-2xl font-bold leading-none">↗</span>
              <div className="text-left">
                <p className="text-xs uppercase tracking-normal text-white/70">Start with</p>
                <p className="text-base font-bold uppercase leading-tight md:text-lg">
                  Link Shortener
                </p>
              </div>
            </a>
            <a
              href="/studio/qr"
              className="group flex items-center gap-3 rounded-2xl bg-default-100 px-5 py-3 text-default-900 transition-all hover:bg-primary-2 md:px-6 md:py-3.5"
            >
              <span className="text-2xl font-bold leading-none">◇</span>
              <div className="text-left">
                <p className="text-xs uppercase tracking-normal text-default-500">Or try</p>
                <p className="text-base font-bold uppercase leading-tight md:text-lg">
                  QR Generator
                </p>
              </div>
            </a>
            <a
              href="/studio/convert"
              className="group flex items-center gap-3 rounded-2xl bg-primary-2 px-5 py-3 text-default-900 transition-all hover:bg-accent-yellow md:px-6 md:py-3.5"
            >
              <span className="text-2xl font-bold leading-none">⤓</span>
              <div className="text-left">
                <p className="text-xs uppercase tracking-normal text-default-600">Convert</p>
                <p className="text-base font-bold uppercase leading-tight md:text-lg">
                  Images
                </p>
              </div>
            </a>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}