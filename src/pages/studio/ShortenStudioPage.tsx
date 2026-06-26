import { useState } from 'react'
import { toast } from 'sonner'
import { StudioPanel } from '@/components/studio/StudioPanel'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ShortenerForm } from '@/components/tools/ShortenerForm'
import { ShortenerResult } from '@/components/tools/ShortenerResult'
import { HistoryList } from '@/components/tools/HistoryList'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { STORAGE_KEYS } from '@/utils/storage'
import type { LinkHistoryItem, ShortLink } from '@/types/link'

export default function ShortenStudioPage() {
  useDocumentTitle(
    'Link studio — Qiro',
    'Skrati i sačuvaj linkove sa prilagođenim aliasima, QR kodom i praćenjem klikova.',
  )

  const [result, setResult] = useState<ShortLink | null>(null)
  const [history, setHistory] = useLocalStorage<LinkHistoryItem[]>(STORAGE_KEYS.links, [])

  function handleCreated(link: ShortLink) {
    setResult(link)
    setHistory((prev) =>
      [
        {
          slug: link.slug,
          shortUrl: link.shortUrl,
          longUrl: link.longUrl,
          title: link.title,
          createdAt: link.createdAt,
        },
        ...prev.filter((h) => h.slug !== link.slug),
      ].slice(0, 50),
    )
    toast.success('Short link kreiran')
  }

  function removeHistory(slug: string) {
    setHistory((prev) => prev.filter((h) => h.slug !== slug))
  }

  return (
    <StudioPanel
      eyebrow="Link studio"
      title="Linkovi"
      description="Pretvori duge linkove u čiste, deljive URL-ove. Svaki kreiran link se čuva ispod."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 sm:p-7">
          <h2 className="mb-5 text-lg font-semibold text-[#211A14] dark:text-white">
            Kreiraj short link
          </h2>
          <ShortenerForm onCreated={handleCreated} />
        </Card>
        <Card className="p-6 sm:p-7">
          <h2 className="mb-5 text-lg font-semibold text-[#211A14] dark:text-white">Rezultat</h2>
          <ShortenerResult link={result} />
        </Card>
      </div>

      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#211A14] dark:text-white">Sačuvani linkovi</h2>
          <Badge tone="default">{history.length} na ovom uređaju</Badge>
        </div>
        <HistoryList items={history} onRemove={removeHistory} />
      </div>
    </StudioPanel>
  )
}
