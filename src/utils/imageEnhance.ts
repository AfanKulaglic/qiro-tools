/**
 * Image enhancement — runs entirely in the browser. Two stages:
 *
 *   1. AI super-resolution (Transformers.js `image-to-image` pipeline with the
 *      Swin2SR ONNX model). The model is fetched from the Hugging Face Hub on
 *      first use and then cached by the browser, so later runs are fast. Runs on
 *      WebGPU when available (much faster), falling back to the WASM/CPU backend.
 *   2. A classical finishing pass on a canvas (auto-contrast, unsharp masking and
 *      saturation) whose intensity is scaled by a `strength` slider.
 *
 * Large images are processed in overlapping tiles so memory stays bounded and the
 * model never sees more pixels than it can handle at once. The heavy library is
 * loaded with a dynamic `import()` only when the user actually enhances an image,
 * so it stays out of the main bundle as its own lazy chunk.
 *
 * Nothing is uploaded — the image, the model and every intermediate stay on the
 * device.
 */

import { loadImage } from '@/utils/imageConvert'

export type EnhanceScale = 2 | 4

export interface EnhanceOptions {
  /** Upscaling factor. 4× chains the 2× model twice. */
  scale: EnhanceScale
  /** Finishing-pass intensity, 0–1. 0 = pure AI output, 1 = full sharpen/contrast/saturation. */
  strength: number
}

export interface EnhanceResult {
  blob: Blob // PNG
  url: string
  size: number
  width: number
  height: number
}

/** Coarse progress phases reported through the `onProgress` callback. */
export type EnhancePhase = 'model' | 'upscale' | 'finish'

// ── Swin2SR 2× super-resolution model (cached after first download) ──
// The "lightweight" variant is far smaller and lower-memory than the classical
// model — important because we run it on the WASM (CPU) backend by default. The
// model upscales 2×; 4× chains it twice *per tile*.
const MODEL_ID = 'Xenova/swin2SR-lightweight-x2-64'
const MODEL_SCALE = 2

// Tiling: the model sees CORE+2·PAD px tiles; only the CORE is written to the
// output, with PAD px of real context on every interior edge to hide seams.
// Tile size is chosen per backend (see TILE_CORE) — small on WebGPU so buffers
// stay tiny (no OOM), larger on the CPU where memory isn't the limit.
const PAD = 16
const TILE_CORE: Record<Device, number> = { webgpu: 192, wasm: 256 }

// The SR input's longest side is capped to this before upscaling. Enhancing is
// about *adding* resolution to small/low-res images, so feeding a huge photo in
// just makes it crawl for little benefit — we downscale first, then 2×/4× it.
// Kept modest on purpose: processing time grows with pixel count, and the CPU
// backend is the only one we use, so a smaller input is the main speed lever.
const MAX_INPUT = 768

type Device = 'webgpu' | 'wasm'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransformersModule = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Upscaler = any

let modulePromise: Promise<TransformersModule> | null = null
let upscalerPromise: Promise<{ upscaler: Upscaler; device: Device }> | null = null

function loadModule(): Promise<TransformersModule> {
  if (!modulePromise) {
    modulePromise = import('@huggingface/transformers').then((mod) => {
      // Skip the "is there a local copy?" lookup — on our server that's just a
      // failed round-trip that slows the first load. Go straight to the HF Hub
      // (then the browser cache on subsequent runs).
      mod.env.allowLocalModels = false
      return mod
    })
  }
  return modulePromise
}

/**
 * Loads (once) the Swin2SR super-resolution pipeline on the WASM (CPU) backend —
 * deliberately *not* WebGPU, so the tool never depends on the graphics card and
 * can't crash it. We use the `q8` (8-bit quantized) weights: a smaller download
 * and meaningfully faster CPU inference than fp32, with quality loss the
 * finishing pass largely hides.
 */
async function getUpscaler(): Promise<{ upscaler: Upscaler; device: Device }> {
  if (upscalerPromise) return upscalerPromise
  upscalerPromise = (async () => {
    const mod = await loadModule()
    const { pipeline } = mod
    const upscaler = await pipeline('image-to-image', MODEL_ID, { device: 'wasm', dtype: 'q8' })
    return { upscaler, device: 'wasm' as Device }
  })()
  try {
    return await upscalerPromise
  } catch (err) {
    upscalerPromise = null // allow a later retry after a failed init
    throw err
  }
}

/** A 2D context that throws rather than returning null, to keep call sites clean. */
function ctx2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const c = canvas.getContext('2d', { willReadFrequently: true })
  if (!c) throw new Error('Canvas 2D context unavailable.')
  return c
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  return c
}

/**
 * Super-resolves `source` by `factor` (2 or 4), tiled, returning a canvas
 * `factor`× the size. For 4× the model is chained twice *per tile* — far fewer
 * tiles (and far less memory) than re-tiling the whole 2× image for a 2nd pass.
 * `onTile(done, total)` reports progress.
 */
