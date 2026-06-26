import { Home, Compass, Link2 } from 'lucide-react'

import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const SUGGESTIONS = [
  { to: '/shorten', label: 'URL Shortener' },
  { to: '/qr-generator', label: 'QR Generator' },
  { to: '/image-converter', label: 'Image Converter' },
  { to: '/pricing', label: 'Pricing' },
]

export default function NotFoundPage() {
  useDocumentTitle('Page not found · 404')

  return (
    <PageShell
      badge="404"
      title={
        <span>
          This page took a{' '}
          <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
            wrong turn
          </span>
        </span>
      }
      subtitle="The page you're looking for doesn't exist, moved, or the link is broken. Let's get you back on track."
    >
      <div className="mx-auto max-w-xl">
        <div className="flex flex-wrap justify-center gap-3">
          <Button to="/">
            <Home className="h-4 w-4" />
            Back home
          </Button>
          <Button to="/help" variant="outline">
            <Compass className="h-4 w-4" />
            Visit Help Center
          </Button>
        </div>

        <div className="mt-12">
          <p className="mb-4 text-center text-sm font-medium text-muted">Popular destinations</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SUGGESTIONS.map((s) => (
              <Button key={s.to} to={s.to} variant="secondary" size="sm" className="justify-center">
                <Link2 className="h-3.5 w-3.5" />
                {s.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
