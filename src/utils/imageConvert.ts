import { decodeAnyImage } from './imageDecoders'

export type OutputFormat =
  | 'png' | 'jpeg' | 'webp' | 'avif' | 'bmp' | 'ico' | 'tiff' | 'pdf' | 'gif' | 'jxl' | 'tga' | 'ppm'

export interface ConvertOptions {
  format: OutputFormat
  quality: number // 0–1, used for jpeg/webp/avif/jxl/pdf
  backgroundColor: string // used when flattening transparency to jpeg/bmp/tiff/pdf/gif
  scale?: number // 0–1 multiplier on the source dimensions (default 1 = original size)
}

export interface ConvertResult {
  blob: Blob
  url: string
  width: number
  height: number
  size: number
}

const MIME: Record<OutputFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  tiff: 'image/tiff',
  pdf: 'application/pdf',
  gif: 'image/gif',
  jxl: 'image/jxl',
  tga: 'image/x-tga',
  ppm: 'image/x-portable-pixmap',
}

export const FORMAT_LABEL: Record<OutputFormat, string> = {
  png: 'PNG',
  jpeg: 'JPG',
  webp: 'WebP',
  avif: 'AVIF',
  bmp: 'BMP',
  ico: 'ICO',
  tiff: 'TIFF',
  pdf: 'PDF',
  gif: 'GIF',
  jxl: 'JXL',
  tga: 'TGA',
  ppm: 'PPM',
}

/** Formats with no alpha channel — transparency is flattened onto the background. */
const FLATTEN_ALPHA: Record<OutputFormat, boolean> = {
  png: false,
  jpeg: true,
  webp: false,
  avif: false,
  bmp: true,
  ico: false,
  tiff: true,
  pdf: true, // embeds a JPEG
  gif: true, // single-frame, palette-based — flatten for clean colours
  jxl: false,
  tga: false, // 32-bit TGA carries an alpha channel
  ppm: true, // P6 has no alpha
}

/** Formats whose file size responds to the quality slider. */
const USES_QUALITY: Record<OutputFormat, boolean> = {
  png: false,
  jpeg: true,
  webp: true,
  avif: true,
  bmp: false,
  ico: false,
  tiff: false,
  pdf: true, // controls the embedded JPEG quality
  gif: false, // 256-colour palette
  jxl: true,
  tga: false,
  ppm: false,
}

/** Formats the browser can render in an <img> tag for the live preview. */
const BROWSER_RENDERABLE: Record<OutputFormat, boolean> = {
  png: true,
  jpeg: true,
  webp: true,
  avif: true,
  bmp: true,
  ico: true,
  tiff: false, // browsers can't display TIFF
  pdf: false, // shown via an <iframe>, not <img>
  gif: true,
  jxl: false, // Chrome/Firefox don't display JXL
  tga: false,
  ppm: false,
}

export function needsBackground(format: OutputFormat): boolean {
  return FLATTEN_ALPHA[format]
}

export function supportsQuality(format: OutputFormat): boolean {
  return USES_QUALITY[format]
}

export function canPreview(format: OutputFormat): boolean {
  return BROWSER_RENDERABLE[format]
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read this image file.'))
    }
    img.src = url
  })
}

/**
 * Converts an image File to the chosen format entirely in the browser.
 *
 * PNG / JPEG / WebP are produced straight from the canvas. AVIF is encoded with
 * the jSquash WASM codec (lazily downloaded on first use). BMP is written by
 * hand as an uncompressed 24-bit bitmap. In every case the image stays on the
 * device — nothing is uploaded.
 */
