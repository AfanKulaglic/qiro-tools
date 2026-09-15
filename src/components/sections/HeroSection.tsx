import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, ShieldCheck, BadgeCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { EmbeddedTool } from '@/components/tools/EmbeddedTool'
import { TOOLS, TOOLS_BY_CATEGORY, getTool } from '@/data/tools'
import type { ToolKey } from '@/hooks/useToolGate'
import { cn } from '@/utils/cn'

const REASSURE = [
  { Icon: Zap, text: 'Instant — nothing to install' },
  { Icon: ShieldCheck, text: 'Private — runs in your browser' },
  { Icon: BadgeCheck, text: '3 free actions — no signup' },
]

/** Landscape fine-art backdrops that auto-crossfade behind the hero. */
const HERO_SLIDES = [
  { src: '/hero/hero-1.jpg', alt: 'Wheat Field with Cypresses — Vincent van Gogh' },
  { src: '/hero/hero-2.jpg', alt: 'Crimean Landscape — Isaac Levitan' },
  { src: '/hero/hero-3.jpg', alt: 'Mont Sainte-Victoire — Paul Cézanne' },
  { src: '/hero/hero-4.jpg', alt: 'Water Lilies — Claude Monet' },
]

/** How long each backdrop stays before crossfading to the next (ms). */
const SLIDE_INTERVAL = 6000

/** Gap (px) kept between the switcher and the top of the overlapping card. */
const SWITCHER_GAP = 20

/**
 * Hero — a fixed-height dark "stage" (image + headline + switcher) whose height
 * never changes with the tool. The live tool card floats over the stage's bottom
 * edge: up to ~50% of the card sits on the dark stage and the rest hangs below it
 * on the page. The overlap is measured so it never covers the switcher — taller
 * tools simply hang further below.
 */
