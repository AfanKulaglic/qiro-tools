import { Star } from 'lucide-react'
import { Marquee } from '@/components/ui/Marquee'

const PHRASES = [
  'Clean short links',
  'Instant QR codes',
  'Private image conversion',
  'No signup to start',
  'Free, no limits',
  'One studio for everything',
]

/** Dark full-bleed scrolling marquee band — rhythm break between sections. */
export function MarqueeStrip() {
  return (
    <section className="bg-ink-950 py-6 dark:bg-white/[0.03]">
      <Marquee duration={30}>
        {PHRASES.map((p, i) => (
          <span key={p} className="flex items-center gap-3 px-2">
            <Star className="h-4 w-4 fill-accent-yellow text-accent-yellow" />
            <span
              className={
                i % 2 === 0
                  ? 'font-serif text-xl font-light tracking-tight text-white sm:text-2xl'
                  : 'font-serif text-xl font-light tracking-tight text-accent-yellow sm:text-2xl'
              }
            >
              {p}
            </span>
          </span>
        ))}
      </Marquee>
    </section>
  )
}