export async function convertImage(
  file: File,
  options: ConvertOptions,
): Promise<ConvertResult> {
  const img = await decodeAnyImage(file)
  const scale = Math.min(1, Math.max(0.05, options.scale ?? 1))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser.')
  // Smooth downscale.
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  if (FLATTEN_ALPHA[options.format]) {
    // Formats without an alpha channel — fill the background first.
    ctx.fillStyle = options.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  let blob: Blob | null
  if (options.format === 'tga') {
    blob = encodeTga(ctx, canvas.width, canvas.height)
  } else if (options.format === 'ppm') {
    blob = encodePpm(ctx, canvas.width, canvas.height)
  } else if (options.format === 'avif') {
    blob = await encodeAvif(ctx, canvas.width, canvas.height, options.quality)
  } else if (options.format === 'bmp') {
    blob = encodeBmp(ctx, canvas.width, canvas.height)
  } else if (options.format === 'tiff') {
    blob = encodeTiff(ctx, canvas.width, canvas.height)
  } else if (options.format === 'ico') {
    blob = await encodeIco(canvas)
  } else if (options.format === 'gif') {
    blob = await encodeGif(ctx, canvas.width, canvas.height)
  } else if (options.format === 'jxl') {
    blob = await encodeJxl(ctx, canvas.width, canvas.height, options.quality)
  } else if (options.format === 'pdf') {
    blob = await encodePdf(canvas, options.quality)
  } else {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(
        resolve,
        MIME[options.format],
        options.format === 'png' ? undefined : options.quality,
      ),
    )
  }

  if (!blob) throw new Error('Conversion failed. Please try a different file.')

  return {
    blob,
    url: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    size: blob.size,
  }
}

/** AVIF encoding via the jSquash WASM codec (loaded on demand). */
async function encodeAvif(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  quality: number,
): Promise<Blob> {
  const { default: encode } = await import('@jsquash/avif/encode')
  const imageData = ctx.getImageData(0, 0, width, height)
  const buffer = await encode(imageData, {
    quality: Math.round(Math.min(1, Math.max(0, quality)) * 100),
  })
  return new Blob([buffer], { type: 'image/avif' })
}

/** JPEG XL encoding via the jSquash WASM codec (loaded on demand). */
async function encodeJxl(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  quality: number,
): Promise<Blob> {
  const { default: encode } = await import('@jsquash/jxl/encode')
  const imageData = ctx.getImageData(0, 0, width, height)
  const buffer = await encode(imageData, {
    quality: Math.round(Math.min(1, Math.max(0, quality)) * 100),
  })
  return new Blob([buffer], { type: 'image/jxl' })
}

/** Single-frame GIF encoding via gifenc (256-colour median-cut palette). */
async function encodeGif(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): Promise<Blob> {
  const { quantize, applyPalette, GIFEncoder } = await import('gifenc')
  const { data } = ctx.getImageData(0, 0, width, height)
  const palette = quantize(data, 256)
  const index = applyPalette(data, palette)
  const gif = GIFEncoder()
  gif.writeFrame(index, width, height, { palette })
  gif.finish()
  return new Blob([gif.bytes() as BlobPart], { type: 'image/gif' })
}

/**
 * Wraps the image in a single-page PDF. The canvas is encoded to JPEG and
 * embedded with the DCTDecode filter, so the PDF carries the photo directly.
 */
