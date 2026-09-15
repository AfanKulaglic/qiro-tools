/**
 * UTM link builder helpers — pure logic, no dependencies. Builds a campaign URL
 * by appending `utm_*` query parameters to a base URL while preserving any
 * existing query string and hash.
 */

export interface UtmParams {
  source: string
  medium: string
  campaign: string
  term?: string
  content?: string
}

const UTM_KEYS: { key: keyof UtmParams; param: string }[] = [
  { key: 'source', param: 'utm_source' },
  { key: 'medium', param: 'utm_medium' },
  { key: 'campaign', param: 'utm_campaign' },
  { key: 'term', param: 'utm_term' },
  { key: 'content', param: 'utm_content' },
]

/** Normalises a UTM value: trims, lowercases, spaces → underscores. */
export function normalizeUtm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '_')
}

/** True when the string parses as an http(s) URL. */
export function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Builds the full campaign URL. Throws if `base` is not a valid http(s) URL.
 * UTM params already present on the base are overwritten by provided values.
 */
export function buildUtmUrl(base: string, params: UtmParams): string {
  const url = new URL(base.trim())
  for (const { key, param } of UTM_KEYS) {
    const raw = params[key]
    if (raw && raw.trim()) {
      url.searchParams.set(param, normalizeUtm(raw))
    }
  }
  return url.toString()
}
