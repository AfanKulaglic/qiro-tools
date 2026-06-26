export type OutputFormat = 'png' | 'jpeg' | 'webp'

export interface ConvertOptions {
  format: OutputFormat
  quality: number // 0–1, used for jpeg/webp
  backgroundColor: string // used when flattening transparency to jpeg
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
}

export const FORMAT_LABEL: Record<OutputFormat, string> = {
  png: 'PNG',
  jpeg: 'JPG',
  webp: 'WebP',
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
 * Converts an image File to the chosen format entirely in the browser using a
 * canvas. For JPEG output, transparency is flattened onto backgroundColor.
 */
export async function convertImage(
  file: File,
  options: ConvertOptions,
): Promise<ConvertResult> {
  const img = await loadImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser.')

  if (options.format === 'jpeg') {
    // JPEG has no alpha channel — fill the background first.
    ctx.fillStyle = options.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(img, 0, 0)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(
      resolve,
      MIME[options.format],
      options.format === 'png' ? undefined : options.quality,
    ),
  )

  if (!blob) throw new Error('Conversion failed. Please try a different file.')

  return {
    blob,
    url: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    size: blob.size,
  }
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
