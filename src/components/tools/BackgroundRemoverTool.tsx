import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Download, RotateCcw, Loader2, ShieldCheck, Scissors, FileType, Wand2, Sparkles, ScanSearch, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ImageDropzone } from './ImageDropzone'
import { FreeLimitBanner } from './FreeLimitBanner'
import { useToolGate } from '@/hooks/useToolGate'
import { removeImageBackground, pngFileName, type BgRemovalResult } from '@/utils/backgroundRemoval'
import { downloadBlob } from '@/utils/ffmpegClient'
import { refineMatte } from '@/utils/matte'
import { formatBytes } from '@/utils/format'
import { cn } from '@/utils/cn'

/** Loads a Blob into an ImageData via an offscreen canvas. */
async function blobToImageData(blob: Blob): Promise<ImageData> {
  const url = URL.createObjectURL(blob)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image()
      im.onload = () => resolve(im)
      im.onerror = () => reject(new Error('decode failed'))
      im.src = url
    })
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    return ctx.getImageData(0, 0, c.width, c.height)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Renders ImageData to a PNG Blob. */
function imageDataToPng(data: ImageData): Promise<Blob> {
  const c = document.createElement('canvas')
  c.width = data.width
  c.height = data.height
  c.getContext('2d')!.putImageData(data, 0, 0)
  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/png'),
  )
}

/** Standard "this area is transparent" checkerboard — not an added background. */
const CHECKERBOARD = 'bg-[repeating-conic-gradient(#0000_0_25%,#80808022_0_50%)] bg-[length:20px_20px]'

