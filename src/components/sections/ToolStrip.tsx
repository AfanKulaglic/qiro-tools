import { Gauge, ShieldCheck, Infinity as InfinityIcon, CircleChevronRight, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

const FEATURES = [
  {
    Icon: Gauge,
    title: 'Instant results',
    body: 'Open Qiro, paste a link, get a short URL or QR - no waiting.',
  },
  {
    Icon: ShieldCheck,
    title: 'Private by design',
    body: 'QR and image conversion run entirely in your browser. Files stay yours.',
  },
  {
    Icon: InfinityIcon,
    title: 'Free, no limits',
    body: 'Start in seconds with no signup. Pro plans only when you outgrow free.',
  },
]

export function ToolStrip() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute right-0 top-[20%] w-72 h-72 blob bg-accent-peach/6 blur-[120px] animate-drift dark:bg-accent-peach/8" style={{ animationDelay: '-3s' }} />
      <div className="pointer-events-none absolute left-[10%] bottom-[10%] w-56 h-56 blob bg-accent-blue/5 blur-[100px] animate-float-slow dark:bg-accent-blue/8" />
      <Container full>
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16 md:gap-0">
          <div className="flex min-w-0 flex-col gap-y-7.5 lg:gap-y-10">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-accent-coral dark:text-accent-coral/80">
                <Sparkles className="h-3 w-3" />
                Why Qiro
              </span>
              <h2 className="mt-5 mb-7.5 text-4xl font-normal leading-normal text-default-800 md:mb-10 md:text-5xl lg:max-w-2xl lg:text-6xl dark:text-white/90">
                Sharing tools designed to make every link, code, and image{' '}
                <span className="text-gradient-warm">faster, easier</span>, and more private.
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-default-500 dark:text-white/65">
                Qiro brings link shortening, QR generation, image conversion, and AI PDF editing into
                one focused workspace - built so the next thing you share is one click away.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-[#E6E2DA]/50 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-blue/20 hover:shadow-glow-soft dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-accent-blue/20"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-accent-blue/10 to-accent-coral/10 text-accent-blue transition-all duration-300 group-hover:scale-110 group-hover:from-accent-blue/20 group-hover:to-accent-coral/20 dark:text-white">
                    <f.Icon className="size-5" />
                  </span>
                  <p className="mt-3 text-sm font-bold leading-tight text-default-800 dark:text-white/85">
                    {f.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-default-500 dark:text-white/60">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex">
              <Button
                to="/about"
                size="lg"
                className="group gap-2.5 rounded-full bg-default-900 px-3.75 py-3.5 text-lg font-bold uppercase tracking-normal text-white transition-all duration-300 hover:bg-accent-blue dark:bg-white dark:text-default-900 dark:hover:bg-accent-blue dark:hover:text-white"
              >
                More about
                <CircleChevronRight className="size-6 leading-none transition-transform duration-500 group-hover:-rotate-45" />
              </Button>
            </div>
          </div>
          <div className="relative justify-self-end">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-[40px] bg-gradient-to-br from-accent-blue/10 via-accent-coral/8 to-accent-peach/10 blur-2xl" />
              <img
                src="/about-split-image.avif"
                alt="Qiro workspace"
                className="relative aspect-[4/5] h-auto w-full rounded-[32px] object-cover shadow-[0_20px_60px_-20px_rgba(28,25,23,0.3)] lg:max-h-[32rem] lg:max-w-[32rem] dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
