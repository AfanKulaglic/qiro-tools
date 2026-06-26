import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { USE_CASES } from '@/data/useCases'

export default function UseCasesPage() {
  useDocumentTitle(
    'Use Cases — LinkQR Tools',
    'Practical tools for real-world sharing: restaurants, small businesses, agencies, events, e-commerce, and print shops.',
  )

  return (
    <PageShell
      badge="Use cases"
      title="Practical tools for real-world sharing."
      subtitle="See how teams use short links, QR codes, and image conversion in everyday work."
      wide
    >
      <div className="space-y-6">
        {USE_CASES.map((uc, i) => (
          <motion.div
            key={uc.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="grid items-center gap-6 rounded-3xl border border-[#E8E0D6] dark:border-white/10 bg-white dark:bg-white/[0.04] p-7 shadow-card md:grid-cols-2"
          >
            <div className={i % 2 === 1 ? 'md:order-2' : ''}>
              <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/10 text-accent-purple">
                <uc.icon className="h-6 w-6" />
              </span>
              <h2 className="text-2xl font-bold text-[#211A14] dark:text-white">{uc.title}</h2>
              <p className="mt-3 text-muted">{uc.description}</p>
              <ul className="mt-5 grid grid-cols-2 gap-2.5">
                {uc.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-muted">
                    <Check className="h-4 w-4 text-accent-green" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* mockup card */}
            <div className={i % 2 === 1 ? 'md:order-1' : ''}>
              <div className="glass gradient-border rounded-2xl p-6">
                <div className="flex flex-wrap gap-2">
                  {uc.points.map((p) => (
                    <span
                      key={p}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-accent-blue/30 bg-accent-blue/5 px-4 py-3">
                  <span className="text-sm font-semibold text-accent-blue">
                    go.yourdomain.com/{uc.title.toLowerCase().split(' ')[0].replace(/[^a-z]/g, '')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <Button to="/shorten" size="lg">
          Get started free
        </Button>
      </div>
    </PageShell>
  )
}
