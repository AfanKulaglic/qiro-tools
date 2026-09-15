import { fetchFile } from '@ffmpeg/util'
import { loadFFmpeg, isFFmpegLoaded, downloadBlob } from './ffmpegClient'

/**
 * Video conversion engine — the video counterpart of `imageConvert.ts`.
 *
 * Everything runs 100% in the browser via ffmpeg.wasm (shared FFmpeg instance
 * from `ffmpegClient.ts`): no server, no upload, no usage limits, fully private.
 *
 * The trade-off: the core is ~31 MB and is fetched lazily the first time a
 * user converts (cached for the rest of the session), and transcoding is
 * CPU-bound and noticeably slower than the canvas-based image converter.
 */

export { loadFFmpeg, isFFmpegLoaded, downloadBlob }

export type VideoOutputFormat =
  | 'mp4' | 'webm' | 'gif' | 'mp3' | 'mov' | 'mkv' | 'avi' | '3gp' | 'ts' | 'flv'

export interface VideoConvertOptions {
  format: VideoOutputFormat
  quality: number // 0–1 — higher = better quality / bigger file
  scale?: number // 0–1 multiplier on the source resolution (ignored for mp3)
}

export interface VideoConvertResult {
  blob: Blob
  url: string
  size: number
}

const MIME: Record<VideoOutputFormat, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  gif: 'image/gif',
  mp3: 'audio/mpeg',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  '3gp': 'video/3gpp',
  ts: 'video/mp2t',
  flv: 'video/x-flv',
}

export const FORMAT_LABEL: Record<VideoOutputFormat, string> = {
  mp4: 'MP4',
  webm: 'WebM',
  gif: 'GIF',
  mp3: 'MP3',
  mov: 'MOV',
  mkv: 'MKV',
  avi: 'AVI',
  '3gp': '3GP',
  ts: 'TS',
  flv: 'FLV',
}

/** Output formats that carry video (everything except the audio-only MP3). */
export const VIDEO_FORMATS: VideoOutputFormat[] = ['mp4', 'webm', 'gif', 'mov', 'mkv', 'avi', '3gp', 'ts', 'flv']

/**
 * Formats a browser can play in a <video> tag for the live preview. Others
 * (MOV / MKV / AVI) still convert fine — the UI shows a download card instead.
 * GIF is handled separately (rendered as an image).
 */
const BROWSER_PLAYABLE: Record<VideoOutputFormat, boolean> = {
  mp4: true,
  webm: true,
  gif: false,
  mp3: false,
  mov: false,
  mkv: false,
  avi: false,
  '3gp': false,
  ts: false,
  flv: false,
}

export function canPlayInBrowser(format: VideoOutputFormat): boolean {
  return BROWSER_PLAYABLE[format]
}

/** Maps the 0–1 quality slider to an x264/VP9 CRF (lower CRF = higher quality). */
function qualityToCrf(quality: number): number {
  const q = Math.min(1, Math.max(0, quality))
  // quality 1 → CRF 18 (high), quality 0 → CRF 34 (low)
  return Math.round(34 - q * 16)
}

/** Maps the 0–1 quality slider to an mp3 VBR quality (0 = best, 9 = worst). */
function qualityToMp3Q(quality: number): number {
  const q = Math.min(1, Math.max(0, quality))
  return Math.round((1 - q) * 9)
}

function sourceExtension(file: File): string {
  const match = file.name.match(/\.([^.]+)$/)
  if (match) return match[1].toLowerCase()
  if (file.type.startsWith('video/')) return file.type.split('/')[1] || 'mp4'
  return 'mp4'
}