async function upscaleTiled(
  source: HTMLCanvasElement,
  factor: EnhanceScale,
  core: number,
  upscaler: Upscaler,
  mod: TransformersModule,
  onTile: (done: number, total: number) => void,
): Promise<HTMLCanvasElement> {
  const { RawImage } = mod
  const passes = factor / MODEL_SCALE // 2× → 1 model pass, 4× → 2 passes
  const sw = source.width
  const sh = source.height
  const srcCtx = ctx2d(source)

  const out = makeCanvas(sw * factor, sh * factor)
  const outCtx = ctx2d(out)

  const cols = Math.ceil(sw / core)
  const rows = Math.ceil(sh / core)
  const total = cols * rows
  let done = 0
  onTile(0, total)

  for (let ty = 0; ty < rows; ty++) {
    for (let tx = 0; tx < cols; tx++) {
      // Core (output) region in source pixels.
      const coreX = tx * core
      const coreY = ty * core
      const coreW = Math.min(core, sw - coreX)
      const coreH = Math.min(core, sh - coreY)

      // Padded source crop, clamped to the image — track the real left/top pad.
      const sx = Math.max(0, coreX - PAD)
      const sy = Math.max(0, coreY - PAD)
      const ex = Math.min(sw, coreX + coreW + PAD)
      const ey = Math.min(sh, coreY + coreH + PAD)
      const cropW = ex - sx
      const cropH = ey - sy
      const leftPad = coreX - sx
      const topPad = coreY - sy

      // Build a RawImage (RGB) from the crop and run the model on it, chaining
      // for 4×. Each pass doubles the tile — they stay small, so memory is fine.
      const img = srcCtx.getImageData(sx, sy, cropW, cropH)
      const rgb = new Uint8ClampedArray(cropW * cropH * 3)
      for (let i = 0, j = 0; i < img.data.length; i += 4, j += 3) {
        rgb[j] = img.data[i]
        rgb[j + 1] = img.data[i + 1]
        rgb[j + 2] = img.data[i + 2]
      }
      let result: unknown = new RawImage(rgb, cropW, cropH, 3)
      for (let p = 0; p < passes; p++) result = await upscaler(result)

      // Place the upscaled tile onto a scratch canvas, then copy out just the core.
      const scaledData = rawImageToImageData(result)
      const scaled = makeCanvas(scaledData.width, scaledData.height)
      ctx2d(scaled).putImageData(scaledData, 0, 0)
      outCtx.drawImage(
        scaled,
        leftPad * factor,
        topPad * factor,
        coreW * factor,
        coreH * factor,
        coreX * factor,
        coreY * factor,
        coreW * factor,
        coreH * factor,
      )

      done++
      onTile(done, total)
      // Yield to the event loop so the UI stays responsive between tiles.
      await new Promise((r) => setTimeout(r, 0))
    }
  }

  return out
}

/** Converts a Transformers.js RawImage (1/3/4 channels) to RGBA ImageData. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rawImageToImageData(raw: any): ImageData {
  const { data, width, height, channels } = raw
  const rgba = new Uint8ClampedArray(width * height * 4)
  for (let p = 0, s = 0; p < width * height; p++, s += channels) {
    if (channels === 1) {
      rgba[p * 4] = rgba[p * 4 + 1] = rgba[p * 4 + 2] = data[s]
    } else {
      rgba[p * 4] = data[s]
      rgba[p * 4 + 1] = data[s + 1]
      rgba[p * 4 + 2] = data[s + 2]
    }
    rgba[p * 4 + 3] = channels === 4 ? data[s + 3] : 255
  }
  return new ImageData(rgba, width, height)
}

/* ─────────────────────── Classical finishing pass ─────────────────────── */

/** Separable box blur (radius `r`) over RGB; alpha is left untouched. Fast O(n). */
function boxBlurRGB(src: Uint8ClampedArray, w: number, h: number, r: number): Uint8ClampedArray {
  if (r < 1) return src.slice()
  const tmp = new Uint8ClampedArray(src.length)
  const out = new Uint8ClampedArray(src.length)
  const win = 2 * r + 1
  // Horizontal
  for (let y = 0; y < h; y++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0
      const row = y * w
      for (let x = -r; x <= r; x++) sum += src[(row + Math.min(w - 1, Math.max(0, x))) * 4 + c]
      for (let x = 0; x < w; x++) {
        tmp[(row + x) * 4 + c] = sum / win
        const add = src[(row + Math.min(w - 1, x + r + 1)) * 4 + c]
        const sub = src[(row + Math.max(0, x - r)) * 4 + c]
        sum += add - sub
      }
    }
  }
  // Vertical
  for (let x = 0; x < w; x++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0
      for (let y = -r; y <= r; y++) sum += tmp[(Math.min(h - 1, Math.max(0, y)) * w + x) * 4 + c]
      for (let y = 0; y < h; y++) {
        out[(y * w + x) * 4 + c] = sum / win
        const add = tmp[(Math.min(h - 1, y + r + 1) * w + x) * 4 + c]
        const sub = tmp[(Math.max(0, y - r) * w + x) * 4 + c]
        sum += add - sub
      }
    }
  }
  // Preserve alpha
  for (let i = 3; i < src.length; i += 4) out[i] = src[i]
  return out
}

