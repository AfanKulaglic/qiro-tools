import { useMemo, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { Copy, RotateCcw, FileImage, FileCode } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { QRPreview } from './QRPreview'
import { useClipboard } from '@/hooks/useClipboard'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/utils/storage'
import type { QRContentType, QRErrorLevel, QRHistoryItem, QRSettings } from '@/types/qr'
import { cn } from '@/utils/cn'

const TYPE_OPTIONS: { value: QRContentType; label: string }[] = [
  { value: 'url', label: 'URL' },
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'wifi', label: 'WiFi' },
]

const LEVEL_OPTIONS: { value: QRErrorLevel; label: string }[] = [
  { value: 'L', label: 'Low (L)' },
  { value: 'M', label: 'Medium (M)' },
  { value: 'Q', label: 'Quartile (Q)' },
  { value: 'H', label: 'High (H)' },
]

const PLACEHOLDERS: Record<QRContentType, string> = {
  url: 'https://example.com',
  text: 'Any text you want to encode…',
  email: 'hello@example.com',
  phone: '+1 555 123 4567',
  wifi: 'NetworkName,password (SSID,password)',
}

const DEFAULTS: QRSettings = {
  value: 'https://linkqr.tools',
  type: 'url',
  fgColor: '#0B1020',
  bgColor: '#FFFFFF',
  transparent: false,
  size: 320,
  level: 'M',
  margin: 2,
}

/** Encode raw textarea content into the proper QR payload for its type. */
function encodeValue(type: QRContentType, raw: string): string {
  const v = raw.trim()
  if (!v) return ''
  switch (type) {
    case 'email':
      return `mailto:${v}`
    case 'phone':
      return `tel:${v.replace(/\s+/g, '')}`
    case 'wifi': {
      const [ssid, password = ''] = v.split(',').map((s) => s.trim())
      return `WIFI:T:WPA;S:${ssid};P:${password};;`
    }
    default:
      return v
  }
}

export function QRGeneratorTool() {
  const [raw, setRaw] = useState('https://linkqr.tools')
  const [type, setType] = useState<QRContentType>('url')
  const [fgColor, setFg] = useState(DEFAULTS.fgColor)
  const [bgColor, setBg] = useState(DEFAULTS.bgColor)
  const [transparent, setTransparent] = useState(false)
  const [size, setSize] = useState(DEFAULTS.size)
  const [level, setLevel] = useState<QRErrorLevel>('M')
  const [margin, setMargin] = useState(2)

  const previewRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<HTMLDivElement>(null)
  const { copy } = useClipboard()
  const [, setHistory] = useLocalStorage<QRHistoryItem[]>(STORAGE_KEYS.qr, [])

  const settings: QRSettings = useMemo(
    () => ({
      value: encodeValue(type, raw),
      type,
      fgColor,
      bgColor,
      transparent,
      size,
      level,
      margin,
    }),
    [type, raw, fgColor, bgColor, transparent, size, level, margin],
  )

  function recordHistory() {
    if (!raw.trim()) return
    setHistory((prev) =>
      [
        { id: `${Date.now()}`, content: raw.trim(), type, createdAt: Date.now() },
        ...prev.filter((h) => !(h.content === raw.trim() && h.type === type)),
      ].slice(0, 50),
    )
  }

  function handleDownloadPNG() {
    const canvas = previewRef.current?.querySelector('canvas')
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'qr-code.png'
    a.click()
    recordHistory()
    toast.success('PNG downloaded')
  }

  function handleDownloadSVG() {
    const svg = svgRef.current?.querySelector('svg')
    if (!svg) return
    const data = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([data], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qr-code.svg'
    a.click()
    URL.revokeObjectURL(url)
    recordHistory()
    toast.success('SVG downloaded')
  }

  async function handleCopyContent() {
    const ok = await copy(settings.value)
    toast[ok ? 'success' : 'error'](ok ? 'Content copied' : 'Could not copy')
  }

  function handleReset() {
    setRaw('https://linkqr.tools')
    setType('url')
    setFg(DEFAULTS.fgColor)
    setBg(DEFAULTS.bgColor)
    setTransparent(false)
    setSize(DEFAULTS.size)
    setLevel('M')
    setMargin(2)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Settings */}
      <Card className="p-6">
        <h2 className="mb-5 text-lg font-semibold text-[#211A14] dark:text-white">QR settings</h2>
        <div className="space-y-5">
          <Select
            label="Content type"
            options={TYPE_OPTIONS}
            value={type}
            onChange={(e) => setType(e.target.value as QRContentType)}
          />
          <Textarea
            label="Content"
            placeholder={PLACEHOLDERS[type]}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            hint={type === 'wifi' ? 'Format: SSID,password' : undefined}
          />

          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Foreground" value={fgColor} onChange={setFg} />
            <ColorField
              label="Background"
              value={bgColor}
              onChange={setBg}
              disabled={transparent}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
            <input
              type="checkbox"
              checked={transparent}
              onChange={(e) => setTransparent(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-transparent accent-accent-blue"
            />
            Transparent background
          </label>

          <RangeField
            label={`Size — ${size}px`}
            min={120}
            max={512}
            step={8}
            value={size}
            onChange={setSize}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Error correction"
              options={LEVEL_OPTIONS}
              value={level}
              onChange={(e) => setLevel(e.target.value as QRErrorLevel)}
            />
            <Select
              label="Margin"
              options={[
                { value: '0', label: 'None' },
                { value: '2', label: 'Small' },
                { value: '4', label: 'Medium' },
                { value: '6', label: 'Large' },
              ]}
              value={String(margin)}
              onChange={(e) => setMargin(Number(e.target.value))}
            />
          </div>

          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </Card>

      {/* Preview */}
      <Card className="flex flex-col p-6">
        <h2 className="mb-5 text-lg font-semibold text-[#211A14] dark:text-white">Preview</h2>
        <QRPreview ref={previewRef} settings={settings} />

        {/* hidden SVG for export */}
        <div ref={svgRef} className="hidden">
          <QRCodeSVG
            value={settings.value || 'https://linkqr.tools'}
            size={settings.size}
            level={settings.level}
            marginSize={settings.margin}
            fgColor={settings.fgColor}
            bgColor={settings.transparent ? 'transparent' : settings.bgColor}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button onClick={handleDownloadPNG}>
            <FileImage className="h-4 w-4" />
            PNG
          </Button>
          <Button variant="secondary" onClick={handleDownloadSVG}>
            <FileCode className="h-4 w-4" />
            SVG
          </Button>
          <Button variant="outline" onClick={handleCopyContent} className="col-span-2">
            <Copy className="h-4 w-4" />
            Copy content
          </Button>
        </div>
      </Card>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className={cn(disabled && 'opacity-50')}>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-[#E8E0D6] dark:border-white/12 p-1.5">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
        />
        <span className="text-sm uppercase text-muted">{value}</span>
      </div>
    </div>
  )
}

function RangeField({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#E8E0D6] dark:bg-white/10 accent-accent-blue"
      />
    </div>
  )
}
