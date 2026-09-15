import { Link } from 'react-router-dom'
import { ArrowLeft, Link2 } from 'lucide-react'
import { HistoryList } from '@/components/tools/HistoryList'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { STORAGE_KEYS } from '@/utils/storage'
import type { LinkHistoryItem } from '@/types/link'

/** Dedicated history page (per plan) — all links made on this device. */
export default function HistoryPage() {
  useDocumentTitle(
    'Link History — Qiro',
    'Every short link created on this device: copy, open, QR or remove. Stored locally in your browser.',
  )
  const [history, setHistory] = useLocalStorage<LinkHistoryItem[]>(STORAGE_KEYS.links, [])

  const removeHistory = (slug: string) => setHistory((h) => h.filter((x) => x.slug !== slug))

  return (
    <section className="container-max py-10">
      <Link to="/shorten" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-[#211A14] dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> New short link
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-blue/10 text-accent-blue">
          <Link2 className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#211A14] dark:text-white">Link History</h1>
          <p className="text-sm text-faint">{history.length ? `${history.length} link${history.length === 1 ? '' : 's'} on this device` : 'Nothing here yet'}</p>
        </div>
      </div>

      <div className="mt-6">
        {history.length ? (
          <HistoryList items={history} onRemove={removeHistory} />
        ) : (
          <div className="rounded-3xl border border-dashed border-[#E8E0D6] p-10 text-center dark:border-white/10">
            <p className="font-serif text-lg font-bold text-[#211A14] dark:text-white">No links yet</p>
            <p className="mt-1 text-sm text-faint">Shorten your first link and it will show up here.</p>
            <Link to="/shorten" className="mt-4 inline-block rounded-full bg-accent-blue px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">
              Shorten a link
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
