import { forwardRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import type { QRSettings } from '@/types/qr'

/**
 * Renders the live QR canvas. Forwarded ref points at the wrapping div so the
 * parent can grab the <canvas> for PNG export.
 */
export const QRPreview = forwardRef<HTMLDivElement, { settings: QRSettings }>(function QRPreview(
  { settings },
  ref,
) {
  const value = settings.value.trim() || 'https://linkqr.tools'
  return (
    <div
      ref={ref}
      className="grid place-items-center rounded-3xl bg-white p-6 shadow-card"
      style={{ minHeight: 280 }}
    >
      <QRCodeCanvas
        value={value}
        size={Math.min(settings.size, 320)}
        level={settings.level}
        marginSize={settings.margin}
        fgColor={settings.fgColor}
        bgColor={settings.transparent ? 'transparent' : settings.bgColor}
      />
    </div>
  )
})
