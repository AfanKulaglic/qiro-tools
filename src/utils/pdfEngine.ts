/**
 * PDF engine — all pdf.js / pdf-lib access lives here, behind dynamic imports,
 * so the heavy libraries stay out of the main bundle as their own lazy chunk
 * (same pattern as `ffmpegClient.ts` for video/audio).
 *
 * pdf.js renders pages to canvas (view + thumbnail + vision/OCR input);
 * pdf-lib performs structural work (merge, split, rotate, save, encrypt).
 * Nothing is uploaded — the document never leaves the device.
 */

import type { PDFDocumentProxy } from 'pdfjs-dist'

/** pdf.js worker as a Vite URL import — bundled as its own chunk. */
let workerReady = false
async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist')
  if (!workerReady) {
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
    workerReady = true
  }
  return pdfjs
}

export interface PdfPageInfo {
  /** 1-based page number. */
  num: number
  /** Page size in CSS points at scale 1. */
  width: number
  height: number
  rotation: number
}

export interface LoadedDoc {
  file: File
  name: string
  size: number
  pdf: PDFDocumentProxy
  pages: PdfPageInfo[]
}

/** Open a PDF file and read page geometry. Password-protected files throw. */
export async function loadDoc(file: File): Promise<LoadedDoc> {
  const pdfjs = await loadPdfJs()
  const data = new Uint8Array(await file.arrayBuffer())
  // fontExtraProperties keeps embedded font programs (needed to rebuild the
  // original typeface on export) instead of letting pdf.js discard them.
  const pdf = await pdfjs.getDocument({ data, fontExtraProperties: true }).promise
  const pages: PdfPageInfo[] = []
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n)
    const viewport = page.getViewport({ scale: 1 })
    pages.push({ num: n, width: viewport.width, height: viewport.height, rotation: viewport.rotation })
  }
  return { file, name: file.name, size: file.size, pdf, pages }
}

/** Render one page onto a canvas at the given CSS-px width. */
export async function renderPage(doc: LoadedDoc, num: number, canvas: HTMLCanvasElement, targetWidth: number): Promise<void> {
  const page = await doc.pdf.getPage(num)
  const base = page.getViewport({ scale: 1 })
  const scale = targetWidth / base.width
  const viewport = page.getViewport({ scale: scale * (window.devicePixelRatio || 1) })
  canvas.width = viewport.width
  canvas.height = viewport.height
  canvas.style.width = `${Math.round(base.width * scale)}px`
  canvas.style.height = `${Math.round(base.height * scale)}px`
  await page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport }).promise
}

/** Extract plain text of one page (line-aware join) — feeds the AI layer. */
export async function extractPageText(doc: LoadedDoc, num: number): Promise<string> {
  const page = await doc.pdf.getPage(num)
  const content = await page.getTextContent()
  let out = ''
  let lastY: number | null = null
  for (const item of content.items) {
    if (!('str' in item)) continue
    const y = item.transform[5]
    if (lastY !== null && Math.abs(y - lastY) > 2) out += '\n'
    else if (out && !out.endsWith(' ') && !out.endsWith('\n')) out += ' '
    out += item.str
    lastY = y
  }
  return out
}

/**
 * Extract text items of one page WITH geometry (top-left origin, PDF points,
 * matching the overlay coordinate system). Fragments on the same baseline are
 * merged into full lines — this powers "click existing text to edit it".
 */
export interface PdfTextItem {
  x: number
  y: number
  w: number
  h: number
  text: string
  fontSize: number
  /** Style flags resolved from the embedded font name. */
  bold?: boolean
  italic?: boolean
  /** Closest standard font family detected from the original font name. */
  family?: 'helv' | 'times' | 'courier'
  /** pdf.js loadedName of the original embedded font (see embeddedFonts). */
  cssFont?: string
  /** Real font-family name from the PDF (e.g. "ArialMT", "Calibri"), used for
   * on-screen preview when the font is a system font (not extractable). */
  realFamily?: string
  /** Per-source-line styles preserved when grouping into a paragraph. */
  lineStyles?: LineStyle[]
  /** Measured top-to-top spacing (pt) between the paragraph's source lines. */
  lineHeight?: number
  /** Source lines of a grouped paragraph — used for line-level diff replacement. */
  lines?: PdfTextItem[]
}

