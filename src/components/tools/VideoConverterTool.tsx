import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Download, RotateCcw, Loader2, ShieldCheck, Sliders, FileType, Maximize2, ArrowRight, Wand2, Film } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { VideoDropzone } from './VideoDropzone'
import { FreeLimitBanner } from './FreeLimitBanner'
import { useToolGate } from '@/hooks/useToolGate'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/utils/storage'
import {
  convertVideo,
  downloadBlob,
  replaceExtension,
  isFFmpegLoaded,
  canPlayInBrowser,
  FORMAT_LABEL,
  type VideoConvertResult,
  type VideoOutputFormat,
} from '@/utils/videoConvert'
import { formatBytes } from '@/utils/format'
import type { VideoConversionHistoryItem } from '@/types/qr'
import { cn } from '@/utils/cn'

const FORMATS: { value: VideoOutputFormat; name: string; desc: string }[] = [
  { value: 'mp4', name: 'MP4', desc: 'Univerzalno, H.264' },
  { value: 'webm', name: 'WebM', desc: 'Small size, for web' },
  { value: 'mov', name: 'MOV', desc: 'QuickTime / Apple' },
  { value: 'mkv', name: 'MKV', desc: 'Matroska, high quality' },
  { value: 'avi', name: 'AVI', desc: 'Legacy, wide support' },
  { value: '3gp', name: '3GP', desc: 'Mobile, H.264 baseline' },
  { value: 'ts', name: 'TS', desc: 'MPEG-TS, streaming' },
  { value: 'flv', name: 'FLV', desc: 'Flash legacy' },
  { value: 'gif', name: 'GIF', desc: 'Animation, no audio' },
  { value: 'mp3', name: 'MP3', desc: 'Extract audio only' },
]
const TARGET_OPTIONS = FORMATS.map((f) => ({ value: f.value, label: f.name, hint: f.desc }))
const SOURCE_OPTIONS = [
  { value: 'auto', label: 'Auto (detect)' },
  { value: 'mp4', label: 'MP4' },
  { value: 'mov', label: 'MOV' },
  { value: 'webm', label: 'WebM' },
  { value: 'avi', label: 'AVI' },
  { value: 'mkv', label: 'MKV' },
]

function mimeToFmt(file: File): string {
  const ext = file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase()
  if (ext && SOURCE_OPTIONS.some((o) => o.value === ext)) return ext
  return 'auto'
}

const QUALITY_MARKS = [
  { value: 0.3, label: 'Min' },
  { value: 0.6, label: 'Dobra' },
  { value: 0.8, label: 'Visoka' },
  { value: 1, label: 'Maks' },
]

const SCALE_MARKS = [0.25, 0.5, 0.75, 1]

