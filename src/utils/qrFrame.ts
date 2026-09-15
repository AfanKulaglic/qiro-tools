import type { QRSettings } from '@/types/qr'

/** Decorative wrapper around the QR — mirrors common "Scan me" frame styles. */
export type QRFrame =
  | 'none' | 'card' | 'label' | 'banner'
  | 'header' | 'pill' | 'minimal' | 'circle'
  | 'bubble' | 'button' | 'ticket'
  | 'flyer' | 'shadow' | 'strip' | 'corners' | 'topbar'

const FONT_FAMILY = {
  script: '"Segoe Script", "Bradley Hand ITC", "Brush Script MT", cursive',
  sans: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
}

const CARD_BG = '#FFFFFF'
const DEFAULT_ACCENT = '#18181B'
const DEFAULT_LABEL = 'Scan me'

interface FrameLayout {
  frame: QRFrame
  hasLabel: boolean
  arrow: boolean
  Q: number
  P: number
  /** top-left corner of the QR inside the card */
  qrX: number
  qrY: number
  cardW: number
  cardH: number
  radius: number
  captionH: number
  /** y where the caption row / banner starts */
  captionY: number
  /** thin border width for the 'minimal' frame (0 otherwise) */
  bw: number
  /** pill button height for the 'pill' frame (0 otherwise) */
  pillH: number
  /** footer text row y/height for the 'flyer' frame (0 otherwise) */
  footY: number
  footH: number
  /** accent offset for the 'shadow' frame (0 otherwise) */
  shadowOff: number
  /** accent bar width for the 'strip' frame (0 otherwise) */
  stripW: number
  /** extra canvas space taken by a corner logo, per side */
  expand: { left: number; right: number; top: number; bottom: number }
}

/** Computes the geometry shared by the canvas and SVG renderers. */
export function frameLayout(Q: number, s: QRSettings): FrameLayout {
  const frame = (s.frame ?? 'none') as QRFrame
  const P = Math.round(Q * 0.14)
  let cardW = Q + P * 2
  let radius = Math.round(cardW * 0.06)
  let qrX = P
  let qrY = P
  let bw = 0
  let pillH = 0
  let footY = 0
  let footH = 0
  let shadowOff = 0
  let stripW = 0
  const hasLabel = frame === 'label' || frame === 'banner'
  const arrow = frame === 'label' && !!s.frameArrow

  let captionH =
    frame === 'label' ? Math.round(Q * 0.3)
    : frame === 'banner' ? Math.round(Q * 0.24)
    : frame === 'header' ? Math.round(Q * 0.22)
    : 0

  let captionY =
    frame === 'banner' ? P + Q + Math.round(P * 0.55)
    : frame === 'header' ? P
    : frame === 'pill' ? P + Q + Math.round(P * 0.5)
    : P + Q

  let cardH: number
  if (frame === 'none') { cardH = Q; cardW = Q; radius = 0; qrX = 0; qrY = 0 }
  else if (frame === 'card') cardH = Q + P * 2
  else if (frame === 'banner') cardH = captionY + captionH + Math.round(P * 0.7)
  else if (frame === 'header') { qrY = P + captionH; cardH = qrY + Q + P }
  else if (frame === 'pill') { pillH = Math.round(Q * 0.2); cardH = P + Q + Math.round(P * 0.5) + pillH + Math.round(P * 0.6) }
  else if (frame === 'minimal') {
    bw = Math.max(3, Math.round(Q * 0.035))
    qrX = bw; qrY = bw
    cardW = Q + bw * 2; cardH = Q + bw * 2
    radius = Math.round(Q * 0.04)
  }
  else if (frame === 'bubble') {
    // Speech bubble with tail above the QR.
    captionH = Math.round(Q * 0.24)
    const tailH = Math.round(Q * 0.07)
    captionY = Math.round(P * 0.45)
    qrY = captionY + captionH + tailH
    cardH = qrY + Q + P
  }
  else if (frame === 'button') {
    // CTA pill sitting clearly below the QR with a comfortable gap.
    pillH = Math.round(Q * 0.24)
    captionY = P + Q + Math.round(P * 0.6)
    cardH = captionY + pillH + Math.round(P * 0.7)
  }
  else if (frame === 'ticket') {
    // Ticket: perforation with notch cut-outs on the card edges.
    captionH = Math.round(Q * 0.22)
    captionY = P + Q + Math.round(P * 0.55)
    cardH = captionY + captionH + Math.round(P * 0.7)
  }
  else if (frame === 'flyer') {
    // Text above AND below the QR.
    captionH = Math.round(Q * 0.18)
    footH = Math.round(Q * 0.18)
    captionY = Math.round(P * 0.6)
    qrY = captionY + captionH + Math.round(P * 0.3)
    footY = qrY + Q + Math.round(P * 0.35)
    cardH = footY + footH + Math.round(P * 0.6)
  }
  else if (frame === 'shadow') {
    // Neubrutalist card: hard accent offset behind the white card.
    shadowOff = Math.round(P * 0.35)
    cardW = Q + P * 2 + shadowOff
    cardH = Q + P * 2 + shadowOff
  }
  else if (frame === 'strip') {
    // Accent vertical bar hugging the left edge, QR shifted right.
    stripW = Math.round(P * 0.7)
    qrX = P + stripW
    cardW = Q + P * 2 + stripW
    cardH = Q + P * 2
  }
  else if (frame === 'label') {
    // Classic label: text row below the QR (original behaviour).
    cardH = P + Q + captionH
  }
  else if (frame === 'corners') {
    // Scanner-style corner brackets around the QR (no card behind).
    cardW = Q + P * 2; cardH = Q + P * 2
    radius = 0
  }
  else if (frame === 'topbar') {
    // Colored top bar (with optional label), QR below.
    captionH = Math.round(Q * 0.14)
    qrY = captionH + Math.round(P * 0.4)
    cardH = qrY + Q + P
  }
  else { // circle
    // Circle must fully contain the QR square with clear breathing room.
    const D = Math.round(Q * 1.62)
    cardW = D; cardH = D; radius = D / 2
    qrX = Math.round((D - Q) / 2); qrY = qrX
  }

  // Optional border around the card/circle: grows the card so the stroke
  // sits outside the QR area without clipping anything.
  const borderWidth = s.frameBorder ?? 0
  if (borderWidth > 0 && frame !== 'none' && frame !== 'minimal') {
    cardW += borderWidth * 2
    cardH += borderWidth * 2
    qrX += borderWidth; qrY += borderWidth
    captionY += borderWidth
    radius += borderWidth
  }

  // Corner logo expands the canvas beyond the code.
  const lp = logoPlacement(Q, s)
  const expand = lp.expand
  cardW += expand.left + expand.right
  cardH += expand.top + expand.bottom

  return { frame, hasLabel, arrow, Q, P, qrX, qrY, cardW, cardH, radius, captionH, captionY, bw, pillH, footY, footH, shadowOff, stripW, expand }
}

