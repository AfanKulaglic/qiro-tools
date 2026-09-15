import { fetchFile } from '@ffmpeg/util'
import { loadFFmpeg } from './ffmpegClient'

/**
 * Extra image decoders for formats the browser can't render in an <img>:
 * TIFF and HEIC/HEIF. Both lazily pull in heavy machinery only when such a
 * file actually arrives, so the common path stays fast.
 */

function loadFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read this image file.'))
    img.src = url
  })
}

const FFMPEG_INPUT_EXTS = ['tif', 'tiff']

const HEIC_EXTS = ['heic', 'heif']

export function isSvgFile(file: File): boolean {
  if (file.type === 'image/svg+xml') return true
  return file.name.toLowerCase().endsWith('.svg')
}

export function isHeicFile(file: File): boolean {
  if (file.type === 'image/heic' || file.type === 'image/heif') return true
  const ext = file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase()
  return !!ext && HEIC_EXTS.includes(ext)
}

export function isTiffFile(file: File): boolean {
  if (file.type === 'image/tiff') return true
  const ext = file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase()
  return !!ext && FFMPEG_INPUT_EXTS.includes(ext)
}

/**
 * Decodes raster formats the browser can't handle natively (TIFF) by piping
 * them through the shared ffmpeg.wasm instance into PNG, which then behaves
 * like any other bitmap input.
 */
async function decodeViaFfmpeg(file: File): Promise<HTMLImageElement> {
  const instance = await loadFFmpeg()
  const ext = file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase() ?? 'tiff'
  await instance.writeFile(`input.${ext}`, await fetchFile(file))
  try {
    const code = await instance.exec(['-i', `input.${ext}`, '-y', 'output.png'])
    if (code !== 0) throw new Error('Could not decode this image.')
    const data = await instance.readFile('output.png')
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data))
    const pngBlob = new Blob([bytes as BlobPart], { type: 'image/png' })
    const url = URL.createObjectURL(pngBlob)
    try {
      return await loadFromUrl(url)
    } finally {
      // Give the decode a grace period before releasing the object URL.
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
    }
  } finally {
    await instance.deleteFile(`input.${ext}`).catch(() => {})
    await instance.deleteFile('output.png').catch(() => {})
  }
}

/** Decodes iPhone HEIC/HEIF photos via libheif (heic2any), lazily imported. */
async function decodeHeic(file: File): Promise<HTMLImageElement> {
  const { default: heic2any } = await import('heic2any')
  const converted = await heic2any({ blob: file, toType: 'image/png' })
  const blob = Array.isArray(converted) ? converted[0] : converted
  const url = URL.createObjectURL(blob)
  try {
    return await loadFromUrl(url)
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
  }
}

/**
 * Rasterises an SVG into a crisp bitmap. Renders at 2× the declared size
 * (capped at 4096 px) so the result has headroom for downscaling outputs.
 */
export async function rasterizeSvg(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  const img = await loadFromUrl(url)
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)

  const baseW = img.naturalWidth || 1024
  const baseH = img.naturalHeight || 1024
  const target = Math.min(2, 4096 / Math.max(baseW, baseH))
  if (target <= 1) return img

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(baseW * target)
  canvas.height = Math.round(baseH * target)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser.')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const pngUrl = URL.createObjectURL(
    await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png')),
  )
  window.setTimeout(() => URL.revokeObjectURL(pngUrl), 30_000)
  return loadFromUrl(pngUrl)
}

/**
 * Unified entry point: takes a File of ANY supported image format (including
 * TIFF, HEIC and SVG) and returns a decoded HTMLImageElement ready for the
 * canvas pipeline in `imageConvert.ts`.
 */
export async function decodeAnyImage(file: File): Promise<HTMLImageElement> {
  if (isSvgFile(file)) return rasterizeSvg(file)
  if (isHeicFile(file)) return decodeHeic(file)
  if (isTiffFile(file)) return decodeViaFfmpeg(file)
  const url = URL.createObjectURL(file)
  try {
    return await loadFromUrl(url)
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
  }
}
