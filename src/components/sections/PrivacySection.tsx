import { motion } from 'framer-motion'
import { Lock, Check, Globe } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const CHECKLIST = [
  'Browser-based image conversion',
  'No image uploads',
  'QR generation is local',
  'Firebase-powered short links',
  'No external shortener API',
]

/**
 * Essentio-style privacy split — left column holds the heading, intro,
 * and check list (Essentio's "Solutions designed to make cleaning
 * faster" treatment); right column is a yellow (primary-2) card holding
 * the in-browser illustration.
 */
export function PrivacySection() {
  return (
    <section className="lg:py-37.5 md:py-25 py-15">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-28.75">
          {/* Left — copy + checklist */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-lg font-bold uppercase tracking-tight text-default-800 dark:text-white/70">
              Privacy
            </span>
            <h2 className="mt-3 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
              Private where it matters.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-default-500 dark:text-white/60">
              QR generation and image conversion happen in your browser. Images are not uploaded to
              a server. Short links are stored only when you choose to create them.
            </p>
            <ul className="mt-7.5 space-y-4">
              {CHECKLIST.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-base font-bold text-default-800 dark:text-white/80"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-2 text-default-900">
                    <Check className="size-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — yellow "image" card with browser mock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl bg-primary-2 p-7.5 lg:rounded-[40px] lg:p-10">
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/40 blur-3xl" />
              {/* browser window */}
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-card">
                <div className="flex items-center gap-1.5 border-b border-default-200 px-4 py-3">
                  <span className="size-3 rounded-full bg-red-400/70" />
                  <span className="size-3 rounded-full bg-amber-400/70" />
                  <span className="size-3 rounded-full bg-accent-green/70" />
                  <span className="ml-3 flex items-center gap-1.5 text-xs font-medium text-default-600">
                    <Lock className="size-3" /> in your browser
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-4 px-6 py-12">
                  <div className="grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
                    <Lock className="size-9" />
                  </div>
                  <p className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                    Your files never leave your device
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium text-default-500">
                    <Globe className="size-3.5" />
                    No upload · No server processing
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}