export function BackgroundRemoverTool({ simple = false }: { simple?: boolean }) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<BgRemovalResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'original' | 'result'>('result')
  // Edge refinement: <0 shrinks the cut-out (removes halo), >0 grows it.
  const [edge, setEdge] = useState(0)
  const [refined, setRefined] = useState<{ blob: Blob; url: string; size: number } | null>(null)
  const [refining, setRefining] = useState(false)
  const baseRef = useRef<ImageData | null>(null) // raw cut-out, source for refinement
  const { gate, lockedForAnon, promptSignIn } = useToolGate('bg')

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  // Re-apply edge refinement (debounced) whenever the slider moves.
  useEffect(() => {
    const base = baseRef.current
    if (!base || !result) return
    if (edge === 0) {
      setRefined((prev) => { if (prev) URL.revokeObjectURL(prev.url); return null })
      return
    }
    let cancelled = false
    setRefining(true)
    const t = setTimeout(async () => {
      try {
        const out = refineMatte(base, edge)
        const blob = await imageDataToPng(out)
        if (cancelled) return
        setRefined((prev) => { if (prev) URL.revokeObjectURL(prev.url); return { blob, url: URL.createObjectURL(blob), size: blob.size } })
      } finally {
        if (!cancelled) setRefining(false)
      }
    }, 250)
    return () => { cancelled = true; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edge, result])

  /** The cut-out currently shown/downloaded — refined version if any, else raw. */
  const activeResult = refined ?? result

  function resetEdge() {
    setEdge(0)
    setRefined((prev) => { if (prev) URL.revokeObjectURL(prev.url); return null })
    baseRef.current = null
  }

  function selectFile(f: File) {
    setError(null)
    setResult(null)
    setView('result')
    resetEdge()
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  async function handleRemove() {
    if (!file || busy) return
    setBusy(true)
    setError(null)
    setProgress(0)
    resetEdge()
    try {
      const res = await removeImageBackground(file, setProgress)
      setResult((prev) => { if (prev) URL.revokeObjectURL(prev.url); return res })
      // Cache the raw cut-out as ImageData so edge refinement is instant.
      baseRef.current = await blobToImageData(res.blob)
      setView('result')
      toast.success('Background removed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Background removal failed.')
    } finally {
      setBusy(false)
    }
  }

  function handleDownload() {
    if (!activeResult || !file) return
    if (!gate()) return
    downloadBlob(activeResult.blob, pngFileName(file.name))
    toast.success('PNG downloaded')
  }

  function handleReset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (result) URL.revokeObjectURL(result.url)
    resetEdge()
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setView('result')
  }

  /* ─── Start screen ─── */
  if (!file) {
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-stretch xl:gap-7">
        <div className="flex flex-col rounded-[1.75rem] border border-accent-green/25 bg-gradient-to-br from-accent-green/12 via-white to-accent-cyan/[0.07] p-6 dark:border-accent-green/15 dark:from-accent-green/10 dark:via-ink-950 dark:to-accent-cyan/[0.07]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-green/20 to-accent-cyan/10 text-accent-green ring-1 ring-inset ring-accent-green/25">
              <Scissors className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-base font-extrabold text-[#211A14] dark:text-white">Background remover</p>
              <p className="mt-0.5 text-[12px] text-faint">Add an image — AI removes the background</p>
            </div>
          </div>

          <div className="mt-auto space-y-2 pt-6">
            {[
              { Icon: ShieldCheck, t: 'Private — AI runs in your browser' },
              { Icon: Sparkles, t: 'Transparent PNG, clean edges' },
              { Icon: Download, t: 'Download instantly, no signup' },
            ].map(({ Icon, t }) => (
              <div key={t} className="flex items-center gap-2.5 text-[12.5px] text-muted">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/70 text-accent-green shadow-sm dark:bg-white/10">
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

            {/* How it works — automatic detection, transparent output */}
            <div className="rounded-2xl border border-accent-green/20 bg-accent-green/[0.04] p-4 dark:border-accent-green/15 dark:bg-accent-green/[0.06]">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#211A14] dark:text-white">
                <ScanSearch className="h-4 w-4 text-accent-green" />
                Automatic detection
              </div>
              <p className="mt-1.5 text-[12px] leading-snug text-muted">
                The AI detects the main subject and removes the background. Click <strong className="text-[#211A14] dark:text-white">"Remove background"</strong> and
                you get a transparent PNG — no manual masking.
              </p>
            </div>

            {/* Edge refinement — only once we have a cut-out */}
            {result && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-sm font-bold text-muted">
                    <SlidersHorizontal className="h-4 w-4" /> Edge
                    {refining && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-green" />}
                  </label>
                  <span className="font-mono text-[13px] font-bold text-accent-green">
                    {edge === 0 ? '0' : edge > 0 ? `+${edge}` : edge} px
                  </span>
                </div>
                <input
                  type="range" min={-12} max={12} step={1} value={edge}
                  onChange={(e) => setEdge(Number(e.target.value))}
                  className="custom-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E8E0D6] dark:bg-white/10 accent-accent-green outline-none"
                />
                <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-faint">
                  <span>← Shrink (remove halo)</span>
                  <span>Grow →</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 border-t border-[#E8E0D6]/50 p-4 dark:border-white/[0.06]">
            <Button onClick={handleRemove} disabled={busy} size="lg" className="rounded-2xl shadow-glow-soft">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
              {busy ? `${Math.round(progress * 100)}%` : 'Remove background'}
            </Button>
            <Button variant="secondary" onClick={handleDownload} disabled={!activeResult || busy} className="rounded-2xl">
              <Download className="h-5 w-5" /> Download
            </Button>
          </div>
        </div>

        {!simple && (
          <div className="flex items-start gap-3 rounded-2xl border border-accent-green/20 bg-gradient-to-r from-accent-green/5 to-transparent px-4 py-3 text-xs leading-relaxed text-muted dark:border-accent-green/10 dark:from-accent-green/[0.02]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-green" />
            <div><strong className="text-[#211A14] dark:text-white">Private:</strong> the AI model runs in your browser — the image is never sent to a server.</div>
          </div>
        )}
      </div>

      {/* ════ STAGE (right) ════ */}
      <div className="lg:col-start-2 lg:sticky lg:top-24">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-accent-green/25 bg-gradient-to-br from-accent-green/12 via-white to-accent-cyan/[0.07] p-5 dark:border-accent-green/15 dark:from-accent-green/10 dark:via-ink-950 dark:to-accent-cyan/[0.07] sm:p-6">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent-green/25 blur-[90px]" />

          {/* header: badge + before/after toggle */}
          <div className="relative mb-5 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-green shadow-sm backdrop-blur dark:bg-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-green" /> Live preview
            </span>
            {result && (
              <div className="flex gap-0.5 rounded-lg border border-[#E8E0D6]/70 bg-white/90 p-0.5 backdrop-blur dark:border-white/10 dark:bg-ink-950/90">
                {(['original', 'result'] as const).map((v) => (
                  <button
                    key={v} type="button" onClick={() => setView(v)}
                    className={cn(
                      'rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors',
                      view === v ? 'bg-accent-green/10 text-accent-green dark:bg-accent-green/20' : 'text-faint hover:text-[#211A14] dark:hover:text-white',
                    )}
                  >
                    {v === 'original' ? 'Original' : 'No background'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* image card — checkerboard marks the transparent areas */}
          <div className={cn('relative overflow-hidden rounded-3xl shadow-[0_40px_80px_-24px_rgba(33,26,20,0.35)] ring-1 ring-black/5', CHECKERBOARD)}>
            <div className="flex min-h-[260px] items-center justify-center p-4 sm:p-6">
              {activeResult && view === 'result' ? (
                <motion.img
                  key={activeResult.url} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  src={activeResult.url} alt="No background" className="max-h-[420px] rounded-lg object-contain"
                />
              ) : previewUrl ? (
                <img src={previewUrl} alt={file.name} className="max-h-[420px] rounded-lg object-contain" />
              ) : null}
            </div>
            {busy && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-black/55 backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Loader2 className="h-7 w-7 animate-spin text-white" />
                  <div>
                    <p className="text-sm font-bold text-white">Removing background… {Math.round(progress * 100)}%</p>
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
            <Pill label="PNG" value={activeResult ? formatBytes(activeResult.size) : '…'} accent />
          </div>
        </div>

        {/* Replace image */}
        <button
          type="button"
          onClick={handleReset}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#E8E0D6]/60 bg-white py-2.5 text-[12px] font-semibold text-faint transition-all duration-200 hover:border-accent-green/40 hover:text-accent-green dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:text-white"
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

function Pill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] shadow-sm backdrop-blur dark:bg-white/10">
      <span className="font-bold uppercase tracking-wider text-faint">{label}</span>
      <span className={cn('font-mono font-bold', accent ? 'text-accent-green' : 'text-[#211A14] dark:text-white')}>{value}</span>
    </span>
  )
}
