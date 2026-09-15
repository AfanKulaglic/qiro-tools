import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Download, RotateCcw, Loader2, ShieldCheck, Sparkles, FileType, Wand2,
  SlidersHorizontal, Maximize2, Gauge, MoveHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ImageDropzone } from './ImageDropzone'
import { FreeLimitBanner } from './FreeLimitBanner'
import { useToolGate } from '@/hooks/useToolGate'
import {
  enhanceImage, enhancedFileName, type EnhanceResult, type EnhanceScale, type EnhancePhase,
} from '@/utils/imageEnhance'
import { downloadBlob } from '@/utils/ffmpegClient'
import { formatBytes } from '@/utils/format'
import { cn } from '@/utils/cn'

const PHASE_LABEL: Record<EnhancePhase, string> = {
  model: 'Loading AI model…',
  upscale: 'Upscaling with AI…',
  finish: 'Finishing…',
}

export function ImageEnhancerTool({ simple = false }: { simple?: boolean }) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<EnhanceResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState<EnhancePhase>('model')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState<EnhanceScale>(2)
  const [strength, setStrength] = useState(0.6)
  const { gate, lockedForAnon, promptSignIn } = useToolGate('enhance')

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  function selectFile(f: File) {
    setError(null)
    setResult((prev) => { if (prev) URL.revokeObjectURL(prev.url); return null })
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  async function handleEnhance() {
    if (!file || busy) return
    setBusy(true)
    setError(null)
    setPhase('model')
    setProgress(0)
    try {
      const res = await enhanceImage(file, { scale, strength }, (ph, ratio) => {
        setPhase(ph)
        setProgress(ratio)
      })
      setResult((prev) => { if (prev) URL.revokeObjectURL(prev.url); return res })
      toast.success('Image enhanced')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enhancing the image failed.')
    } finally {
      setBusy(false)
    }
  }

  function handleDownload() {
    if (!result || !file) return
    if (!gate()) return
    downloadBlob(result.blob, enhancedFileName(file.name))
    toast.success('PNG downloaded')
  }

  function handleReset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (result) URL.revokeObjectURL(result.url)
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
  }

  /* ─── Start screen ─── */
  if (!file) {
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-stretch xl:gap-7">
        <div className="flex flex-col rounded-[1.75rem] border border-accent-coral/25 bg-gradient-to-br from-accent-coral/12 via-white to-accent-peach/[0.07] p-6 dark:border-accent-coral/15 dark:from-accent-coral/10 dark:via-ink-950 dark:to-accent-peach/[0.07]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-coral/20 to-accent-peach/10 text-accent-coral ring-1 ring-inset ring-accent-coral/25">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-base font-extrabold text-[#211A14] dark:text-white">Image enhancer</p>
              <p className="mt-0.5 text-[12px] text-faint">Add a photo — AI upscales & sharpens it</p>
            </div>
          </div>

          <div className="mt-auto space-y-2 pt-6">
            {[
              { Icon: Maximize2, t: '2× or 4× super-resolution' },
              { Icon: Sparkles, t: 'Sharper, cleaner, more detail' },
              { Icon: ShieldCheck, t: 'Private — AI runs in your browser' },
            ].map(({ Icon, t }) => (
              <div key={t} className="flex items-center gap-2.5 text-[12.5px] text-muted">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/70 text-accent-coral shadow-sm dark:bg-white/10">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>

        <ImageDropzone onFile={selectFile} />
      </div>
    )
  }

  const cardFlat =
    'rounded-3xl border border-[#E8E0D6]/70 bg-white shadow-[0_10px_40px_-24px_rgba(33,26,20,0.25)] dark:border-white/[0.08] dark:bg-white/[0.03]'

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start xl:gap-7">
      {/* ════ CONSOLE (left) ════ */}
      <div className="space-y-4 lg:col-start-1">
        {lockedForAnon && (
          <FreeLimitBanner onSignIn={promptSignIn} />
        )}

        <div className={cardFlat}>
          <div className="space-y-5 p-5">
            {/* Source file */}
            <div className="flex items-center gap-2 rounded-2xl border border-[#E8E0D6] bg-[#211A14]/[0.015] px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.01]">
              <FileType className="h-4 w-4 shrink-0 text-faint" />
              <span className="truncate text-[13px] font-semibold text-[#211A14] dark:text-white">{file.name}</span>
              <span className="ml-auto shrink-0 font-mono text-[11px] font-bold text-faint">{formatBytes(file.size)}</span>
            </div>

            {/* Upscale factor */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-muted">
                <Maximize2 className="h-4 w-4" /> Upscale
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([2, 4] as const).map((s) => (
                  <button
                    key={s} type="button" onClick={() => setScale(s)} disabled={busy}
                    className={cn(
                      'rounded-2xl border px-3 py-2.5 text-sm font-bold transition-colors disabled:opacity-50',
                      scale === s
                        ? 'border-accent-coral/40 bg-accent-coral/10 text-accent-coral'
                        : 'border-[#E8E0D6] text-faint hover:text-[#211A14] dark:border-white/10 dark:hover:text-white',
                    )}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>

            {/* Strength */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-sm font-bold text-muted">
                  <SlidersHorizontal className="h-4 w-4" /> Strength
                </label>
                <span className="font-mono text-[13px] font-bold text-accent-coral">{Math.round(strength * 100)}%</span>
              </div>
              <input
                type="range" min={0} max={1} step={0.05} value={strength} disabled={busy}
                onChange={(e) => setStrength(Number(e.target.value))}
                className="custom-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E8E0D6] dark:bg-white/10 accent-accent-coral outline-none disabled:opacity-50"
              />
              <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-faint">
                <span>← Natural</span>
                <span>Punchy →</span>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-2xl border border-accent-coral/20 bg-accent-coral/[0.04] p-4 dark:border-accent-coral/15 dark:bg-accent-coral/[0.06]">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#211A14] dark:text-white">
                <Gauge className="h-4 w-4 text-accent-coral" />
                AI super-resolution
              </div>
              <p className="mt-1.5 text-[12px] leading-snug text-muted">
                The AI adds real detail while upscaling, then a finishing pass sharpens and
                cleans the result. It runs on your CPU in small tiles — the first run downloads the
                model (tens of MB, then cached). Larger images and <strong className="text-[#211A14] dark:text-white">4×</strong> take a bit longer.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 border-t border-[#E8E0D6]/50 p-4 dark:border-white/[0.06]">
            <Button onClick={handleEnhance} disabled={busy} size="lg" className="rounded-2xl shadow-glow-soft">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
              {busy ? `${Math.round(progress * 100)}%` : 'Enhance'}
            </Button>
            <Button variant="secondary" onClick={handleDownload} disabled={!result || busy} className="rounded-2xl">
              <Download className="h-5 w-5" /> Download
            </Button>
          </div>
        </div>

        {!simple && (
          <div className="flex items-start gap-3 rounded-2xl border border-accent-coral/20 bg-gradient-to-r from-accent-coral/5 to-transparent px-4 py-3 text-xs leading-relaxed text-muted dark:border-accent-coral/10 dark:from-accent-coral/[0.02]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-coral" />
            <div><strong className="text-[#211A14] dark:text-white">Private:</strong> the AI model runs in your browser — the image is never sent to a server.</div>
          </div>
        )}
      </div>

      {/* ════ STAGE (right) ════ */}
      <div className="lg:col-start-2 lg:sticky lg:top-24">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-accent-coral/25 bg-gradient-to-br from-accent-coral/12 via-white to-accent-peach/[0.07] p-5 dark:border-accent-coral/15 dark:from-accent-coral/10 dark:via-ink-950 dark:to-accent-peach/[0.07] sm:p-6">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent-coral/25 blur-[90px]" />

          {/* header: badge + drag hint */}
          <div className="relative mb-5 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-coral shadow-sm backdrop-blur dark:bg-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-coral" /> Live preview
            </span>
            {result && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-faint shadow-sm backdrop-blur dark:bg-white/10">
                <SlidersHorizontal className="h-3 w-3" /> Drag to compare
              </span>
            )}
          </div>

          {/* image card */}
          <div className="relative overflow-hidden rounded-3xl bg-[#211A14]/[0.03] shadow-[0_40px_80px_-24px_rgba(33,26,20,0.35)] ring-1 ring-black/5 dark:bg-white/[0.02]">
            <div className="flex min-h-[260px] items-center justify-center p-4 sm:p-6">
              {result && previewUrl ? (
                <CompareSlider beforeUrl={previewUrl} afterUrl={result.url} alt={file.name} />
              ) : previewUrl ? (
                <img src={previewUrl} alt={file.name} className="max-h-[420px] rounded-lg object-contain" />
              ) : null}
            </div>
            {busy && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-black/55 backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Loader2 className="h-7 w-7 animate-spin text-white" />
                  <div>
                    <p className="text-sm font-bold text-white">{PHASE_LABEL[phase]} {Math.round(progress * 100)}%</p>
                    <p className="mt-0.5 text-[11px] text-white/60">First time loads the AI model — everything stays on your device</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* meta */}
          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            <Pill label="Original" value={formatBytes(file.size)} />
            <span className="text-faint">→</span>
            <Pill
              label={`PNG ${scale}×`}
              value={result ? `${result.width}×${result.height} · ${formatBytes(result.size)}` : '…'}
              accent
            />
          </div>
        </div>

        {/* Replace image */}
        <button
          type="button"
          onClick={handleReset}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#E8E0D6]/60 bg-white py-2.5 text-[12px] font-semibold text-faint transition-all duration-200 hover:border-accent-coral/40 hover:text-accent-coral dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Replace image
        </button>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl border border-red-400/30 bg-red-500/5 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  )
}

/* ─── Small Helpers ─── */

/**
 * Before/after comparison slider. The "after" (enhanced) image defines the box;
 * the "before" (original) is overlaid and clipped from the right, so dragging the
 * handle wipes between them. Both render `object-contain` in the same box, so —
 * since the enhanced image is just a scaled-up copy — they line up pixel-for-pixel.
 */
function CompareSlider({ beforeUrl, afterUrl, alt }: { beforeUrl: string; afterUrl: string; alt: string }) {
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  function setFromClientX(clientX: number) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const p = ((clientX - r.left) / r.width) * 100
    setPos(p < 0 ? 0 : p > 100 ? 100 : p)
  }

  return (
    <div
      ref={ref}
      className="relative cursor-ew-resize touch-none select-none"
      onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); setFromClientX(e.clientX) }}
      onPointerMove={(e) => { if (dragging.current) setFromClientX(e.clientX) }}
      onPointerUp={() => { dragging.current = false }}
      onPointerCancel={() => { dragging.current = false }}
    >
      {/* AFTER — defines the box size */}
      <img src={afterUrl} alt="Enhanced" draggable={false} className="block max-h-[420px] w-auto rounded-lg object-contain" />

      {/* BEFORE — clipped from the right by the handle position */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img src={beforeUrl} alt={alt} draggable={false} className="absolute inset-0 h-full w-full object-contain" />
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Before</span>
      </div>

      {/* AFTER label */}
      <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-accent-coral/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">After</span>

      {/* Handle */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" />
        <div className="absolute left-0 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#211A14] shadow-lg ring-1 ring-black/10">
          <MoveHorizontal className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

function Pill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] shadow-sm backdrop-blur dark:bg-white/10">
      <span className="font-bold uppercase tracking-wider text-faint">{label}</span>
      <span className={cn('font-mono font-bold', accent ? 'text-accent-coral' : 'text-[#211A14] dark:text-white')}>{value}</span>
    </span>
  )
}
