/**
 * Matte edge refinement for cut-outs (transparent PNGs). Lets the user shrink
 * the alpha edge (erode — removes leftover background halo/fringe) or grow it
 * (dilate — keeps a touch more of the subject), entirely on a canvas.
 *
 * Implementation: a separable box blur of the alpha channel turns the hard edge
 * into a ramp; re-thresholding that ramp moves the edge in/out by a sub-pixel
 * amount. Colour is reconstructed with an alpha-weighted blur (premultiplied),
 * so grown pixels take the neighbouring subject colour instead of black — this
 * also de-fringes the edge.
 */

function clampIdx(v: number, max: number): number {
  return v < 0 ? 0 : v > max ? max : v
}

/** Separable box blur over a single Float32 channel. */
function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const tmp = new Float32Array(src.length)
  const dst = new Float32Array(src.length)
  const win = r * 2 + 1

  // Horizontal pass
  for (let y = 0; y < h; y++) {
    const row = y * w
    let sum = 0
    for (let k = -r; k <= r; k++) sum += src[row + clampIdx(k, w - 1)]
    for (let x = 0; x < w; x++) {
      tmp[row + x] = sum / win
      const out = row + clampIdx(x - r, w - 1)
      const inn = row + clampIdx(x + r + 1, w - 1)
      sum += src[inn] - src[out]
    }
  }

  // Vertical pass
  for (let x = 0; x < w; x++) {
    let sum = 0
    for (let k = -r; k <= r; k++) sum += tmp[clampIdx(k, h - 1) * w + x]
    for (let y = 0; y < h; y++) {
      dst[y * w + x] = sum / win
      const out = clampIdx(y - r, h - 1) * w + x
      const inn = clampIdx(y + r + 1, h - 1) * w + x
      sum += tmp[inn] - tmp[out]
    }
  }

  return dst
}

/**
 * Returns a new ImageData with the matte edge moved by `amount` pixels.
 * `amount < 0` shrinks the cut-out (erode); `amount > 0` grows it (dilate);
 * `0` returns an untouched copy.
 */
export function refineMatte(src: ImageData, amount: number): ImageData {
  const { width: w, height: h, data } = src
  const n = w * h
  const out = new Uint8ClampedArray(data) // start from a copy (keeps RGBA)
  if (!amount) return new ImageData(out, w, h)

  // Channels: alpha (0–255) and premultiplied colour (rgb * alpha/255).
  const a = new Float32Array(n)
  const pr = new Float32Array(n)
  const pg = new Float32Array(n)
  const pb = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const al = data[i * 4 + 3]
    const af = al / 255
    a[i] = al
    pr[i] = data[i * 4] * af
    pg[i] = data[i * 4 + 1] * af
    pb[i] = data[i * 4 + 2] * af
  }

  // Blur radius scales with the requested shift, with a little headroom so the
  // ramp is wider than the move (keeps the new edge anti-aliased).
  const r = Math.max(2, Math.round(Math.abs(amount) * 1.5))
  const ba = boxBlur(a, w, h, r)
  const bpr = boxBlur(pr, w, h, r)
  const bpg = boxBlur(pg, w, h, r)
  const bpb = boxBlur(pb, w, h, r)

  // Threshold shift: amount>0 → lower threshold → grow; amount<0 → raise → shrink.
  const T = 128 - amount * (255 / (2 * r))
  const soft = 28 // alpha units of feather around the new edge

  for (let i = 0; i < n; i++) {
    const baI = ba[i]
    // New alpha from a soft threshold of the blurred alpha ramp.
    let na = ((baI - (T - soft)) / (2 * soft)) * 255
    na = na < 0 ? 0 : na > 255 ? 255 : na
    out[i * 4 + 3] = na

    // Alpha-weighted (bled) colour for edge/grown pixels — avoids a black rim.
    const af0 = a[i] / 255
    if (baI > 1) {
      const inv = 255 / baI
      const cr = bpr[i] * inv
      const cg = bpg[i] * inv
      const cb = bpb[i] * inv
      // Solid interior keeps its crisp original colour; edges use the bled colour.
      out[i * 4] = data[i * 4] * af0 + cr * (1 - af0)
      out[i * 4 + 1] = data[i * 4 + 1] * af0 + cg * (1 - af0)
      out[i * 4 + 2] = data[i * 4 + 2] * af0 + cb * (1 - af0)
    }
  }

  return new ImageData(out, w, h)
}
