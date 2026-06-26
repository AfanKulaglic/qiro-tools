import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Rocket,
  Link2,
  QrCode,
  ImageDown,
  Globe,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { LucideIcon } from 'lucide-react'

interface Article {
  title: string
  category: string
  icon: LucideIcon
}

const CATEGORIES = [
  { label: 'Getting Started', icon: Rocket },
  { label: 'URL Shortener', icon: Link2 },
  { label: 'QR Generator', icon: QrCode },
  { label: 'Image Converter', icon: ImageDown },
  { label: 'Custom Domains', icon: Globe },
  { label: 'Privacy', icon: ShieldCheck },
]

const ARTICLES: Article[] = [
  { title: 'How to create a short link', category: 'URL Shortener', icon: Link2 },
  { title: 'How to use a custom alias', category: 'URL Shortener', icon: Link2 },
  { title: 'How to generate a QR code', category: 'QR Generator', icon: QrCode },
  { title: 'How to download a QR code (PNG/SVG)', category: 'QR Generator', icon: QrCode },
  { title: 'How image conversion works', category: 'Image Converter', icon: ImageDown },
  { title: 'How to connect go.mydomain.com', category: 'Custom Domains', icon: Globe },
  { title: 'Why Firebase Dynamic Links is not used', category: 'Custom Domains', icon: Globe },
  { title: 'Getting started with LinkQR Tools', category: 'Getting Started', icon: Rocket },
  { title: 'What data is stored and where', category: 'Privacy', icon: ShieldCheck },
]

export default function HelpPage() {
  useDocumentTitle(
    'Help Center — LinkQR Tools',
    'Guides and answers for the URL shortener, QR generator, image converter, custom domains, and privacy.',
  )

  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return ARTICLES.filter((a) => {
      const matchesQuery = a.title.toLowerCase().includes(query.toLowerCase())
      const matchesCat = !activeCat || a.category === activeCat
      return matchesQuery && matchesCat
    })
  }, [query, activeCat])

  return (
    <PageShell
      badge="Help center"
      title="Help Center"
      subtitle="Search guides or browse by topic."
      wide
    >
      <div className="mx-auto max-w-xl">
        <Input
          name="search"
          placeholder="Search help articles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          prefix=""
        />
        <div className="mt-1 flex items-center gap-2 px-1 text-xs text-faint">
          <Search className="h-3.5 w-3.5" />
          {filtered.length} article{filtered.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar categories */}
        <aside className="space-y-1.5">
          <button
            onClick={() => setActiveCat(null)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              !activeCat
                ? 'bg-accent-blue/10 text-accent-blue'
                : 'text-muted hover:bg-white/5'
            }`}
          >
            <FileText className="h-4 w-4" />
            All topics
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              onClick={() => setActiveCat(c.label)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                activeCat === c.label
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'text-muted hover:bg-white/5'
              }`}
            >
              <c.icon className="h-4 w-4" />
              {c.label}
            </button>
          ))}
        </aside>

        {/* Articles */}
        <div>
          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="No articles found" description="Try a different search term." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((a) => (
                <Card key={a.title} hover className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-blue/15 to-accent-purple/15 text-accent-blue">
                      <a.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#211A14] dark:text-white">
                        {a.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-faint">{a.category}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <p className="mt-8 text-sm text-muted">
            Still stuck?{' '}
            <Link to="/contact" className="font-medium text-accent-blue hover:underline">
              Contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </PageShell>
  )
}
