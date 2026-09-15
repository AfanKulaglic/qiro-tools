import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Copy, RotateCcw, FileCode, Check, Palette,
  X, Loader2, Download,
  Type, Settings2, Image as ImageIcon, Eye,
  Link2, Mail, Phone, Wifi, ArrowLeftRight, AlertTriangle, ImagePlus,
  Frame, Scan, RectangleHorizontal, Square, Ban, MoveUpRight, ChevronDown,
  Circle, Minus, Heading1, Pill, MessageCircle, MousePointerClick, Ticket,
  ScanLine, PanelTop, PanelLeft, FileText, Layers, MessageSquareText, Contact, Calendar, MapPin, Bitcoin
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { QRPreview } from './QRPreview'
import { FreeLimitBanner } from './FreeLimitBanner'
import { useClipboard } from '@/hooks/useClipboard'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAuth } from '@/hooks/useAuth'
import { useToolGate } from '@/hooks/useToolGate'
import { STORAGE_KEYS } from '@/utils/storage'
import { uploadAndSaveQRLogo, listQRLogos, deleteQRLogoRecord, type QRLogo } from '@/services/imageService'
import { isFirebaseConfigured } from '@/lib/firebase'
import { isImgBBConfigured } from '@/lib/imgbb'
import type { QRContentType, QRErrorLevel, QRFrameStyle, QRHistoryItem, QRLogoPosition, QRSettings } from '@/types/qr'
import { buildFramedSvg, logoSvgLayer } from '@/utils/qrFrame'
import { cn } from '@/utils/cn'

/* ─── Constants ─── */

const TYPE_OPTIONS: { value: QRContentType; label: string; icon: typeof Eye }[] = [
  { value: 'url', label: 'URL', icon: Link2 },
  { value: 'text', label: 'Text', icon: Type },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'sms', label: 'SMS', icon: MessageSquareText },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'vcard', label: 'Contact', icon: Contact },
  { value: 'event', label: 'Event', icon: Calendar },
  { value: 'location', label: 'Location', icon: MapPin },
  { value: 'crypto', label: 'Crypto', icon: Bitcoin },
  { value: 'wifi', label: 'WiFi', icon: Wifi },
]

const LEVEL_OPTIONS: { value: QRErrorLevel; label: string }[] = [
  { value: 'L', label: 'Low (Fast scanning)' },
  { value: 'M', label: 'Medium (Standard)' },
  { value: 'Q', label: 'High (Better resistance)' },
  { value: 'H', label: 'Maximum (For logo)' },
]

const WIFI_SECURITY: { value: string; label: string }[] = [
  { value: 'WPA', label: 'WPA / WPA2' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'No password' },
]

const PLACEHOLDERS: Record<QRContentType, string> = {
  url: 'https://www.example.com',
  text: 'Enter any text...',
  email: 'ime@domena.com',
  phone: '+387 61 123 456',
  sms: '+387 61 123 456',
  whatsapp: '38761123456 (broj, bez razmaka)',
  vcard: '',
  event: 'Naslov događaja',
  location: '',
  crypto: '',
  wifi: '',
}

const DEFAULTS: QRSettings = {
  value: 'https://linkqr.tools',
  type: 'url',
  fgColor: '#18181B',
  bgColor: '#FFFFFF',
  transparent: false,
  size: 320,
  level: 'M',
  margin: 2,
}

const BRAND_PRESETS = [
  { label: 'Charcoal', hex: '#18181B' },
  { label: 'Cobalt', hex: '#2781EC' },
  { label: 'Emerald', hex: '#15803D' },
  { label: 'Violet', hex: '#6D28D9' },
  { label: 'Ruby', hex: '#B91C1C' },
]

const TEXT_FRAMES: QRFrameStyle[] = ['label', 'banner', 'header', 'pill', 'bubble', 'button', 'topbar', 'ticket', 'flyer']

const FRAME_OPTIONS: { value: QRFrameStyle; label: string; icon: typeof Eye; hint: string }[] = [
  { value: 'none', label: 'None', icon: Ban, hint: 'Just QR code, no frame.' },
  { value: 'card', label: 'Card', icon: Square, hint: 'QR on a white rounded card.' },
  { value: 'label', label: 'Label', icon: Scan, hint: 'Card + label below (e.g. "Scan me").' },
  { value: 'banner', label: 'Banner', icon: RectangleHorizontal, hint: 'Card + label in a colored banner.' },
  { value: 'circle', label: 'Circle', icon: Circle, hint: 'QR inside a white circle sticker.' },
  { value: 'minimal', label: 'Minimal', icon: Minus, hint: 'Thin accent border around the QR.' },
  { value: 'header', label: 'Header', icon: Heading1, hint: 'Title text above the QR.' },
  { value: 'pill', label: 'Pill', icon: Pill, hint: 'Small pill-shaped tag below the QR.' },
  { value: 'bubble', label: 'Bubble', icon: MessageCircle, hint: 'Speech bubble above the QR.' },
  { value: 'button', label: 'Button', icon: MousePointerClick, hint: 'Big CTA button over the QR edge.' },
  { value: 'ticket', label: 'Ticket', icon: Ticket, hint: 'Ticket stub with dashed divider.' },
  { value: 'corners', label: 'Corners', icon: ScanLine, hint: 'Scanner-style brackets, no card.' },
  { value: 'topbar', label: 'Top bar', icon: PanelTop, hint: 'Colored bar on top, optional label.' },
  { value: 'flyer', label: 'Flyer', icon: FileText, hint: 'Text above and below the QR.' },
  { value: 'shadow', label: 'Shadow', icon: Layers, hint: 'Neubrutalist card with hard offset.' },
  { value: 'strip', label: 'Strip', icon: PanelLeft, hint: 'Accent bar on the left edge.' },
]

