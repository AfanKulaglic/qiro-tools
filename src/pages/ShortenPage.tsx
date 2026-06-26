import {
  Link2,
  Globe,
  BarChart3,
  QrCode,
  Database,
  Zap,
  Lightbulb,
  ArrowRight,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Accordion } from '@/components/ui/Accordion'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const FEATURES = [
  { icon: Link2, title: 'Custom aliases', text: 'Pick a memorable slug like /summer-sale.' },
  { icon: Globe, title: 'Own-domain links', text: 'Use go.yourdomain.com for branded links.' },
  { icon: BarChart3, title: 'Click tracking', text: 'See how often each link is opened.' },
  { icon: QrCode, title: 'QR code included', text: 'Every link comes with a downloadable QR.' },
  { icon: Database, title: 'Firebase-powered', text: 'Reliable Firestore-backed redirects.' },
  { icon: Zap, title: 'Fast redirects', text: 'Lightweight redirect route, no bloat.' },
]

const TIPS = [
  'Keep aliases short and readable.',
  'Use clear campaign names like spring-launch.',
  'Test links before printing them.',
  'Use QR codes for offline materials.',
  'Never use misleading or deceptive links.',
]

const SHORTENER_FAQ = [
  {
    q: 'How does the shortener work?',
    a: 'We store a small record in Firestore mapping a slug to your destination URL. Opening the short link redirects to the original and counts the click.',
  },
  {
    q: 'Can I use go.mydomain.com?',
    a: 'Yes. Point a subdomain to Firebase Hosting and set VITE_SHORT_DOMAIN to that origin. Links then use your branded domain.',
  },
  {
    q: 'Is this using Bitly?',
    a: 'No. The shortener is our own Firebase-based system. No Bitly, TinyURL, Cuttly, or Rebrandly APIs are used.',
  },
  {
    q: 'Is Firebase Dynamic Links used?',
    a: 'No. Firebase Dynamic Links is deprecated. We use a simple Firestore + redirect route you control.',
  },
  {
    q: 'Are links permanent?',
    a: 'Links stay active while your Firebase project runs and the link is not disabled for abuse. Permanent availability is not guaranteed.',
  },
  {
    q: 'Can I edit the destination later?',
    a: 'Editable links are part of the upcoming Pro plan. The current MVP creates fixed-destination links.',
  },
]

export default function ShortenPage() {
  useDocumentTitle(
    'Free URL Shortener with Custom Domain Support — LinkQR Tools',
    'Turn long links into clean, shareable URLs with custom aliases, QR codes, and basic click tracking. Free to start, powered by Firebase.',
  )

  return (
    <PageShell
      badge="Own-domain URL shortener"
      title="Free URL Shortener"
      subtitle="Turn long links into clean, shareable URLs with custom aliases, QR codes, and basic click tracking."
      wide
    >
      {/* Open the working tool in the Studio */}
      <div className="flex flex-col items-center gap-4">
        <Button to="/studio/shorten" size="lg">
          Otvori Link studio
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-sm text-faint">Kreiranje i čuvanje linkova radi se u studiju.</p>
      </div>

      {/* Features */}
      <div className="mt-20">
        <SectionHeader title="Everything in the free shortener" align="center" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} hover className="p-6">
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent-blue/15 to-accent-purple/15 text-accent-blue">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-semibold text-[#211A14] dark:text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.text}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Best practices */}
      <div className="mt-20">
        <Card className="p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-cyan/15 text-accent-cyan">
              <Lightbulb className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-[#211A14] dark:text-white">
              Tips for better short links
            </h2>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-sm text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-blue" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* FAQ */}
      <div className="mt-20">
        <SectionHeader title="Shortener FAQ" align="center" />
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-[#E8E0D6] dark:border-white/10 bg-white dark:bg-white/[0.04] px-6 shadow-card sm:px-8">
          <Accordion items={SHORTENER_FAQ} />
        </div>
      </div>
    </PageShell>
  )
}