/* ─── Arrow geometry (shared by canvas Path2D and SVG <path>) ─── */

function arrowPaths(x: number, y: number, w: number, h: number) {
  const startX = x + w * 0.16, startY = y + h * 0.86
  const ctrlX = x + w * 0.02, ctrlY = y + h * 0.34
  const endX = x + w * 0.74, endY = y + h * 0.16
  const curve = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`
  const ang = Math.atan2(endY - ctrlY, endX - ctrlX)
  const ah = w * 0.24
  const h1x = endX - ah * Math.cos(ang - 0.5), h1y = endY - ah * Math.sin(ang - 0.5)
  const h2x = endX - ah * Math.cos(ang + 0.5), h2y = endY - ah * Math.sin(ang + 0.5)
  const head = `M ${h1x} ${h1y} L ${endX} ${endY} L ${h2x} ${h2y}`
  return { curve, head, lineWidth: Math.max(3, w * 0.07) }
}

/* ─── Caption fitting ─── */

let _measureCtx: CanvasRenderingContext2D | null = null
function measureCtx(): CanvasRenderingContext2D {
  if (!_measureCtx) _measureCtx = document.createElement('canvas').getContext('2d')!
  return _measureCtx
}

/** Largest font size (px) that fits `text` within maxW, capped at maxH. */
function fitFontSize(text: string, maxW: number, maxH: number, font: string): number {
  const ctx = measureCtx()
  let size = Math.round(maxH)
  for (; size > 8; size--) {
    ctx.font = `700 ${size}px ${font}`
    if (ctx.measureText(text).width <= maxW) break
  }
  return size
}

/** Measured pixel width of `text` at `size` in `font` (weight 700/800). */
/** Accent used by bars/strips/shadows — falls back to the classic dark. */
function accentColor(s: QRSettings): string {
  return s.frameAccent || DEFAULT_ACCENT
}

function textWidth(text: string, size: number, weight: number, font: string): number {
  const ctx = measureCtx()
  ctx.font = `${weight} ${size}px ${font}`
  return ctx.measureText(text).width
}

function familyFor(s: QRSettings): string {
  return (s.frameFont ?? 'script') === 'sans' ? FONT_FAMILY.sans : FONT_FAMILY.script
}

/* ─── Logo layer (shared geometry for canvas + SVG renderers) ─── */

/** Computes where the logo (and its optional backing plate) sits on a Q×Q QR. */
export function logoPlacement(Q: number, s: QRSettings) {
  const dim = Math.round((Q * (s.logoSize || 20)) / 100)
  const pos = s.logoPosition ?? 'center'
  const pad = s.logoPad ? Math.round(dim * 0.12) : 0
  const expand = { left: 0, right: 0, top: 0, bottom: 0 }

  if (pos === 'center') {
    return { x: (Q - dim) / 2, y: (Q - dim) / 2, dim, pad, expand }
  }

  // Finder markers (7 modules + separator) occupy the top-left, top-right and
  // bottom-left corners: 8 of ~(33 + 2·margin) modules.
  const quiet = s.margin ?? 2
  const F = Math.round((8 / (33 + quiet * 2)) * Q)

  // Shift `v` along an edge so the logo doesn't overlap a marker at either end.
  const clampEdge = (v: number) => {
    if (v < F && v + dim > F) return Math.min(F, Q - F - dim > 0 ? F : (Q - dim) / 2)
    if (v + dim > Q - F && v < Q - F) return Q - F - dim
    return v
  }

  let x: number, y: number
  if (pos.includes('-')) {
    // Corners: flush against both edges (INSIDE the QR).
    x = pos.includes('left') ? 0 : Q - dim
    y = pos.startsWith('top') ? 0 : Q - dim
    if (pos !== 'bottom-right' && dim >= F) {
      // Logo would cover a finder marker — fall back to the bottom-right
      // corner (the only marker-free one), or center if even that is too tight.
      x = Q - dim
      y = Q - dim
      if (dim > Q - F) { x = (Q - dim) / 2; y = (Q - dim) / 2 }
    }
  } else {
    // Edge midpoints: flush against the edge, centered along it, kept clear of markers.
    const mid = (Q - dim) / 2
    if (pos === 'left') { x = 0; y = clampEdge(mid) }
    else if (pos === 'right') { x = Q - dim; y = clampEdge(mid) }
    else if (pos === 'top') { x = clampEdge(mid); y = 0 }
    else { x = clampEdge(mid); y = Q - dim }
  }

  return { x, y, dim, pad, expand }
}

/** Draws the logo (with optional rounded plate) onto ctx at the QR offset. */
function drawLogoLayer(
  ctx: CanvasRenderingContext2D,
  Q: number,
  s: QRSettings,
  img: HTMLImageElement,
  ox = 0,
  oy = 0,
) {
  const { x, y, dim, pad } = logoPlacement(Q, s)
  // Excavate: blank out the modules under the logo (exact square, like
  // qrcode.react's excavate) so the scanner sees a clean area that error
  // correction restores, instead of corrupted dark/light cells.
  roundRectPath(ctx, ox + x - pad, oy + y - pad, dim + pad * 2, dim + pad * 2, pad > 0 ? Math.round(dim * 0.28) : 0)
  if (s.transparent) {
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0,0,0,1)'
    ctx.fill()
    ctx.restore()
  } else {
    ctx.fillStyle = s.bgColor || '#FFFFFF'
    ctx.fill()
  }
  if (pad > 0) {
    roundRectPath(ctx, ox + x - pad, oy + y - pad, dim + pad * 2, dim + pad * 2, Math.round(dim * 0.28))
    ctx.fillStyle = s.logoPadColor || '#FFFFFF'
    ctx.fill()
  }
  ctx.drawImage(img, ox + x, oy + y, dim, dim)
}

/** SVG markup for the logo layer — injected into the QR svg before export. */
export function logoSvgLayer(Q: number, s: QRSettings): string {
  if (!s.logoUrl) return ''
  const { x, y, dim, pad, expand } = logoPlacement(Q, s)
  const parts: string[] = []
  // Excavate plate under the logo (recovered by error correction).
  const under = s.logoPad && !s.transparent ? s.logoPadColor || '#FFFFFF' : s.bgColor || '#FFFFFF'
  parts.push(
    `<rect x="${x - pad}" y="${y - pad}" width="${dim + pad * 2}" height="${dim + pad * 2}" rx="${pad > 0 ? Math.round(dim * 0.28) : 0}" ry="${pad > 0 ? Math.round(dim * 0.28) : 0}" fill="${under}"/>`,
  )
  parts.push(
    `<image x="${x}" y="${y}" width="${dim}" height="${dim}" preserveAspectRatio="xMidYMid meet" href="${s.logoUrl}"/>`,
  )
  return `<g transform="translate(${expand.left} ${expand.top})">${parts.join('')}</g>`
}

/* ─── Canvas renderer (used for live preview + PNG export) ─── */

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Draws the QR (`src`) plus the selected frame onto `out`. */
export function drawFramedQR(
  out: HTMLCanvasElement,
  src: HTMLCanvasElement,
  s: QRSettings,
  logoImg?: HTMLImageElement | null,
): void {
  const Q = src.width
  if (!Q) return
  const ctx = out.getContext('2d')
  if (!ctx) return

  const L = frameLayout(Q, s)
  out.width = L.cardW
  out.height = L.cardH
  ctx.clearRect(0, 0, out.width, out.height)

  if ((L.frame as string) === 'none') {
    ctx.drawImage(src, L.expand.left, L.expand.top)
    if (logoImg?.complete && logoImg.naturalWidth) drawLogoLayer(ctx, Q, s, logoImg, L.expand.left, L.expand.top)
    return
  }

  // Card background — white rounded rect, full circle, or neubrutalist shadow.
  const borderW = s.frameBorder ?? 0
  const borderColor = s.frameBorderColor || s.frameAccent || DEFAULT_ACCENT
  if (L.frame === 'circle') {
    ctx.beginPath()
    ctx.arc(L.cardW / 2, L.cardH / 2, L.radius, 0, Math.PI * 2)
    ctx.fillStyle = CARD_BG
    ctx.fill()
  } else if (L.frame === 'corners') {
    // No card — transparent background, brackets drawn after the QR.
  } else if (L.frame === 'topbar') {
    // Accent bar with rounded top corners, squared bottom edge.
    const bh = L.captionH
    roundRectPath(ctx, 0, 0, L.cardW, bh, L.radius)
    ctx.fillStyle = accentColor(s)
    ctx.fill()
    ctx.fillRect(0, bh - L.radius, L.cardW, L.radius)
  } else {
    if (L.frame === 'shadow') {
      const off = L.shadowOff
      roundRectPath(ctx, off, off, L.cardW - off, L.cardH - off, L.radius)
      ctx.fillStyle = accentColor(s)
      ctx.fill()
    }
    const w = L.frame === 'shadow' ? L.cardW - L.shadowOff : L.cardW
    const h = L.frame === 'shadow' ? L.cardH - L.shadowOff : L.cardH
    roundRectPath(ctx, 0, 0, w, h, L.radius)
    ctx.fillStyle = CARD_BG
    ctx.fill()
    if (L.frame === 'strip') {
      ctx.fillStyle = accentColor(s)
      ctx.fillRect(0, 0, L.stripW, L.cardH)
    }
    if (L.frame === 'minimal' && L.bw) {
      // Thin accent border, drawn just inside the card edge.
      roundRectPath(ctx, L.bw / 2, L.bw / 2, L.cardW - L.bw, L.cardH - L.bw, L.radius - L.bw / 2)
      ctx.strokeStyle = s.frameAccent || DEFAULT_ACCENT
      ctx.lineWidth = L.bw
      ctx.stroke()
    }
  }

  // Optional user border around card-style frames.
  if (borderW > 0 && L.frame !== 'none' && L.frame !== 'minimal') {
    ctx.beginPath()
    if (L.frame === 'circle') {
      ctx.arc(L.cardW / 2, L.cardH / 2, L.radius - borderW / 2, 0, Math.PI * 2)
    } else {
      roundRectPath(ctx, borderW / 2, borderW / 2, L.cardW - borderW, L.cardH - borderW, L.radius - borderW / 2)
    }
    ctx.strokeStyle = borderColor
    ctx.lineWidth = borderW
    ctx.stroke()
  }

  // Ticket: punch semicircular notches into the side edges at the perforation,
  // plus V-shaped cut-outs on the top and bottom edges (ticket-icon style).
  if (L.frame === 'ticket') {
    const dy = L.captionY - Math.round(L.P * 0.28)
    const nr = Math.round(Q * 0.055)
    const vw = Math.round(Q * 0.055)
    const vh = Math.round(Q * 0.06)
    const cx = Math.round(L.cardW / 2)
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(0, dy, nr, 0, Math.PI * 2)
    ctx.arc(L.cardW, dy, nr, 0, Math.PI * 2)
    // V notch on the top edge (pointing down into the card)
    ctx.moveTo(cx - vw, 0)
    ctx.lineTo(cx, vh)
    ctx.lineTo(cx + vw, 0)
    ctx.closePath()
    // V notch on the bottom edge (pointing up into the card)
    ctx.moveTo(cx - vw, L.cardH)
    ctx.lineTo(cx, L.cardH - vh)
    ctx.lineTo(cx + vw, L.cardH)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // Everything QR-relative is drawn inside a translate, so the existing
  // geometry (padding, caption rows, logo placement) stays unchanged.
  ctx.save()
  ctx.translate(L.expand.left, L.expand.top)

  // QR
  ctx.drawImage(src, L.qrX, L.qrY, Q, Q)

  // Logo layer (positioned + optional backing plate)
  if (logoImg?.complete && logoImg.naturalWidth) drawLogoLayer(ctx, Q, s, logoImg, L.qrX, L.qrY)

  const accent = s.frameAccent || DEFAULT_ACCENT
  const label = (s.frameLabel || DEFAULT_LABEL).trim()
  const family = familyFor(s)

  if (L.frame === 'corners') {
    // Scanner-style corner brackets around the QR.
    const inset = Math.round(L.P * 0.3)
    const len = Math.round(Q * 0.2)
    const th = Math.max(3, Math.round(Q * 0.035))
    const x0 = L.qrX - L.P + inset, y0 = L.qrY - L.P + inset
    const x1 = L.qrX + Q + L.P - inset, y1 = L.qrY + Q + L.P - inset
    ctx.strokeStyle = accent
    ctx.lineWidth = th
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x0, y0 + len); ctx.lineTo(x0, y0); ctx.lineTo(x0 + len, y0) // TL
    ctx.moveTo(x1 - len, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + len) // TR
    ctx.moveTo(x1, y1 - len); ctx.lineTo(x1, y1); ctx.lineTo(x1 - len, y1) // BR
    ctx.moveTo(x0 + len, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - len) // BL
    ctx.stroke()
  } else if (L.frame === 'topbar' && label) {
    const fs = Math.max(8, Math.round(L.captionH * 0.46))
    ctx.font = `800 ${fs}px ${family}`
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, L.qrX + Q / 2, L.captionH / 2 + fs * 0.04)
  } else if (L.frame === 'banner' && label) {
    const bh = L.captionH
    const bx = L.qrX, by = L.captionY, bw = Q
    roundRectPath(ctx, bx, by, bw, bh, Math.round(bh * 0.3))
    ctx.fillStyle = accent
    ctx.fill()
    const size = fitFontSize(label, bw * 0.86, bh * 0.6, family)
    ctx.font = `700 ${size}px ${family}`
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, bx + bw / 2, by + bh / 2)
  } else if (L.frame === 'header' && label) {
    const size = fitFontSize(label, Q * 0.9, L.captionH * 0.6, family)
    ctx.font = `700 ${size}px ${family}`
    ctx.fillStyle = accent
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, L.qrX + Q / 2, L.captionY + L.captionH / 2)
  } else if (L.frame === 'bubble' && label) {
    // Speech bubble with a tail pointing down at the QR.
    const bw2 = Q * 0.82
    const bx = L.qrX + (Q - bw2) / 2
    const by = L.captionY
    const bh = L.captionH
    roundRectPath(ctx, bx, by, bw2, bh, Math.round(bh * 0.34))
    ctx.fillStyle = accent
    ctx.fill()
    const tailW = bh * 0.34, tailX = L.qrX + Q / 2
    ctx.beginPath()
    ctx.moveTo(tailX - tailW / 2, by + bh - 2)
    ctx.lineTo(tailX + tailW / 2, by + bh - 2)
    ctx.lineTo(tailX, by + bh + Q * 0.07)
    ctx.closePath()
    ctx.fill()
    const size = fitFontSize(label, bw2 * 0.86, bh * 0.52, family)
    ctx.font = `800 ${size}px ${family}`
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, bx + bw2 / 2, by + bh / 2)
  } else if (L.frame === 'button' && label) {
    // CTA pill below the QR — auto-width so text always has padding.
    const txt = label.toUpperCase()
    const ph = L.pillH
    const fs = Math.max(8, Math.round(ph * 0.38))
    const tw = textWidth(txt, fs, 800, family)
    const pw = Math.min(Q, Math.round(tw + ph * 1.6))
    const px = L.qrX + (Q - pw) / 2, py = L.captionY
    roundRectPath(ctx, px, py, pw, ph, ph / 2)
    ctx.fillStyle = accent
    ctx.fill()
    ctx.font = `800 ${fs}px ${family}`
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(txt, px + pw / 2, py + ph / 2 + fs * 0.04)
  } else if (L.frame === 'ticket' && label) {
    // Ticket stub: perforation + spaced caption + barcode (white stub).
    const dy = L.captionY - Math.round(L.P * 0.28)
    const accentHex = accentColor(s)
    // Full-width dashed perforation.
    ctx.save()
    ctx.setLineDash([Q * 0.022, Q * 0.04])
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'
    ctx.lineWidth = Math.max(2, Q * 0.013)
    ctx.lineCap = 'butt'
    ctx.beginPath()
    ctx.moveTo(0, dy)
    ctx.lineTo(L.cardW, dy)
    ctx.stroke()
    ctx.restore()
    // Barcode under the caption, centered at the bottom of the stub.
    const bw = Q * 0.3
    const bh = Math.round(L.captionH * 0.34 + L.P * 0.35)
    const pattern = [3, 1.2, 2, 1, 3, 1.2, 1, 2.5, 1.2, 1, 2, 3, 1, 1.6, 2.2, 1, 2.6, 1.2, 1.8, 1, 2.4, 1.3]
    const gap = bw * 0.05
    const totalW = pattern.reduce((a, w) => a + (w / 12) * bw + gap, -gap)
    const bx = L.qrX + (Q - totalW) / 2
    const by = L.captionY + Math.round(L.captionH * 0.78)
    ctx.fillStyle = accentHex
    let lx = bx
    for (const w of pattern) {
      ctx.fillRect(lx, by, (w / 12) * bw, bh)
      lx += (w / 12) * bw + gap
    }
    const txt = label.toUpperCase()
    const fs = Math.max(9, Math.round(L.captionH * 0.3))
    ctx.font = `800 ${fs}px ${family}`
    ctx.fillStyle = accent
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${Math.round(fs * 0.12)}px`
    ctx.fillText(txt, L.qrX + Q / 2, L.captionY + L.captionH * 0.42)
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'
  } else if (L.frame === 'flyer' && label) {
    // Text above (accent) and below (soft gray) the QR.
    const fsTop = Math.max(9, Math.round(L.captionH * 0.52))
    ctx.font = `700 ${fsTop}px ${family}`
    ctx.fillStyle = accent
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, L.qrX + Q / 2, L.captionY + L.captionH / 2)
    const fsBot = Math.max(8, Math.round(L.footH * 0.42))
    ctx.font = `600 ${fsBot}px ${family}`
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillText((s.frameFootLabel || '').trim() || 'Point your camera at the code', L.qrX + Q / 2, L.footY + L.footH / 2)
  } else if (L.frame === 'pill' && label) {
    // Pill hugs the text: font sized to the pill height, width = text + padding.
    const txt = label.toUpperCase()
    const ph = L.pillH
    const fs = Math.max(8, Math.round(ph * 0.42))
    const tw = textWidth(txt, fs, 800, family)
    const pw = Math.min(Q, Math.round(tw + ph * 1.1))
    const px = L.qrX + (Q - pw) / 2, py = L.captionY
    roundRectPath(ctx, px, py, pw, ph, ph / 2)
    ctx.fillStyle = accent
    ctx.fill()
    ctx.font = `800 ${fs}px ${family}`
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(txt, px + pw / 2, py + ph / 2 + fs * 0.04)
  } else if (L.frame === 'label' && label) {
    const rowY = L.qrY + Q
    let textX = L.qrX + Q / 2
    let textW = Q * 0.92
    if (L.arrow) {
      const aw = Q * 0.32
      const a = arrowPaths(L.qrX, rowY, aw, L.captionH)
      ctx.strokeStyle = accent
      ctx.lineWidth = a.lineWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke(new Path2D(a.curve))
      ctx.stroke(new Path2D(a.head))
      textX = L.qrX + aw + (Q - aw) / 2
      textW = (Q - aw) * 0.9
    }
    const size = fitFontSize(label, textW, L.captionH * 0.55, family)
    ctx.font = `700 ${size}px ${family}`
    ctx.fillStyle = accent
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, textX, rowY + L.captionH / 2)
  }

  ctx.restore()
}

