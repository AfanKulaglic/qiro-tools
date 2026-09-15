import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Copy, Check, Link2, Megaphone, QrCode, Scissors, Globe, RotateCcw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dropdown } from '@/components/ui/Dropdown'
import { useClipboard } from '@/hooks/useClipboard'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/utils/storage'
import { buildUtmUrl, isValidUrl, type UtmParams } from '@/utils/utm'
import type { UtmHistoryItem } from '@/types/qr'
import { cn } from '@/utils/cn'

const FIELD_WRAP =
  '!rounded-2xl !border-2 !border-accent-blue/40 focus-within:!border-accent-blue focus-within:!shadow-[0_0_0_4px_rgba(39,129,236,0.10)]'

const MEDIUM_OPTIONS = [
  { value: 'cpc', label: 'cpc', hint: 'Paid ads (click)' },
  { value: 'social', label: 'social', hint: 'Social networks' },
  { value: 'email', label: 'email', hint: 'Newsletter / mailing' },
  { value: 'organic', label: 'organic', hint: 'Organic traffic' },
  { value: 'referral', label: 'referral', hint: 'Sa drugog sajta' },
  { value: 'banner', label: 'banner', hint: 'Display / banner' },
]

const SOURCE_PRESETS = [
  { label: 'Google', value: 'google', medium: 'cpc' },
  { label: 'Facebook', value: 'facebook', medium: 'social' },
  { label: 'Instagram', value: 'instagram', medium: 'social' },
  { label: 'Newsletter', value: 'newsletter', medium: 'email' },
  { label: 'LinkedIn', value: 'linkedin', medium: 'social' },
  { label: 'YouTube', value: 'youtube', medium: 'social' },
]

