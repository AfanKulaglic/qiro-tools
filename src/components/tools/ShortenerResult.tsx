import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Copy, Check, ExternalLink, Download, QrCode, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useClipboard } from '@/hooks/useClipboard'
import { formatDate, truncateMiddle } from '@/utils/format'
import type { ShortLink } from '@/types/link'

export function ShortenerResult({ link }: { link: ShortLink | null }) {
  const { copied, copy } = useClipboard()
  const qrRef = useRef<HTMLDivElement>(null)

  if (!link) {
    return (
      <EmptyState
        icon={QrCode}
        title="Your short link will appear here"
        description="Paste a URL and create a link to see the short URL, a QR code, and stats."
      >
        <div className="grid h-32 w-32 place-items-center rounded-2xl border border-dashed border-[#E8E0D6] dark:border-white/12">
          <QrCode className="h-10 w-10 text-faint" />
        </div>
      </EmptyState>
    )
  }

  async function handleCopy() {
    const ok = await copy(link!.shortUrl)
    toast[ok ? 'success' : 'error'](ok ? 'Short link copied' : 'Could not copy')
  }

  function handleDownloadQR() {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${link!.slug}.png`
    a.click()
    toast.success('QR code downloaded')
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <Badge tone="green">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
          Active
        </Badge>
        <span className="text-xs text-faint">{formatDate(link.createdAt)}</span>
      </div>

      {/* Short URL copy field */}
      <div className="gradient-border flex items-center gap-2 rounded-2xl bg-white dark:bg-white/[0.04] p-2 pl-4">
        <span className="truncate text-sm font-semibold text-accent-blue">{link.shortUrl}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button size="sm" variant="secondary" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-accent-green" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button size="sm" href={link.shortUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* QR + meta */}
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#E8E0D6] dark:border-white/10 p-5 sm:flex-row sm:items-start">
        <div ref={qrRef} className="grid place-items-center rounded-2xl bg-white p-3 shadow-card">
          <QRCodeCanvas value={link.shortUrl} size={132} level="M" includeMargin />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-faint">Destination</p>
            <p className="mt-0.5 break-all text-sm text-muted">{truncateMiddle(link.longUrl, 64)}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Stat label="Clicks" value={String(link.clicks)} />
            <Stat label="Created" value={formatDate(link.createdAt)} icon />
          </div>
          <Button size="sm" variant="outline" onClick={handleDownloadQR}>
            <Download className="h-4 w-4" />
            Download QR
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-[#211A14] dark:text-white">
        {icon && <CalendarDays className="h-3.5 w-3.5 text-faint" />}
        {value}
      </p>
    </div>
  )
}
