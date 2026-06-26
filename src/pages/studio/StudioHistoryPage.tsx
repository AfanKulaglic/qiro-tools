import { useEffect, useState } from 'react'
import {
  QrCode,
  RotateCcw,
  Trash2,
  ImageIcon,
  History as HistoryIcon,
  Cloud,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { StudioPanel } from '@/components/studio/StudioPanel'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { HistoryList } from '@/components/tools/HistoryList'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuth } from '@/hooks/useAuth'
import { listImages, deleteImageRecord, type CloudImage } from '@/services/imageService'
import { STORAGE_KEYS } from '@/utils/storage'
import { formatDateTime, formatBytes } from '@/utils/format'
import type { LinkHistoryItem } from '@/types/link'
import type { ImageConversionHistoryItem, QRHistoryItem } from '@/types/qr'

const TABS = [
  { value: 'links', label: 'Linkovi' },
  { value: 'qr', label: 'QR kodovi' },
  { value: 'images', label: 'Konverzije' },
  { value: 'cloud', label: 'Cloud slike' },
]

export default function StudioHistoryPage() {
  useDocumentTitle('Historija — Qiro', 'Tvoji nedavni linkovi, QR kodovi i konverzije.')

  const [tab, setTab] = useState('links')
  const [links, setLinks] = useLocalStorage<LinkHistoryItem[]>(STORAGE_KEYS.links, [])
  const [qrs, setQrs] = useLocalStorage<QRHistoryItem[]>(STORAGE_KEYS.qr, [])
  const [images, setImages] = useLocalStorage<ImageConversionHistoryItem[]>(STORAGE_KEYS.images, [])

  const { user } = useAuth()
  const [cloud, setCloud] = useState<CloudImage[]>([])
  const [loadingCloud, setLoadingCloud] = useState(false)

  useEffect(() => {
    if (!user) {
      setCloud([])
      return
    }
    setLoadingCloud(true)
    listImages(user.uid)
      .then(setCloud)
      .catch(() => {})
      .finally(() => setLoadingCloud(false))
  }, [user])

  async function removeCloud(id: string) {
    if (!user) return
    await deleteImageRecord(user.uid, id).catch(() => {})
    setCloud((p) => p.filter((x) => x.id !== id))
  }

  return (
    <StudioPanel
      eyebrow="Historija"
      title="Tvoja aktivnost"
      description="Linkovi, QR kodovi i konverzije čuvaju se lokalno u ovom browseru. Cloud slike su vezane za tvoj nalog."
    >
      <Tabs items={TABS} value={tab} onChange={setTab} />

      <div className="mt-8">
        {tab === 'links' && (
          <HistoryList items={links} onRemove={(slug) => setLinks((p) => p.filter((l) => l.slug !== slug))} />
        )}

        {tab === 'qr' &&
          (qrs.length === 0 ? (
            <EmptyState icon={QrCode} title="Još nema QR kodova" description="Preuzeti QR kodovi pojaviće se ovdje." />
          ) : (
            <div className="space-y-3">
              {qrs.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center gap-3 rounded-2xl border border-[#E8E0D6] dark:border-white/10 p-4"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-cyan/15 text-accent-cyan">
                    <QrCode className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#211A14] dark:text-white">
                      {q.content}
                    </p>
                    <p className="text-xs text-faint">
                      {q.type.toUpperCase()} · {formatDateTime(q.createdAt)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" to="/studio/qr" aria-label="Ponovo generiši">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={() => setQrs((p) => p.filter((x) => x.id !== q.id))}
                    className="grid h-9 w-9 place-items-center rounded-lg text-faint hover:text-red-400"
                    aria-label="Ukloni"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ))}

        {tab === 'images' &&
          (images.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="Još nema konverzija"
              description="Konvertovani fajlovi se ne čuvaju — samo ovi metapodaci ostaju lokalno."
            />
          ) : (
            <div className="space-y-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="flex items-center gap-3 rounded-2xl border border-[#E8E0D6] dark:border-white/10 p-4"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-purple/15 text-accent-purple">
                    <ImageIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#211A14] dark:text-white">
                      {img.fileName}
                    </p>
                    <p className="text-xs text-faint">
                      → {img.outputFormat} · {formatDateTime(img.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setImages((p) => p.filter((x) => x.id !== img.id))}
                    className="grid h-9 w-9 place-items-center rounded-lg text-faint hover:text-red-400"
                    aria-label="Ukloni"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <p className="px-1 pt-2 text-xs text-faint">
                Napomena: sami konvertovani fajlovi se nikad ne čuvaju lokalno — samo ime fajla i
                izlazni format. Koristi „Sačuvaj u cloud" da hostuješ sam fajl.
              </p>
            </div>
          ))}

        {tab === 'cloud' &&
          (!user ? (
            <EmptyState
              icon={Cloud}
              title="Prijavi se da vidiš svoje cloud slike"
              description="Sačuvane slike se hostuju na ImgBB i sinhronizuju sa tvojim nalogom."
            >
              <Button to="/studio/convert">Konvertuj sliku</Button>
            </EmptyState>
          ) : loadingCloud ? (
            <div className="flex justify-center py-16 text-faint">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : cloud.length === 0 ? (
            <EmptyState
              icon={Cloud}
              title="Još nema cloud slika"
              description="Konvertuj sliku i izaberi „Sačuvaj u cloud” da je hostuješ ovdje."
            >
              <Button to="/studio/convert">Idi na konverter</Button>
            </EmptyState>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cloud.map((img) => (
                <div
                  key={img.id}
                  className="group overflow-hidden rounded-2xl border border-[#E8E0D6] dark:border-white/10 bg-white dark:bg-white/[0.03]"
                >
                  <a href={img.displayUrl} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={img.thumbUrl}
                      alt={img.name}
                      className="aspect-video w-full bg-black/20 object-contain"
                    />
                  </a>
                  <div className="flex items-center gap-2 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#211A14] dark:text-white">
                        {img.name}
                      </p>
                      <p className="text-xs text-faint">
                        {img.format} · {formatBytes(img.size)} · {formatDateTime(img.createdAt)}
                      </p>
                    </div>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-9 w-9 place-items-center rounded-lg text-faint hover:text-accent-blue"
                      aria-label="Otvori sliku"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => removeCloud(img.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg text-faint hover:text-red-400"
                      aria-label="Ukloni"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>

      {links.length === 0 && qrs.length === 0 && images.length === 0 && (
        <div className="mt-10">
          <EmptyState
            icon={HistoryIcon}
            title="Tvoja nedavna aktivnost pojaviće se ovdje."
            description="Kreiraj short link, generiši QR kod ili konvertuj sliku da počneš."
          >
            <Button to="/studio/shorten">Počni</Button>
          </EmptyState>
        </div>
      )}
    </StudioPanel>
  )
}
