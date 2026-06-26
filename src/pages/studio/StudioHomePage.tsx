import { Link } from 'react-router-dom'
import { QrCode, Link2, ImageDown, ArrowRight, History } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { StudioPanel } from '@/components/studio/StudioPanel'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { STORAGE_KEYS } from '@/utils/storage'
import type { LinkHistoryItem } from '@/types/link'
import type { ImageConversionHistoryItem, QRHistoryItem } from '@/types/qr'

interface StudioCard {
  to: string
  label: string
  desc: string
  icon: LucideIcon
  iconWrap: string
}

const STUDIOS: StudioCard[] = [
  {
    to: '/studio/qr',
    label: 'QR studio',
    desc: 'Kreiraj i preuzmi QR kodove — PNG i SVG.',
    icon: QrCode,
    iconWrap: 'bg-accent-cyan/15 text-accent-cyan',
  },
  {
    to: '/studio/shorten',
    label: 'Link studio',
    desc: 'Skrati i sačuvaj linkove sa aliasima.',
    icon: Link2,
    iconWrap: 'bg-accent-blue/15 text-accent-blue',
  },
  {
    to: '/studio/convert',
    label: 'Konverter studio',
    desc: 'Konvertuj JPG, PNG i WebP u browseru.',
    icon: ImageDown,
    iconWrap: 'bg-accent-purple/15 text-accent-purple',
  },
]

export default function StudioHomePage() {
  useDocumentTitle('Studio — Qiro', 'Tvoj radni prostor za QR kodove, linkove i konverziju slika.')

  const [links] = useLocalStorage<LinkHistoryItem[]>(STORAGE_KEYS.links, [])
  const [qrs] = useLocalStorage<QRHistoryItem[]>(STORAGE_KEYS.qr, [])
  const [images] = useLocalStorage<ImageConversionHistoryItem[]>(STORAGE_KEYS.images, [])

  const stats = [
    { label: 'Linkova', value: links.length },
    { label: 'QR kodova', value: qrs.length },
    { label: 'Konverzija', value: images.length },
  ]

  return (
    <StudioPanel
      eyebrow="Studio"
      title="Radni prostor"
      description="Izaberi alat i počni. Sve što kreiraš čuva se u Historiji ovog uređaja."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {STUDIOS.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group rounded-2xl border border-[#E8E0D6] bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-blue/30 hover:shadow-glow dark:border-white/[0.08] dark:bg-white/[0.03]"
          >
            <span className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${s.iconWrap}`}>
              <s.icon className="h-5 w-5" />
            </span>
            <h3 className="flex items-center gap-1.5 text-base font-semibold text-[#211A14] dark:text-white">
              {s.label}
              <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-60" />
            </h3>
            <p className="mt-1.5 text-sm text-muted">{s.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#211A14] dark:text-white">Pregled aktivnosti</h2>
          <Link
            to="/studio/history"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-[#211A14] dark:hover:text-white"
          >
            <History className="h-4 w-4" />
            Historija
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-[#E8E0D6] bg-white p-5 text-center shadow-card dark:border-white/[0.08] dark:bg-white/[0.03]"
            >
              <p className="text-2xl font-bold text-[#211A14] dark:text-white sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-faint sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </StudioPanel>
  )
}
