import {
  Sparkles,
  Zap,
  ShieldCheck,
  Palette,
  Accessibility,
  Wrench,
  Target,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const VALUES = [
  { icon: Sparkles, title: 'Simplicity', text: 'Tools that work on the first click.' },
  { icon: Zap, title: 'Speed', text: 'Fast load, fast redirects, fast conversions.' },
  { icon: ShieldCheck, title: 'Privacy', text: 'Local-first processing wherever possible.' },
  { icon: Palette, title: 'Professional design', text: 'A product that looks trustworthy.' },
  { icon: Accessibility, title: 'Accessibility', text: 'Readable, keyboard-friendly, responsive.' },
  { icon: Wrench, title: 'Practicality', text: 'Built around real, everyday tasks.' },
]

const TECH = ['React', 'TypeScript', 'Tailwind', 'Firebase', 'Browser APIs']

export default function AboutPage() {
  useDocumentTitle(
    'About — LinkQR Tools',
    'Simple tools, built for faster digital sharing. Learn why we built LinkQR Tools and the principles behind it.',
  )

  return (
    <PageShell
      badge="About"
      title="Simple tools, built for faster digital sharing."
      subtitle="We believe everyday sharing tasks deserve software that is fast, private, and genuinely pleasant to use."
    >
      {/* Mission + why */}
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <Card className="p-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-blue/15 text-accent-blue">
              <Target className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold text-[#211A14] dark:text-white">Our mission</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            Give individuals and small teams a clean, trustworthy place to shorten links, generate
            QR codes, and convert images — without ads, clutter, or complicated setup.
          </p>
        </Card>
        <Card className="p-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-purple/15 text-accent-purple">
              <Sparkles className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold text-[#211A14] dark:text-white">Why we built this</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            Most free tools feel disposable and untrustworthy. We wanted a single workspace that
            looks and behaves like a real product, while keeping your data on your device.
          </p>
        </Card>
      </div>

      {/* Values */}
      <div className="mt-20">
        <SectionHeader title="What we value" align="center" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <Card key={v.title} hover className="p-6">
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent-blue/15 to-accent-purple/15 text-accent-blue">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-semibold text-[#211A14] dark:text-white">{v.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{v.text}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Technology */}
      <div className="mt-20">
        <SectionHeader title="Built with modern technology" align="center" />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {TECH.map((t) => (
            <span
              key={t}
              className="rounded-full border border-[#E8E0D6] dark:border-white/12 bg-white dark:bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-16 flex justify-center">
        <Button to="/shorten" size="lg">
          Start using the tools
        </Button>
      </div>
    </PageShell>
  )
}
