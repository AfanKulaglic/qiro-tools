import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Copy, Check, ExternalLink, Download, QrCode, CalendarDays, MousePointerClick, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useClipboard } from '@/hooks/useClipboard'
import { formatDate, truncateMiddle } from '@/utils/format'
import type { ShortLink } from '@/types/link'

export function ShortenerResult({ link }: { link: ShortLink | null }) {
  const { copied, copy } = useClipboard()
  const qrRef = useRef<HTMLDivElement>(null)

  if (!link) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent-blue/10 to-accent-cyan/10 text-accent-blue">
          <QrCode className="h-7 w-7" />
        </div>
        <p className="text-sm font-bold text-[#211A14] dark:text-white">Your short link will appear here</p>
        <p className="mt-1 text-xs text-muted max-w-[220px]">
          Paste a URL and create a link to see the short URL, QR code, and stats.
        </p>
      </div>
    )
  }

  async function handleCopy() {
    const ok = await copy(link!.shortUrl)
    toast[ok ? 'success' : 'error'](ok ? 'Short link copied' : 'Copy failed')
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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="space-y-4"
    >
      {/* Status + Date */}
      <div className="flex items-center justify-between">
        <Badge tone="green">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-accent-green animate-ping opacity-60" />
            <span className="absolute inset-0 rounded-full bg-accent-green" />
          </span>
          Active
        </Badge>
        <span className="flex items-center gap-1 text-[11px] text-faint">
          <CalendarDays className="h-3 w-3" />
          {formatDate(link.createdAt)}
        </span>
      </div>

      {/* Short URL copy field — premium gradient border */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-blue/5 via-accent-cyan/5 to-accent-purple/5 p-[1px]">
        <div className="flex items-center gap-2 rounded-2xl bg-white p-2 pl-4 dark:bg-ink-950">
          <LinkIcon className="h-4 w-4 text-accent-blue shrink-0" />
          <span className="truncate text-sm font-bold text-accent-blue">{link.shortUrl}</span>
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <Button size="sm" variant="secondary" onClick={handleCopy} className="rounded-lg">
              {copied ? <Check className="h-3.5 w-3.5 text-accent-green" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button size="sm" href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg">
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* QR + Meta */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E8E0D6] bg-white p-4 dark:border-white/10 dark:bg-white/[0.02] sm:flex-row sm:items-start">
        {/* QR Code */}
        <div ref={qrRef} className="grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#F8F7F5] to-white p-3 shadow-[0_2px_8px_-4px_rgba(33,26,20,0.06)] dark:from-white/[0.04] dark:to-transparent">
          <QRCodeCanvas value={link.shortUrl} size={120} level="M" includeMargin />
        </div>

        {/* Meta */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Destination */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-faint">Destination</p>
            <a
              href={link.longUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 flex items-center gap-1 break-all text-[13px] text-muted hover:text-accent-blue transition-colors"
            >
              {truncateMiddle(link.longUrl, 56)}
              <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-[#E8E0D6]/50 bg-[#211A14]/[0.015] px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.01]">
              <MousePointerClick className="h-3.5 w-3.5 text-accent-blue" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-faint">Clicks</p>
                <p className="text-sm font-extrabold text-[#211A14] dark:text-white">{link.clicks}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[#E8E0D6]/50 bg-[#211A14]/[0.015] px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.01]">
              <CalendarDays className="h-3.5 w-3.5 text-faint" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-faint">Created</p>
                <p className="text-sm font-semibold text-[#211A14] dark:text-white">{formatDate(link.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadQR} className="rounded-lg">
              <Download className="h-3.5 w-3.5" />
              Download QR code
            </Button>
            <Button size="sm" variant="outline" href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg">
              <ExternalLink className="h-3.5 w-3.5" />
              Open link
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
