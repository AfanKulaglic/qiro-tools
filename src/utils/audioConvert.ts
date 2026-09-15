import { fetchFile } from '@ffmpeg/util'
import { loadFFmpeg, isFFmpegLoaded, downloadBlob } from './ffmpegClient'

/**
 * Audio conversion engine — shares the single ffmpeg.wasm instance with the
 * video / GIF tools (see `ffmpegClient.ts`), so nothing extra is downloaded.
 * Everything runs in the browser: no server, no upload, no limits.
 */

export { loadFFmpeg, isFFmpegLoaded, downloadBlob }

export type AudioOutputFormat =
  | 'mp3' | 'wav' | 'ogg' | 'm4a' | 'flac' | 'opus' | 'aac' | 'aiff' | 'alac' | 'ac3'

export interface AudioConvertOptions {
  format: AudioOutputFormat
  quality: number // 0–1 — used by the lossy formats (mp3/ogg/m4a/opus/aac/ac3)
}

export interface AudioConvertResult {
  blob: Blob
  url: string
  size: number
}

const MIME: Record<AudioOutputFormat, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  flac: 'audio/flac',
  opus: 'audio/ogg',
  aac: 'audio/aac',
  aiff: 'audio/aiff',
  alac: 'audio/mp4',
  ac3: 'audio/ac3',
}

export const FORMAT_LABEL: Record<AudioOutputFormat, string> = {
  mp3: 'MP3',
  wav: 'WAV',
  ogg: 'OGG',
  m4a: 'M4A',
  flac: 'FLAC',
  opus: 'Opus',
  aac: 'AAC',
  aiff: 'AIFF',
  alac: 'ALAC',
  ac3: 'AC3',
}

/**
 * File extension to use on disk, when it differs from the format key. ALAC is
 * wrapped in an MP4 container, so it ships as a .m4a file.
 */
const FILE_EXT: Partial<Record<AudioOutputFormat, string>> = {
  alac: 'm4a',
}

function fileExt(format: AudioOutputFormat): string {
  return FILE_EXT[format] ?? format
}

/** Lossless / uncompressed formats have no quality knob. */
export const LOSSLESS_FORMATS: AudioOutputFormat[] = ['wav', 'flac', 'aiff', 'alac']

const clamp01 = (q: number) => Math.min(1, Math.max(0, q))

function sourceExtension(file: File): string {
  const match = file.name.match(/\.([^.]+)$/)
  if (match) return match[1].toLowerCase()
  if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
    return file.type.split('/')[1] || 'mp3'
  }
  return 'mp3'
}

/** Builds the ffmpeg argument list for the chosen audio format and quality. */
function buildArgs(input: string, output: string, { format, quality }: AudioConvertOptions): string[] {
  const q = clamp01(quality)
  const base = ['-i', input, '-vn'] // -vn: drop any video stream

  switch (format) {
    case 'mp3':
      // libmp3lame VBR: -q:a 0 (best) … 9 (worst)
      return [...base, '-c:a', 'libmp3lame', '-q:a', String(Math.round((1 - q) * 9)), output]
    case 'ogg':
      // libvorbis VBR: -q:a 0 … 10
      return [...base, '-c:a', 'libvorbis', '-q:a', String(Math.round(q * 10)), output]
    case 'm4a': {
      // AAC CBR: map quality → 96…256 kbps
      const kbps = Math.round(96 + q * 160)
      return [...base, '-c:a', 'aac', '-b:a', `${kbps}k`, output]
    }
    case 'aac': {
      // Raw AAC (ADTS) — same encoder, standalone .aac stream.
      const kbps = Math.round(96 + q * 160)
      return [...base, '-c:a', 'aac', '-b:a', `${kbps}k`, output]
    }
    case 'opus': {
      // libopus VBR: map quality → 32…160 kbps (very efficient, modern).
      const kbps = Math.round(32 + q * 128)
      return [...base, '-c:a', 'libopus', '-b:a', `${kbps}k`, output]
    }
    case 'ac3': {
      // Dolby Digital AC-3 CBR: map quality → 192…448 kbps.
      const kbps = Math.round(192 + q * 256)
      return [...base, '-c:a', 'ac3', '-b:a', `${kbps}k`, output]
    }
    case 'wav':
      return [...base, '-c:a', 'pcm_s16le', output]
    case 'aiff':
      return [...base, '-c:a', 'pcm_s16be', output]
    case 'flac':
      return [...base, '-c:a', 'flac', output]
    case 'alac':
      // Apple Lossless in an MP4 (.m4a) container.
      return [...base, '-c:a', 'alac', output]
  }
}

/**
 * Converts an audio (or video) File to the chosen audio format. Reports 0–1
 * progress through `onProgress`.
 */
export async function convertAudio(
  file: File,
  options: AudioConvertOptions,
  onProgress?: (ratio: number) => void,
): Promise<AudioConvertResult> {
  const instance = await loadFFmpeg()

  const inputName = `input.${sourceExtension(file)}`
  const outputName = `output.${fileExt(options.format)}`

  const handleProgress = ({ progress }: { progress: number }) => {
    onProgress?.(Math.min(1, Math.max(0, progress)))
  }
  instance.on('progress', handleProgress)

  try {
    await instance.writeFile(inputName, await fetchFile(file))
    const code = await instance.exec(buildArgs(inputName, outputName, options))
    if (code !== 0) throw new Error('Conversion failed — make sure the file contains audio.')

    const data = await instance.readFile(outputName)
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data))
    const blob = new Blob([bytes as BlobPart], { type: MIME[options.format] })

    await instance.deleteFile(inputName).catch(() => {})
    await instance.deleteFile(outputName).catch(() => {})

    return { blob, url: URL.createObjectURL(blob), size: blob.size }
  } finally {
    instance.off('progress', handleProgress)
  }
}

export function replaceExtension(fileName: string, format: AudioOutputFormat): string {
  const base = fileName.replace(/\.[^.]+$/, '')
  return `${base}.${fileExt(format)}`
}
