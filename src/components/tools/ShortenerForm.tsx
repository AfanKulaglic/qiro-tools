import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Link2, Sparkles, Loader2, Check, X, ClipboardPaste,
  Globe, Tag, FileText, Wand2, ChevronDown, Search,
} from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { ShortenerResult } from './ShortenerResult'
import { HistoryList } from './HistoryList'
import { FreeLimitBanner } from './FreeLimitBanner'
import { useToolGate } from '@/hooks/useToolGate'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { validateAlias, validateLongUrl } from '@/utils/validateUrl'
import { createShortLink, checkSlugAvailability, LinkServiceError } from '@/services/linkService'
import { isReservedSlug } from '@/utils/reservedSlugs'
import { isFirebaseConfigured } from '@/lib/firebase'
import { STORAGE_KEYS } from '@/utils/storage'
import type { LinkHistoryItem, ShortLink } from '@/types/link'
import { cn } from '@/utils/cn'

const SHORT_DOMAIN_PREVIEW =
  import.meta.env.VITE_SHORT_DOMAIN?.replace(/^https?:\/\//, '').replace(/\/+$/, '') ||
  'go.yourdomain.com'

// Emphasized "focused" field look — same treatment as the QR tool's input.
const FIELD_WRAP =
  '!rounded-2xl !border-2 !border-accent-blue/40 focus-within:!border-accent-blue focus-within:!shadow-[0_0_0_4px_rgba(39,129,236,0.10)]'

type AliasStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

/**
 * Short-link tool — an actual working interface, not an explainer:
 *   1. a compact create bar (paste → shorten), with alias/details tucked away
 *   2. the link you just made, with copy / QR / clicks / open
 *   3. the list of links you've made on this device, each with quick actions
 */
export function ShortenerForm({ onCreated }: { onCreated: (link: ShortLink) => void; simple?: boolean }) {
  const [longUrl, setLongUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ url?: string; alias?: string; form?: string }>({})
  const [aliasStatus, setAliasStatus] = useState<AliasStatus>('idle')
  const [result, setResult] = useState<ShortLink | null>(null)
  const [query, setQuery] = useState('')
  const [history, setHistory] = useLocalStorage<LinkHistoryItem[]>(STORAGE_KEYS.links, [])
  const { gate, lockedForAnon, promptSignIn } = useToolGate('shorten')

  // Debounced live availability check for the custom alias.
  useEffect(() => {
    const a = alias.trim().toLowerCase()
    if (!a) { setAliasStatus('idle'); return }
    if (!validateAlias(a).ok) { setAliasStatus('invalid'); return }
    if (isReservedSlug(a)) { setAliasStatus('taken'); return }
    if (!isFirebaseConfigured) { setAliasStatus('idle'); return }
    setAliasStatus('checking')
    let cancelled = false
    const t = setTimeout(async () => {
      try {
        const free = await checkSlugAvailability(a)
        if (!cancelled) setAliasStatus(free ? 'available' : 'taken')
      } catch { if (!cancelled) setAliasStatus('idle') }
    }, 400)
    return () => { cancelled = true; clearTimeout(t) }
  }, [alias])

  async function handlePasteUrl() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) { setLongUrl(text.trim()); setErrors((e) => ({ ...e, url: undefined })) }
    } catch { toast.error('Cannot read clipboard') }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const urlCheck = validateLongUrl(longUrl)
    if (!urlCheck.ok) { setErrors({ url: urlCheck.error }); return }
    if (alias) {
      const aliasCheck = validateAlias(alias)
      if (!aliasCheck.ok) { setErrors({ alias: aliasCheck.error }); return }
    }

    if (!gate()) return

    setLoading(true)
    try {
      const link = await createShortLink({ longUrl, customAlias: alias, title, notes })
      setResult(link)
      setHistory((prev) => [
        { slug: link.slug, shortUrl: link.shortUrl, longUrl: link.longUrl, title: link.title, createdAt: link.createdAt },
        ...prev.filter((h) => h.slug !== link.slug),
      ].slice(0, 50))
      onCreated(link)
      setLongUrl('')
      setAlias('')
      setTitle('')
      setNotes('')
    } catch (err) {
      const message =
        err instanceof LinkServiceError ? err.message : 'Could not create the short link. Please try again.'
      if (/alias/i.test(message)) setErrors({ alias: message })
      else setErrors({ form: message })
    } finally {
      setLoading(false)
    }
  }

  function removeHistory(slug: string) {
    setHistory((prev) => prev.filter((h) => h.slug !== slug))
  }

  const submitDisabled = loading || aliasStatus === 'taken' || aliasStatus === 'invalid'

  const q = query.trim().toLowerCase()
  const filtered = q
    ? history.filter((h) =>
        h.shortUrl.toLowerCase().includes(q) ||
        h.longUrl.toLowerCase().includes(q) ||
        (h.title || '').toLowerCase().includes(q),
      )
    : history

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ═══ Create bar — paste a link, shorten it. That's the whole job. ═══ */}
      <div className="rounded-3xl border border-[#E8E0D6]/70 bg-white p-4 shadow-[0_10px_40px_-24px_rgba(33,26,20,0.25)] dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-5">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          {/* URL input with leading icon */}
          <div className="relative min-w-0 flex-1">
            <Link2 className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-accent-blue" />
            <Input
              name="longUrl"
              placeholder="https://www.example.com"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              error={errors.url}
              autoComplete="off"
              inputMode="url"
              className="!py-4 !pl-12 !text-[16px] font-semibold"
              wrapperClassName={FIELD_WRAP}
            />
          </div>

          {/* Paste + Shorten */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handlePasteUrl}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-[#E8E0D6] bg-white px-4 py-3.5 text-[13px] font-bold text-muted transition-colors hover:border-accent-blue/50 hover:text-accent-blue dark:border-white/10 dark:bg-ink-950 dark:hover:text-white"
            >
              <ClipboardPaste className="h-4 w-4" />
              <span className="hidden sm:inline">Paste</span>
            </button>
            <Button type="submit" size="lg" disabled={submitDisabled} className="flex-1 rounded-2xl px-7 shadow-glow-soft lg:flex-none">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
              {loading ? 'Creating...' : 'Shorten link'}
            </Button>
          </div>
        </div>

        {/* Alias + details — tucked behind a quiet toggle */}
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-faint transition-colors hover:text-accent-blue"
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform', showMore && 'rotate-180')} />
          {showMore ? 'Hide options' : 'Custom alias and details'}
        </button>
        {showMore && (
          <div className="mt-4 space-y-4 border-t border-[#E8E0D6]/50 pt-4 dark:border-white/[0.06]">
            <Section
              icon={Tag}
              title="Custom alias"
              hint="Memorable link"
              trailing={alias.trim() ? <AliasStatusChip status={aliasStatus} /> : null}
            >
              <Input
                name="alias"
                prefix={`${SHORT_DOMAIN_PREVIEW}/`}
                placeholder="my-alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                error={errors.alias}
                autoComplete="off"
                wrapperClassName={FIELD_WRAP}
              />
            </Section>
            <Section icon={FileText} title="Details" hint="Organize your links">
              <div className="space-y-3">
                <Input
                  name="title"
                  placeholder="Title — e.g. Summer campaign"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  wrapperClassName={FIELD_WRAP}
                />
                <Textarea
                  name="notes"
                  placeholder="Internal notes (optional)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[72px] !rounded-2xl !border-2 !border-accent-blue/40 focus:!border-accent-blue focus:!shadow-[0_0_0_4px_rgba(39,129,236,0.10)]"
                />
              </div>
            </Section>
          </div>
        )}

        {errors.form && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl border border-red-400/30 bg-red-500/5 px-4 py-3 text-sm text-red-400"
          >
            {errors.form}
          </motion.p>
        )}
        {!isFirebaseConfigured && (
          <p className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-600 dark:text-amber-500">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              The link shortener requires a Firebase database. Configure it in the <code className="rounded bg-amber-500/10 px-1 py-0.5">.env</code> file.
            </span>
          </p>
        )}
      </div>

      {lockedForAnon && (
        <FreeLimitBanner onSignIn={promptSignIn} message="You've used your free link. Sign in for unlimited shortening." />
      )}

      {/* ═══ The link you just made ═══ */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="relative overflow-hidden rounded-3xl border border-accent-blue/20 bg-gradient-to-br from-accent-blue/10 via-white to-accent-cyan/[0.06] p-5 dark:border-accent-blue/15 dark:from-accent-blue/10 dark:via-ink-950 dark:to-accent-cyan/[0.06] sm:p-6"
        >
          <div className="pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full bg-accent-blue/15 blur-[80px]" />
          <div className="relative">
            <ShortenerResult link={result} />
          </div>
        </motion.div>
      )}

      {/* ═══ Your links — the real content of a shortener ═══ */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-blue/10 to-accent-cyan/10 text-accent-blue">
              <Link2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-[#211A14] dark:text-white">Your links</p>
              <p className="text-[11px] text-faint">Saved on this device</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 4 && (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-40 rounded-lg border border-[#E8E0D6] bg-white py-1.5 pl-8 pr-3 text-[12px] text-[#211A14] placeholder:text-faint focus:border-accent-blue/60 focus:outline-none dark:border-white/10 dark:bg-ink-950 dark:text-white"
                />
              </div>
            )}
            {history.length > 0 && (
              <span className="rounded-full bg-[#211A14]/[0.04] px-2.5 py-1 text-[11px] font-bold text-muted dark:bg-white/10">
                {q ? `${filtered.length}/${history.length}` : history.length}
              </span>
            )}
          </div>
        </div>
        {q && filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#E8E0D6] py-10 text-center text-sm text-faint dark:border-white/10">
            No links for "{query}".
          </p>
        ) : (
          <HistoryList items={filtered} onRemove={removeHistory} highlightSlug={result?.slug} />
        )}
      </div>
    </form>
  )
}