/**
 * Classical enhancement applied to the upscaled pixels, scaled by `strength`:
 * a light denoise + unsharp mask (sharpen), a gentle auto-contrast stretch and
 * a small saturation lift. `strength` 0 returns the input unchanged.
 */
function finish(data: ImageData, strength: number): ImageData {
  const s = Math.max(0, Math.min(1, strength))
  if (s === 0) return data

  const { width: w, height: h } = data
  const src = data.data

  // 1. Light denoise: blend a small blur back in to tame high-frequency noise
  //    before sharpening, so we don't amplify it. Very subtle.
  const denoiseR = 1
  const denoised = boxBlurRGB(src, w, h, denoiseR)
  const dn = 0.25 * s // how much of the blurred version to mix in
  for (let i = 0; i < src.length; i += 4) {
    for (let c = 0; c < 3; c++) src[i + c] = src[i + c] * (1 - dn) + denoised[i + c] * dn
  }

  // 2. Unsharp mask: out = src + amount * (src - blur(src))
  const blur = boxBlurRGB(src, w, h, 2)
  const amount = 0.9 * s
  for (let i = 0; i < src.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = src[i + c] + amount * (src[i + c] - blur[i + c])
      src[i + c] = v < 0 ? 0 : v > 255 ? 255 : v
    }
  }

  // 3. Auto-contrast: stretch the luminance histogram between the 0.5th and
  //    99.5th percentiles, then re-apply scaled by strength.
  const hist = new Uint32Array(256)
  for (let i = 0; i < src.length; i += 4) {
    const l = (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114) | 0
    hist[l]++
  }
  const px = w * h
  const lowCut = px * 0.005
  const highCut = px * 0.005
  let lo = 0
  let hi = 255
  for (let acc = 0, l = 0; l < 256; l++) { acc += hist[l]; if (acc >= lowCut) { lo = l; break } }
  for (let acc = 0, l = 255; l >= 0; l--) { acc += hist[l]; if (acc >= highCut) { hi = l; break } }
  if (hi > lo + 1) {
    const range = hi - lo
    for (let i = 0; i < src.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const stretched = ((src[i + c] - lo) / range) * 255
        const v = src[i + c] * (1 - s) + stretched * s
        src[i + c] = v < 0 ? 0 : v > 255 ? 255 : v
      }
    }
  }

  // 4. Saturation lift around per-pixel luminance.
  const sat = 1 + 0.18 * s
  for (let i = 0; i < src.length; i += 4) {
    const l = src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114
    for (let c = 0; c < 3; c++) {
      const v = l + (src[i + c] - l) * sat
      src[i + c] = v < 0 ? 0 : v > 255 ? 255 : v
    }
  }

  return data
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Encoding the result failed.'))), 'image/png'),
  )
}

/**
 * Enhances an image File: AI super-resolution followed by a classical finishing
 * pass. `onProgress(phase, ratio)` reports 0–1 within each phase.
 */
export async function enhanceImage(
  file: File,
  opts: EnhanceOptions,
  onProgress?: (phase: EnhancePhase, ratio: number) => void,
): Promise<EnhanceResult> {
  onProgress?.('model', 0)
  const mod = await loadModule()
  const { upscaler, device } = await getUpscaler()
  onProgress?.('model', 1)

  // Draw the source onto a canvas as the SR input, downscaling first if it's
  // larger than MAX_INPUT on its longest side (keeps the run fast).
  const img = await loadImage(file)
  const longest = Math.max(img.naturalWidth, img.naturalHeight)
  const k = longest > MAX_INPUT ? MAX_INPUT / longest : 1
  const dw = Math.max(1, Math.round(img.naturalWidth * k))
  const dh = Math.max(1, Math.round(img.naturalHeight * k))
  const source = makeCanvas(dw, dh)
  ctx2d(source).drawImage(img, 0, 0, dw, dh)
  URL.revokeObjectURL(img.src)

  // Super-resolve (per-tile, chaining the model for 4×).
  const canvas = await upscaleTiled(source, opts.scale, TILE_CORE[device], upscaler, mod, (done, total) => {
    onProgress?.('upscale', total > 0 ? done / total : 0)
  })

  // Finishing pass.
  onProgress?.('finish', 0)
  const fctx = ctx2d(canvas)
  const finished = finish(fctx.getImageData(0, 0, canvas.width, canvas.height), opts.strength)
  fctx.putImageData(finished, 0, 0)
  onProgress?.('finish', 1)

  const blob = await canvasToPng(canvas)
  return {
    blob,
    url: URL.createObjectURL(blob),
    size: blob.size,
    width: canvas.width,
    height: canvas.height,
  }
}

/** Output filename for an enhanced image, e.g. `photo` → `photo-poboljsano.png`. */
export function enhancedFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, '')
  return `${base}-poboljsano.png`
}
