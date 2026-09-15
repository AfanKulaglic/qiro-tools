// Minimal ambient types for `gifenc` (the package ships no .d.ts).
declare module 'gifenc' {
  type Pixels = Uint8Array | Uint8ClampedArray | number[]
  type Palette = number[][]

  export function quantize(
    rgba: Pixels,
    maxColors: number,
    options?: { format?: string; oneBitAlpha?: boolean | number; clearAlpha?: boolean; clearAlphaThreshold?: number; clearAlphaColor?: number },
  ): Palette

  export function applyPalette(rgba: Pixels, palette: Palette, format?: string): Uint8Array

  export interface GIFEncoderInstance {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: { palette?: Palette; delay?: number; transparent?: boolean; transparentIndex?: number; repeat?: number; dispose?: number; first?: boolean },
    ): void
    finish(): void
    bytes(): Uint8Array
    bytesView(): Uint8Array
  }

  export function GIFEncoder(options?: { auto?: boolean; initialCapacity?: number }): GIFEncoderInstance

  export function nearestColorIndex(palette: Palette, pixel: number[]): number
}
