/**
 * Background removal — runs entirely in the browser via `@imgly/background-removal`
 * (ONNX model + WASM, fetched from imgly's CDN on first use). No server, no API
 * key, no usage limit; the image never leaves the device.
 *
 * The library (+ onnxruntime-web) is heavy, so it's loaded with a dynamic
 * `import()` only when the user actually removes a background — it stays out of
 * the main/home bundle as its own lazy chunk.
 *
 * Multi-image reliability: imgly memoizes its inference session keyed by
 * `JSON.stringify(config)`. We pass ONE stable config so the model loads once and
 * is reused for every image in the session. If a run ever fails, imgly caches the
 * rejected init under that key — so we bump a cache-buster, which forces a fresh
 * session on the next attempt instead of requiring a page refresh.
 */

export interface BgRemovalResult {
  blob: Blob // PNG with transparent background
  url: string
  size: number
}

type BgModule = typeof import('@imgly/background-removal')

let modulePromise: Promise<BgModule> | null = null
/** Bumped after a failure to escape imgly's memoized (and possibly poisoned) session. */
let sessionEpoch = 0

function loadModule(): Promise<BgModule> {
  if (!modulePromise) modulePromise = import('@imgly/background-removal')
  return modulePromise
}

/**
 * Removes the background from an image File and returns a transparent PNG.
 * `onProgress` reports 0–1 across model download + inference.
 */
export async function removeImageBackground(
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<BgRemovalResult> {
  const mod = await loadModule()

  // Stable config → imgly reuses the same loaded model/session across images.
  // `model: 'isnet'` is the full-precision model (best edges on shadows/lighting/
  // noise). `_epoch` only changes after a failure to bust the memoized session.
  const config = {
    model: 'isnet',
    output: { format: 'image/png', quality: 1 },
    _epoch: sessionEpoch,
    progress: (_key: string, current: number, total: number) => {
      if (total > 0) onProgress?.(Math.min(1, current / total))
    },
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await mod.removeBackground(file as any, config as any)
    return { blob, url: URL.createObjectURL(blob), size: blob.size }
  } catch (err) {
    // Next call uses a new memoize key → fresh session instead of the cached failure.
    sessionEpoch += 1
    throw err
  }
}

export function pngFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, '')
  return `${base}-bez-pozadine.png`
}
