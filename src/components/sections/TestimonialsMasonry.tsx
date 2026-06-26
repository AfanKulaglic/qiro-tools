import { motion } from 'framer-motion'
import { Star, Play, Instagram, Twitter, Facebook } from 'lucide-react'
import { Container } from '@/components/ui/Container'

/**
 * Essentio-style 4-column customer reviews grid. Eight cards mixing three
 * layouts — text review with social icon, image-with-bottom-overlay,
 * video play card — in the same asymmetric pattern as the reference.
 *
 * Uses real testimonial photos (`/blog/testimonial-N.avif`) and real
 * avatars (`/user/N.avif`) so the section reads like the Essentio
 * reference instead of an abstract gradient panel.
 */

type TextItem = {
  kind: 'text'
  quote: string
  name: string
  role: string
  social: 'instagram' | 'twitter' | 'facebook'
  /** Yellow stars vs blue stars — Essentio alternates accent-yellow and accent-blue */
  starTone: 'yellow' | 'blue'
  avatar: string
}

type VisualItem = {
  kind: 'visual'
  /** Image-with-overlay (link / qr / convert) or video play card */
  variant: 'overlay' | 'play'
  /** Path under /blog — overlay cards reuse testimonial photos */
  image: string
  caption: string
  /** Optional pull-quote shown at the bottom of overlay cards */
  overlay?: string
}

type Item = TextItem | VisualItem

const ITEMS: Item[] = [
  {
    kind: 'text',
    quote:
      'Qiro replaced three different tabs I used to keep open. Short links and QR codes from the same place — finally.',
    name: 'Sophia M',
    role: 'Director',
    social: 'instagram',
    starTone: 'yellow',
    avatar: '/user/3.avif',
  },
  {
    kind: 'visual',
    variant: 'overlay',
    image: '/blog/testimonial-05.avif',
    caption: 'Custom aliases, click tracking, and a clean link on my own domain.',
    overlay: 'Branded short links, ready to share in seconds.',
  },
  {
    kind: 'text',
    quote: 'The QR generator is clean and the export is instantly print-ready. No watermark nonsense.',
    name: 'James R',
    role: 'Director',
    social: 'twitter',
    starTone: 'blue',
    avatar: '/user/4.avif',
  },
  {
    kind: 'visual',
    variant: 'play',
    image: '/blog/testimonial-06.avif',
    caption: 'See the studio in 60 seconds',
  },
  {
    kind: 'visual',
    variant: 'overlay',
    image: '/blog/estimonial-07.avif',
    caption: 'High-resolution SVG and PNG exports, with optional center logo.',
    overlay: 'QR codes that match your brand and print beautifully.',
  },
  {
    kind: 'text',
    quote:
      'I convert product photos to WebP all day. Knowing nothing gets uploaded is a real relief for client work.',
    name: 'Mike R',
    role: 'Director',
    social: 'twitter',
    starTone: 'blue',
    avatar: '/user/2.avif',
  },
  {
    kind: 'visual',
    variant: 'overlay',
    image: '/blog/testimonial-08.avif',
    caption: 'JPG · PNG · WebP, batch-friendly. Files never leave your device.',
    overlay: 'In-browser image conversion — private by design.',
  },
  {
    kind: 'text',
    quote: 'History view means I never lose a code I made last week. Small thing, huge time-saver.',
    name: 'Emma L',
    role: 'Director',
    social: 'facebook',
    starTone: 'yellow',
    avatar: '/user/1.avif',
  },
]

export function TestimonialsMasonry() {
  return (
    <section className="lg:pb-37.5 md:pb-20 pb-15">
      <Container full>
        {/* Section header — Essentio: TESTIMONIAL eyebrow + big serif title */}
        <div className="mb-12 lg:mb-12.5">
          <span className="block text-lg uppercase tracking-normal font-medium text-default-800 dark:text-white/70">
            Testimonial
          </span>
          <h2 className="mt-2 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
            Customer reviews
          </h2>
        </div>

        {/* 4-column review grid — Essentio asymmetric mix */}
        <div className="grid grid-cols-1 gap-12.5 md:grid-cols-2 lg:grid-cols-4 lg:gap-26.25">
          {ITEMS.map((it, idx) =>
            it.kind === 'visual' ? (
              <VisualCard key={`v${idx}`} item={it} index={idx} />
            ) : (
              <ReviewCard key={it.name} review={it} index={idx} />
            ),
          )}
        </div>
      </Container>
    </section>
  )
}

function StarRow({ tone }: { tone: 'yellow' | 'blue' }) {
  const fill =
    tone === 'yellow'
      ? 'fill-primary-2 text-primary-2/80'
      : 'fill-primary text-primary'
  return (
    <div className="mb-2.5 flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`text-xl ${fill}`} />
      ))}
    </div>
  )
}

function ReviewCard({ review, index }: { review: TextItem; index: number }) {
  const SocialIcon =
    review.social === 'instagram' ? Instagram : review.social === 'twitter' ? Twitter : Facebook
  return (
    <motion.figure
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}
      className="flex h-full min-h-60 flex-col justify-between rounded-3xl"
    >
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <StarRow tone={review.starTone} />
          <SocialIcon className="text-2xl text-default-900 transition-transform duration-300 hover:-translate-y-1 dark:text-white" />
        </div>
        <blockquote className="text-lg font-bold leading-normal text-default-900 dark:text-white">
          {review.quote}
        </blockquote>
      </div>

      <div className="mt-5 flex flex-col items-start justify-between gap-2.5 md:flex-row md:items-center">
        <div>
          <h3 className="text-lg font-bold text-default-900 sm:text-xl dark:text-white">{review.name}</h3>
          <span className="text-lg tracking-normal text-default-400 dark:text-white/50">{review.role}</span>
        </div>
        <img
          src={review.avatar}
          alt={review.name}
          className="size-14 shrink-0 rounded-full object-cover"
        />
      </div>
    </motion.figure>
  )
}

function VisualCard({ item, index }: { item: VisualItem; index: number }) {
  if (item.variant === 'play') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}
        className="group relative flex h-full min-h-60 cursor-pointer items-center justify-center overflow-hidden rounded-3xl"
      >
        <img
          src={item.image}
          alt={item.caption}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <span className="relative grid size-11.5 place-items-center rounded-full bg-primary transition-transform duration-300 group-hover:scale-110">
          <Play className="text-xl text-white" />
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}
      className="group relative h-full min-h-60 overflow-hidden rounded-3xl"
    >
      <img
        src={item.image}
        alt={item.caption}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      {item.overlay && (
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
          <p className="text-lg leading-normal text-white">{item.overlay}</p>
        </div>
      )}
    </motion.div>
  )
}