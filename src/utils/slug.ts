// Alphabet without easily-confused characters (no 0/O, 1/l/I).
const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'

/** Generate a random url-safe slug of the given length (default 7). */
export function generateSlug(length = 7): string {
  let out = ''
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return out
}

/** Build the public short URL for a slug, honouring VITE_SHORT_DOMAIN. */
export function buildShortUrl(slug: string): string {
  const domain = import.meta.env.VITE_SHORT_DOMAIN?.trim()
  if (domain) {
    return `${domain.replace(/\/+$/, '')}/${slug}`
  }
  // Bare `/slug` — matches the `/:slug` resolver route. (Must not be `/s/slug`:
  // that's two path segments and the single-segment route would never match it.)
  return `${window.location.origin}/${slug}`
}