/** Per-line style of an edited paragraph (aligned to text.split('\n')). */
export interface LineStyle {
  bold?: boolean
  italic?: boolean
  /** Left offset (pt) of the line relative to the paragraph box — keeps bullets/indents. */
  x?: number
  /** Original font size of this line. */
  fontSize?: number
}

/** Map an embedded PDF font name to the closest pdf-lib standard family. */
export function fontFamilyFromName(name: string): 'helv' | 'times' | 'courier' {
  if (/courier|mono|consol/i.test(name)) return 'courier'
  // "sans-serif" (pdf.js generic) must hit this before the serif test below.
  if (/sans|helvetica|arial|verdana|calibri|segoe|tahoma|trebuchet/i.test(name)) return 'helv'
  if (/times|roman|serif|georgia|garamond|book|minion|cambria|palatino/i.test(name)) return 'times'
  return 'helv'
}

/**
 * Registry of embedded font programs extracted by pdf.js, keyed by the
 * pdf.js loadedName (e.g. "g_d0_f1"). Used twice:
 *  - `registerEmbeddedFonts()` adds them as CSS FontFaces so the editing
 *    overlay renders text with the REAL document font, and
 *  - `buildEditedPdf` embeds the bytes via pdf-lib+fontkit so the exported
 *    PDF keeps the original typeface (falls back to a standard font if a
 *    font program can't be parsed, e.g. Type3).
 */
export const embeddedFonts = new Map<string, Uint8Array>()
const registeredFaces = new Set<string>()

export function registerEmbeddedFonts(): void {
  if (typeof document === 'undefined') return
  for (const [loadedName, data] of embeddedFonts) {
    if (registeredFaces.has(loadedName)) continue
    try {
      const face = new FontFace(loadedName, data as unknown as ArrayBuffer)
      void face.load().then((f) => {
        document.fonts.add(f)
        registeredFaces.add(loadedName)
      })
    } catch {
      /* skip unusable font program */
    }
  }
}

