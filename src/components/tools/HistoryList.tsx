import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, ExternalLink, QrCode, Trash2, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { QRCodeCanvas } from 'qrcode.react'
import { Link2 } from 'lucide-react'
import { formatDate, getHostname, truncateMiddle } from '@/utils/format'
import type { LinkHistoryItem } from '@/types/link'

export function HistoryList({
  items,
  onRemove,
}: {
  items: LinkHistoryItem[]
  onRemove: (slug: string) => void
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
      toast.error('Could not copy')
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Link2}
        title="No links yet"
        description="Short links you create will be saved here on this device."
      />
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-[#E8E0D6] dark:border-white/10 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#211A14]/[0.03] dark:bg-white/5 text-xs uppercase tracking-wide text-faint">
            <tr>
              <th className="px-5 py-3 font-medium">Short link</th>
              <th className="px-5 py-3 font-medium">Destination</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E0D6] dark:divide-white/10">
            {items.map((item) => (
              <tr key={item.slug} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3.5 font-medium text-accent-blue">
                  {item.shortUrl.replace(/^https?:\/\//, '')}
                </td>
                <td className="px-5 py-3.5 text-muted">{getHostname(item.longUrl)}</td>
                <td className="px-5 py-3.5 text-faint">{formatDate(item.createdAt)}</td>
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
                    <IconBtn label="QR" onClick={() => setQrFor(item)}>
                      <QrCode className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn label="Remove" onClick={() => onRemove(item.slug)} danger>
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <div
            key={item.slug}
            className="rounded-2xl border border-[#E8E0D6] dark:border-white/10 p-4"
          >
            <p className="font-medium text-accent-blue">
              {item.shortUrl.replace(/^https?:\/\//, '')}
            </p>
            <p className="mt-1 break-all text-xs text-muted">{truncateMiddle(item.longUrl, 50)}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-faint">{formatDate(item.createdAt)}</span>
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
                <IconBtn label="QR" onClick={() => setQrFor(item)}>
                  <QrCode className="h-4 w-4" />
                </IconBtn>
                <IconBtn label="Remove" onClick={() => onRemove(item.slug)} danger>
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!qrFor} onClose={() => setQrFor(null)} title="QR code">
        {qrFor && (
          <div className="flex flex-col items-center">
            <div className="rounded-2xl bg-white p-4">
              <QRCodeCanvas value={qrFor.shortUrl} size={200} level="M" includeMargin />
            </div>
            <p className="mt-4 text-sm text-muted">{qrFor.shortUrl.replace(/^https?:\/\//, '')}</p>
          </div>
        )}
      </Modal>
    </>
  )
}

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
  const cls =
    'grid h-9 w-9 place-items-center rounded-lg text-faint transition-colors hover:bg-white/10 ' +
    (danger ? 'hover:text-red-400' : 'hover:text-accent-blue')
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
