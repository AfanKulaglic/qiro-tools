import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Link2, QrCode, ImageDown } from 'lucide-react'
import { Container } from '@/components/ui/Container'

type Studio = {
  icon: typeof Link2
  name: string
  tagline: string
  image: string
  features: string[]
  to: string
}

const STUDIOS: Studio[] = [
  {
    icon: Link2,
    name: 'Link Studio',
    tagline: 'Branded short links with click tracking',
    features: ['Custom aliases', 'Own-domain support', 'Click counter'],
    to: '/studio/shorten',
    image: '/product/product-01.avif',
  },
  {
    icon: QrCode,
    name: 'QR Studio',
    tagline: 'Customizable QR codes, ready to download',
    features: ['Colors & logos', 'High-res SVG export', 'Save to history'],
    to: '/studio/qr',
    image: '/product/product-02.avif',
  },
  {
    icon: ImageDown,
    name: 'Convert Studio',
    tagline: 'Private in-browser image conversion',
    features: ['JPG · PNG · WebP', 'Nothing uploaded', 'Batch friendly'],
    to: '/studio/convert',
    image: '/product/product-03.avif',
  },
]

/** Essentio-style product carousel, repurposed for the three Qiro studios.
 *  Mirrors the Essentio Products Swiper: text + checklist on the left, big
 *  lifestyle image on the right, prev/next controls bottom-left, numbered
 *  thumbs. */
export function StudioCarousel() {
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const s = STUDIOS[i]

  const go = (next: number) => {
    setDir(next > i || (i === STUDIOS.length - 1 && next === 0) ? 1 : -1)
    setI((next + STUDIOS.length) % STUDIOS.length)
  }

  return (
    <section className="lg:py-37.5 md:py-25 py-15">
      <Container full>
        <div className="mb-12 lg:mb-17.5 text-center">
          <span className="text-lg font-bold uppercase tracking-normal text-default-800 dark:text-white/70">
            Our
          </span>
          <h2 className="mt-3 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
            Three studios, one workspace
          </h2>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-7.5">
          {/* Left — studio card with controls (Essentio text + chevrons) */}
          <div className="relative flex flex-col justify-between rounded-3xl p-7 text-default-900 lg:rounded-[50px] lg:p-12.5 lg:min-h-114 bg-default-100 dark:bg-white/[0.04]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={s.name}
                custom={dir}
                initial={{ opacity: 0, x: dir * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -24 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="grid size-15 place-items-center rounded-full bg-primary text-white lg:size-23.5">
                  <s.icon className="size-6 lg:size-14" />
                </span>
                <h3 className="mt-7.5 text-4xl font-bold leading-tight text-default-900 lg:text-5xl dark:text-white">
                  {s.name}
                </h3>
                <p className="mt-3 text-lg text-default-500 dark:text-white/60">{s.tagline}</p>

                <ul className="mt-6 space-y-3">
                  {s.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-base text-default-800 dark:text-white/85"
                    >
                      <span className="grid size-6 place-items-center rounded-full bg-primary-2 text-default-900">
                        <ArrowRight className="size-4" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next chevrons + counter (Essentio bottom controls) */}
            <div className="mt-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => go(i - 1)}
                  aria-label="Previous studio"
                  className="grid size-16.25 place-items-center rounded-full bg-default-100 text-default-900 transition-colors hover:bg-primary hover:text-white dark:bg-white/[0.06] dark:text-white"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <button
                  onClick={() => go(i + 1)}
                  aria-label="Next studio"
                  className="grid size-16.25 place-items-center rounded-full bg-default-100 text-default-900 transition-colors hover:bg-primary hover:text-white dark:bg-white/[0.06] dark:text-white"
                >
                  <ArrowRight className="size-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {STUDIOS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => go(idx)}
                    aria-label={`Go to studio ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === i
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-default-300 dark:bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right — lifestyle image (Essentio product image column) */}
          <div className="relative overflow-hidden rounded-3xl lg:rounded-[50px] lg:min-h-114">
            <AnimatePresence mode="wait">
              <motion.img
                key={s.image}
                src={s.image}
                alt={s.name}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Numbered chip */}
            <span className="absolute left-7 top-7 grid size-12.5 place-items-center rounded-full bg-white text-base font-bold text-default-900 lg:size-15 lg:text-lg">
              {String(i + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
      </Container>
    </section>
  )
}