export async function extractTextItems(doc: LoadedDoc, num: number): Promise<PdfTextItem[]> {
  const pdfjs = await loadPdfJs()
  const page = await doc.pdf.getPage(num)
  const viewport = page.getViewport({ scale: 1 })
  const content = await page.getTextContent()
  // Map loadedName → original font export. Fonts are resolved into the
  // DOCUMENT-level commonObjs (keyed by internal id), NOT the page's — so scan
  // doc.pdf.commonObjs._objs. Each entry carries the real name, bold/italic and
  // the raw font program (with fontExtraProperties it is NOT cleared), which we
  // keep for real-font preview + export embedding.
  const fontByName: Record<string, { name: string; bold?: boolean; italic?: boolean }> = {}
  try {
    const store = (
      doc.pdf as unknown as {
        commonObjs?: { _objs?: Record<string, { data?: { loadedName?: string; name?: string; bold?: boolean; italic?: boolean; data?: Uint8Array | ArrayBuffer; fontData?: { data?: Uint8Array | ArrayBuffer } } }> }
      }
    ).commonObjs?._objs
    if (store) {
      for (const entry of Object.values(store)) {
        const d = entry?.data
        if (!d?.loadedName) continue
        fontByName[d.loadedName] = { name: d.name || d.loadedName, bold: d.bold, italic: d.italic }
        // Keep the raw font program for real-font preview + export embedding.
        // pdf.js may expose the program as `data` (Uint8Array/ArrayBuffer) or as
        // a nested fontData; `fontExtraProperties:true` stops it being cleared.
        let raw: Uint8Array | ArrayBuffer | null | undefined = d.data
        if ((!raw || (raw instanceof Uint8Array && raw.length === 0)) && (d as { fontData?: { data?: Uint8Array | ArrayBuffer } }).fontData?.data) {
          raw = (d as { fontData: { data: Uint8Array | ArrayBuffer } }).fontData.data
        }
        if (raw && !embeddedFonts.has(d.loadedName)) {
          embeddedFonts.set(d.loadedName, raw instanceof ArrayBuffer ? new Uint8Array(raw) : (raw as Uint8Array))
        }
      }
    }
  } catch {
    /* internal pdf.js shape changed — style detection degrades to name heuristics */
  }
  const raw: (PdfTextItem & { baseline: number })[] = []
  for (const item of content.items) {
    if (!('str' in item) || !item.str.trim()) continue
    const tx = pdfjs.Util.transform(viewport.transform, item.transform)
    const fontSize = Math.hypot(tx[2], tx[3]) || item.height || 12
    const fo = fontByName[item.fontName]
    const styleName = fo?.name || content.styles?.[item.fontName]?.fontFamily || ''
    const bold = !!(fo?.bold || /bold|black|heavy|semib/i.test(styleName))
    const italic = !!(fo?.italic || /italic|oblique/i.test(styleName))
    const family = fontFamilyFromName(styleName)
    // Clean real name for CSS: strip pdf.js subset prefix ("ABCDEF+Calibri"),
    // keep e.g. "Calibri", "ArialMT", "Segoe UI", "LiberationSerif".
    const cleanReal = styleName.replace(/^[A-Z]{6}\+/i, '').replace(/[,-].*$/, '') || undefined
    raw.push({
      x: tx[4],
      baseline: tx[5],
      y: tx[5] - fontSize,
      w: item.width * viewport.scale,
      h: fontSize * 1.2,
      text: item.str,
      fontSize,
      bold,
      italic,
      family,
      cssFont: item.fontName,
      realFamily: cleanReal,
    })
  }
  // Merge fragments sharing a baseline (±2pt) into whole lines. The line style
  // is the majority of its fragments, so mixed lines keep their dominant look.
  // A large horizontal gap (> ~1.2em) starts a NEW segment instead of joining
  // with a space — that keeps table cells / columns separate and editable.
  type Line = PdfTextItem & { baseline: number; bb: number; ib: number; tf: number; cf: number; hf: number; ft: number }
  const asLine = (it: PdfTextItem & { baseline: number }): Line => ({
    ...it,
    bb: it.bold ? 1 : 0,
    ib: it.italic ? 1 : 0,
    tf: it.family === 'times' ? 1 : 0,
    cf: it.family === 'courier' ? 1 : 0,
    hf: !it.family || it.family === 'helv' ? 1 : 0,
    ft: 1,
  })
  const lines: Line[] = []
  for (const it of raw.sort((a, b) => a.baseline - b.baseline || a.x - b.x)) {
    const last = lines[lines.length - 1]
    const gap = last ? it.x - (last.x + last.w) : Infinity
    if (last && Math.abs(last.baseline - it.baseline) <= 2 && gap <= it.fontSize * 1.2) {
      last.text += gap > it.fontSize * 0.25 ? ` ${it.text}` : it.text
      last.w = it.x + it.w - last.x
      last.fontSize = Math.max(last.fontSize, it.fontSize)
      last.h = Math.max(last.h, it.fontSize * 1.2)
      last.y = Math.min(last.y, it.y)
      last.bb += it.bold ? 1 : 0
      last.ib += it.italic ? 1 : 0
      last.tf += it.family === 'times' ? 1 : 0
      last.cf += it.family === 'courier' ? 1 : 0
      last.hf += !it.family || it.family === 'helv' ? 1 : 0
      last.ft += 1
    } else {
      lines.push(asLine(it))
    }
  }
  return lines.map(({ baseline: _b, bb, ib, tf, cf, hf, ft, ...l }) => {
    l.bold = bb * 2 > ft
    l.italic = ib * 2 > ft
    l.family = tf >= cf && tf >= hf ? 'times' : cf >= hf ? 'courier' : 'helv'
    return l
  })
}

/**
 * Group lines into visual paragraphs: consecutive lines with a small vertical
 * gap, similar font size and overlapping horizontal ranges become one block.
 * This makes "click text to edit" operate on a whole paragraph, not one line.
 */