/** Builds the ffmpeg argument list for the chosen format and settings. */
function buildArgs(
  input: string,
  output: string,
  { format, quality, scale = 1 }: VideoConvertOptions,
): string[] {
  const crf = String(qualityToCrf(quality))
  const scaleFilter = scale < 1 ? `scale=trunc(iw*${scale}/2)*2:-2` : null

  switch (format) {
    case 'mp4':
    case 'mov': {
      const args = ['-i', input, '-c:v', 'libx264', '-crf', crf, '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '128k']
      if (scaleFilter) args.push('-vf', scaleFilter)
      args.push('-movflags', '+faststart', output)
      return args
    }
    case 'mkv': {
      // Matroska container — same H.264 + AAC codecs as MP4, no faststart.
      const args = ['-i', input, '-c:v', 'libx264', '-crf', crf, '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '128k']
      if (scaleFilter) args.push('-vf', scaleFilter)
      args.push(output)
      return args
    }
    case 'avi': {
      // AVI container — H.264 video with MP3 audio (the classic AVI pairing).
      const args = ['-i', input, '-c:v', 'libx264', '-crf', crf, '-preset', 'veryfast', '-c:a', 'libmp3lame', '-q:a', '2']
      if (scaleFilter) args.push('-vf', scaleFilter)
      args.push(output)
      return args
    }
    case '3gp': {
      // Mobile 3GP — H.264 baseline + AAC for maximum device compatibility.
      const args = ['-i', input, '-c:v', 'libx264', '-profile:v', 'baseline', '-level', '3.0', '-crf', crf, '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '128k']
      if (scaleFilter) args.push('-vf', scaleFilter)
      args.push(output)
      return args
    }
    case 'ts':
    case 'flv': {
      // MPEG-TS / FLV — H.264 + AAC, same codecs as MP4, different container.
      const args = ['-i', input, '-c:v', 'libx264', '-crf', crf, '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '128k']
      if (scaleFilter) args.push('-vf', scaleFilter)
      args.push(output)
      return args
    }
    case 'webm': {
      // VP8 + Vorbis (not VP9/Opus): the single-threaded wasm core's libvpx-vp9
      // encoder corrupts the heap ("memory access out of bounds"), so we stick
      // to the rock-solid VP8 path.
      const args = ['-i', input, '-c:v', 'libvpx', '-crf', crf, '-b:v', '1M', '-c:a', 'libvorbis']
      if (scaleFilter) args.push('-vf', scaleFilter)
      args.push(output)
      return args
    }
    case 'gif': {
      const dim = scale < 1 ? `iw*${scale}:-1` : 'iw:-1'
      return ['-i', input, '-vf', `fps=12,scale=${dim}:flags=lanczos`, '-loop', '0', output]
    }
    case 'mp3': {
      return ['-i', input, '-vn', '-c:a', 'libmp3lame', '-q:a', String(qualityToMp3Q(quality)), output]
    }
  }
}

/**
 * Converts a video File to the chosen format entirely in the browser. Reports
 * 0–1 transcode progress through `onProgress`.
 */
export async function convertVideo(
  file: File,
  options: VideoConvertOptions,
  onProgress?: (ratio: number) => void,
): Promise<VideoConvertResult> {
  const instance = await loadFFmpeg()

  const inputName = `input.${sourceExtension(file)}`
  const outputName = `output.${options.format}`

  const handleProgress = ({ progress }: { progress: number }) => {
    onProgress?.(Math.min(1, Math.max(0, progress)))
  }
  instance.on('progress', handleProgress)

  try {
    await instance.writeFile(inputName, await fetchFile(file))
    const code = await instance.exec(buildArgs(inputName, outputName, options))
    if (code !== 0) throw new Error('Conversion failed — make sure the file is a valid video.')

    const data = await instance.readFile(outputName)
    // `data` is a Uint8Array; wrap it in a typed Blob. Cast the blob part —
    // ffmpeg.wasm's Uint8Array may be SharedArrayBuffer-backed, which the DOM
    // Blob types don't accept directly.
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data))
    const blob = new Blob([bytes as BlobPart], { type: MIME[options.format] })

    // Tidy up the in-memory virtual filesystem.
    await instance.deleteFile(inputName).catch(() => {})
    await instance.deleteFile(outputName).catch(() => {})

    return { blob, url: URL.createObjectURL(blob), size: blob.size }
  } finally {
    instance.off('progress', handleProgress)
  }
}

export function replaceExtension(fileName: string, format: VideoOutputFormat): string {
  const base = fileName.replace(/\.[^.]+$/, '')
  return `${base}.${format}`
}