export function HeroSection() {
  const [active, setActive] = useState<ToolKey>('qr')
  const svc = getTool(active) ?? TOOLS[0]

  const stageRef = useRef<HTMLDivElement>(null)
  const switcherRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [pull, setPull] = useState(0)

  // Auto-advancing backdrop. Respects reduced-motion (then it stays on slide 0).
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(
      () => setSlide((s) => (s + 1) % HERO_SLIDES.length),
      SLIDE_INTERVAL,
    )
    return () => window.clearInterval(id)
  }, [])

  // Pull the card up so that half of it (capped to the free dark space below the
  // switcher) overlaps the stage. Re-measured on resize and tool switches.
  const measure = useCallback(() => {
    const stage = stageRef.current
    const card = cardRef.current
    const switcher = switcherRef.current
    if (!stage || !card) return
    const half = card.offsetHeight / 2
    let safe = half
    if (switcher) {
      const stageRect = stage.getBoundingClientRect()
      const swRect = switcher.getBoundingClientRect()
      safe = stageRect.bottom - swRect.bottom - SWITCHER_GAP
    }
    setPull(Math.max(0, Math.min(half, safe)))
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(() => measure())
    if (cardRef.current) ro.observe(cardRef.current)
    if (stageRef.current) ro.observe(stageRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measure, active])

  return (
    <section className="relative w-full">
      {/* ── Fixed-height dark stage ── */}
      <div
        ref={stageRef}
        className="relative h-[34rem] w-full overflow-hidden rounded-b-[50px] bg-ink-950 sm:h-[38rem] md:rounded-b-[86px] lg:h-[42rem]"
      >
        {/* Auto-crossfading fine-art backdrops */}
        <AnimatePresence>
          <motion.img
            key={slide}
            src={HERO_SLIDES[slide].src}
            alt={HERO_SLIDES[slide].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        {/* Hidden image to warm the browser cache for the upcoming slide (no flash on crossfade) */}
        <img
          src={HERO_SLIDES[(slide + 1) % HERO_SLIDES.length].src}
          alt=""
          aria-hidden
          className="hidden"
        />
        {/* Slide indicator dots */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setSlide(i)}
              aria-label={`Show backdrop ${i + 1}`}
              aria-current={i === slide}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === slide ? 'w-6 bg-white/90' : 'w-1.5 bg-white/40 hover:bg-white/60',
              )}
            />
          ))}
        </div>
        {/* Legibility overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black/90" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
        {/* Soft brand glow */}
        <div className="pointer-events-none absolute left-1/2 top-[60%] h-72 w-[52rem] max-w-[92vw] -translate-x-1/2 rounded-full bg-accent-blue/20 blur-[150px]" />

        {/* Headline + switcher pinned to the top, leaving the lower stage for the card */}
        <div className="relative z-10 h-full">
          <Container full className="px-4 pt-[112px] sm:px-6 md:pt-[140px]">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-accent-peach" />
                Ten tools, one workspace
              </span>

              <h1 className="mt-5 font-serif text-4xl font-normal leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                Shorten, generate{' '}
                <span className="text-accent-peach">&amp;</span> convert
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                Links, QR codes, image/video/audio conversion, GIFs and background removal —
                no signup, nothing to install, right here on the page.
              </p>
            </div>

            {/* Single-row switcher — dividers mark the categories */}
            <div
              ref={switcherRef}
              className="mx-auto mt-7 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-white/15 bg-white/10 p-1.5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            >
              {TOOLS_BY_CATEGORY.map((group, gi) => (
                <Fragment key={group.category}>
                  {gi > 0 && <span aria-hidden className="mx-1 h-7 w-px shrink-0 rounded-full bg-white/20" />}
                  {group.tools.map((t) => {
                    const isActive = active === t.key
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setActive(t.key)}
                        aria-pressed={isActive}
                        title={t.navLabel}
                        className={cn(
                          'relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 transition-colors',
                          isActive ? 'bg-white shadow-[0_8px_24px_-10px_rgba(0,0,0,0.65)]' : 'hover:bg-white/10',
                        )}
                      >
                        <t.Icon className={cn('h-4.5 w-4.5 shrink-0 transition-colors', isActive ? t.accent : 'text-white/60')} />
                        <span className={cn('text-[13px] font-bold leading-tight transition-colors', isActive ? 'text-[#211A14]' : 'text-white/80')}>
                          {t.label}
                        </span>
                      </button>
                    )
                  })}
                </Fragment>
              ))}
            </div>
          </Container>
        </div>
      </div>

      {/* ── Active tool card — overlaps the stage's bottom edge ── */}
      <div className="relative z-20 px-4 sm:px-6">
        <div
          ref={cardRef}
          style={{ marginTop: pull ? -pull : undefined }}
          className="mx-auto w-full max-w-7xl overflow-hidden rounded-[1.75rem] border border-[#E8E0D6] bg-white shadow-[0_50px_120px_-40px_rgba(0,0,0,0.75)] ring-1 ring-white/10 dark:border-white/10 dark:bg-ink-950"
        >
          {/* Brand ribbon */}
          <div className="h-1.5 w-full bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-purple" />

          {/* Window header */}
          <div className="flex items-center gap-3 border-b border-[#E8E0D6] px-5 py-4 sm:px-7 dark:border-white/10">
            <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-inset', svc.tint, svc.accent, svc.ring)}>
              <svc.Icon className="h-5.5 w-5.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-bold leading-tight text-[#211A14] dark:text-white">
                {svc.navLabel}
              </p>
              <p className="mt-0.5 truncate text-[12.5px] leading-tight text-faint">{svc.hint}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <EmbeddedTool toolKey={active} simple />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Reassurance row ── */}
      <Container full className="px-4 pb-16 pt-7 sm:px-6 lg:pb-24">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-xs text-default-500 dark:text-white/55">
          {REASSURE.map((r) => (
            <span key={r.text} className="inline-flex items-center gap-2">
              <r.Icon className="h-3.5 w-3.5 text-accent-blue" />
              {r.text}
            </span>
          ))}
        </div>
      </Container>
    </section>
  )
}
