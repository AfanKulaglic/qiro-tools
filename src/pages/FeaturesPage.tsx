import { Check, X, Link2, QrCode, ImageDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageShell } from '@/components/layout/PageShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PLATFORM_FEATURES, COMPARISON_ROWS } from '@/data/features'

const DEEP_DIVES = [
  {
    icon: Link2,
    title: 'URL shortener',
    text: 'Branded short links with custom aliases, basic click tracking, and a QR code for every link — backed by Firebase Firestore, not a third-party API.',
  },
  {
    icon: QrCode,
    title: 'QR generator',
    text: 'Fully client-side QR codes with color, size, margin, and error-correction control. Export crisp PNG and SVG for digital or print.',
  },
  {
    icon: ImageDown,
    title: 'Image converter',
    text: 'Convert between JPG, PNG, and WebP with quality control. Everything runs in your browser — no uploads, no waiting.',
  },
]

export default function FeaturesPage() {
  useDocumentTitle(
    'Features — LinkQR Tools',
    'All the tools you need to share links, QR codes, and images faster: own-domain short links, customizable QR codes, and private image conversion.',
  )

  return (
    <PageShell
      badge="Features"
      title="All the tools you need to share links, QR codes, and images faster."
      subtitle="A focused toolkit that feels like a real product — not a pile of disconnected free utilities."
      wide
    >
      {/* Bento grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORM_FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
          >
            <Card hover className="h-full p-6">
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent-blue/15 to-accent-purple/15 text-accent-blue">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-semibold text-[#211A14] dark:text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Deep dives */}
      <div className="mt-20 space-y-5">
        {DEEP_DIVES.map((d) => (
          <Card key={d.title} className="flex flex-col items-start gap-5 p-7 sm:flex-row sm:items-center">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/10 text-accent-blue">
              <d.icon className="h-7 w-7" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-[#211A14] dark:text-white">{d.title}</h3>
              <p className="mt-1.5 max-w-2xl text-sm text-muted">{d.text}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Comparison table */}
      <div className="mt-20">
        <SectionHeader title="How it compares" align="center" />
        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-[#E8E0D6] dark:border-white/10 shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#211A14]/[0.03] dark:bg-white/5">
              <tr>
                <th className="px-5 py-4 font-semibold text-[#211A14] dark:text-white">Feature</th>
                <th className="px-5 py-4 text-center font-medium text-faint">Basic free tools</th>
                <th className="px-5 py-4 text-center font-semibold text-accent-blue">LinkQR Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E0D6] dark:divide-white/10">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature}>
                  <td className="px-5 py-3.5 text-muted">{row.feature}</td>
                  <td className="px-5 py-3.5 text-center">
                    {row.basic ? (
                      <Check className="mx-auto h-4 w-4 text-accent-green" />
                    ) : (
                      <X className="mx-auto h-4 w-4 text-faint" />
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {row.linkqr ? (
                      <Check className="mx-auto h-4 w-4 text-accent-green" />
                    ) : (
                      <X className="mx-auto h-4 w-4 text-faint" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-14 flex justify-center">
        <Button to="/shorten" size="lg">
          Try it free
        </Button>
      </div>
    </PageShell>
  )
}
