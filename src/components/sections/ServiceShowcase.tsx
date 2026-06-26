import { motion } from 'framer-motion'
import { ArrowRight, Check, Link2, QrCode, ImageDown } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

type Service = {
  num: string
  icon: typeof Link2
  eyebrow: string
  headline: string
  copy: string
  bullets: string[]
  cta: string
  to: string
  accent: 'blue' | 'cyan' | 'purple'
  visual: 'link' | 'qr' | 'convert'
}

const SERVICES: Service[] = [
  {
    num: '01',
    icon: Link2,
    eyebrow: 'Link Shortener',
    headline: 'Long, ugly URLs? Gone in one click.',
    copy: 'Turn any link into a short, branded one people actually trust — then watch the clicks roll in with a clean, real-time counter.',
    bullets: ['Custom branded aliases', 'Real-time click tracking', 'Use your own domain'],
    cta: 'Shorten a link — free',
    to: '/studio/shorten',
    accent: 'blue',
    visual: 'link',
  },
  {
    num: '02',
    icon: QrCode,
    eyebrow: 'QR Generator',
    headline: "Codes your customers can't miss.",
    copy: 'Crisp, on-brand QR codes for menus, posters, and packaging. Drop in your logo and colors, then export print-ready in seconds.',
    bullets: ['Logo & color styling', 'High-res & SVG export', 'Editable dynamic codes'],
    cta: 'Create a QR code',
    to: '/studio/qr',
    accent: 'cyan',
    visual: 'qr',
  },
  {
    num: '03',
    icon: ImageDown,
    eyebrow: 'Image Converter',
    headline: 'Convert images without giving them away.',
    copy: 'JPG, PNG, WebP and more — converted instantly, right inside your browser. Nothing is ever uploaded, so your files stay yours.',
    bullets: ['100% in your browser', 'Batch conversion', 'Modern formats (WebP, AVIF)'],
    cta: 'Convert an image',
    to: '/studio/convert',
    accent: 'purple',
    visual: 'convert',
  },
]

const ACCENT_TEXT = {
  blue: 'text-primary',
  cyan: 'text-secondary',
  purple: 'text-primary',
}

/**
 * Essentio-style service showcase — alternating left/right split rows with
 * generous `lg:gap-28.75` between copy and visual, white surface, and a
 * big rounded product visual on the right. Mirrors the reference's "More
 * about" + product image treatment.
 */
export function ServiceShowcase() {
  return (
    <section className="lg:py-37.5 md:py-25 py-15">
      <Container>
        <div className="mb-16 lg:mb-25 text-center">
          <span className="text-lg font-bold uppercase tracking-tight text-default-800 dark:text-white/70">
            What&apos;s inside
          </span>
          <h2 className="mt-3 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
            Three tools that each pull their weight
          </h2>
        </div>

        <div className="space-y-25 md:space-y-37.5">
          {SERVICES.map((s, i) => (
            <ServiceRow key={s.num} service={s} flipped={i % 2 === 1} />
          ))}
        </div>
      </Container>
    </section>
  )
}

function ServiceRow({ service: s, flipped }: { service: Service; flipped: boolean }) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-28.75">
      {/* Copy */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className={cn(flipped && 'lg:order-2')}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-full bg-primary-2 text-default-900">
            <s.icon className="size-7" />
          </span>
          <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-default-800 dark:text-white/70">
            {s.num} — {s.eyebrow}
          </span>
        </div>

        <h3 className="mt-7.5 text-4xl font-normal leading-tight tracking-[-0.01em] text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
          {s.headline}
        </h3>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-default-500 dark:text-white/60">
          {s.copy}
        </p>

        <ul className="mt-7.5 space-y-3.5">
          {s.bullets.map((b) => (
            <li
              key={b}
              className="flex items-center gap-2.5 text-base font-bold text-default-800 dark:text-white/85"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-2 text-default-900">
                <Check className="size-4" />
              </span>
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-9">
          <Button
            to={s.to}
            className="group gap-2.5 rounded-full bg-primary px-7 py-3.75 font-medium uppercase tracking-normal text-white transition-all duration-300 hover:bg-secondary-1"
          >
            {s.cta}
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </motion.div>

      {/* Visual */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(flipped && 'lg:order-1')}
      >
        <div className="relative grid min-h-[18rem] place-items-center overflow-hidden rounded-3xl bg-default-100 dark:bg-white/[0.04] lg:min-h-[28rem] lg:rounded-[40px]">
          <div className="pointer-events-none absolute inset-0 bg-grid-light bg-grid opacity-50 dark:bg-grid-dark" />
          <div
            className={cn(
              'pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl',
              s.accent === 'blue' && 'bg-primary/30',
              s.accent === 'cyan' && 'bg-secondary/30',
              s.accent === 'purple' && 'bg-primary/30',
            )}
          />
          <div className="relative">
            <ServiceVisual variant={s.visual} accent={s.accent} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function ServiceVisual({
  variant,
  accent,
}: {
  variant: Service['visual']
  accent: Service['accent']
}) {
  if (variant === 'qr') {
    return (
      <div className="rounded-3xl bg-white p-7.5 shadow-card">
        <QRCodeSVG value="https://qiro.tools/studio/qr" size={180} level="M" />
      </div>
    )
  }
  if (variant === 'convert') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-default-200 bg-white px-6 py-5 font-mono text-base shadow-card dark:border-white/10 dark:bg-white/[0.04]">
        <span className="rounded-lg border border-default-200 bg-white px-3 py-2 text-default-500 dark:border-white/10 dark:bg-white/[0.04]">
          photo.png
        </span>
        <ArrowRight className="size-5 text-primary" />
        <span className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-primary">
          photo.webp
        </span>
      </div>
    )
  }
  return (
    <div className="w-80 rounded-2xl border border-default-200 bg-white p-5 shadow-card dark:border-white/10 dark:bg-white/[0.04]">
      <div className="rounded-lg border border-default-200 bg-default-50 px-3 py-2.5 font-mono text-xs text-default-500 line-through dark:border-white/10 dark:bg-white/[0.03]">
        example.com/long-campaign-url
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5">
        <span className={cn('font-mono text-base font-semibold', ACCENT_TEXT[accent])}>
          qiro.to/launch
        </span>
        <span className="ml-auto rounded-full bg-accent-green/15 px-2 py-0.5 font-mono text-xs font-bold text-accent-green">
          +1,248
        </span>
      </div>
    </div>
  )
}