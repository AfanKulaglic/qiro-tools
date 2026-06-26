import { useState } from 'react'
import { Globe, UtensilsCrossed, IdCard, CalendarDays, AtSign, Wifi, ArrowRight } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const TEMPLATES = [
  { icon: Globe, label: 'Website QR', hint: 'https://yourbrand.com' },
  { icon: UtensilsCrossed, label: 'Menu QR', hint: 'https://yourbrand.com/menu' },
  { icon: IdCard, label: 'Business Card QR', hint: 'Your contact details' },
  { icon: CalendarDays, label: 'Event QR', hint: 'https://tickets.com/event' },
  { icon: AtSign, label: 'Social Profile QR', hint: 'https://instagram.com/you' },
  { icon: Wifi, label: 'WiFi QR', hint: 'NetworkName,password' },
]

const BEST_PRACTICES = [
  'Use high contrast between foreground and background.',
  'Always test before printing.',
  'Use short URLs for cleaner, faster-scanning codes.',
  'Avoid over-customizing — readability comes first.',
  'Use PNG for digital, SVG for print.',
]

export default function QRGeneratorPage() {
  useDocumentTitle(
    'Free QR Code Generator — LinkQR Tools',
    'Create clean, downloadable QR codes for websites, menus, business cards, campaigns, and events. PNG and SVG export, fully client-side.',
  )

  // Note: templates are illustrative prefill hints shown to the user. The tool
  // owns its own state; we surface guidance here without coupling components.
  const [, setActiveTemplate] = useState<string | null>(null)

  return (
    <PageShell
      badge="Client-side QR generator"
      title="Free QR Code Generator"
      subtitle="Create clean, downloadable QR codes for websites, menus, business cards, campaigns, and events."
      wide
    >
      {/* Open the working tool in the Studio */}
      <div className="flex flex-col items-center gap-4">
        <Button to="/studio/qr" size="lg">
          Otvori QR studio
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-sm text-faint">Kreiranje, podešavanje i preuzimanje radi se u studiju.</p>
      </div>

      {/* Templates */}
      <div className="mt-20">
        <SectionHeader title="Start from a template" align="center" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <Card
              key={t.label}
              hover
              className="cursor-default p-5"
              onMouseEnter={() => setActiveTemplate(t.label)}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-cyan/15 to-accent-blue/15 text-accent-cyan">
                  <t.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#211A14] dark:text-white">{t.label}</h3>
                  <p className="text-xs text-faint">{t.hint}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Best practices */}
      <div className="mt-16">
        <Card className="p-7 sm:p-9">
          <h2 className="text-xl font-bold text-[#211A14] dark:text-white">QR best practices</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {BEST_PRACTICES.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-sm text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-cyan" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageShell>
  )
}