export function groupParagraphs(lines: PdfTextItem[]): PdfTextItem[] {
  const paras: (PdfTextItem & { lastBaseline: number; lineStyles?: LineStyle[]; lineHeight?: number; _gaps?: number[]; _prevY?: number })[] = []
  for (const l of [...lines].sort((a, b) => a.y - b.y || a.x - b.x)) {
    const p = paras[paras.length - 1]
    const gap = l.y - (p ? p.lastBaseline : Infinity)
    const overlap = p ? Math.min(p.x + p.w, l.x + l.w) - Math.max(p.x, l.x) : -1
    const sameish = p && Math.max(p.fontSize, l.fontSize) / Math.min(p.fontSize, l.fontSize) <= 1.6
    if (p && gap < p.fontSize * 1.6 && overlap > Math.min(p.w, l.w) * 0.25 && sameish) {
      // union bbox + join with newline
      const x2 = Math.max(p.x + p.w, l.x + l.w)
      p.lineStyles = p.lineStyles || [{ bold: p.bold, italic: p.italic, x: 0, fontSize: p.fontSize }]
      p.lines = p.lines || [p]
      p.lines.push(l)
      p.lineStyles.push({ bold: l.bold, italic: l.italic, x: l.x - p.x, fontSize: l.fontSize })
      // measure real line spacing from original baselines
      const topGap = l.y - (p._prevY ?? l.y)
      if (topGap > 1) (p._gaps = p._gaps || []).push(topGap)
      p._prevY = l.y
      p.x = Math.min(p.x, l.x)
      p.w = x2 - p.x
      p.h = l.y + l.h - p.y
      p.text += `\n${l.text}`
      p.fontSize = Math.max(p.fontSize, l.fontSize)
      p.bold = p.bold || l.bold
      p.italic = p.italic || l.italic
      p.lastBaseline = l.y + l.fontSize
    } else {
      paras.push({ ...l, lines: [l], lastBaseline: l.y + l.fontSize, _prevY: l.y })
    }
  }
  return paras.map(({ lastBaseline: _b, _gaps, _prevY, ...p }) => {
    if (_gaps && _gaps.length) {
      const sorted = [..._gaps].sort((a, b) => a - b)
      p.lineHeight = sorted[Math.floor(sorted.length / 2)]
    }
    return p
  })
}

/** True if the text looks like a list item (starts with a bullet or a
 * number/letter + separator) — these are treated as SEPARATE editable rows,
 * never merged with neighbours. */
export function isMarkerLine(text: string): boolean {
  const t = (text || '').trimStart()
  return /^[•▪●○◦‣∙·]\s/.test(t) || /^\d{1,3}[.)]\s/.test(t) || /^[a-zA-Z][.)]\s/.test(t)
}

/** Two lines are the SAME text continuing onto the next row when they share the
 * exact same style (family, size, weight, italic), start at the same left edge
 * (no new indent → not a separate list/column item) and sit on a regular line
 * spacing. Strict on purpose: we only merge true paragraph continuation. */
export function isTextContinuation(a: PdfTextItem, b: PdfTextItem): boolean {
  if (isMarkerLine(a.text) || isMarkerLine(b.text)) return false
  if (a.family !== b.family) return false
  if ((a.cssFont || '') !== (b.cssFont || '')) return false
  if (Math.abs((a.fontSize || 14) - (b.fontSize || 14)) > 0.6) return false
  if (!!a.bold !== !!b.bold) return false
  if (!!a.italic !== !!b.italic) return false
  // same left edge (±4pt) → not a new indent/column
  if (Math.abs(a.x - b.x) > 4) return false
  // vertical: the next line sits on normal line spacing below the current
  const lineH = (a.h || a.fontSize)
  const gap = b.y - a.y
  if (gap < lineH * 0.7 || gap > lineH * 2.4) return false
  return true
}

/** Expand the clicked line to its contiguous "same paragraph" block (lines that
 * are simply this text wrapping to more rows). Returns the group (always
 * includes the clicked line). */
export function groupSameStyleBlock(lines: PdfTextItem[], clicked: PdfTextItem): PdfTextItem[] {
  const sorted = [...lines].sort((a, b) => a.y - b.y || a.x - b.x)
  const idx = sorted.indexOf(clicked)
  if (idx < 0) return [clicked]
  const group = [sorted[idx]]
  // extend down
  let cur = sorted[idx]
  for (let i = idx + 1; i < sorted.length; i++) {
    if (isTextContinuation(cur, sorted[i])) { group.push(sorted[i]); cur = sorted[i] }
    else break
  }
  // extend up
  cur = sorted[idx]
  for (let i = idx - 1; i >= 0; i--) {
    if (isTextContinuation(sorted[i], cur)) { group.unshift(sorted[i]); cur = sorted[i] }
    else break
  }
  return group
}

/**
 * Per-line style helper for edited paragraphs. For elements that came from
 * grouping, `lineStyles` (stored on the element at creation time) keeps the
 * original bold/italic/indent per source line; new elements render everything
 * in the element's own style.
 */
export function styleForLine(el: { bold?: boolean; italic?: boolean; lineStyles?: LineStyle[] }, lineIdx: number): LineStyle {
  const ls = el.lineStyles?.[lineIdx]
  return ls ? { bold: ls.bold || el.bold, italic: ls.italic || el.italic, x: ls.x || 0 } : { bold: el.bold, italic: el.italic, x: 0 }
}

