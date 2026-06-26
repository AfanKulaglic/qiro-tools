import { PageShell } from '@/components/layout/PageShell'
import { Accordion } from '@/components/ui/Accordion'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { FAQ_CATEGORIES } from '@/data/faq'

export default function FAQPage() {
  useDocumentTitle(
    'FAQ — LinkQR Tools',
    'Frequently asked questions about LinkQR Tools: the URL shortener, QR codes, image conversion, and privacy.',
  )

  return (
    <PageShell
      badge="FAQ"
      title="Frequently asked questions"
      subtitle="Everything about how LinkQR Tools works, organized by topic."
    >
      <div className="mx-auto max-w-3xl space-y-10">
        {FAQ_CATEGORIES.map((cat) => (
          <div key={cat.category}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent-blue">
              {cat.category}
            </h2>
            <div className="rounded-3xl border border-[#E8E0D6] dark:border-white/10 bg-white dark:bg-white/[0.04] px-6 shadow-card sm:px-8">
              <Accordion items={cat.items} />
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
