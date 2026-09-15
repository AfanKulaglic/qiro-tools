import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Copy, ExternalLink, QrCode, Trash2, Check, Link2, CalendarDays, ArrowUpRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { QRCodeCanvas } from 'qrcode.react'
import { formatDate, getHostname, truncateMiddle } from '@/utils/format'
import type { LinkHistoryItem } from '@/types/link'
import { cn } from '@/utils/cn'

export function HistoryList({
  items,
  onRemove,
  highlightSlug,
}: {
  items: LinkHistoryItem[]
  onRemove: (slug: string) => void
  /** Slug of the most recently created link — gets a subtle highlight + "New" badge. */
  highlightSlug?: string | null
}) {
  const [qrFor, setQrFor] = useState<LinkHistoryItem | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  async function copy(item: LinkHistoryItem) {
    try {
      await navigator.clipboard.writeText(item.shortUrl)
      setCopiedSlug(item.slug)
      toast.success('Copied')
      setTimeout(() => setCopiedSlug(null), 1500)
    } catch {
      toast.error('Copy failed')
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-14 text-center">
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent-blue/10 via-accent-cyan/10 to-accent-purple/10">
          <Link2 className="h-8 w-8 text-accent-blue" />
        </div>
        <p className="text-base font-bold text-[#211A14] dark:text-white">No links yet</p>
        <p className="mt-1.5 max-w-xs text-sm text-muted leading-relaxed">
          Short links you create will automatically be saved here on this device.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop Table ── */}
      <div className="hidden overflow-hidden rounded-2xl border border-[#E8E0D6] dark:border-white/10 md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[#211A14]/[0.03] to-transparent dark:from-white/5 dark:to-transparent">
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-faint">Short link</th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-faint">Destination</th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-faint">Date</th>
              <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-faint">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E0D6]/60 dark:divide-white/8">
            {items.map((item, i) => (
              <motion.tr
                key={item.slug}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className={cn(
                  'group transition-colors hover:bg-[#211A14]/[0.015] dark:hover:bg-white/[0.02]',
                  item.slug === highlightSlug && 'bg-accent-blue/[0.05] dark:bg-accent-blue/[0.08]',
                )}
              >
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-2">
                    <span className="font-semibold text-accent-blue">
                      {item.shortUrl.replace(/^https?:\/\//, '')}
                    </span>
                    {item.slug === highlightSlug && (
                      <span className="rounded-full bg-accent-blue/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-blue">New</span>
                    )}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted">{getHostname(item.longUrl)}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5 text-faint">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <IconBtn label="Copy" onClick={() => copy(item)}>
                      {copiedSlug === item.slug ? (
                        <Check className="h-4 w-4 text-accent-green" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </IconBtn>
                    <IconBtn label="Open" href={item.shortUrl}>
                      <ExternalLink className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn label="QR code" onClick={() => setQrFor(item)}>
                      <QrCode className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn label="Remove" onClick={() => onRemove(item.slug)} danger>
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ── */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-2.5 md:hidden">
          {items.map((item, i) => (
            <motion.div
              key={item.slug}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              className={cn(
                'group rounded-2xl border bg-white p-4 transition-all duration-200 hover:shadow-md hover:border-accent-blue/20 dark:bg-white/[0.02] dark:hover:border-accent-blue/20',
                item.slug === highlightSlug
                  ? 'border-accent-blue/40 ring-1 ring-accent-blue/30 dark:border-accent-blue/40'
                  : 'border-[#E8E0D6] dark:border-white/10',
              )}
            >
              {/* Short URL */}
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-blue/10 text-accent-blue">
                  <Link2 className="h-4 w-4" />
                </span>
                <p className="truncate font-semibold text-accent-blue text-sm">
                  {item.shortUrl.replace(/^https?:\/\//, '')}
                </p>
                {item.slug === highlightSlug && (
                  <span className="ml-auto rounded-full bg-accent-blue/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-blue">New</span>
                )}
              </div>

              {/* Destination */}
              <p className="mt-2 flex items-center gap-1 truncate text-xs text-muted pl-10">
                <ArrowUpRight className="h-3 w-3 shrink-0" />
                {truncateMiddle(item.longUrl, 45)}
              </p>

              {/* Bottom row */}
              <div className="mt-3 flex items-center justify-between pl-10">
                <span className="flex items-center gap-1 text-xs text-faint">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(item.createdAt)}
                </span>
                <div className="flex items-center gap-1">
                  <IconBtn label="Copy" onClick={() => copy(item)}>
                    {copiedSlug === item.slug ? (
                      <Check className="h-4 w-4 text-accent-green" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </IconBtn>
                  <IconBtn label="Open" href={item.shortUrl}>
                    <ExternalLink className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="QR kod" onClick={() => setQrFor(item)}>
                    <QrCode className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="Remove" onClick={() => onRemove(item.slug)} danger>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* ── QR Modal ── */}
      <Modal open={!!qrFor} onClose={() => setQrFor(null)} title="QR code">
        {qrFor && (
          <div className="flex flex-col items-center">
            <div className="rounded-2xl bg-gradient-to-br from-[#F8F7F5] to-white p-5 shadow-[0_4px_16px_-8px_rgba(33,26,20,0.1)]">
              <QRCodeCanvas value={qrFor.shortUrl} size={200} level="M" includeMargin />
            </div>
            <p className="mt-4 text-sm font-medium text-muted break-all text-center max-w-[260px]">
              {qrFor.shortUrl.replace(/^https?:\/\//, '')}
            </p>
          </div>
        )}
      </Modal>
    </>
  )
}

/* ─── Icon Button ─── */

function IconBtn({
  children,
  onClick,
  href,
  label,
  danger,
}: {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  label: string
  danger?: boolean
}) {
  const cls = cn(
    'grid h-9 w-9 place-items-center rounded-lg transition-all duration-200',
    danger
      ? 'text-faint hover:bg-red-500/10 hover:text-red-400'
      : 'text-faint hover:bg-accent-blue/10 hover:text-accent-blue',
  )
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={label}>
        {children}
      </a>
    )
  }
  return (
    <button onClick={onClick} className={cls} aria-label={label}>
      {children}
    </button>
  )
}
