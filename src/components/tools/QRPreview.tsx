import { forwardRef, useEffect, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import type { QRSettings } from '@/types/qr'
import { drawFramedQR } from '@/utils/qrFrame'

/**
 * Live QR preview. Renders the QR onto an offscreen canvas, then composites it
 * with the selected frame onto the visible export canvas. The forwarded ref
 * points at the wrapping div; the parent grabs `canvas[data-qr-export]` for
 * PNG export so the frame is included.
 */
export const QRPreview = forwardRef<HTMLDivElement, { settings: QRSettings }>(function QRPreview(
  { settings },
  ref,
) {
  const value = settings.value.trim() || 'https://linkqr.tools'
  const qrSize = settings.size

  const srcWrap = useRef<HTMLDivElement>(null)
  const outRef = useRef<HTMLCanvasElement>(null)
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null)

  // Preload the logo so the composite renderer can draw it at any position.
  useEffect(() => {
    if (!settings.logoUrl) { setLogoImg(null); return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setLogoImg(img)
    img.src = settings.logoUrl
  }, [settings.logoUrl])

  // Composite QR + frame onto the visible canvas.
  useEffect(() => {
    const render = () => {
      const src = srcWrap.current?.querySelector('canvas')
      const out = outRef.current
      if (src && out) drawFramedQR(out, src, settings, logoImg)
    }
    render()
    const timers = [60, 200, 500].map((t) => window.setTimeout(render, t))
    return () => timers.forEach(clearTimeout)
  }, [settings, logoImg])

  return (
    <div
      ref={ref}
      className="grid place-items-center rounded-2xl bg-[#F8F7F5] dark:bg-white/[0.02] p-8"
      style={{ minHeight: 260 }}
    >
      {/* Offscreen QR source */}
      <div ref={srcWrap} className="pointer-events-none absolute -left-[9999px] top-0" aria-hidden>
        <QRCodeCanvas
          value={value}
          size={qrSize}
          level={settings.level}
          marginSize={settings.margin}
          fgColor={settings.fgColor}
          bgColor={settings.transparent ? 'transparent' : settings.bgColor}
        />
      </div>

      {/* Visible composite (QR + frame) — also the PNG export source */}
      <canvas
        ref={outRef}
        data-qr-export
        className="h-auto max-h-[320px] w-auto max-w-full rounded-lg"
      />
    </div>
  )
})
