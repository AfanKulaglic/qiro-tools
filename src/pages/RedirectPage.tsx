import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import { getLinkBySlug, incrementLinkClicks } from '@/services/linkService'
import { isReservedSlug } from '@/utils/reservedSlugs'

type State = 'resolving' | 'not-found' | 'inactive' | 'error'

/**
 * Short-link resolver. Rendered *outside* the marketing layout (no navbar/footer)
 * so a valid link sends the visitor straight to its destination with no visible
 * stop on our site — just a brief spinner while we look the slug up, then a hard
 * `location.replace`. Only invalid/disabled links ever show UI.
 */
export default function RedirectPage() {
  const { slug = '' } = useParams()
  const [state, setState] = useState<State>('resolving')

  useEffect(() => {
    let cancelled = false
    const clean = slug.trim()

    // Reserved slugs are real routes; they should never resolve as links.
    if (!clean || isReservedSlug(clean)) {
      setState('not-found')
      return
    }

    ;(async () => {
      try {
        const link = await getLinkBySlug(clean)
        if (cancelled) return
        if (!link) {
          setState('not-found')
          return
        }
        if (!link.isActive) {
          setState('inactive')
          return
        }
        // Redirect immediately; count the click without blocking it.
        void incrementLinkClicks(clean).catch(() => {})
        window.location.replace(link.longUrl)
      } catch {
        if (!cancelled) setState('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [slug])

  // While resolving (and during the replace) show a near-blank screen with no app
  // chrome — it should feel like a normal redirector, not a page on our site.
  if (state === 'resolving') {
    return (
      <div className="grid min-h-screen place-items-center bg-white dark:bg-ink-950">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-blue/30 border-t-accent-blue" />
      </div>
    )
  }

  const COPY: Record<Exclude<State, 'resolving'>, { title: string; desc: string }> = {
    'not-found': { title: 'Link not found', desc: 'This short link doesn’t exist or has been removed.' },
    inactive: { title: 'Link disabled', desc: 'This short link has been deactivated and no longer redirects.' },
    error: { title: 'Something went wrong', desc: 'We couldn’t resolve this link. Please try again in a moment.' },
  }
  const msg = COPY[state]

  return (
    <div className="grid min-h-screen place-items-center bg-white px-6 text-center dark:bg-ink-950">
      <div className="max-w-sm">
        <h1 className="text-xl font-extrabold text-[#211A14] dark:text-white">{msg.title}</h1>
        <p className="mt-2 text-sm text-muted">{msg.desc}</p>
        <Link
          to="/shorten"
          className="mt-5 inline-block rounded-xl bg-accent-blue px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Create a new link
        </Link>
      </div>
    </div>
  )
}
