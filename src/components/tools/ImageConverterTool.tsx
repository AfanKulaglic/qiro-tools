import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { ArrowRight, Download, RotateCcw, Loader2, ShieldCheck, ImageIcon, Cloud } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { ImageDropzone } from './ImageDropzone'
import { useAuth } from '@/hooks/useAuth'
import { uploadAndSaveImage } from '@/services/imageService'
import { isImgBBConfigured } from '@/lib/imgbb'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/utils/storage'
import {
  convertImage,
  downloadBlob,
  replaceExtension,
  FORMAT_LABEL,
  type ConvertResult,
  type OutputFormat,
} from '@/utils/imageConvert'
import { formatBytes } from '@/utils/format'
import type { ImageConversionHistoryItem } from '@/types/qr'

const FORMAT_OPTIONS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPG' },
  { value: 'webp', label: 'WebP' },
]

export function ImageConverterTool() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [format, setFormat] = useState<OutputFormat>('webp')
  const [quality, setQuality] = useState(0.9)
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [result, setResult] = useState<ConvertResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedUrl, setSavedUrl] = useState<string | null>(null)
  const [, setHistory] = useLocalStorage<ImageConversionHistoryItem[]>(STORAGE_KEYS.images, [])
  const { user } = useAuth()

  // Manage object URLs to avoid leaks.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function selectFile(f: File) {
    setError(null)
    setResult(null)
    setSavedUrl(null)
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  async function handleConvert() {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const res = await convertImage(file, { format, quality, backgroundColor: bgColor })
      setResult(res)
      setHistory((prev) =>
        [
          {
            id: `${Date.now()}`,
            fileName: file.name,
            outputFormat: FORMAT_LABEL[format],
            createdAt: Date.now(),
          },
          ...prev,
        ].slice(0, 50),
      )
      toast.success('Image converted')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed.')
    } finally {
      setBusy(false)
    }
  }

  function handleDownload() {
    if (!result || !file) return
    downloadBlob(result.blob, replaceExtension(file.name, format))
  }

  async function handleSaveToCloud() {
    if (!result || !file) return
    if (!user) {
      toast.error('Sign in to save images to your cloud library.')
      return
    }
    if (!isImgBBConfigured) {
      toast.error('Add your ImgBB API key (VITE_IMGBB_API_KEY) to enable cloud saves.')
      return
    }
    setSaving(true)
    try {
      const saved = await uploadAndSaveImage(user.uid, result.blob, {
        name: replaceExtension(file.name, format),
        format: FORMAT_LABEL[format],
      })
      setSavedUrl(saved.url)
      toast.success('Saved to your cloud library')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (result) URL.revokeObjectURL(result.url)
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setSavedUrl(null)
  }

  const showQuality = format === 'jpeg' || format === 'webp'

  return (
    <div className="space-y-6">
      {!file ? (
        <ImageDropzone onFile={selectFile} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Source + settings */}
          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#211A14] dark:text-white">Source</h2>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Change
              </Button>
            </div>

            <div className="mb-5 overflow-hidden rounded-2xl border border-[#E8E0D6] dark:border-white/10 bg-[repeating-conic-gradient(#0000_0_25%,#80808014_0_50%)] bg-[length:20px_20px]">
              {previewUrl && (
                <img src={previewUrl} alt={file.name} className="mx-auto max-h-64 object-contain" />
              )}
            </div>

            <p className="truncate text-sm text-muted">{file.name}</p>
            <p className="text-xs text-faint">{formatBytes(file.size)}</p>

            <div className="mt-5 space-y-5">
              <Select
                label="Output format"
                options={FORMAT_OPTIONS}
                value={format}
                onChange={(e) => setFormat(e.target.value as OutputFormat)}
              />
              {showQuality && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted">
                    Quality — {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0.3}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#E8E0D6] dark:bg-white/10 accent-accent-blue"
                  />
                </div>
              )}
              {format === 'jpeg' && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted">
                    Background (for transparent PNGs)
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-[#E8E0D6] dark:border-white/12 p-1.5">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-8 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                    />
                    <span className="text-sm uppercase text-muted">{bgColor}</span>
                  </div>
                </div>
              )}

              <Button onClick={handleConvert} size="lg" className="w-full" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Converting…
                  </>
                ) : (
                  <>
                    Convert to {FORMAT_LABEL[format]} <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          </Card>

          {/* Result */}
          <Card className="flex flex-col p-6">
            <h2 className="mb-5 text-lg font-semibold text-[#211A14] dark:text-white">Result</h2>
            {result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-1 flex-col"
              >
                <div className="mb-4 overflow-hidden rounded-2xl border border-[#E8E0D6] dark:border-white/10 bg-[repeating-conic-gradient(#0000_0_25%,#80808014_0_50%)] bg-[length:20px_20px]">
                  <img src={result.url} alt="Converted" className="mx-auto max-h-64 object-contain" />
                </div>
                <div className="mb-5 grid grid-cols-3 gap-3 text-center">
                  <ResultStat label="Format" value={FORMAT_LABEL[format]} />
                  <ResultStat label="Size" value={formatBytes(result.size)} />
                  <ResultStat label="Dimensions" value={`${result.width}×${result.height}`} />
                </div>
                <div className="mt-auto space-y-2">
                  <Button onClick={handleDownload} size="lg" className="w-full">
                    <Download className="h-4 w-4" />
                    Download {FORMAT_LABEL[format]}
                  </Button>
                  <Button
                    onClick={handleSaveToCloud}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Cloud className="h-4 w-4" /> Save to cloud
                      </>
                    )}
                  </Button>
                  {savedUrl && (
                    <a
                      href={savedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate rounded-lg border border-accent-green/30 bg-accent-green/5 px-3 py-2 font-mono text-xs text-accent-green"
                    >
                      {savedUrl}
                    </a>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E8E0D6] dark:border-white/12 py-10 text-center">
                <ImageIcon className="mb-3 h-10 w-10 text-faint" />
                <p className="text-sm text-muted">Your converted image will appear here.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl border border-accent-green/25 bg-accent-green/5 px-5 py-4 text-sm text-muted">
        <ShieldCheck className="h-5 w-5 shrink-0 text-accent-green" />
        Conversion happens entirely in your browser. “Save to cloud” is optional and only
        uploads when you choose to.
      </div>
    </div>
  )
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E8E0D6] dark:border-white/10 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-[#211A14] dark:text-white">{value}</p>
    </div>
  )
}