async function encodePdf(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  const jpegBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality),
  )
  if (!jpegBlob) throw new Error('Conversion failed. Please try a different file.')
  const jpeg = new Uint8Array(await jpegBlob.arrayBuffer())
  const w = canvas.width
  const h = canvas.height

  const enc = new TextEncoder()
  const parts: Uint8Array[] = []
  let length = 0
  const offsets: number[] = []
  const push = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === 'string' ? enc.encode(chunk) : chunk
    parts.push(bytes)
    length += bytes.length
  }
  const mark = (obj: number) => { offsets[obj] = length }

  push('%PDF-1.4\n')
  mark(1); push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
  mark(2); push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')
  mark(3); push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] ` +
    `/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
  )
  mark(4); push(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} ` +
    `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  )
  push(jpeg)
  push('\nendstream\nendobj\n')

  const content = `q\n${w} 0 0 ${h} 0 0 cm\n/Im0 Do\nQ\n`
  mark(5); push(`5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`)

  const xrefStart = length
  let xref = 'xref\n0 6\n0000000000 65535 f \n'
  for (let i = 1; i <= 5; i++) xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  push(xref)
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`)

  const out = new Uint8Array(length)
  let o = 0
  for (const b of parts) { out.set(b, o); o += b.length }
  return new Blob([out], { type: 'application/pdf' })
}

/** Writes an uncompressed 24-bit (BGR, bottom-up) BMP from the canvas pixels. */
function encodeBmp(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): Blob {
  const { data } = ctx.getImageData(0, 0, width, height)
  const rowSize = (width * 3 + 3) & ~3 // each row padded to a multiple of 4 bytes
  const pixelArraySize = rowSize * height
  const fileSize = 54 + pixelArraySize

  const buffer = new ArrayBuffer(fileSize)
  const view = new DataView(buffer)

  // BITMAPFILEHEADER
  view.setUint8(0, 0x42) // 'B'
  view.setUint8(1, 0x4d) // 'M'
  view.setUint32(2, fileSize, true)
  view.setUint32(6, 0, true) // reserved
  view.setUint32(10, 54, true) // pixel data offset

  // BITMAPINFOHEADER
  view.setUint32(14, 40, true) // header size
  view.setInt32(18, width, true)
  view.setInt32(22, height, true) // positive height = bottom-up rows
  view.setUint16(26, 1, true) // planes
  view.setUint16(28, 24, true) // bits per pixel
  view.setUint32(30, 0, true) // BI_RGB, no compression
  view.setUint32(34, pixelArraySize, true)
  view.setInt32(38, 2835, true) // 72 DPI horizontal
  view.setInt32(42, 2835, true) // 72 DPI vertical
  view.setUint32(46, 0, true) // colors in palette
  view.setUint32(50, 0, true) // important colors

  const bytes = new Uint8Array(buffer)
  for (let y = 0; y < height; y++) {
    const srcRow = (height - 1 - y) * width * 4 // BMP rows run bottom-to-top
    let dst = 54 + y * rowSize
    for (let x = 0; x < width; x++) {
      const src = srcRow + x * 4
      bytes[dst++] = data[src + 2] // B
      bytes[dst++] = data[src + 1] // G
      bytes[dst++] = data[src] // R
    }
  }

  return new Blob([buffer], { type: 'image/bmp' })
}

/**
 * Writes an uncompressed, little-endian RGB TIFF (single strip, top-down) from
 * the canvas pixels. Alpha is already flattened onto the background by the
 * caller, so only the three colour channels are stored.
 */
function encodeTiff(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): Blob {
  const { data } = ctx.getImageData(0, 0, width, height)
  const NUM_ENTRIES = 10
  const HEADER = 8
  const ifdSize = 2 + NUM_ENTRIES * 12 + 4
  const bitsOffset = HEADER + ifdSize // BitsPerSample array [8,8,8]
  const pixelOffset = bitsOffset + 6
  const pixelBytes = width * height * 3
  const buffer = new ArrayBuffer(pixelOffset + pixelBytes)
  const view = new DataView(buffer)

  // ── Header (little-endian) ──
  view.setUint16(0, 0x4949, true) // 'II'
  view.setUint16(2, 42, true) // magic
  view.setUint32(4, HEADER, true) // offset to first IFD

  // ── Image File Directory ──
  view.setUint16(HEADER, NUM_ENTRIES, true)
  let p = HEADER + 2
  const entry = (tag: number, type: number, count: number, value: number) => {
    view.setUint16(p, tag, true)
    view.setUint16(p + 2, type, true)
    view.setUint32(p + 4, count, true)
    view.setUint32(p + 8, value, true)
    p += 12
  }
  const SHORT = 3
  const LONG = 4
  entry(256, LONG, 1, width) // ImageWidth
  entry(257, LONG, 1, height) // ImageLength
  entry(258, SHORT, 3, bitsOffset) // BitsPerSample → [8,8,8]
  entry(259, SHORT, 1, 1) // Compression = none
  entry(262, SHORT, 1, 2) // PhotometricInterpretation = RGB
  entry(273, LONG, 1, pixelOffset) // StripOffsets
  entry(277, SHORT, 1, 3) // SamplesPerPixel
  entry(278, LONG, 1, height) // RowsPerStrip
  entry(279, LONG, 1, pixelBytes) // StripByteCounts
  entry(284, SHORT, 1, 1) // PlanarConfiguration = chunky
  view.setUint32(p, 0, true) // next IFD = none

  // BitsPerSample values
  view.setUint16(bitsOffset, 8, true)
  view.setUint16(bitsOffset + 2, 8, true)
  view.setUint16(bitsOffset + 4, 8, true)

  // ── Pixel data (RGB, top-down) ──
  const bytes = new Uint8Array(buffer)
  let dst = pixelOffset
  for (let i = 0; i < width * height; i++) {
    const src = i * 4
    bytes[dst++] = data[src] // R
    bytes[dst++] = data[src + 1] // G
    bytes[dst++] = data[src + 2] // B
  }

  return new Blob([buffer], { type: 'image/tiff' })
}

/**
 * Writes a Truevision TGA (type 2, uncompressed). Kept 32-bit so the alpha
 * channel survives; the 0x20 descriptor puts the origin top-left, so pixel
 * rows are written straight down without a flip.
 */
function encodeTga(ctx: CanvasRenderingContext2D, width: number, height: number): Blob {
  const { data } = ctx.getImageData(0, 0, width, height)
  const header = new ArrayBuffer(18)
  const view = new DataView(header)
  view.setUint8(2, 2) // uncompressed true-colour
  view.setUint16(12, width, true)
  view.setUint16(14, height, true)
  view.setUint8(16, 32) // bits per pixel
  view.setUint8(17, 0x20) // top-left origin + 8 alpha bits

  const bytes = new Uint8Array(18 + width * height * 4)
  bytes.set(new Uint8Array(header), 0)
  let dst = 18
  for (let i = 0; i < width * height; i++) {
    const src = i * 4
    bytes[dst++] = data[src + 2] // B
    bytes[dst++] = data[src + 1] // G
    bytes[dst++] = data[src] // R
    bytes[dst++] = data[src + 3] // A
  }
  return new Blob([bytes], { type: 'image/x-tga' })
}

/** Writes a binary PPM (P6) — raw RGB with a plain-text header. */
function encodePpm(ctx: CanvasRenderingContext2D, width: number, height: number): Blob {
  const { data } = ctx.getImageData(0, 0, width, height)
  const header = new TextEncoder().encode(`P6\n${width} ${height}\n255\n`)
  const pixels = new Uint8Array(width * height * 3)
  let dst = 0
  for (let i = 0; i < width * height; i++) {
    const src = i * 4
    pixels[dst++] = data[src] // R
    pixels[dst++] = data[src + 1] // G
    pixels[dst++] = data[src + 2] // B
  }
  return new Blob([header, pixels], { type: 'image/x-portable-pixmap' })
}

/**
 * Writes a Windows ICO that embeds a PNG image (supported since Windows Vista).
 * Icons are capped to 256×256 — the largest size the ICO directory can encode.
 */
async function encodeIco(source: HTMLCanvasElement): Promise<Blob> {
  // Downscale into a ≤256 px square-bounded canvas, preserving aspect ratio.
  const max = 256
  const ratio = Math.min(1, max / Math.max(source.width, source.height))
  const w = Math.max(1, Math.round(source.width * ratio))
  const h = Math.max(1, Math.round(source.height * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser.')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, w, h)

  const pngBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  )
  if (!pngBlob) throw new Error('Conversion failed. Please try a different file.')
  const png = new Uint8Array(await pngBlob.arrayBuffer())

  const header = new ArrayBuffer(22)
  const view = new DataView(header)
  view.setUint16(0, 0, true) // reserved
  view.setUint16(2, 1, true) // type = icon
  view.setUint16(4, 1, true) // image count
  view.setUint8(6, w >= 256 ? 0 : w) // width (0 = 256)
  view.setUint8(7, h >= 256 ? 0 : h) // height (0 = 256)
  view.setUint8(8, 0) // palette count
  view.setUint8(9, 0) // reserved
  view.setUint16(10, 1, true) // colour planes
  view.setUint16(12, 32, true) // bits per pixel
  view.setUint32(14, png.length, true) // size of PNG data
  view.setUint32(18, 22, true) // offset to PNG data

  return new Blob([header, png], { type: 'image/x-icon' })
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function replaceExtension(fileName: string, format: OutputFormat): string {
  const base = fileName.replace(/\.[^.]+$/, '')
  const ext = format === 'jpeg' ? 'jpg' : format
  return `${base}.${ext}`
}