/** Logo position picker — 3×3 grid (dot size hints where it sits). */
const LOGO_POSITIONS: { value: QRLogoPosition; label: string; dot: string }[] = [
  { value: 'top-left', label: 'Top left', dot: 'h-1.5 w-1.5' },
  { value: 'top', label: 'Top center', dot: 'h-1.5 w-3' },
  { value: 'top-right', label: 'Top right', dot: 'h-1.5 w-1.5' },
  { value: 'left', label: 'Middle left', dot: 'h-3 w-1.5' },
  { value: 'center', label: 'Center', dot: 'h-3 w-3' },
  { value: 'right', label: 'Middle right', dot: 'h-3 w-1.5' },
  { value: 'bottom-left', label: 'Bottom left', dot: 'h-1.5 w-1.5' },
  { value: 'bottom', label: 'Bottom center', dot: 'h-1.5 w-3' },
  { value: 'bottom-right', label: 'Bottom right', dot: 'h-1.5 w-1.5' },
]

/* ─── Helpers ─── */

/** Escapes the special characters in a WiFi QR payload (\ ; , : "). */
function escapeWifi(s: string): string {
  return s.replace(/([\\;,:"])/g, '\\$1')
}

function encodeValue(type: QRContentType, raw: string): string {
  const v = raw.trim()
  if (!v) return ''
  switch (type) {
    case 'email': return `mailto:${v}`
    case 'phone': return `tel:${v.replace(/\s+/g, '')}`
    case 'whatsapp': return `https://wa.me/${v.replace(/\D/g, '')}`
    default: return v
  }
}

/* ─── Contrast check (WCAG relative luminance) ─── */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  const int = parseInt(full, 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

function channelLin(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function relLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return 0.2126 * channelLin(rgb.r) + 0.7152 * channelLin(rgb.g) + 0.0722 * channelLin(rgb.b)
}

/** Returns the WCAG contrast ratio (1–21) between two hex colors, or null if unparseable. */
function contrastRatio(a: string, b: string): number | null {
  const la = relLuminance(a)
  const lb = relLuminance(b)
  if (la === null || lb === null) return null
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

/* ─── Inspector tabs ─── */

const INSPECTOR_TABS = [
  { id: 'colors', label: 'Colors', icon: Palette },
  { id: 'frame', label: 'Frame', icon: Frame },
  { id: 'logo', label: 'Logo', icon: ImageIcon },
  { id: 'advanced', label: 'Advanced', icon: Settings2 },
] as const

type InspectorTab = (typeof INSPECTOR_TABS)[number]['id']

/* ─── Main Component ─── */

export function QRGeneratorTool({ simple = false }: { simple?: boolean }) {
  const [raw, setRaw] = useState('')
  // Customize panel: open by default on the full page, collapsed in the hero card.
  const [showAdvanced, setShowAdvanced] = useState(!simple)
  const [type, setType] = useState<QRContentType>('url')
  // WiFi structured fields
  const [wifiSsid, setWifiSsid] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [wifiSecurity, setWifiSecurity] = useState('WPA')

  const [fgColor, setFg] = useState(DEFAULTS.fgColor)
  const [bgColor, setBg] = useState(DEFAULTS.bgColor)
  const [transparent, setTransparent] = useState(false)
  const [size, setSize] = useState(DEFAULTS.size)
  const [level, setLevel] = useState<QRErrorLevel>('M')
  const [margin, setMargin] = useState(2)

  // Logo
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined)
  const [logoSize, setLogoSize] = useState(20)
  const [logoPosition, setLogoPosition] = useState<QRLogoPosition>('center')
  const [logoPad, setLogoPad] = useState(false)
  const [logoPadColor, setLogoPadColor] = useState('#FFFFFF')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoDragging, setLogoDragging] = useState(false)
  const [logosGallery, setLogosGallery] = useState<QRLogo[]>([])

  // Frame / caption decoration
  const [frame, setFrame] = useState<QRFrameStyle>('none')
  // SMS / WhatsApp / vCard structured fields
  const [smsNumber, setSmsNumber] = useState('')
  const [smsMessage, setSmsMessage] = useState('')
  const [vcName, setVcName] = useState('')
  const [vcOrg, setVcOrg] = useState('')
  const [vcPhone, setVcPhone] = useState('')
  const [vcEmail, setVcEmail] = useState('')
  const [vcUrl, setVcUrl] = useState('')
  // Event / Location / Crypto structured fields
  const [evTitle, setEvTitle] = useState('')
  const [evLocation, setEvLocation] = useState('')
  const [evStart, setEvStart] = useState('')
  const [evEnd, setEvEnd] = useState('')
  const [locLat, setLocLat] = useState('')
  const [locLng, setLocLng] = useState('')
  const [cryptoCoin, setCryptoCoin] = useState('bitcoin')
  const [cryptoAddr, setCryptoAddr] = useState('')
  const [cryptoAmount, setCryptoAmount] = useState('')
  const [frameLabel, setFrameLabel] = useState('Scan me')
const [frameFootLabel, setFrameFootLabel] = useState('Point your camera at the code')
  const [frameFont, setFrameFont] = useState<'script' | 'sans'>('script')
  const [frameAccent, setFrameAccent] = useState('#18181B')
  const [frameArrow, setFrameArrow] = useState(true)
  const [frameBorder, setFrameBorder] = useState(0)
  const [frameBorderColor, setFrameBorderColor] = useState('#18181B')

  // Inspector active tab
  const [tab, setTab] = useState<InspectorTab>('colors')

  const previewRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<HTMLDivElement>(null)
  const pillRowRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ down: false, startX: 0, scroll: 0, moved: false })

  // Keep the active pill visible when the type changes from elsewhere (history, reset...).
  useEffect(() => {
    const row = pillRowRef.current
    if (!row) return
    const idx = TYPE_OPTIONS.findIndex((o) => o.value === type)
    row.children[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [type])
  const { copied, copy } = useClipboard()
  const [, setHistory] = useLocalStorage<QRHistoryItem[]>(STORAGE_KEYS.qr, [])
  const { user } = useAuth()
  const { gate, lockedForAnon, promptSignIn } = useToolGate('qr')

  useEffect(() => {
    if (!user) { setLogosGallery([]); return }
    listQRLogos(user.uid).then(setLogosGallery).catch(() => {})
  }, [user])

  // Compose the encoded payload. WiFi / SMS / vCard assemble structured
  // strings; everything else runs through encodeValue.
  const composedValue = useMemo(() => {
    if (type === 'wifi') {
      if (!wifiSsid.trim()) return ''
      const pass = wifiSecurity === 'nopass' ? '' : escapeWifi(wifiPassword)
      return `WIFI:T:${wifiSecurity};S:${escapeWifi(wifiSsid)};P:${pass};;`
    }
    if (type === 'sms') {
      if (!smsNumber.trim()) return ''
      return `SMSTO:${smsNumber.replace(/\s+/g, '')}:${smsMessage.trim()}`
    }
    if (type === 'vcard') {
      if (!vcName.trim() && !vcPhone.trim() && !vcEmail.trim()) return ''
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${vcName.trim()}`,
        `FN:${vcName.trim()}`,
        vcOrg.trim() && `ORG:${vcOrg.trim()}`,
        vcPhone.trim() && `TEL:${vcPhone.trim()}`,
        vcEmail.trim() && `EMAIL:${vcEmail.trim()}`,
        vcUrl.trim() && `URL:${vcUrl.trim()}`,
        'END:VCARD',
      ].filter(Boolean).join('\n')
    }
    if (type === 'event') {
      if (!evTitle.trim()) return ''
      const ics = (s: string) => (s ? s.replace(/[-:]/g, '') + '00' : '')
      return [
        'BEGIN:VEVENT',
        `SUMMARY:${evTitle.trim()}`,
        evLocation.trim() && `LOCATION:${evLocation.trim()}`,
        ics(evStart) && `DTSTART:${ics(evStart)}`,
        ics(evEnd) && `DTEND:${ics(evEnd)}`,
        'END:VEVENT',
      ].filter(Boolean).join('\n')
    }
    if (type === 'location') {
      if (!locLat.trim() || !locLng.trim()) return ''
      return `geo:${locLat.trim()},${locLng.trim()}`
    }
    if (type === 'crypto') {
      if (!cryptoAddr.trim()) return ''
      return cryptoAmount.trim()
        ? `${cryptoCoin}:${cryptoAddr.trim()}?amount=${cryptoAmount.trim()}`
        : `${cryptoCoin}:${cryptoAddr.trim()}`
    }
    return encodeValue(type, raw)
  }, [type, raw, wifiSsid, wifiPassword, wifiSecurity, smsNumber, smsMessage, vcName, vcOrg, vcPhone, vcEmail, vcUrl,
    evTitle, evLocation, evStart, evEnd, locLat, locLng, cryptoCoin, cryptoAddr, cryptoAmount])

  const settings: QRSettings = useMemo(() => ({
    value: composedValue, type, fgColor, bgColor, transparent,
    size, level, margin, logoUrl, logoSize, logoPosition, logoPad, logoPadColor,
    frame, frameLabel, frameFootLabel, frameFont, frameAccent, frameArrow, frameBorder, frameBorderColor,
  }), [composedValue, type, fgColor, bgColor, transparent, size, level, margin, logoUrl, logoSize,
    logoPosition, logoPad, logoPadColor,
    frame, frameLabel, frameFootLabel, frameFont, frameAccent, frameArrow, frameBorder, frameBorderColor])

  // Low-contrast guard — a QR that's too low-contrast won't scan reliably.
  const lowContrast = useMemo(() => {
    if (transparent) return false
    const ratio = contrastRatio(fgColor, bgColor)
    return ratio !== null && ratio < 3
  }, [fgColor, bgColor, transparent])

  // A short human label of what's being recorded in history.
  const historyLabel =
    type === 'wifi' ? (wifiSsid.trim() || '')
    : type === 'sms' ? (smsNumber.trim() + (smsMessage.trim() ? ` — ${smsMessage.trim()}` : ''))
    : type === 'vcard' ? (vcName.trim() || vcPhone.trim() || vcEmail.trim())
    : type === 'event' ? (evTitle.trim() || evLocation.trim())
    : type === 'location' ? (locLat.trim() && locLng.trim() ? `${locLat.trim()}, ${locLng.trim()}` : '')
    : type === 'crypto' ? (cryptoAddr.trim() ? `${cryptoCoin}: ${cryptoAddr.trim()}` : '')
    : raw.trim()

  function recordHistory() {
    if (!historyLabel) return
    setHistory((prev) => [
      { id: `${Date.now()}`, content: historyLabel, type, createdAt: Date.now() },
      ...prev.filter((h) => !(h.content === historyLabel && h.type === type)),
    ].slice(0, 50))
  }

  function handleDownloadPNG() {
    if (!gate()) return
    const canvas = previewRef.current?.querySelector<HTMLCanvasElement>('canvas[data-qr-export]')
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'qr-code.png'
    a.click()
    recordHistory()
    toast.success('PNG downloaded')
  }

  function handleDownloadSVG() {
    if (!gate()) return
    const svg = svgRef.current?.querySelector('svg')
    if (!svg) return
    const qrMarkup = new XMLSerializer().serializeToString(svg)
    const framed = buildFramedSvg(qrMarkup, settings.size, settings)
    // Inject the positioned logo layer (with optional backing plate) into the
    // inner QR area, before the frame wraps it — or into the bare QR if no frame.
    let data = framed
    if (settings.logoUrl) {
      const logoLayer = logoSvgLayer(settings.size, settings)
      if (settings.frame && settings.frame !== 'none') {
        // Place the logo group right after the inner QR svg element.
        data = framed.replace(/(<svg[^>]*x="[\d.]+"[^>]*>[\s\S]*?<\/svg>)/, `$1<g>${logoLayer}</g>`)
      } else {
        data = framed.replace(/(<\/svg>)\s*$/, `<g>${logoLayer}</g>$1`)
      }
    }
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

  function handleCopyImage() {
    if (!gate()) return
    const canvas = previewRef.current?.querySelector<HTMLCanvasElement>('canvas[data-qr-export]')
    if (!canvas) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        toast.success('Image copied to clipboard')
      } catch {
        toast.error('Image copying is not supported in this browser')
      }
    })
  }

  async function handleCopyContent() {
    const ok = await copy(settings.value)
    toast[ok ? 'success' : 'error'](ok ? 'Content copied' : 'Copy failed')
  }

  function handleSwapColors() {
    setFg(bgColor)
    setBg(fgColor)
  }

  // Loads a logo file: instant local preview, then (if possible) ImgBB → Firebase.
  async function processLogoFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      setLogoUrl(String(reader.result))
      if (level !== 'H') setLevel('H')
    }
    reader.readAsDataURL(file)

    if (!user) {
      toast.info('Sign in to permanently save the logo — for now it\'s just a local preview.')
      return
    }
    if (!isFirebaseConfigured || !isImgBBConfigured) {
      toast.info('Storage is not configured — the logo is used locally but not saved.')
      return
    }

    setUploadingLogo(true)
    try {
      const saved = await uploadAndSaveQRLogo(user.uid, file, file.name)
      setLogoUrl(saved.url)
      setLogosGallery((prev) => [saved, ...prev])
      toast.success('Logo saved')
    } catch { toast.error('Logo upload failed') }
    finally { setUploadingLogo(false) }
  }

  const handleLogoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processLogoFile(file)
    e.target.value = ''
  }

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setLogoDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) processLogoFile(file)
    else if (file) toast.error('Only images are supported (PNG, JPG, SVG).')
  }

  const handleDeleteLogo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return
    try {
      await deleteQRLogoRecord(user.uid, id)
      setLogosGallery((prev) => prev.filter((lg) => lg.id !== id))
      const deleted = logosGallery.find((lg) => lg.id === id)
      if (deleted && logoUrl === deleted.url) setLogoUrl(undefined)
      toast.success('Logo deleted')
    } catch { toast.error('Delete failed') }
  }

  function handleReset() {
    setRaw('')
    setType('url')
    setWifiSsid('')
    setWifiPassword('')
    setWifiSecurity('WPA')
    setSmsNumber('')
    setSmsMessage('')
    setVcName(''); setVcOrg(''); setVcPhone(''); setVcEmail(''); setVcUrl('')
    setEvTitle(''); setEvLocation(''); setEvStart(''); setEvEnd('')
    setLocLat(''); setLocLng('')
    setCryptoCoin('bitcoin'); setCryptoAddr(''); setCryptoAmount('')
    setFg(DEFAULTS.fgColor)
    setBg(DEFAULTS.bgColor)
    setTransparent(false)
    setSize(DEFAULTS.size)
    setLevel('M')
    setMargin(2)
    setLogoUrl(undefined)
    setLogoSize(20)
    setLogoPosition('center')
    setLogoPad(false)
    setLogoPadColor('#FFFFFF')
    setFrame('none')
    setFrameLabel('Scan me')
setFrameFootLabel('Point your camera at the code')
    setFrameFont('script')
    setFrameAccent('#18181B')
    setFrameArrow(true)
    setFrameBorder(0)
    setFrameBorderColor('#18181B')
  }

  return (
    <div className="grid gap-5 xl:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,400px)] lg:items-start">
      {/* ═══ STEP 1 — content type + input (console) ═══ */}
      <div className="rounded-3xl border border-[#E8E0D6]/70 bg-white p-5 shadow-[0_10px_40px_-24px_rgba(33,26,20,0.25)] dark:border-white/[0.08] dark:bg-white/[0.03] lg:col-start-1 lg:row-start-1">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-cyan/15 to-accent-blue/10 text-sm font-extrabold text-accent-cyan ring-1 ring-inset ring-accent-cyan/25">1</span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-tight text-[#211A14] dark:text-white">What are we encoding?</p>
            <p className="mt-0.5 text-[12px] leading-tight text-faint">Pick a type and enter content</p>
          </div>
        </div>

        {/* Type pills — one dense row, horizontally scrollable with edge fades */}
        <div className="relative mt-4">
          <div
            ref={pillRowRef}
            onPointerDown={(e) => {
              if (e.button !== 0) return
              dragRef.current = { down: true, startX: e.clientX, scroll: pillRowRef.current!.scrollLeft, moved: false }
            }}
            onPointerMove={(e) => {
              const d = dragRef.current
              if (!d.down || !pillRowRef.current) return
              const dx = e.clientX - d.startX
              if (Math.abs(dx) > 5) d.moved = true
              pillRowRef.current.scrollLeft = d.scroll - dx
            }}
            onPointerUp={() => { dragRef.current.down = false }}
            onPointerLeave={() => { dragRef.current.down = false }}
            // Suppress the pill click after a real drag so moving the row doesn't switch types.
            onClickCapture={(e) => {
              if (dragRef.current.moved) {
                e.preventDefault()
                e.stopPropagation()
                dragRef.current.moved = false
              }
            }}
            className="flex cursor-grab select-none flex-nowrap gap-1.5 overflow-x-auto pb-2 [scrollbar-width:thin] [scrollbar-color:#DDD4C8_transparent] [&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#E4DCD1] [&::-webkit-scrollbar-thumb]:border-[2px] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-track]:bg-transparent dark:[scrollbar-color:rgba(255,255,255,0.14)_transparent] dark:[&::-webkit-scrollbar-thumb]:bg-white/10 active:cursor-grabbing"
          >
            {TYPE_OPTIONS.map((opt) => {
              const active = type === opt.value
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-bold transition-all duration-200',
                    active
                      ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan shadow-[0_0_0_1px_rgba(83,155,240,0.25)]'
                      : 'border-[#E8E0D6] bg-white text-muted hover:border-accent-cyan/40 hover:text-[#211A14] dark:border-white/10 dark:bg-ink-950 dark:hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Primary content input */}
        <div className="mt-4">
          {type === 'wifi' ? (
            <Input
              placeholder="Network name (SSID)"
              value={wifiSsid}
              onChange={(e) => setWifiSsid(e.target.value)}
              autoComplete="off"
              className="!py-4 !text-[16px] font-semibold"
              wrapperClassName="!rounded-2xl !border-2 !border-accent-cyan/40 focus-within:!border-accent-cyan focus-within:!shadow-[0_0_0_4px_rgba(83,155,240,0.10)]"
            />
          ) : type === 'sms' ? (
            <Input
              placeholder="+387 61 123 456"
              value={smsNumber}
              onChange={(e) => setSmsNumber(e.target.value)}
              inputMode="tel"
              autoComplete="off"
              className="!py-4 !text-[16px] font-semibold"
              wrapperClassName="!rounded-2xl !border-2 !border-accent-cyan/40 focus-within:!border-accent-cyan focus-within:!shadow-[0_0_0_4px_rgba(83,155,240,0.10)]"
            />
          ) : type === 'whatsapp' ? (
            <Input
              placeholder="38761123456"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              inputMode="tel"
              autoComplete="off"
              className="!py-4 !text-[16px] font-semibold"
              wrapperClassName="!rounded-2xl !border-2 !border-accent-cyan/40 focus-within:!border-accent-cyan focus-within:!shadow-[0_0_0_4px_rgba(83,155,240,0.10)]"
            />
          ) : type === 'vcard' ? (
            <Input
              placeholder="Full name"
              value={vcName}
              onChange={(e) => setVcName(e.target.value)}
              autoComplete="off"
              className="!py-4 !text-[16px] font-semibold"
              wrapperClassName="!rounded-2xl !border-2 !border-accent-cyan/40 focus-within:!border-accent-cyan focus-within:!shadow-[0_0_0_4px_rgba(83,155,240,0.10)]"
            />
          ) : type === 'event' ? (
            <Input
              placeholder="Naslov događaja"
              value={evTitle}
              onChange={(e) => setEvTitle(e.target.value)}
              autoComplete="off"
              className="!py-4 !text-[16px] font-semibold"
              wrapperClassName="!rounded-2xl !border-2 !border-accent-cyan/40 focus-within:!border-accent-cyan focus-within:!shadow-[0_0_0_4px_rgba(83,155,240,0.10)]"
            />
          ) : type === 'location' || type === 'crypto' ? null : (
            <Input
              placeholder={PLACEHOLDERS[type]}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              inputMode={type === 'phone' ? 'tel' : type === 'email' ? 'email' : undefined}
              autoComplete="off"
              className="!py-4 !text-[16px] font-semibold"
              wrapperClassName="!rounded-2xl !border-2 !border-accent-cyan/40 focus-within:!border-accent-cyan focus-within:!shadow-[0_0_0_4px_rgba(83,155,240,0.10)]"
            />
          )}
        </div>

        {/* WiFi extra fields */}
        {type === 'wifi' && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Select
              label="Security"
              options={WIFI_SECURITY}
              value={wifiSecurity}
              onChange={(e) => setWifiSecurity(e.target.value)}
            />
            <Input
              label="Password"
              type="text"
              placeholder={wifiSecurity === 'nopass' ? 'Not required' : '••••••••'}
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
              disabled={wifiSecurity === 'nopass'}
              autoComplete="off"
            />
          </div>
        )}

        {/* SMS extra field */}
        {type === 'sms' && (
          <div className="mt-3">
            <Input
              label="Message (optional)"
              placeholder="Pozdrav..."
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}

        {/* vCard extra fields */}
        {type === 'vcard' && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Input
              label="Company (optional)"
              placeholder="Your Company"
              value={vcOrg}
              onChange={(e) => setVcOrg(e.target.value)}
              autoComplete="off"
            />
            <Input
              label="Phone"
              placeholder="+387 61 123 456"
              value={vcPhone}
              onChange={(e) => setVcPhone(e.target.value)}
              inputMode="tel"
              autoComplete="off"
            />
            <Input
              label="Email"
              placeholder="ime@domena.com"
              value={vcEmail}
              onChange={(e) => setVcEmail(e.target.value)}
              inputMode="email"
              autoComplete="off"
            />
            <Input
              label="Website (optional)"
              placeholder="https://www.company.com"
              value={vcUrl}
              onChange={(e) => setVcUrl(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}

        {/* Event extra fields */}
        {type === 'event' && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Input
              label="Location (optional)"
              placeholder="Main Square 5, Sarajevo"
              value={evLocation}
              onChange={(e) => setEvLocation(e.target.value)}
              autoComplete="off"
            />
            <div />
            <Input
              label="Starts"
              type="datetime-local"
              value={evStart}
              onChange={(e) => setEvStart(e.target.value)}
            />
            <Input
              label="Ends (optional)"
              type="datetime-local"
              value={evEnd}
              onChange={(e) => setEvEnd(e.target.value)}
            />
          </div>
        )}

        {/* Location extra fields */}
        {type === 'location' && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Input
              label="Latitude"
              placeholder="43.8563"
              value={locLat}
              onChange={(e) => setLocLat(e.target.value)}
              inputMode="decimal"
              autoComplete="off"
            />
            <Input
              label="Longitude"
              placeholder="18.4131"
              value={locLng}
              onChange={(e) => setLocLng(e.target.value)}
              inputMode="decimal"
              autoComplete="off"
            />
          </div>
        )}

        {/* Crypto extra fields */}
        {type === 'crypto' && (
          <div className="mt-3">
            <div className="flex gap-1.5">
              {[
                { id: 'bitcoin', label: 'BTC' },
                { id: 'ethereum', label: 'ETH' },
                { id: 'litecoin', label: 'LTC' },
                { id: 'dogecoin', label: 'DOGE' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCryptoCoin(c.id)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-[12px] font-bold transition-all duration-150',
                    cryptoCoin === c.id
                      ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
                      : 'border-[#E8E0D6] text-muted hover:border-accent-cyan/40 dark:border-white/10 dark:text-white/60',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input
                label="Wallet address"
                placeholder="bc1q..."
                value={cryptoAddr}
                onChange={(e) => setCryptoAddr(e.target.value)}
                autoComplete="off"
              />
              <Input
                label="Amount (optional)"
                placeholder="0.005"
                value={cryptoAmount}
                onChange={(e) => setCryptoAmount(e.target.value)}
                inputMode="decimal"
                autoComplete="off"
              />
            </div>
          </div>
        )}

        {/* Soft cross-sell — only for URLs */}
        {type === 'url' && (
          <p className="mt-3 flex items-start gap-2 text-[12px] leading-snug text-faint">
            <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-blue/70" />
            <span>
              Long link?{' '}
              <Link to="/shorten" className="font-semibold text-accent-blue hover:underline">
                Shorten it with Qiro Links
              </Link>
              .
            </span>
          </p>
        )}
      </div>

      {/* ═══ STAGE — the live QR, the showpiece (right) ═══ */}
      <div className="lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:self-start lg:sticky lg:top-24">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-accent-cyan/20 bg-gradient-to-br from-accent-cyan/15 via-white to-accent-blue/10 p-6 sm:p-10 dark:border-accent-cyan/15 dark:from-accent-cyan/10 dark:via-ink-950 dark:to-accent-blue/[0.08]">
          {/* dotted texture + soft glow */}
          <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(33,26,20,0.06)_1px,transparent_0)] [background-size:16px_16px] dark:opacity-20 dark:[background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)]" />
          <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent-cyan/25 blur-[90px]" />

          {/* header row */}
          <div className="relative mb-6 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-cyan shadow-sm backdrop-blur dark:bg-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-green" /> Live preview
            </span>
            <span className="font-mono text-[11px] font-bold text-faint">{size}×{size} px</span>
          </div>

          {/* floating QR */}
          <div className="relative mx-auto w-fit rounded-3xl bg-white p-5 shadow-[0_40px_80px_-24px_rgba(33,26,20,0.4)] ring-1 ring-black/5">
            <QRPreview ref={previewRef} settings={settings} />
          </div>

          {lockedForAnon && (
            <div className="relative mt-5">
              <FreeLimitBanner onSignIn={promptSignIn} message="You've used your free QR code. Sign in for unlimited downloads." />
            </div>
          )}

          {/* low-contrast warning */}
          <AnimatePresence>
            {lowContrast && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="relative mt-5 flex items-start gap-2.5 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3.5 py-2.5 text-[12px] leading-snug text-amber-700 dark:text-amber-400"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Low color contrast — the code may not scan. Use a darker foreground on a lighter background.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ STEP 2 — customize (console) ═══ */}
      <div className="lg:col-start-1 lg:row-start-2">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex w-full items-center gap-3 rounded-3xl border border-[#E8E0D6]/70 bg-white px-5 py-4 text-left shadow-[0_10px_40px_-24px_rgba(33,26,20,0.25)] transition-colors hover:border-accent-cyan/40 dark:border-white/[0.08] dark:bg-white/[0.03]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-cyan/15 to-accent-blue/10 text-sm font-extrabold text-accent-cyan ring-1 ring-inset ring-accent-cyan/25">2</span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold leading-tight text-[#211A14] dark:text-white">Customize appearance</p>
            <p className="mt-0.5 text-[12px] leading-tight text-faint">Colors, frame, logo — optional</p>
          </div>
          <ChevronDown className={cn('h-5 w-5 shrink-0 text-faint transition-transform', showAdvanced && 'rotate-180')} />
        </button>

        {showAdvanced && (
        <div className="mt-3 overflow-hidden rounded-3xl border border-[#E8E0D6]/60 bg-white shadow-[0_10px_40px_-24px_rgba(33,26,20,0.25)] dark:border-white/[0.08] dark:bg-white/[0.03]">
        {/* Tab bar */}
        <div className="border-b border-[#E8E0D6]/40 px-3 pt-3 dark:border-white/[0.06] sm:px-4 sm:pt-4">
          <div className="flex gap-1 rounded-xl border border-[#E8E0D6]/60 bg-[#211A14]/[0.015] p-1 dark:border-white/[0.06] dark:bg-white/[0.02]">
            {INSPECTOR_TABS.map((t) => {
              const active = tab === t.id
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold transition-all duration-200',
                    active
                      ? 'bg-white text-accent-cyan shadow-[0_1px_4px_-1px_rgba(33,26,20,0.12)] dark:bg-white/10 dark:text-accent-cyan'
                      : 'text-faint hover:text-[#211A14] dark:hover:text-white',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="px-4 py-4 sm:px-5 sm:py-5">
          {tab === 'colors' && (
            <div className="space-y-4">
              {/* Quick colors */}
              <div className="rounded-xl border border-[#E8E0D6]/50 bg-gradient-to-b from-[#211A14]/[0.015] to-transparent p-3 dark:border-white/[0.06] dark:from-white/[0.01]">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Palette className="h-3.5 w-3.5 text-accent-cyan" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Quick colors</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {BRAND_PRESETS.map((p) => {
                    const active = fgColor.toLowerCase() === p.hex.toLowerCase()
                    return (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setFg(p.hex)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-semibold transition-all',
                          active
                            ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/5 shadow-[0_0_0_1px_rgba(83,155,240,0.2)] dark:bg-accent-cyan/10'
                            : 'border-[#E8E0D6] bg-white text-muted hover:border-accent-cyan/40 dark:border-white/10 dark:bg-ink-950',
                        )}
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.hex }} />
                        {p.label}
                        {active && <Check className="h-3 w-3 ml-0.5" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Color fields + swap */}
              <div className="relative grid grid-cols-2 gap-3">
                <ColorField label="Foreground" value={fgColor} onChange={setFg} />
                <ColorField label="Background" value={bgColor} onChange={setBg} disabled={transparent} />
                <button
                  type="button"
                  onClick={handleSwapColors}
                  disabled={transparent}
                  title="Swap colors"
                  aria-label="Swap colors"
                  className="absolute left-1/2 top-[1.85rem] grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full border border-[#E8E0D6] bg-white text-faint shadow-sm transition-all hover:text-accent-cyan hover:border-accent-cyan/50 disabled:opacity-40 disabled:pointer-events-none dark:border-white/10 dark:bg-ink-950"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Transparent toggle */}
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#E8E0D6]/50 bg-[#211A14]/[0.015] px-3.5 py-2.5 text-[12px] font-semibold text-muted select-none transition-colors hover:bg-[#211A14]/[0.02] dark:border-white/[0.06] dark:from-white/[0.01] dark:hover:bg-white/[0.02]">
                <input
                  type="checkbox"
                  checked={transparent}
                  onChange={(e) => setTransparent(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E8E0D6] bg-transparent text-accent-cyan focus:ring-0 focus:ring-offset-0 dark:border-white/10"
                />
                <span>Transparent background</span>
              </label>
            </div>
          )}

          {tab === 'frame' && (
            <div className="space-y-4">
              {/* Frame preset picker */}
              <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-[#E8E0D6]/60 bg-[#211A14]/[0.015] p-1 dark:border-white/[0.06] dark:bg-white/[0.02]">
                {FRAME_OPTIONS.map((opt) => {
                  const active = frame === opt.value
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFrame(opt.value)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[9.5px] font-bold uppercase tracking-wide transition-all duration-200',
                        active
                          ? 'bg-white text-accent-blue shadow-[0_1px_4px_-1px_rgba(33,26,20,0.12)] dark:bg-white/10'
                          : 'text-faint hover:text-[#211A14] dark:hover:text-white',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {frame !== 'none' && (
                <p className="text-[11px] leading-snug text-faint">
                  {FRAME_OPTIONS.find((o) => o.value === frame)?.hint}
                </p>
              )}

              {TEXT_FRAMES.includes(frame) && (
                <>
                  <Input
                    label={frame === 'flyer' ? 'Top text' : 'Text'}
                    placeholder="Scan me"
                    value={frameLabel}
                    onChange={(e) => setFrameLabel(e.target.value)}
                    maxLength={24}
                    autoComplete="off"
                  />
                  {frame === 'flyer' && (
                    <Input
                      label="Bottom text"
                      placeholder="Point your camera at the code"
                      value={frameFootLabel}
                      onChange={(e) => setFrameFootLabel(e.target.value)}
                      maxLength={40}
                      autoComplete="off"
                    />
                  )}

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                      Font style
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-[#E8E0D6]/60 bg-[#211A14]/[0.015] p-1 dark:border-white/[0.06] dark:bg-white/[0.02]">
                      {([['script', 'Script'], ['sans', 'Bold']] as const).map(([val, lbl]) => {
                        const active = frameFont === val
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setFrameFont(val)}
                            className={cn(
                              'rounded-lg py-1.5 text-[12px] font-bold transition-all',
                              active
                                ? 'bg-white text-accent-blue shadow-sm dark:bg-white/10'
                                : 'text-faint hover:text-[#211A14] dark:hover:text-white',
                              val === 'script' && 'italic',
                            )}
                          >
                            {lbl}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <ColorField
                    label={frame === 'banner' ? 'Banner color' : 'Label color'}
                    value={frameAccent}
                    onChange={setFrameAccent}
                  />
                </>
              )}

              {frame !== 'none' && frame !== 'minimal' && (
                <div className="space-y-2.5 rounded-xl border border-[#E8E0D6]/50 bg-[#211A14]/[0.015] p-3.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Border</label>
                    <button
                      type="button"
                      onClick={() => setFrameBorder(frameBorder > 0 ? 0 : 6)}
                      className={cn(
                        'relative h-5 w-9 rounded-full transition-colors duration-200',
                        frameBorder > 0 ? 'bg-accent-cyan' : 'bg-[#E8E0D6] dark:bg-white/15',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200',
                          frameBorder > 0 ? 'left-[18px]' : 'left-0.5',
                        )}
                      />
                    </button>
                  </div>
                  {frameBorder > 0 && (
                    <div className="grid grid-cols-[1fr_auto] items-center gap-2.5">
                      <div className="flex items-center gap-2 rounded-xl border border-[#E8E0D6] bg-white px-3 py-2 dark:border-white/10 dark:bg-ink-950">
                        <input
                          type="range"
                          min={2}
                          max={20}
                          value={frameBorder}
                          onChange={(e) => setFrameBorder(Number(e.target.value))}
                          className="w-full accent-accent-cyan"
                        />
                        <span className="w-6 text-right text-[11px] font-mono font-bold text-[#211A14] dark:text-white">{frameBorder}</span>
                      </div>
                      <input
                        type="color"
                        value={frameBorderColor}
                        onChange={(e) => setFrameBorderColor(e.target.value)}
                        className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                        title="Border color"
                      />
                    </div>
                  )}
                </div>
              )}

              {frame === 'label' && (
                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#E8E0D6]/50 bg-[#211A14]/[0.015] px-3.5 py-2.5 text-[12px] font-semibold text-muted select-none transition-colors hover:bg-[#211A14]/[0.02] dark:border-white/[0.06] dark:hover:bg-white/[0.02]">
                  <input
                    type="checkbox"
                    checked={frameArrow}
                    onChange={(e) => setFrameArrow(e.target.checked)}
                    className="h-4 w-4 rounded border-[#E8E0D6] bg-transparent text-accent-blue focus:ring-0 focus:ring-offset-0 dark:border-white/10"
                  />
                  <MoveUpRight className="h-3.5 w-3.5 text-faint" />
                  <span>Decorative arrow</span>
                </label>
              )}
            </div>
          )}

          {tab === 'logo' && (
            <div className="space-y-3">
              {logoUrl && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setLogoUrl(undefined)}
                    className="text-[11px] font-bold text-red-500 hover:underline transition-colors"
                  >
                    Remove logo
                  </button>
                </div>
              )}

              <label
                onDragOver={(e) => { e.preventDefault(); setLogoDragging(true) }}
                onDragLeave={() => setLogoDragging(false)}
                onDrop={handleLogoDrop}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all duration-200',
                  logoDragging
                    ? 'border-accent-cyan bg-accent-cyan/[0.06]'
                    : 'border-[#E8E0D6] bg-white hover:border-accent-cyan/50 hover:bg-accent-cyan/[0.02] dark:border-white/10 dark:bg-ink-950 dark:hover:bg-white/[0.04]',
                )}
              >
                {uploadingLogo ? (
                  <Loader2 className="h-5 w-5 animate-spin text-accent-cyan" />
                ) : (
                  <ImagePlus className={cn('h-5 w-5', logoDragging ? 'text-accent-cyan' : 'text-faint')} />
                )}
                <span className="text-[12px] font-bold text-muted">
                  {uploadingLogo ? 'Uploading...' : logoDragging ? 'Drop image here' : 'Upload or drag logo'}
                </span>
                <span className="text-[10px] text-faint">PNG, JPG ili SVG</span>
                <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoInput} className="hidden" disabled={uploadingLogo} />
              </label>

              {logoUrl && (
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                    Logo size — {logoSize}%
                  </label>
                  <input
                    type="range"
                    min={10} max={30} step={1} value={logoSize}
                    onChange={(e) => setLogoSize(Number(e.target.value))}
                    className="custom-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E8E0D6] dark:bg-white/10 accent-accent-cyan outline-none"
                  />
                </div>
              )}

              {logoUrl && (
                <div className="space-y-3 rounded-xl border border-[#E8E0D6] bg-white p-3 dark:border-white/10 dark:bg-ink-950">
                  {/* Position — 3×3 grid */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                      Position
                    </label>
                    <div className="mx-auto grid w-fit grid-cols-3 gap-1 rounded-lg bg-[#F8F7F5] p-1.5 dark:bg-white/[0.04]">
                      {LOGO_POSITIONS.map((p) => {
                        const active = logoPosition === p.value
                        return (
                          <button
                            key={p.value}
                            type="button"
                            title={p.label}
                            onClick={() => setLogoPosition(p.value)}
                            className={cn(
                              'grid h-7 w-7 place-items-center rounded-md transition-all',
                              active
                                ? 'bg-accent-cyan text-white shadow-sm'
                                : 'bg-white text-faint hover:text-accent-cyan dark:bg-white/[0.06] dark:hover:text-accent-cyan',
                            )}
                          >
                            <span className={cn('block rounded-sm bg-current', p.dot)} />
                          </button>
                        )
                      })}
                    </div>
                    <p className="mt-1.5 text-center text-[10px] leading-tight text-faint">
                      Corner spots sit as close to the corner as possible — the QR's scan markers in the
                      exact corners must stay clear for the code to work.
                    </p>
                  </div>

                  {/* Backing plate */}
                  <label className="flex cursor-pointer items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                      Backing plate
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={logoPad}
                      onClick={() => setLogoPad(!logoPad)}
                      className={cn(
                        'relative h-5 w-9 shrink-0 rounded-full transition-colors',
                        logoPad ? 'bg-accent-cyan' : 'bg-[#E8E0D6] dark:bg-white/10',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                          logoPad ? 'left-[18px]' : 'left-0.5',
                        )}
                      />
                    </button>
                  </label>
                  {logoPad && (
                    <ColorField label="Plate color" value={logoPadColor} onChange={setLogoPadColor} />
                  )}
                </div>
              )}

              {user && logosGallery.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E8E0D6]/40 dark:border-white/[0.06]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-faint">Your logos</span>
                  <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto pr-1">
                    {logosGallery.map((lg) => (
                      <div key={lg.id} className="relative group/logo">
                        <button
                          type="button"
                          onClick={() => { setLogoUrl(lg.url); if (level !== 'Q' && level !== 'H') setLevel('Q') }}
                          className={cn(
                            'grid h-10 w-10 place-items-center rounded-lg border bg-white p-1 transition-all dark:bg-ink-950',
                            logoUrl === lg.url
                              ? 'border-accent-cyan ring-1 ring-accent-cyan bg-accent-cyan/5'
                              : 'border-[#E8E0D6] hover:border-accent-cyan/50 dark:border-white/10',
                          )}
                        >
                          <img src={lg.url} alt={lg.name} className="h-full w-full object-contain rounded" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteLogo(lg.id, e)}
                          className="absolute -top-1 -right-1 hidden group-hover/logo:grid h-4.5 w-4.5 place-items-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-all"
                          aria-label="Delete"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'advanced' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Dimension — {size}px
                </label>
                <input
                  type="range"
                  min={120} max={512} step={8} value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="custom-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E8E0D6] dark:bg-white/10 accent-accent-cyan outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                    { value: '2', label: 'Narrow' },
                    { value: '4', label: 'Standard' },
                    { value: '6', label: 'Wide' },
                  ]}
                  value={String(margin)}
                  onChange={(e) => setMargin(Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>
        </div>
        )}
      </div>

      {/* ═══ STEP 3 — download (console) ═══ */}
      <div className="space-y-2.5 lg:col-start-1 lg:row-start-3">
        <Button onClick={handleDownloadPNG} size="lg" className="w-full rounded-2xl py-4 text-base shadow-glow-soft">
          <Download className="h-5 w-5" />
          Download QR code
        </Button>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={handleDownloadSVG} className="rounded-xl text-[13px]">
            <FileCode className="h-4 w-4" />
            SVG
          </Button>
          <Button variant="outline" onClick={handleCopyImage} className="rounded-xl text-[13px]">
            <ImageIcon className="h-4 w-4" />
            Image
          </Button>
          <Button variant="outline" onClick={handleCopyContent} className="rounded-xl text-[13px]">
            {copied ? <Check className="h-4 w-4 text-accent-green" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Ok' : 'Text'}
          </Button>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold text-faint transition-colors hover:text-[#211A14] dark:hover:text-white"
        >
          <RotateCcw className="h-3 w-3" />
          Reset all
        </button>
      </div>

      {/* Hidden SVG export */}
      <div ref={svgRef} className="hidden" aria-hidden>
        <QRCodeSVG
          value={settings.value || 'https://linkqr.tools'}
          size={settings.size}
          level={settings.level}
          marginSize={settings.margin}
          fgColor={settings.fgColor}
          bgColor={settings.transparent ? 'transparent' : settings.bgColor}
        />
      </div>
    </div>
  )
}

/* ─── Small Helpers ─── */

function ColorField({ label, value, onChange, disabled }: {
  label: string; value: string; onChange: (v: string) => void; disabled?: boolean
}) {
  return (
    <div className={cn(disabled && 'opacity-40')}>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-[#E8E0D6] bg-white p-1.5 dark:border-white/10 dark:bg-ink-950">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-8 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
        />
        <span className="text-[12px] font-mono font-bold uppercase text-[#211A14] dark:text-white">{value}</span>
      </div>
    </div>
  )
}
