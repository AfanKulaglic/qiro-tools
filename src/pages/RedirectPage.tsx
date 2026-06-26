import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ExternalLink, Link2 } from 'lucide-react'

import { PageShell } from '@/components/layout/PageShell'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { getLinkBySlug, incrementLinkClicks } from '@/services/linkService'
import { isReservedSlug } from '@/utils/reservedSlugs'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

type State =
  | { status: 'loading' }
  | { status: 'redirecting'; url: string }
  | { status: 'not-found' }
  | { status: 'inactive' }
  | { status: 'error' }

export default function RedirectPage() {
  const { slug = '' } = useParams()
  const [state, setState] = useState<State>({ status: 'loading' })
  useDocumentTitle('Redirecting…')

  useEffect(() => {
    let cancelled = false
    const clean = slug.trim()

    // Reserved slugs are real routes; they should never resolve as links.
    if (!clean || isReservedSlug(clean)) {
      setState({ status: 'not-found' })
      return
    }

    ;(async () => {
      try {
        const link = await getLinkBySlug(clean)
        if (cancelled) return
        if (!link) {
          setState({ status: 'not-found' })
          return
        }
        if (!link.isActive) {
          setState({ status: 'inactive' })
          return
        }
        setState({ status: 'redirecting', url: link.longUrl })
        // Fire-and-forget; a failed counter must not block the redirect.
        void incrementLinkClicks(clean).catch(() => {})
        window.location.replace(link.longUrl)
      } catch {
        if (!cancelled) setState({ status: 'error' })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (state.status === 'loading' || state.status === 'redirecting') {
    return (
      <PageShell
        badge="Short link"
        title="Taking you there…"
        subtitle={
          state.status === 'redirecting'
            ? 'If your browser does not redirect automatically, use the button below.'
            : 'Resolving your link.'
        }
      >
        <div className="flex flex-col items-center gap-6 py-10">
          <LoadingSpinner className="h-8 w-8" />
          {state.status === 'redirecting' && (
            <Button href={state.url} rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Continue to destination
            </Button>
          )}
        </div>
      </PageShell>
    )
  }

  const copy: Record<'not-found' | 'inactive' | 'error', { title: string; description: string }> = {
    'not-found': {
      title: 'Link not found',
      description: `We couldn't find a short link for "${slug}". It may have been removed or never existed.`,
    },
    inactive: {
      title: 'Link disabled',
      description: 'This short link has been deactivated and no longer redirects anywhere.',
    },
    error: {
      title: 'Something went wrong',
      description: 'We had trouble resolving this link. Please try again in a moment.',
    },
  }

  const c = copy[state.status]

  return (
    <PageShell badge="Short link" title={c.title} subtitle={c.description}>
      <div className="mx-auto max-w-md">
        <ErrorState title={c.title} description={c.description}>
          <div className="flex flex-wrap justify-center gap-3">
            <Button to="/shorten">
              <Link2 className="h-4 w-4" />
              Create a new link
            </Button>
            <Button to="/" variant="outline">
              Back home
            </Button>
          </div>
        </ErrorState>
      </div>
    </PageShell>
  )
}
