/**
 * Tiny typed localStorage helper. All app history (links, QR codes, image
 * conversions) lives here — no account required, nothing leaves the device.
 */

export const STORAGE_KEYS = {
  links: 'linkqr.history.links',
  qr: 'linkqr.history.qr',
  images: 'linkqr.history.images',
  videos: 'linkqr.history.videos',
  audios: 'linkqr.history.audios',
  gifs: 'linkqr.history.gifs',
  utm: 'linkqr.history.utm',
  theme: 'qiro.theme',
  freeUsage: 'qiro.free.usage',
} as const

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable — ignore */
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