/* ─── SVG renderer (used for SVG export) ─── */

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&apos;' : '&quot;',
  )
}

/**
 * Wraps a serialized QR `<svg>` (sized Q×Q) in the selected frame and returns a
 * complete standalone SVG string.
 */
export function buildFramedSvg(qrMarkup: string, Q: number, s: QRSettings): string {
  const L = frameLayout(Q, s)
  if ((L.frame as string) === 'none') {
    const hasExpand = L.expand.left || L.expand.right || L.expand.top || L.expand.bottom
    if (!hasExpand) return qrMarkup
    const shifted = qrMarkup
      .replace(/<\?xml[^>]*\?>/i, '')
      .replace(/<svg /i, `<svg x="${L.expand.left}" y="${L.expand.top}" `)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${L.cardW}" height="${L.cardH}" viewBox="0 0 ${L.cardW} ${L.cardH}">${shifted}</svg>`
  }

  const accent = s.frameAccent || DEFAULT_ACCENT
  const label = (s.frameLabel || DEFAULT_LABEL).trim()
  const family = familyFor(s)

  // Nest the QR svg at (qrX,qrY) — strip its xml header and inject x/y.
  const inner = qrMarkup
    .replace(/<\?xml[^>]*\?>/i, '')
    .replace(/<svg /i, `<svg x="${L.expand.left + L.qrX}" y="${L.expand.top + L.qrY}" `)

  const parts: string[] = []
  let ticketMaskClose = false
  if (L.frame === 'circle') {
    parts.push(`<circle cx="${L.cardW / 2}" cy="${L.cardH / 2}" r="${L.radius}" fill="${CARD_BG}"/>`)
  } else if (L.frame === 'corners') {
    // No card — transparent background, brackets drawn after the QR.
  } else if (L.frame === 'topbar') {
    const bh = L.captionH
    const r = L.radius
    parts.push(
      `<path d="M 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 H ${L.cardW - r} A ${r} ${r} 0 0 1 ${L.cardW} ${r} V ${bh} H 0 Z" fill="${accent}"/>`,
    )
  } else {
    const cardStart = parts.length
    parts.push(
      `<rect x="0" y="0" width="${L.cardW}" height="${L.cardH}" rx="${L.radius}" ry="${L.radius}" fill="${CARD_BG}"/>`,
    )
    if (L.frame === 'minimal' && L.bw) {
      parts.push(
        `<rect x="${L.bw / 2}" y="${L.bw / 2}" width="${L.cardW - L.bw}" height="${L.cardH - L.bw}" rx="${L.radius - L.bw / 2}" ry="${L.radius - L.bw / 2}" fill="none" stroke="${accent}" stroke-width="${L.bw}"/>`,
      )
    }
    // Ticket: mask cuts the perforation notches + V cut-outs through card & border.
    if (L.frame === 'ticket') {
      const dy = L.captionY - Math.round(L.P * 0.28)
      const nr = Math.round(Q * 0.055)
      const vw = Math.round(Q * 0.055)
      const vh = Math.round(Q * 0.06)
      const cx = Math.round(L.cardW / 2)
      const cut = `M ${cx - vw} 0 L ${cx} ${vh} L ${cx + vw} 0 Z M ${cx - vw} ${L.cardH} L ${cx} ${L.cardH - vh} L ${cx + vw} ${L.cardH} Z`
      const maskId = `tkm-${Math.random().toString(36).slice(2, 8)}`
      parts.splice(cardStart, 0,
        `<defs><mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${L.cardW}" height="${L.cardH}"><rect x="0" y="0" width="${L.cardW}" height="${L.cardH}" fill="#fff"/><circle cx="0" cy="${dy}" r="${nr}" fill="#000"/><circle cx="${L.cardW}" cy="${dy}" r="${nr}" fill="#000"/><path d="${cut}" fill="#000"/></mask></defs>`,
        `<g mask="url(#${maskId})">`,
      )
      ticketMaskClose = true
    }
  }
  const borderW = s.frameBorder ?? 0
  if (borderW > 0 && L.frame !== 'none' && L.frame !== 'minimal') {
    const bc = s.frameBorderColor || accent
    if (L.frame === 'circle') {
      parts.push(`<circle cx="${L.cardW / 2}" cy="${L.cardH / 2}" r="${L.radius - borderW / 2}" fill="none" stroke="${bc}" stroke-width="${borderW}"/>`)
    } else {
      parts.push(
        `<rect x="${borderW / 2}" y="${borderW / 2}" width="${L.cardW - borderW}" height="${L.cardH - borderW}" rx="${L.radius - borderW / 2}" ry="${L.radius - borderW / 2}" fill="none" stroke="${bc}" stroke-width="${borderW}"/>`,
      )
    }
  }
  if (ticketMaskClose) parts.push('</g>')
  parts.push(inner)
  const gOpen = L.expand.left || L.expand.top ? `<g transform="translate(${L.expand.left} ${L.expand.top})">` : ''
  const gClose = gOpen ? '</g>' : ''
  if (gOpen) parts.splice(parts.length - 1, 0, gOpen) // open group before inner

  if (L.frame === 'corners') {
    const inset = Math.round(L.P * 0.3)
    const len = Math.round(Q * 0.2)
    const th = Math.max(3, Math.round(Q * 0.035))
    const x0 = L.qrX - L.P + inset, y0 = L.qrY - L.P + inset
    const x1 = L.qrX + Q + L.P - inset, y1 = L.qrY + Q + L.P - inset
    parts.push(
      `<path d="M ${x0} ${y0 + len} L ${x0} ${y0} L ${x0 + len} ${y0} M ${x1 - len} ${y0} L ${x1} ${y0} L ${x1} ${y0 + len} M ${x1} ${y1 - len} L ${x1} ${y1} L ${x1 - len} ${y1} M ${x0 + len} ${y1} L ${x0} ${y1} L ${x0} ${y1 - len}" fill="none" stroke="${accent}" stroke-width="${th}" stroke-linecap="round"/>`,
    )
  } else if (L.frame === 'topbar' && label) {
    const bh = L.captionH
    const fs = Math.max(8, Math.round(bh * 0.46))
    parts.push(
      `<text x="${L.qrX + Q / 2}" y="${bh / 2}" font-family='${family}' font-weight="800" font-size="${fs}" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">${escapeXml(label)}</text>`,
    )
  }

  if (L.frame === 'banner' && label) {
    const bh = L.captionH, bx = L.qrX, by = L.captionY, bw = Q
    const size = fitFontSize(label, bw * 0.86, bh * 0.6, family)
    parts.push(
      `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${Math.round(bh * 0.3)}" ry="${Math.round(bh * 0.3)}" fill="${accent}"/>`,
    )
    parts.push(
      `<text x="${bx + bw / 2}" y="${by + bh / 2}" font-family='${family}' font-weight="700" font-size="${size}" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">${escapeXml(label)}</text>`,
    )
  } else if (L.frame === 'header' && label) {
    const size = fitFontSize(label, Q * 0.9, L.captionH * 0.6, family)
    parts.push(
      `<text x="${L.qrX + Q / 2}" y="${L.captionY + L.captionH / 2}" font-family='${family}' font-weight="700" font-size="${size}" fill="${accent}" text-anchor="middle" dominant-baseline="central">${escapeXml(label)}</text>`,
    )
  } else if (L.frame === 'bubble' && label) {
    const bw2 = Q * 0.82
    const bx = L.qrX + (Q - bw2) / 2
    const by = L.captionY
    const bh = L.captionH
    const tailW = bh * 0.34, tailX = L.qrX + Q / 2
    parts.push(
      `<rect x="${bx}" y="${by}" width="${bw2}" height="${bh}" rx="${Math.round(bh * 0.34)}" ry="${Math.round(bh * 0.34)}" fill="${accent}"/>`,
    )
    parts.push(
      `<path d="M ${tailX - tailW / 2} ${by + bh - 2} L ${tailX + tailW / 2} ${by + bh - 2} L ${tailX} ${by + bh + Q * 0.07} Z" fill="${accent}"/>`,
    )
    const size = fitFontSize(label, bw2 * 0.86, bh * 0.52, family)
    parts.push(
      `<text x="${bx + bw2 / 2}" y="${by + bh / 2}" font-family='${family}' font-weight="800" font-size="${size}" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">${escapeXml(label)}</text>`,
    )
  } else if (L.frame === 'button' && label) {
    // Auto-width pill matching the canvas renderer.
    const txt = label.toUpperCase()
    const ph = L.pillH
    const fs = Math.max(8, Math.round(ph * 0.38))
    const tw = textWidth(txt, fs, 800, family)
    const pw = Math.min(Q, Math.round(tw + ph * 1.6))
    const px = L.qrX + (Q - pw) / 2, py = L.captionY
    parts.push(
      `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${ph / 2}" ry="${ph / 2}" fill="${accent}"/>`,
    )
    parts.push(
      `<text x="${px + pw / 2}" y="${py + ph / 2}" font-family='${family}' font-weight="800" font-size="${fs}" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">${escapeXml(txt)}</text>`,
    )
  } else if (L.frame === 'ticket' && label) {
    const dy = L.captionY - Math.round(L.P * 0.28)
    const accentHex = accentColor(s)
    // Full-width dashed perforation.
    parts.push(
      `<line x1="0" y1="${dy}" x2="${L.cardW}" y2="${dy}" stroke="rgba(0,0,0,0.3)" stroke-width="${Math.max(2, Q * 0.013)}" stroke-dasharray="${Q * 0.022} ${Q * 0.04}"/>`,
    )
    // Barcode under the caption, centered at the bottom of the stub.
    const bw = Q * 0.3
    const bh = Math.round(L.captionH * 0.34 + L.P * 0.35)
    const pattern = [3, 1.2, 2, 1, 3, 1.2, 1, 2.5, 1.2, 1, 2, 3, 1, 1.6, 2.2, 1, 2.6, 1.2, 1.8, 1, 2.4, 1.3]
    const gap = bw * 0.05
    const totalW = pattern.reduce((a, w) => a + (w / 12) * bw + gap, -gap)
    let lx = L.qrX + (Q - totalW) / 2
    const by = L.captionY + Math.round(L.captionH * 0.78)
    for (const w of pattern) {
      parts.push(`<rect x="${lx}" y="${by}" width="${(w / 12) * bw}" height="${bh}" fill="${accentHex}"/>`)
      lx += (w / 12) * bw + gap
    }
    const txt = label.toUpperCase()
    const fs = Math.max(9, Math.round(L.captionH * 0.3))
    parts.push(
      `<text x="${L.qrX + Q / 2}" y="${L.captionY + Math.round(L.captionH * 0.42)}" font-family='${family}' font-weight="800" font-size="${fs}" letter-spacing="${Math.round(fs * 0.12)}" fill="${accent}" text-anchor="middle" dominant-baseline="central">${escapeXml(txt)}</text>`,
    )
  } else if (L.frame === 'pill' && label) {
    // Auto-width pill hugging the text, matching the canvas renderer.
    const txt = label.toUpperCase()
    const ph = L.pillH
    const fs = Math.max(8, Math.round(ph * 0.42))
    const tw = textWidth(txt, fs, 800, family)
    const pw = Math.min(Q, Math.round(tw + ph * 1.1))
    const px = L.qrX + (Q - pw) / 2, py = L.captionY
    parts.push(
      `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${ph / 2}" ry="${ph / 2}" fill="${accent}"/>`,
    )
    parts.push(
      `<text x="${px + pw / 2}" y="${py + ph / 2 + fs * 0.04}" font-family='${family}' font-weight="800" font-size="${fs}" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">${escapeXml(txt)}</text>`,
    )
  } else if (L.frame === 'label' && label) {
    const rowY = L.qrY + Q
    let textX = L.qrX + Q / 2
    let textW = Q * 0.92
    if (L.arrow) {
      const aw = Q * 0.32
      const a = arrowPaths(L.qrX, rowY, aw, L.captionH)
      parts.push(
        `<path d="${a.curve}" fill="none" stroke="${accent}" stroke-width="${a.lineWidth}" stroke-linecap="round"/>`,
      )
      parts.push(
        `<path d="${a.head}" fill="none" stroke="${accent}" stroke-width="${a.lineWidth}" stroke-linecap="round" stroke-linejoin="round"/>`,
      )
      textX = L.qrX + aw + (Q - aw) / 2
      textW = (Q - aw) * 0.9
    }
    const size = fitFontSize(label, textW, L.captionH * 0.55, family)
    parts.push(
      `<text x="${textX}" y="${rowY + L.captionH / 2}" font-family='${family}' font-weight="700" font-size="${size}" fill="${accent}" text-anchor="middle" dominant-baseline="central">${escapeXml(label)}</text>`,
    )
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L.cardW}" height="${L.cardH}" viewBox="0 0 ${L.cardW} ${L.cardH}">${parts.join('')}${gClose}</svg>`
}