/* ─── Small helpers ─── */

function Section({
  icon: Icon, title, hint, trailing, children,
}: {
  icon: typeof Globe; title: string; hint?: string; trailing?: ReactNode; children: ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-accent-blue/10 text-accent-blue">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div>
            <span className="block text-[13px] font-bold leading-none text-[#211A14] dark:text-white">{title}</span>
            {hint && <span className="mt-0.5 block text-[11px] leading-none text-faint">{hint}</span>}
          </div>
        </div>
        {trailing}
      </div>
      {children}
    </div>
  )
}

function AliasStatusChip({ status }: { status: AliasStatus }) {
  const map = {
    checking: { icon: <Loader2 className="h-2.5 w-2.5 animate-spin" />, text: 'Checking', cls: 'bg-[#211A14]/[0.05] text-muted dark:bg-white/10 dark:text-white/60' },
    available: { icon: <Check className="h-2.5 w-2.5" />, text: 'Available', cls: 'bg-accent-green/10 text-accent-green' },
    taken: { icon: <X className="h-2.5 w-2.5" />, text: 'Taken', cls: 'bg-red-500/10 text-red-500' },
    invalid: { icon: <X className="h-2.5 w-2.5" />, text: 'Invalid', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-500' },
    idle: null,
  }[status]
  if (!map) return null
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider', map.cls)}>
      {map.icon} {map.text}
    </span>
  )
}
