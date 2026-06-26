/**
 * Routes that must never be treated as short-link slugs, otherwise a user could
 * shadow a real page (e.g. claiming "pricing" would hijack /pricing).
 */
export const RESERVED_SLUGS = new Set<string>([
  'shorten',
  'qr',
  'qr-generator',
  'image-converter',
  'convert',
  'features',
  'use-cases',
  'pricing',
  'about',
  'contact',
  'help',
  'faq',
  'history',
  'privacy',
  'terms',
  'admin',
  'dashboard',
  'login',
  'signup',
  'api',
  's',
  'settings',
  'support',
  'blog',
])

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase().trim())
}
