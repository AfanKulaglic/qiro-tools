import { fetchFile } from '@ffmpeg/util'
import { loadFFmpeg, isFFmpegLoaded, downloadBlob } from './ffmpegClient'

/**
 * GIF maker — turns a slice of a video into an animated GIF, using the shared
 * ffmpeg.wasm instance (see `ffmpegClient.ts`). Two-pass palette generation
 * (palettegen → paletteuse) keeps colours clean at small file sizes.
 */

export { loadFFmpeg, isFFmpegLoaded, downloadBlob }

export interface GifOptions {
  start: number // seconds
  duration: number // seconds
  fps: number
  width: number // px; height auto (keeps aspect ratio)
}

export interface GifResult {
  blob: Blob
  url: string
  size: number
}

function sourceExtension(file: File): string {
  const match = file.name.match(/\.([^.]+)$/)
  if (match) return match[1].toLowerCase()
  if (file.type.startsWith('video/')) return file.type.split('/')[1] || 'mp4'
  return 'mp4'
}

/**
 * Builds an animated GIF from a trimmed segment of `file`. Reports 0–1 progress.
 */
export async function makeGif(
  file: File,
  { start, duration, fps, width }: GifOptions,
  onProgress?: (ratio: number) => void,
): Promise<GifResult> {
  const instance = await loadFFmpeg()

  const inputName = `input.${sourceExtension(file)}`
  const paletteName = 'palette.png'
  const outputName = 'output.gif'

  const handleProgress = ({ progress }: { progress: number }) => {
    onProgress?.(Math.min(1, Math.max(0, progress)))
  }
  instance.on('progress', handleProgress)

  const filters = `fps=${fps},scale=${Math.round(width)}:-1:flags=lanczos`

  try {
    await instance.writeFile(inputName, await fetchFile(file))

    // Pass 1 — generate an optimal 256-colour palette for this segment.
    const code1 = await instance.exec([
      '-ss', String(start), '-t', String(duration), '-i', inputName,
      '-vf', `${filters},palettegen=stats_mode=diff`, '-y', paletteName,
    ])
    if (code1 !== 0) throw new Error('GIF creation failed — make sure the file is a valid video.')

    // Pass 2 — render the GIF using that palette.
    const code2 = await instance.exec([
      '-ss', String(start), '-t', String(duration), '-i', inputName, '-i', paletteName,
      '-lavfi', `${filters} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5`,
      '-loop', '0', '-y', outputName,
    ])
    if (code2 !== 0) throw new Error('GIF creation failed.')

    const data = await instance.readFile(outputName)
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data))
    const blob = new Blob([bytes as BlobPart], { type: 'image/gif' })

    await instance.deleteFile(inputName).catch(() => {})
    await instance.deleteFile(paletteName).catch(() => {})
    await instance.deleteFile(outputName).catch(() => {})

    return { blob, url: URL.createObjectURL(blob), size: blob.size }
  } finally {
    instance.off('progress', handleProgress)
  }
}

export function gifFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, '')
  return `${base}.gif`
}