export function UtmBuilderTool({ simple = false }: { simple?: boolean }) {
  const [base, setBase] = useState('')
  const [source, setSource] = useState('')
  const [medium, setMedium] = useState('')
  const [campaign, setCampaign] = useState('')
  const [term, setTerm] = useState('')
  const [content, setContent] = useState('')
  const { copied, copy } = useClipboard()
  const [, setHistory] = useLocalStorage<UtmHistoryItem[]>(STORAGE_KEYS.utm, [])
  const navigate = useNavigate()

  const baseValid = isValidUrl(base)
  const ready = baseValid && !!source.trim() && !!medium.trim() && !!campaign.trim()

  const builtUrl = useMemo(() => {
    if (!ready) return ''
    try {
      return buildUtmUrl(base, { source, medium, campaign, term, content } as UtmParams)
    } catch {
      return ''
    }
  }, [ready, base, source, medium, campaign, term, content])

  function applyPreset(p: (typeof SOURCE_PRESETS)[number]) {
    setSource(p.value)
    if (!medium) setMedium(p.medium)
  }

  function record() {
    if (!builtUrl) return
    setHistory((prev) => [
      { id: `${Date.now()}`, url: builtUrl, campaign: campaign.trim(), createdAt: Date.now() },
      ...prev.filter((h) => h.url !== builtUrl),
    ].slice(0, 50))
  }

  async function handleCopy() {
    if (!builtUrl) return
    const ok = await copy(builtUrl)
    if (ok) { record(); toast.success('Link copied') }
    else toast.error('Kopiranje nije uspjelo')
  }

  async function handleShorten() {
    if (!builtUrl) return
    await copy(builtUrl)
    record()
    toast.success('Link copied — paste it into the shortener')
    navigate('/shorten')
  }

  async function handleQr() {
    if (!builtUrl) return
    await copy(builtUrl)
    record()
    toast.success('Link copied — paste it into the QR generator')
    navigate('/qr-generator')
  }

  function handleReset() {
    setBase(''); setSource(''); setMedium(''); setCampaign(''); setTerm(''); setContent('')
  }

  const chips: { label: string; value: string }[] = [
    { label: 'utm_source', value: source },
    { label: 'utm_medium', value: medium },
    { label: 'utm_campaign', value: campaign },
    ...(term ? [{ label: 'utm_term', value: term }] : []),
    ...(content ? [{ label: 'utm_content', value: content }] : []),
  ]

  const cardFlat =
    'rounded-3xl border border-[#E8E0D6]/70 bg-white shadow-[0_10px_40px_-24px_rgba(33,26,20,0.25)] dark:border-white/[0.08] dark:bg-white/[0.03]'

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-start xl:gap-7">
      {/* ════ CONSOLE (left) — form ════ */}
      <div className={cn(cardFlat, 'lg:col-start-1')}>
        <div className="space-y-5 p-5 sm:p-6">
          {/* Base URL */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-muted">
              <Globe className="h-4 w-4" /> Destination URL <span className="text-accent-blue">*</span>
            </label>
            <Input
              placeholder="https://www.example.com/page"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              inputMode="url"
              autoComplete="off"
              error={base && !baseValid ? 'Unesi ispravan http(s) link' : undefined}
              className="!py-3.5 !text-[15px] font-semibold"
              wrapperClassName={FIELD_WRAP}
            />
          </div>

          {/* Source presets */}
          <div>
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted">Quick sources</span>
            <div className="flex flex-wrap gap-1.5">
              {SOURCE_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-[12px] font-bold transition-all',
                    source === p.value
                      ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                      : 'border-[#E8E0D6] bg-white text-muted hover:border-accent-blue/40 hover:text-[#211A14] dark:border-white/10 dark:bg-ink-950 dark:hover:text-white',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* source + medium */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-muted">Source <span className="text-accent-blue">*</span></label>
              <Input placeholder="e.g. google" value={source} onChange={(e) => setSource(e.target.value)} autoComplete="off" wrapperClassName={FIELD_WRAP} />
            </div>
            <Dropdown
              label="Medium *"
              accent="blue"
              options={MEDIUM_OPTIONS}
              value={medium}
              onChange={setMedium}
              placeholder="Select a medium…"
            />
          </div>

          {/* campaign */}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-muted">Campaign <span className="text-accent-blue">*</span></label>
            <Input placeholder="e.g. summer_sale" value={campaign} onChange={(e) => setCampaign(e.target.value)} autoComplete="off" wrapperClassName={FIELD_WRAP} />
          </div>

          {/* optional term + content */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-muted">Keyword (term)</label>
              <Input placeholder="optional" value={term} onChange={(e) => setTerm(e.target.value)} autoComplete="off" wrapperClassName={FIELD_WRAP} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-muted">Content</label>
              <Input placeholder="optional" value={content} onChange={(e) => setContent(e.target.value)} autoComplete="off" wrapperClassName={FIELD_WRAP} />
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-faint transition-colors hover:text-[#211A14] dark:hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear fields
          </button>
        </div>
      </div>

      {/* ════ STAGE (right) — live URL ════ */}
      <div className="lg:col-start-2 lg:sticky lg:top-24">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-accent-blue/20 bg-gradient-to-br from-accent-blue/12 via-white to-accent-cyan/[0.07] p-5 dark:border-accent-blue/15 dark:from-accent-blue/10 dark:via-ink-950 dark:to-accent-cyan/[0.07] sm:p-6">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent-blue/25 blur-[90px]" />

          <div className="relative mb-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-blue shadow-sm backdrop-blur dark:bg-white/10">
              <Megaphone className="h-3 w-3" /> Your campaign link
            </span>
          </div>

          {/* URL box */}
          <div className="relative rounded-2xl border border-[#E8E0D6] bg-white p-4 dark:border-white/10 dark:bg-ink-950">
            {builtUrl ? (
              <p className="break-all font-mono text-[13px] leading-relaxed text-[#211A14] dark:text-white">
                {builtUrl}
              </p>
            ) : (
              <p className="flex items-center gap-2 text-[13px] text-faint">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                Fill in the destination URL, source, medium and campaign.
              </p>
            )}
          </div>

          {/* param chips */}
          {ready && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span key={c.label} className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] shadow-sm backdrop-blur dark:bg-white/10">
                  <span className="font-bold text-accent-blue">{c.label}</span>
                  <span className="font-mono text-faint">=</span>
                  <span className="font-mono font-semibold text-[#211A14] dark:text-white">{c.value.trim().toLowerCase().replace(/\s+/g, '_')}</span>
                </span>
              ))}
            </div>
          )}

          {/* actions */}
          <div className="mt-5 space-y-2.5">
            <Button onClick={handleCopy} disabled={!builtUrl} size="lg" className="w-full rounded-2xl shadow-glow-soft">
              {copied ? <Check className="h-5 w-5 text-accent-green" /> : <Copy className="h-5 w-5" />}
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleShorten} disabled={!builtUrl} className="rounded-xl text-[13px]">
                <Scissors className="h-4 w-4" /> Shorten
              </Button>
              <Button variant="outline" onClick={handleQr} disabled={!builtUrl} className="rounded-xl text-[13px]">
                <QrCode className="h-4 w-4" /> QR kod
              </Button>
            </div>
          </div>
        </div>

        {!simple && (
          <div className="mt-3 flex items-start gap-3 rounded-2xl border border-accent-blue/20 bg-gradient-to-r from-accent-blue/5 to-transparent px-4 py-3 text-xs leading-relaxed text-muted dark:border-accent-blue/10 dark:from-accent-blue/[0.02]">
            <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-blue" />
            <div><strong className="text-[#211A14] dark:text-white">UTM tags</strong> tell tools like Google Analytics where visitors come from — without them all traffic looks "direct".</div>
          </div>
        )}
      </div>
    </div>
  )
}