/** CSS font stack used to preview an element's detected family on screen. */
export const FONT_CSS: Record<'helv' | 'times' | 'courier', string> = {
  helv: 'Helvetica, Arial, sans-serif',
  times: '"Times New Roman", Times, serif',
  courier: '"Courier New", Courier, monospace',
}

function rgbHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

/**
 * Sample the real text & background colour of a text rect from the rendered
 * canvas: darkest pixel inside the rect = ink colour, average of the thin ring
 * just outside = page background. This keeps the original ink colour on
 * replacement text and makes the whiteout match coloured/non-white pages.
 */
export function sampleTextColors(
  canvas: HTMLCanvasElement,
  rect: { x: number; y: number; w: number; h: number },
  pagePtW: number,
): { color: string; bg: string } {
  const fallback = { color: '#111111', bg: '#ffffff' }
  try {
    const ctx = canvas.getContext('2d')
    if (!ctx || !canvas.width || !canvas.height || rect.w <= 0 || rect.h <= 0) return fallback
    const s = canvas.width / pagePtW
    const x = Math.max(0, Math.floor(rect.x * s))
    const y = Math.max(0, Math.floor(rect.y * s))
    const w = Math.min(canvas.width - x, Math.max(1, Math.ceil(rect.w * s)))
    const h = Math.min(canvas.height - y, Math.max(1, Math.ceil(rect.h * s)))
    const img = ctx.getImageData(x, y, w, h)
    let minLum = Infinity
    let tx = 17, tg = 17, tb = 17
    for (let i = 0; i < img.data.length; i += 4) {
      if (img.data[i + 3] < 128) continue
      const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2]
      const lum = 0.299 * r + 0.587 * g + 0.114 * b
      if (lum < minLum) {
        minLum = lum
        tx = r; tg = g; tb = b
      }
    }
    if (minLum === Infinity) return fallback
    // Ring of ~3 device px around the rect → average = background colour.
    const rx = Math.max(0, x - 3), ry = Math.max(0, y - 3)
    const rw = Math.min(canvas.width - rx, w + 6), rh = Math.min(canvas.height - ry, h + 6)
    const ring = ctx.getImageData(rx, ry, rw, rh)
    let n = 0, br = 0, bgc = 0, bb = 0
    for (let py = 0; py < rh; py++) {
      for (let px = 0; px < rw; px++) {
        const inside = px >= x - rx && px < x - rx + w && py >= y - ry && py < y - ry + h
        if (inside) continue
        const i = (py * rw + px) * 4
        if (ring.data[i + 3] < 128) continue
        br += ring.data[i]; bgc += ring.data[i + 1]; bb += ring.data[i + 2]; n++
      }
    }
    return {
      color: rgbHex(tx, tg, tb),
      bg: n ? rgbHex(Math.round(br / n), Math.round(bgc / n), Math.round(bb / n)) : fallback.bg,
    }
  } catch {
    return fallback
  }
}

/**
 * Build whiteout + replacement elements for a line-level text edit. Only lines
 * whose text actually changed are replaced — untouched lines keep the original
 * PDF rendering pixel-for-pixel (how pro editors avoid any reflow). Lines typed
 * beyond the original count are appended below the block in the same style.
 */
