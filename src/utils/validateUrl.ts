import { isReservedSlug } from './reservedSlugs'

const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'file:', 'ftp:', 'mailto:', 'tel:', 'vbscript:']

export interface UrlValidationResult {
  ok: boolean
  url?: string
  error?: string
}

/**
 * Normalises a URL: trims whitespace and auto-adds https:// when no protocol is
 * present. Does not validate — pair with validateLongUrl.
 */
export function normalizeUrl(input: string): string {
  let value = input.trim()
  if (!value) return value
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value) && !/^[a-zA-Z]+:/.test(value)) {
    value = `https://${value}`
  }
  return value
}

export function validateLongUrl(input: string): UrlValidationResult {
  const raw = (input || '').trim()
  if (!raw) {
    return { ok: false, error: 'Please enter a URL.' }
  }

  const lower = raw.toLowerCase()
  if (BLOCKED_PROTOCOLS.some((p) => lower.startsWith(p))) {
    return { ok: false, error: 'Only http and https links are supported.' }
  }

  const normalized = normalizeUrl(raw)

  let parsed: URL
  try {
    parsed = new URL(normalized)
  } catch {
    return { ok: false, error: 'Please enter a valid URL.' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Only http and https links are supported.' }
  }

  if (!parsed.hostname || !parsed.hostname.includes('.')) {
    return { ok: false, error: 'Please enter a valid URL with a domain.' }
  }

  return { ok: true, url: parsed.toString() }
}

const ALIAS_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export interface AliasValidationResult {
  ok: boolean
  error?: string
}

/**
 * Validates a custom alias: 3–32 chars, lowercase letters/numbers/hyphens,
 * no leading/trailing/double hyphens, not reserved.
 */
export function validateAlias(alias: string): AliasValidationResult {
  const value = (alias || '').trim().toLowerCase()
  if (!value) return { ok: true } // optional

  if (value.length < 3 || value.length > 32) {
    return { ok: false, error: 'Aliases must be between 3 and 32 characters.' }
  }
  if (!ALIAS_RE.test(value)) {
    return {
      ok: false,
      error: 'Aliases can only contain lowercase letters, numbers, and hyphens.',
    }
  }
  if (value.includes('--')) {
    return { ok: false, error: 'Aliases cannot contain double hyphens.' }
  }
  if (isReservedSlug(value)) {
    return { ok: false, error: 'This alias is reserved.' }
  }
  return { ok: true }
}
