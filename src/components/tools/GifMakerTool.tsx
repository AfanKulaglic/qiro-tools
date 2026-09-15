import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Download, RotateCcw, Loader2, ShieldCheck, Gauge, FileType, Scissors, Wand2, Clapperboard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { VideoDropzone } from './VideoDropzone'
import { FreeLimitBanner } from './FreeLimitBanner'
import { useToolGate } from '@/hooks/useToolGate'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/utils/storage'
import { makeGif, gifFileName, downloadBlob, isFFmpegLoaded, type GifResult } from '@/utils/gifMaker'
import { formatBytes } from '@/utils/format'
import type { GifHistoryItem } from '@/types/qr'
import { cn } from '@/utils/cn'

const FPS_OPTIONS = [
  { value: '8', label: '8 fps', hint: 'Smallest file' },
  { value: '12', label: '12 fps', hint: 'Standard' },
  { value: '15', label: '15 fps', hint: 'Smooth' },
  { value: '24', label: '24 fps', hint: 'Very smooth' },
]
const WIDTH_OPTIONS = [
  { value: '240', label: '240 px', hint: 'Tiny' },
  { value: '320', label: '320 px', hint: 'Small' },
  { value: '480', label: '480 px', hint: 'Medium' },
  { value: '640', label: '640 px', hint: 'Large' },
]

/** Caps the default selection so a single click never renders a giant GIF. */
const DEFAULT_MAX_SEGMENT = 5

function fmtTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function GifMakerTool({ simple = false }: { simple?: boolean }) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(DEFAULT_MAX_SEGMENT)
  const [fps, setFps] = useState('12')
  const [width, setWidth] = useState('480')
  const [result, setResult] = useState<GifResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [engineLoading, setEngineLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [, setHistory] = useLocalStorage<GifHistoryItem[]>(STORAGE_KEYS.gifs, [])
  const { gate, lockedForAnon, promptSignIn } = useToolGate('gif')

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  function selectFile(f: File) {
    setError(null)
    setResult(null)
    setStart(0)
    setEnd(DEFAULT_MAX_SEGMENT)
    setDuration(0)
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  // Stale result whenever the segment / settings change.
  useEffect(() => {
    setResult((prev) => { if (prev) URL.revokeObjectURL(prev.url); return null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, fps, width])

  const segment = Math.max(0, end - start)

  async function handleMake() {
    if (!file || busy || segment <= 0) return
    setBusy(true)
    setError(null)
    setProgress(0)
    setEngineLoading(!isFFmpegLoaded())
    try {
      const res = await makeGif(file, { start, duration: segment, fps: Number(fps), width: Number(width) }, setProgress)
      setResult((prev) => { if (prev) URL.revokeObjectURL(prev.url); return res })
      recordHistory()
      toast.success('GIF created')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GIF creation failed.')
    } finally {
      setBusy(false)
      setEngineLoading(false)
    }
  }

  function recordHistory() {
    if (!file) return
    setHistory((prev) => [
      { id: `${Date.now()}`, fileName: gifFileName(file.name), createdAt: Date.now() },
      ...prev.filter((h) => h.fileName !== gifFileName(file.name)),
    ].slice(0, 50))
  }

  function handleDownload() {
    if (!result || !file) return
    if (!gate()) return
    downloadBlob(result.blob, gifFileName(file.name))
    toast.success('GIF downloaded')
  }

  function handleReset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (result) URL.revokeObjectURL(result.url)
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setDuration(0)
  }

  function onMeta() {
    const v = videoRef.current
    if (!v || !isFinite(v.duration)) return
    setDuration(v.duration)
    setEnd(Math.min(v.duration, DEFAULT_MAX_SEGMENT))
  }

  // Keep start ≤ end and both within [0, duration].
  function updateStart(val: number) {
    const s = Math.max(0, Math.min(val, end - 0.1))
    setStart(s)
    if (videoRef.current) videoRef.current.currentTime = s
  }
  function updateEnd(val: number) {
    setEnd(Math.min(duration || val, Math.max(val, start + 0.1)))
  }

  /* ─── Start screen ─── */
  if (!file) {
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-stretch xl:gap-7">
        <div className="flex flex-col rounded-[1.75rem] border border-accent-purple/20 bg-gradient-to-br from-accent-purple/12 via-white to-accent-blue/[0.07] p-6 dark:border-accent-purple/15 dark:from-accent-purple/10 dark:via-ink-950 dark:to-accent-blue/[0.07]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/10 text-accent-purple ring-1 ring-inset ring-accent-purple/25">
              <Clapperboard className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-base font-extrabold text-[#211A14] dark:text-white">GIF maker</p>
              <p className="mt-0.5 text-[12px] text-faint">Add a video and trim a clip for the GIF</p>
            </div>
          </div>

          <div className="mt-auto space-y-2 pt-6">
            {[
              { Icon: ShieldCheck, t: 'Private — all in your browser' },
              { Icon: Scissors, t: 'Trim the exact clip' },
              { Icon: Download, t: 'Download the GIF instantly, no signup' },
            ].map(({ Icon, t }) => (
              <div key={t} className="flex items-center gap-2.5 text-[12.5px] text-muted">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/70 text-accent-purple shadow-sm dark:bg-white/10">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>

        <VideoDropzone onFile={selectFile} />
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
          <FreeLimitBanner onSignIn={promptSignIn} message="You've used your free GIF. Sign in for unlimited downloads." />
        )}

        <div className={cardFlat}>
          <div className="space-y-5 p-5">
            {/* Source file */}
            <div className="flex items-center gap-2 rounded-2xl border border-[#E8E0D6] bg-[#211A14]/[0.015] px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.01]">
              <FileType className="h-4 w-4 shrink-0 text-faint" />
              <span className="truncate text-[13px] font-semibold text-[#211A14] dark:text-white">{file.name}</span>
              <span className="ml-auto shrink-0 font-mono text-[11px] font-bold text-faint">{formatBytes(file.size)}</span>
            </div>

            {/* Trim */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-sm font-bold text-muted">
                  <Scissors className="h-4 w-4" /> Clip
                </label>
                <span className="font-mono text-[13px] font-bold text-accent-purple dark:text-accent-cyan">
                  {fmtTime(start)} – {fmtTime(end)} <span className="text-[11px] text-faint">({segment.toFixed(1)}s)</span>
                </span>
              </div>
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold text-faint">Start</span>
                  <input
                    type="range" min={0} max={duration || 0} step={0.1} value={start}
                    onChange={(e) => updateStart(Number(e.target.value))}
                    className="custom-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E8E0D6] dark:bg-white/10 accent-accent-purple outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold text-faint">End</span>
                  <input
                    type="range" min={0} max={duration || 0} step={0.1} value={end}
                    onChange={(e) => updateEnd(Number(e.target.value))}
                    className="custom-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E8E0D6] dark:bg-white/10 accent-accent-purple outline-none"
                  />
                </label>
              </div>
              {segment > 15 && (
                <p className="mt-2 text-[11px] leading-snug text-amber-600 dark:text-amber-500">
                  Long clips make large GIFs and slower processing.
                </p>
              )}
            </div>

            {/* fps + width */}
            <div className="grid grid-cols-2 gap-3">
              <Dropdown label="Speed" accent="purple" options={FPS_OPTIONS} value={fps} onChange={setFps} />
              <Dropdown label="Width" accent="purple" options={WIDTH_OPTIONS} value={width} onChange={setWidth} />
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 border-t border-[#E8E0D6]/50 p-4 dark:border-white/[0.06]">
            <Button onClick={handleMake} disabled={busy || segment <= 0} size="lg" className="rounded-2xl shadow-glow-soft">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
              {busy ? `${Math.round(progress * 100)}%` : 'Make GIF'}
            </Button>
            <Button variant="secondary" onClick={handleDownload} disabled={!result || busy} className="rounded-2xl">
              <Download className="h-5 w-5" /> Download
            </Button>
          </div>
        </div>

        {!simple && (
          <div className="flex items-start gap-3 rounded-2xl border border-accent-green/20 bg-gradient-to-r from-accent-green/5 to-transparent px-4 py-3 text-xs leading-relaxed text-muted dark:border-accent-green/10 dark:from-accent-green/[0.02]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-green" />
            <div><strong className="text-[#211A14] dark:text-white">Private:</strong> the GIF is made in your browser — the video is never sent to a server.</div>
          </div>
        )}
      </div>

      {/* ════ STAGE (right) ════ */}
      <div className="lg:col-start-2 lg:sticky lg:top-24">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-accent-purple/20 bg-gradient-to-br from-accent-purple/12 via-white to-accent-blue/[0.07] p-5 dark:border-accent-purple/15 dark:from-accent-purple/10 dark:via-ink-950 dark:to-accent-blue/[0.07] sm:p-6">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent-purple/25 blur-[90px]" />

          <div className="relative mb-5 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-purple shadow-sm backdrop-blur dark:bg-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-green" /> {result ? 'GIF result' : 'Source (video)'}
            </span>
            {duration > 0 && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-faint">
                <Gauge className="h-3 w-3" /> {fmtTime(duration)}
              </span>
            )}
          </div>

          {/* media card */}
          <div className="relative overflow-hidden rounded-3xl bg-[repeating-conic-gradient(#0000_0_25%,#80808014_0_50%)] bg-[length:20px_20px] shadow-[0_40px_80px_-24px_rgba(33,26,20,0.35)] ring-1 ring-black/5">
            <div className="flex min-h-[260px] items-center justify-center bg-black/[0.02] p-4 sm:p-6">
              {result ? (
                <motion.img
                  key={result.url} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  src={result.url} alt="GIF" className="max-h-[420px] rounded-lg object-contain"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={previewUrl ?? undefined}
                  controls
                  onLoadedMetadata={onMeta}
                  className="max-h-[420px] w-full rounded-lg object-contain"
                />
              )}
            </div>
            {busy && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-black/55 backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Loader2 className="h-7 w-7 animate-spin text-white" />
                  <div>
                    <p className="text-sm font-bold text-white">
                      {engineLoading ? 'Loading engine…' : `Making GIF… ${Math.round(progress * 100)}%`}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/60">
                      {engineLoading ? 'First time downloads ~31 MB (once)' : 'Everything happens in your browser'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* meta */}
          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            <Pill label="Clip" value={`${segment.toFixed(1)}s`} />
            <Pill label="Speed" value={`${fps} fps`} />
            <Pill label="Width" value={`${width}px`} accent />
            {result && <Pill label="GIF" value={formatBytes(result.size)} accent />}
          </div>
        </div>

        {/* Replace video */}
        <button
          type="button"
          onClick={handleReset}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#E8E0D6]/60 bg-white py-2.5 text-[12px] font-semibold text-faint transition-all duration-200 hover:border-accent-purple/40 hover:text-accent-purple dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Replace video
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
      <span className={cn('font-mono font-bold', accent ? 'text-accent-purple dark:text-accent-cyan' : 'text-[#211A14] dark:text-white')}>{value}</span>
    </span>
  )
}
