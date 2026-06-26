import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Sparkles, ChevronDown, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { validateAlias, validateLongUrl } from '@/utils/validateUrl'
import { createShortLink, LinkServiceError } from '@/services/linkService'
import { isFirebaseConfigured } from '@/lib/firebase'
import type { ShortLink } from '@/types/link'
import { cn } from '@/utils/cn'

const SHORT_DOMAIN_PREVIEW =
  import.meta.env.VITE_SHORT_DOMAIN?.replace(/^https?:\/\//, '').replace(/\/+$/, '') ||
  'go.yourdomain.com'

export function ShortenerForm({ onCreated }: { onCreated: (link: ShortLink) => void }) {
  const [longUrl, setLongUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [advanced, setAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ url?: string; alias?: string; form?: string }>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const urlCheck = validateLongUrl(longUrl)
    if (!urlCheck.ok) {
      setErrors({ url: urlCheck.error })
      return
    }
    if (alias) {
      const aliasCheck = validateAlias(alias)
      if (!aliasCheck.ok) {
        setErrors({ alias: aliasCheck.error })
        return
      }
    }

    setLoading(true)
    try {
      const link = await createShortLink({ longUrl, customAlias: alias, title, notes })
      onCreated(link)
      setLongUrl('')
      setAlias('')
      setTitle('')
      setNotes('')
      setAdvanced(false)
    } catch (err) {
      const message =
        err instanceof LinkServiceError
          ? err.message
          : 'Could not create the short link. Please try again.'
      // Surface alias-specific errors on the alias field for clarity.
      if (/alias/i.test(message)) setErrors({ alias: message })
      else setErrors({ form: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        name="longUrl"
        label="Long URL"
        placeholder="Paste your long URL here..."
        hint="Example: https://example.com/products/summer-sale"
        value={longUrl}
        onChange={(e) => setLongUrl(e.target.value)}
        error={errors.url}
        autoComplete="off"
        inputMode="url"
      />

      <Input
        name="alias"
        label="Custom alias (optional)"
        prefix={`${SHORT_DOMAIN_PREVIEW}/`}
        placeholder="summer-sale"
        hint="Use lowercase letters, numbers, and hyphens."
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        error={errors.alias}
        autoComplete="off"
      />

      <button
        type="button"
        onClick={() => setAdvanced((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent-blue"
      >
        <ChevronDown className={cn('h-4 w-4 transition-transform', advanced && 'rotate-180')} />
        Advanced options
      </button>

      <AnimatePresence initial={false}>
        {advanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-5 overflow-hidden"
          >
            <Input
              name="title"
              label="Title (optional)"
              placeholder="Summer Sale Campaign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              name="notes"
              label="Notes (optional)"
              placeholder="Internal notes about this link…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <DisabledOption label="Expiration date" />
              <DisabledOption label="Password protection" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {errors.form && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {errors.form}
        </p>
      )}

      {!isFirebaseConfigured && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-500">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          The shortener needs Firebase. Add your config to a <code className="mx-1">.env</code> file
          to enable it. QR & image tools work without setup.
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating…
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            Create short link
          </>
        )}
      </Button>
    </form>
  )
}

function DisabledOption({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-dashed border-[#E8E0D6] dark:border-white/12 px-3.5 py-3 opacity-70">
      <span className="text-sm text-muted">{label}</span>
      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-faint">
        Coming soon
      </span>
    </div>
  )
}