export function VideoConverterTool({ simple = false }: { simple?: boolean }) {
  const [file, setFile] = useState<File | null>(null)
  const [srcDims, setSrcDims] = useState<{ w: number; h: number } | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [format, setFormat] = useState<VideoOutputFormat>('mp4')
  const [sourceFmt, setSourceFmt] = useState('auto')
  const [quality, setQuality] = useState(0.8)
  const [scale, setScale] = useState(1)
  const [result, setResult] = useState<VideoConvertResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [engineLoading, setEngineLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compareView, setCompareView] = useState<'original' | 'converted'>('converted')
  const [, setHistory] = useLocalStorage<VideoConversionHistoryItem[]>(STORAGE_KEYS.videos, [])
  const { gate, lockedForAnon, promptSignIn } = useToolGate('video')

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  function selectFile(f: File) {
    setError(null)
    setResult(null)
    setScale(1)
    setCompareView('converted')
    setFile(f)
    setSourceFmt(mimeToFmt(f))
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
    setSrcDims(null)
  }

  // A converted result is stale the moment any setting changes — clear it so the
  // user re-runs the (heavy) transcode rather than downloading the wrong output.
  useEffect(() => {
    setResult((prev) => { if (prev) URL.revokeObjectURL(prev.url); return null })
    setCompareView('original')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, quality, scale])

  async function handleConvert() {
    if (!file || busy) return
    setBusy(true)
    setError(null)
    setProgress(0)
    setEngineLoading(!isFFmpegLoaded())
    try {
      const res = await convertVideo(file, { format, quality, scale }, setProgress)
      setResult((prev) => { if (prev) URL.revokeObjectURL(prev.url); return res })
      setCompareView('converted')
      recordHistory()
      toast.success('Video converted')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Konverzija nije uspjela.')
    } finally {
      setBusy(false)
      setEngineLoading(false)
    }
  }

  function recordHistory() {
    if (!file) return
    setHistory((prev) => [
      { id: `${Date.now()}`, fileName: file.name, outputFormat: FORMAT_LABEL[format], createdAt: Date.now() },
      ...prev.filter((h) => !(h.fileName === file.name && h.outputFormat === FORMAT_LABEL[format])),
    ].slice(0, 50))
  }

  function handleDownload() {
    if (!result || !file) return
    if (!gate()) return
    downloadBlob(result.blob, replaceExtension(file.name, format))
    toast.success('Video downloaded')
  }

  function handleReset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (result) URL.revokeObjectURL(result.url)
    setFile(null)
    setPreviewUrl(null)
    setSrcDims(null)
    setResult(null)
    setError(null)
    setScale(1)
    setSourceFmt('auto')
    setCompareView('converted')
  }

  const showQuality = format !== 'gif'
  const showScale = format !== 'mp3'
  const isAudioOnly = format === 'mp3'
  const isGif = format === 'gif'
  // Whether the converted output can be shown inline (video player or image).
  const convertedViewable = isGif || canPlayInBrowser(format)
  const savings = file && result ? ((file.size - result.size) / file.size) * 100 : 0
  const targetDims = srcDims && format !== 'mp3'
    ? { w: Math.max(1, Math.round(srcDims.w * scale)), h: Math.max(1, Math.round(srcDims.h * scale)) }
    : null

  /* ── From → To format picker (shared by start screen + controls) ── */
  const formatRow = (
    <div className="flex items-end gap-2.5">
      <div className="min-w-0 flex-1">
        <Dropdown label="From format" accent="purple" options={SOURCE_OPTIONS} value={sourceFmt} onChange={setSourceFmt} />
      </div>
      <ArrowRight className="mb-3 h-5 w-5 shrink-0 text-accent-purple" />
      <div className="min-w-0 flex-1">
        <Dropdown label="To format" accent="purple" options={TARGET_OPTIONS} value={format} onChange={(v) => setFormat(v as VideoOutputFormat)} />
      </div>
    </div>
  )

  /* ─── Start screen — pick the target format FIRST, then add the video ─── */
  if (!file) {
    const activeName = FORMATS.find((f) => f.value === format)?.name
    const sourceName = SOURCE_OPTIONS.find((o) => o.value === sourceFmt)?.label
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-stretch xl:gap-7">
        {/* LEFT — from → to + why */}
        <div className="flex flex-col rounded-[1.75rem] border border-accent-purple/20 bg-gradient-to-br from-accent-purple/12 via-white to-accent-blue/[0.07] p-6 dark:border-accent-purple/15 dark:from-accent-purple/10 dark:via-ink-950 dark:to-accent-blue/[0.07]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/10 text-accent-purple ring-1 ring-inset ring-accent-purple/25">
              <Film className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-base font-extrabold text-[#211A14] dark:text-white">Video converter</p>
              <p className="mt-0.5 text-[12px] text-faint">From which format to which — then add the video</p>
            </div>
          </div>

          <div className="mt-5">{formatRow}</div>
          <p className="mt-3 text-[12.5px] text-muted">
            Selected:{' '}
            <strong className="text-accent-purple dark:text-accent-cyan">{sourceName} → {activeName}</strong>
          </p>

          {/* reassurance pinned to the bottom so the panel fills the height */}
          <div className="mt-auto space-y-2 pt-6">
            {[
              { Icon: ShieldCheck, t: 'Private — all in your browser' },
              { Icon: Maximize2, t: 'Resize and adjust quality' },
              { Icon: Download, t: 'Download instantly, no signup' },
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

        {/* RIGHT — big dropzone fills width + height */}
        <VideoDropzone onFile={selectFile} />
      </div>
    )
  }

  const cardFlat =
    'rounded-3xl border border-[#E8E0D6]/70 bg-white shadow-[0_10px_40px_-24px_rgba(33,26,20,0.25)] dark:border-white/[0.08] dark:bg-white/[0.03]'

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start xl:gap-7">
      {/* ════ CONSOLE (left) — controls ════ */}
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

            {/* From → To format */}
            {formatRow}

            {/* Quality */}
            {showQuality ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-sm font-bold text-muted">
                    <Sliders className="h-4 w-4" /> Quality
                  </label>
                  <span className="font-mono text-[13px] font-bold text-accent-purple dark:text-accent-cyan">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range" min={0.3} max={1} step={0.05} value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="custom-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E8E0D6] dark:bg-white/10 accent-accent-purple outline-none"
                />
                <div className="mt-2 flex justify-between px-0.5">
                  {QUALITY_MARKS.map((m) => (
                    <button
                      key={m.value} type="button" onClick={() => setQuality(m.value)}
                      className={cn('text-[10px] font-semibold transition-colors', quality >= m.value ? 'text-accent-purple dark:text-accent-cyan' : 'text-faint')}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-[#E8E0D6]/50 bg-[#211A14]/[0.015] px-3.5 py-3 text-[12px] leading-snug text-muted dark:border-white/[0.06] dark:bg-white/[0.01]">
                The GIF renders at 12 fps — adjust quality with the size below.
              </p>
            )}

            {/* Resize (scale) */}
            {showScale ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-sm font-bold text-muted">
                    <Maximize2 className="h-4 w-4" /> Size
                  </label>
                  <span className="font-mono text-[13px] font-bold text-accent-purple dark:text-accent-cyan">
                    {Math.round(scale * 100)}%
                    {targetDims && <span className="ml-1.5 text-[11px] font-semibold text-faint">{targetDims.w}×{targetDims.h}</span>}
                  </span>
                </div>
                <input
                  type="range" min={0.1} max={1} step={0.05} value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="custom-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E8E0D6] dark:bg-white/10 accent-accent-purple outline-none"
                />
                <div className="mt-2 flex justify-between px-0.5">
                  {SCALE_MARKS.map((m) => (
                    <button
                      key={m} type="button" onClick={() => setScale(m)}
                      className={cn('text-[10px] font-semibold transition-colors', scale === m ? 'text-accent-purple dark:text-accent-cyan' : 'text-faint')}
                    >
                      {Math.round(m * 100)}%
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-[#E8E0D6]/50 bg-[#211A14]/[0.015] px-3.5 py-3 text-[12px] leading-snug text-muted dark:border-white/[0.06] dark:bg-white/[0.01]">
                MP3 extracts audio only — no image and no size settings.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 border-t border-[#E8E0D6]/50 p-4 dark:border-white/[0.06]">
            <Button onClick={handleConvert} disabled={busy} size="lg" className="rounded-2xl shadow-glow-soft">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
              {busy ? `${Math.round(progress * 100)}%` : 'Convert'}
            </Button>
            <Button variant="secondary" onClick={handleDownload} disabled={!result || busy} className="rounded-2xl">
              <Download className="h-5 w-5" /> Download
            </Button>
          </div>
        </div>

        {!simple && (
          <div className="flex items-start gap-3 rounded-2xl border border-accent-green/20 bg-gradient-to-r from-accent-green/5 to-transparent px-4 py-3 text-xs leading-relaxed text-muted dark:border-accent-green/10 dark:from-accent-green/[0.02]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-green" />
            <div><strong className="text-[#211A14] dark:text-white">Private:</strong> everything is converted in your browser — the video is never sent to a server.</div>
          </div>
        )}
      </div>

      {/* ════ STAGE (right) — big before/after preview ════ */}
      <div className="lg:col-start-2 lg:sticky lg:top-24">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-accent-purple/20 bg-gradient-to-br from-accent-purple/12 via-white to-accent-blue/[0.07] p-5 dark:border-accent-purple/15 dark:from-accent-purple/10 dark:via-ink-950 dark:to-accent-blue/[0.07] sm:p-6">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent-purple/25 blur-[90px]" />

          {/* header: badge + before/after toggle */}
          <div className="relative mb-5 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-purple shadow-sm backdrop-blur dark:bg-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-green" /> Live preview
            </span>
            {result && !isAudioOnly && convertedViewable && (
              <div className="flex gap-0.5 rounded-lg border border-[#E8E0D6]/70 bg-white/90 p-0.5 backdrop-blur dark:border-white/10 dark:bg-ink-950/90">
                {(['original', 'converted'] as const).map((v) => (
                  <button
                    key={v} type="button" onClick={() => setCompareView(v)}
                    className={cn(
                      'rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors',
                      compareView === v ? 'bg-accent-purple/10 text-accent-purple dark:bg-accent-purple/20' : 'text-faint hover:text-[#211A14] dark:hover:text-white',
                    )}
                  >
                    {v === 'original' ? 'Original' : 'New'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* floating media card */}
          <div className="relative overflow-hidden rounded-3xl bg-[#0b0b0e] shadow-[0_40px_80px_-24px_rgba(33,26,20,0.35)] ring-1 ring-black/5">
            <div className="flex min-h-[260px] items-center justify-center p-4 sm:p-6">
              {result && (compareView === 'converted' || !convertedViewable) ? (
                isAudioOnly ? (
                  <div className="flex w-full flex-col items-center gap-4 py-8">
                    <span className="grid h-16 w-16 place-items-center rounded-2xl bg-accent-purple/15 text-accent-purple">
                      <Film className="h-8 w-8" />
                    </span>
                    <audio key="audio" controls src={result.url} className="w-full max-w-md" />
                  </div>
                ) : isGif ? (
                  <motion.img
                    key="gif" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    src={result.url} alt="Converted GIF" className="max-h-[420px] w-full rounded-lg object-contain"
                  />
                ) : convertedViewable ? (
                  <motion.video
                    key="converted" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    src={result.url} controls className="max-h-[420px] w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex w-full flex-col items-center gap-3 px-6 py-10 text-center text-white">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-purple/20 text-accent-purple">
                      <Film className="h-7 w-7" />
                    </span>
                    <p className="text-sm font-bold">{FORMAT_LABEL[format]} is ready — {formatBytes(result.size)}</p>
                    <p className="max-w-xs text-[12px] leading-snug text-white/60">
                      Browsers can’t play {FORMAT_LABEL[format]} inline. Download the file to watch it.
                    </p>
                  </div>
                )
              ) : previewUrl ? (
                <video
                  key="original"
                  src={previewUrl}
                  controls
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget
                    if (v.videoWidth) setSrcDims({ w: v.videoWidth, h: v.videoHeight })
                  }}
                  className="max-h-[420px] w-full rounded-lg object-contain"
                />
              ) : null}
            </div>
            {busy && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-black/55 backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Loader2 className="h-7 w-7 animate-spin text-white" />
                  <div>
                    <p className="text-sm font-bold text-white">
                      {engineLoading ? 'Loading video engine…' : `Converting… ${Math.round(progress * 100)}%`}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/60">
                      {engineLoading ? 'First time downloads ~31 MB (once)' : 'Everything happens in your browser'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* meta: original → converted + savings */}
          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            <Pill label="Original" value={formatBytes(file.size)} />
            <span className="text-faint">→</span>
            <Pill label={FORMAT_LABEL[format]} value={result ? formatBytes(result.size) : '…'} accent />
            {result && savings !== 0 && (
              <span className={cn(
                'ml-auto rounded-full px-3 py-1 text-[12px] font-extrabold',
                savings > 0 ? 'bg-accent-green/15 text-accent-green' : 'bg-red-400/15 text-red-500',
              )}>
                {savings > 0 ? `−${savings.toFixed(0)}% smaller` : `+${Math.abs(savings).toFixed(0)}% larger`}
              </span>
            )}
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
