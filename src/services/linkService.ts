import { ref, get, set, update, runTransaction } from 'firebase/database'
import { db, auth } from '@/lib/firebase'
import type { CreateLinkInput, ShortLink } from '@/types/link'
import { buildShortUrl, generateSlug } from '@/utils/slug'
import { isReservedSlug } from '@/utils/reservedSlugs'
import { normalizeUrl, validateAlias, validateLongUrl } from '@/utils/validateUrl'

export class LinkServiceError extends Error {}

function linkRef(slug: string) {
  return ref(db, `links/${slug}`)
}

/** Returns true when no link exists for the slug. */
export async function checkSlugAvailability(slug: string): Promise<boolean> {
  const snap = await get(linkRef(slug))
  return !snap.exists()
}

export async function getLinkBySlug(slug: string): Promise<ShortLink | null> {
  const snap = await get(linkRef(slug))
  if (!snap.exists()) return null
  const data = snap.val() as Record<string, unknown>
  return {
    slug,
    longUrl: String(data.longUrl ?? ''),
    shortUrl: String(data.shortUrl ?? ''),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
    clicks: Number(data.clicks ?? 0),
    lastClickedAt: data.lastClickedAt ? toMillis(data.lastClickedAt) : null,
    isActive: Boolean(data.isActive ?? true),
    customAlias: Boolean(data.customAlias ?? false),
    source: 'web',
    title: String(data.title ?? ''),
    notes: String(data.notes ?? ''),
  }
}

export async function incrementLinkClicks(slug: string): Promise<void> {
  await runTransaction(ref(db, `links/${slug}/clicks`), (current) => (current ?? 0) + 1)
  await update(linkRef(slug), { lastClickedAt: Date.now() })
}

/**
 * Creates a short link in Realtime Database. Validates URL + alias, reserves a
 * unique slug via a transaction, then writes the record. When a user is signed
 * in, the link is tagged with their uid and indexed under users/{uid}/links.
 */
export async function createShortLink(input: CreateLinkInput): Promise<ShortLink> {
  const urlCheck = validateLongUrl(input.longUrl)
  if (!urlCheck.ok || !urlCheck.url) {
    throw new LinkServiceError(urlCheck.error ?? 'Please enter a valid URL.')
  }
  const longUrl = normalizeUrl(urlCheck.url)

  const customAlias = input.customAlias?.trim().toLowerCase() ?? ''
  let slug: string
  let isCustom = false

  if (customAlias) {
    const aliasCheck = validateAlias(customAlias)
    if (!aliasCheck.ok) throw new LinkServiceError(aliasCheck.error ?? 'Invalid alias.')
    if (isReservedSlug(customAlias)) throw new LinkServiceError('This alias is reserved.')
    const reserved = await reserveSlug(customAlias)
    if (!reserved) throw new LinkServiceError('This alias is already taken.')
    slug = customAlias
    isCustom = true
  } else {
    slug = await pickAvailableSlug()
  }

  const shortUrl = buildShortUrl(slug)
  const now = Date.now()
  const ownerId = auth.currentUser?.uid ?? null

  const record = {
    slug,
    longUrl,
    shortUrl,
    createdAt: now,
    updatedAt: now,
    clicks: 0,
    lastClickedAt: null,
    isActive: true,
    customAlias: isCustom,
    source: 'web' as const,
    title: input.title?.trim() ?? '',
    notes: input.notes?.trim() ?? '',
    ownerId,
  }

  await set(linkRef(slug), record)

  // Index under the signed-in user for their history.
  if (ownerId) {
    await set(ref(db, `users/${ownerId}/links/${slug}`), {
      slug,
      shortUrl,
      longUrl,
      title: record.title,
      createdAt: now,
    })
  }

  return {
    slug,
    longUrl,
    shortUrl,
    createdAt: now,
    updatedAt: now,
    clicks: 0,
    lastClickedAt: null,
    isActive: true,
    customAlias: isCustom,
    source: 'web',
    title: record.title,
    notes: record.notes,
  }
}

/** Atomically claims a slug. Returns true if it was free and is now reserved. */
async function reserveSlug(slug: string): Promise<boolean> {
  const placeholder = { reservedAt: Date.now(), ownerId: auth.currentUser?.uid ?? null }
  const res = await runTransaction(linkRef(slug), (current) =>
    current === null ? placeholder : undefined,
  )
  return res.committed
}

async function pickAvailableSlug(): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const length = attempt < 3 ? 7 : 8
    const candidate = generateSlug(length)
    if (isReservedSlug(candidate)) continue
    // eslint-disable-next-line no-await-in-loop
    if (await reserveSlug(candidate)) return candidate
  }
  throw new LinkServiceError('Could not generate a unique link. Please try again.')
}

function toMillis(value: unknown): number {
  if (!value) return Date.now()
  if (typeof value === 'number') return value
  return Date.now()
}