export function buildLineReplacements(
  origLines: PdfTextItem[],
  newText: string,
  opts: {
    makeId: () => string
    lineHeight?: number
    /** Per-line colour sampling from the rendered canvas. */
    sample?: (rect: { x: number; y: number; w: number; h: number }) => { color: string; bg: string }
    color?: string
    bg?: string
  },
): PdfElement[] {
  const out: PdfElement[] = []
  const newLines = newText.split('\n')
  const last = origLines[origLines.length - 1]
  const lh = opts.lineHeight || last?.h || 16
  const left = origLines.length ? Math.min(...origLines.map((l) => l.x)) : 0
  const right = origLines.length ? Math.max(...origLines.map((l) => l.x + l.w)) : 0
  const top = origLines.length ? Math.min(...origLines.map((l) => l.y)) : 0
  const bottom = origLines.length ? Math.max(...origLines.map((l) => l.y + l.h)) : 0

  // Free-flow edit: the typed text has a different line count than the source
  // (soft-wrapped typing, added/removed Enter breaks). Replace the WHOLE block
  // with one flowing text element so nothing gets deleted and the text wraps
  // naturally within the block width. Style = majority of the source lines.
  if (origLines.length === 0 || newLines.length !== origLines.length) {
    const maj = (pick: (l: PdfTextItem) => number) => {
      const t = origLines.reduce((acc, l) => acc + (pick(l) ? 1 : 0), 0)
      return t * 2 > origLines.length
    }
    const famT = origLines.filter((l) => l.family === 'times').length
    const famC = origLines.filter((l) => l.family === 'courier').length
    const sizes = origLines.map((l) => l.fontSize).sort((a, b) => a - b)
    // Majority embedded font (the real document typeface, when extracted).
    const cssFontCounts = new Map<string, number>()
    for (const l of origLines) if (l.cssFont) cssFontCounts.set(l.cssFont, (cssFontCounts.get(l.cssFont) ?? 0) + 1)
    const cssFont = [...cssFontCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    // Majority real family name (used for CSS preview of system fonts).
    const rfCounts = new Map<string, number>()
    for (const l of origLines) if (l.realFamily) rfCounts.set(l.realFamily, (rfCounts.get(l.realFamily) ?? 0) + 1)
    const realFamily = [...rfCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    const style: Pick<PdfElement, 'fontSize' | 'bold' | 'italic' | 'family' | 'cssFont' | 'realFamily'> = {
      fontSize: sizes.length ? sizes[Math.floor(sizes.length / 2)] : 14,
      bold: maj((l) => (l.bold ? 1 : 0)),
      italic: maj((l) => (l.italic ? 1 : 0)),
      family: famT >= famC && famT >= origLines.length - famT - famC ? 'times' : famC >= origLines.length - famT - famC ? 'courier' : 'helv',
      ...(cssFont ? { cssFont } : {}),
      ...(realFamily ? { realFamily } : {}),
    }
    const c = opts.sample ? opts.sample({ x: left, y: top, w: right - left, h: bottom - top }) : undefined
    out.push({ id: opts.makeId(), kind: 'whiteout', x: left - 1, y: top - 1, w: right - left + 2, h: bottom - top + 2, bg: c?.bg ?? opts.bg ?? '#ffffff' })
    if (newText.trim()) {
      out.push({
        id: opts.makeId(),
        kind: 'text',
        x: left,
        y: top,
        w: Math.max(40, right - left),
        h: Math.max(lh, bottom - top),
        text: newText,
        lineHeight: lh,
        color: c?.color ?? opts.color ?? '#111111',
        ...style,
      })
    }
    return out
  }

  for (let i = 0; i < Math.max(origLines.length, newLines.length); i++) {
    const o = origLines[i]
    const n = newLines[i] ?? ''
    if (o && n === o.text) continue // unchanged — original pixels stay
    if (o) {
      const c = opts.sample ? opts.sample(o) : undefined
      out.push({
        id: opts.makeId(),
        kind: 'whiteout',
        x: o.x - 1,
        y: o.y - 1,
        w: o.w + 2,
        h: o.h + 2,
        bg: c?.bg ?? opts.bg ?? '#ffffff',
      })
      if (n.trim()) {
        out.push({
          id: opts.makeId(),
          kind: 'text',
          x: o.x,
          y: o.y,
          w: o.w,
          h: o.h,
          text: n,
          fontSize: o.fontSize,
          bold: o.bold,
          italic: o.italic,
          family: o.family,
          cssFont: o.cssFont,
          realFamily: o.realFamily,
          color: c?.color ?? opts.color ?? '#111111',
        })
      }
    } else if (n.trim() && last) {
      // Added line — same style as the block's last line, stacked underneath.
      out.push({
        id: opts.makeId(),
        kind: 'text',
        x: left,
        y: last.y + lh * (i - origLines.length + 1),
        w: Math.max(40, right - left),
        h: last.h,
        text: n,
        fontSize: last.fontSize,
        bold: last.bold,
        italic: last.italic,
        family: last.family,
        cssFont: last.cssFont,
        realFamily: last.realFamily,
        color: opts.color ?? '#111111',
      })
    }
  }
  return out
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ------------------------------------------------------------------ *
 * Editing — overlay elements are stored in PDF points (top-left
 * origin, matching the rendered view) and baked into the PDF with
 * pdf-lib on save. Nothing is uploaded.
 * ------------------------------------------------------------------ */

export interface PdfElement {
  id: string
  kind: 'text' | 'whiteout' | 'highlight' | 'image' | 'signature'
  /** PDF points, origin top-left of the page. */
  x: number
  y: number
  w: number
  h: number
  text?: string
  fontSize?: number
  /** Style flags resolved from the original PDF font (existing text). */
  bold?: boolean
  italic?: boolean
  /** Closest standard font family of the original text. */
  family?: 'helv' | 'times' | 'courier'
  /** pdf.js loadedName of the original embedded font (see embeddedFonts). */
  cssFont?: string
  /** Real font-family name from the PDF, when the font isn't extractable. */
  realFamily?: string
  /** Original line spacing in pt (measured from source lines). */
  lineHeight?: number
  /** Per-source-line styles preserved from the original paragraph. */
  lineStyles?: LineStyle[]
  /** CSS hex color for text / highlight. */
  color?: string
  /** Background colour (hex) of a whiteout, sampled from the page. */
  bg?: string
  /**
   * Invisible caret-catcher used while editing existing text: the textarea
   * captures typing but renders transparent — the visible text is either the
   * original PDF (unchanged lines) or live-diff replacement elements.
   */
  ghost?: boolean
  /** data URL (PNG/JPG) for image & signature elements. */
  dataUrl?: string
}

export type PageEdits = Record<number, PdfElement[]> // key = 1-based page number

function hexToRgb01(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return [0, 0, 0]
  const n = parseInt(m[1], 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/**
 * Bake all overlay elements into a fresh PDF bytes copy (original is never
 * mutated). Returns a Blob ready for download.
 *
 * Export is guaranteed: it first tries to embed the ORIGINAL embedded fonts
 * (subsetting each, falling back per-font to full embed then to the closest
 * standard font). If anything fails (some sanitized fonts can't be re-embedded
 * and would otherwise abort pdf.save), the whole bake is retried with standard
 * fonts only — so an edit ALWAYS lands in the downloaded PDF.
 */
export async function buildEditedPdf(doc: LoadedDoc, edits: PageEdits): Promise<Blob> {
  try {
    return await bake(doc, edits, true)
  } catch {
    return bake(doc, edits, false) // guaranteed standard-font fallback
  }
}

/**
 * Transliterate/filter characters the WinAnsi (CP1252) standard fonts can't
 * encode — pdf-lib's drawText THROWS on e.g. "č" (0x010D). Bosnian/Croatian
 * diacritics map to their ASCII base; anything else unmappable is dropped.
 */
export function winAnsiSafe(text: string): string {
  const pass = new Set(
    "‘’‚“”„†‡ˆ‰Š‹ŒŽ''•˜™š›œžŸƒ‚„…†‡ˆ‰Š‹ŒŽ•˜™š›œžŸ–—€".split('').concat(['–', '—', '…', '€', '‚', '„']),
  )
  let out = ''
  for (const ch of text) {
    const c = ch.charCodeAt(0)
    if (c <= 0x7e || (c >= 0xa0 && c <= 0xff) || pass.has(ch)) {
      out += ch
      continue
    }
    switch (ch) {
      case 'č': case 'ć': out += 'c'; break
      case 'Č': case 'Ć': out += 'C'; break
      case 'đ': out += 'dj'; break
      case 'Đ': out += 'Dj'; break
      case 'ž': out += 'z'; break
      case 'Ž': out += 'Z'; break
      case 'š': out += 's'; break
      case 'Š': out += 'S'; break
      case '\u2011': out += '-'; break
      default: break // unmappable (arrows, emoji, CJK…) — dropped
    }
  }
  return out
}

async function bake(doc: LoadedDoc, edits: PageEdits, useEmbedded: boolean): Promise<Blob> {
  const { PDFDocument, rgb, StandardFonts, degrees } = await import('pdf-lib')
  const bytes = new Uint8Array(await doc.file.arrayBuffer())
  const pdf = await PDFDocument.load(bytes)
  // Original-document typeface embedding (pdf-lib + fontkit). Registered lazily;
  // per-font we try subset → full embed → standard font, so a single exotic
  // font can never abort the whole document.
  let fontkit: Parameters<typeof pdf.registerFontkit>[0] | null = null
  const embeddedCache = new Map<string, Awaited<ReturnType<typeof pdf.embedFont>>>()
  const fontForEmbedded = async (loadedName?: string) => {
    if (!useEmbedded || !loadedName || !embeddedFonts.has(loadedName)) return null
    if (embeddedCache.has(loadedName)) return embeddedCache.get(loadedName) ?? null
    const data = embeddedFonts.get(loadedName)!
    try {
      if (!fontkit) {
        fontkit = ((await import('@pdf-lib/fontkit')) as unknown as { default: Parameters<typeof pdf.registerFontkit>[0] }).default
        pdf.registerFontkit(fontkit)
      }
      let f
      try {
        f = await pdf.embedFont(data, { subset: true })
      } catch {
        f = await pdf.embedFont(data, { subset: false })
      }
      embeddedCache.set(loadedName, f)
      return f
    } catch {
      return null // parse failure → caller falls back to standard font
    }
  }
  const helv = await pdf.embedFont(StandardFonts.Helvetica)
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const helvItal = await pdf.embedFont(StandardFonts.HelveticaOblique)
  const times = await pdf.embedFont(StandardFonts.TimesRoman)
  const timesBold = await pdf.embedFont(StandardFonts.TimesRomanBold)
  const timesItal = await pdf.embedFont(StandardFonts.TimesRomanItalic)
  const courier = await pdf.embedFont(StandardFonts.Courier)
  const courierBold = await pdf.embedFont(StandardFonts.CourierBold)
  const courierItal = await pdf.embedFont(StandardFonts.CourierOblique)
  const fontFor = (family: 'helv' | 'times' | 'courier' | undefined, bold?: boolean, italic?: boolean) =>
    family === 'times' ? (italic ? timesItal : bold ? timesBold : times)
      : family === 'courier' ? (italic ? courierItal : bold ? courierBold : courier)
      : italic ? helvItal : bold ? helvBold : helv
  const pages = pdf.getPages()

  for (const [key, els] of Object.entries(edits)) {
    const pageNo = Number(key)
    const page = pages[pageNo - 1]
    if (!page) continue
    const pageH = page.getHeight()
    for (const el of els) {
      // PDF coordinates have bottom-left origin; our overlay uses top-left.
      const y = pageH - el.y - el.h
      if (el.kind === 'whiteout') {
        const [r, g, b] = el.bg ? hexToRgb01(el.bg) : [1, 1, 1]
        page.drawRectangle({ x: el.x, y, width: el.w, height: el.h, color: rgb(r, g, b) })
      } else if (el.kind === 'highlight') {
        const [r, g, b] = hexToRgb01(el.color || '#FFE066')
        page.drawRectangle({ x: el.x, y, width: el.w, height: el.h, color: rgb(r, g, b), opacity: 0.35 })
      } else if (el.kind === 'text' && el.text) {
        const [r, g, b] = hexToRgb01(el.color || '#111111')
        const size = el.fontSize || 14
        const lh = el.lineHeight || size * 1.25
        // Original embedded typeface when available; standard font otherwise.
        const elF = await fontForEmbedded(el.cssFont)
        // Wrap text into the element width, drawing line by line (top-left origin).
        const maxW = el.w
        const lines: { text: string; size: number; font: ReturnType<typeof fontFor>; x: number }[] = []
        const srcLines = el.text.split('\n')
        srcLines.forEach((raw, si) => {
          const st = styleForLine(el, si)
          const lsize = st.fontSize || size
          const font = elF ?? fontFor(el.family, st.bold, st.italic)
          // Standard fonts are WinAnsi-only: transliterate chars they can't
          // encode (č ć đ …) instead of letting drawText throw.
          const safe = elF ? raw : winAnsiSafe(raw)
          const indent = st.x || 0
          let line = ''
          for (const word of safe.split(' ')) {
            const next = line ? `${line} ${word}` : word
            if (font.widthOfTextAtSize(next, lsize) > maxW - indent && line) {
              lines.push({ text: line, size: lsize, font, x: indent })
              line = word
            } else line = next
          }
          lines.push({ text: line, size: lsize, font, x: indent })
        })
        let cy = el.y // top of current line (top-left origin)
        for (const ln of lines) {
          page.drawText(ln.text, {
            x: el.x + ln.x,
            y: pageH - cy - ln.size,
            size: ln.size,
            font: ln.font,
            color: rgb(r, g, b),
          })
          cy += Math.max(ln.size * 1.15, lh)
        }
      } else if ((el.kind === 'image' || el.kind === 'signature') && el.dataUrl) {
        const b64 = el.dataUrl.split(',')[1] ?? ''
        const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
        const img = el.dataUrl.includes('image/png') ? await pdf.embedPng(bin) : await pdf.embedJpg(bin)
        page.drawImage(img, { x: el.x, y, width: el.w, height: el.h })
      }
    }
  }
  void degrees // (kept for future page-rotation support)
  const out = await pdf.save()
  return new Blob([out as unknown as BlobPart], { type: 'application/pdf' })
}