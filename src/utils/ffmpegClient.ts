import { FFmpeg } from '@ffmpeg/ffmpeg'

/**
 * Shared ffmpeg.wasm client. A single FFmpeg instance is created and loaded
 * lazily, then reused by every tool that needs it (video / audio / GIF), so the
 * heavy ~31 MB core is downloaded only once per session.
 *
 * We load the *single-threaded* core from a CDN with `toBlobURL`, which avoids
 * the SharedArrayBuffer / COOP-COEP cross-origin-isolation requirement entirely.
 */

/** Pinned ESM core matching the installed @ffmpeg/ffmpeg 0.12.x. */
export const CORE_BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm'

let ffmpeg: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

/**
 * Lazily creates and loads the shared FFmpeg instance. Subsequent calls reuse
 * it, so the core download happens only once.
 */
export async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const instance = new FFmpeg()
    await instance.load({
      // Use the ESM core URLs directly: the worker runs as a module worker and
      // dynamic-imports the core, so the ESM build is required.
      coreURL: `${CORE_BASE_URL}/ffmpeg-core.js`,
      wasmURL: `${CORE_BASE_URL}/ffmpeg-core.wasm`,
      // Required with Vite: the ESM worker that Vite pulls in can't
      // importScripts the UMD core. We ship the library's own ESM worker as a
      // static asset (public/ffmpeg-worker/) so it's same-origin and cacheable.
      classWorkerURL: '/ffmpeg-worker/worker.js',
    })
    ffmpeg = instance
    return instance
  })()

  try {
    return await loadPromise
  } catch (err) {
    // Reset so a later attempt can retry the download.
    loadPromise = null
    throw err
  }
}

/** Whether the core has already been downloaded and is ready to use. */
export function isFFmpegLoaded(): boolean {
  return ffmpeg !== null
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
