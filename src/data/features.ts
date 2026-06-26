import type { LucideIcon } from 'lucide-react'
import {
  Link2,
  QrCode,
  ImageDown,
  Globe,
  Zap,
  ShieldCheck,
  BarChart3,
  Smartphone,
  History,
  Palette,
  Download,
  Lock,
} from 'lucide-react'

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

/** Six "why it feels better" cards used on the home page. */
export const WHY_FEATURES: Feature[] = [
  {
    icon: Globe,
    title: 'Own-domain links',
    description: 'Brand every short link with your own domain or subdomain for trust and recall.',
  },
  {
    icon: Zap,
    title: 'Fast redirects',
    description: 'Lightweight Firestore-backed redirects send visitors to the destination instantly.',
  },
  {
    icon: Download,
    title: 'QR downloads',
    description: 'Export crisp PNG and SVG QR codes ready for menus, flyers, and campaigns.',
  },
  {
    icon: Lock,
    title: 'Private image conversion',
    description: 'Images are converted in your browser and never uploaded to a server.',
  },
  {
    icon: History,
    title: 'Local history',
    description: 'Your recent links, QR codes, and conversions stay on your device — no account needed.',
  },
  {
    icon: Smartphone,
    title: 'Clean mobile experience',
    description: 'Every tool and page is designed mobile-first, so it feels great on any screen.',
  },
]

/** Deep-dive feature cards for the Features page bento grid. */
export const PLATFORM_FEATURES: Feature[] = [
  {
    icon: Link2,
    title: 'Custom aliases',
    description: 'Turn long URLs into memorable links like /summer-sale with full validation.',
  },
  {
    icon: BarChart3,
    title: 'Basic click tracking',
    description: 'See how many times each short link has been opened, updated in real time.',
  },
  {
    icon: QrCode,
    title: 'Built-in QR codes',
    description: 'Every short link comes with a downloadable QR code for offline sharing.',
  },
  {
    icon: Palette,
    title: 'QR customization',
    description: 'Adjust colors, size, margin, and error correction for the perfect code.',
  },
  {
    icon: ImageDown,
    title: 'Multi-format conversion',
    description: 'Convert between JPG, PNG, and WebP with quality control, all client-side.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy by design',
    description: 'No image uploads, no external shortener APIs, no hidden tracking.',
  },
]

export interface ComparisonRow {
  feature: string
  basic: boolean
  linkqr: boolean
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: 'Own-domain short links', basic: false, linkqr: true },
  { feature: 'Custom aliases', basic: false, linkqr: true },
  { feature: 'QR code generation', basic: true, linkqr: true },
  { feature: 'Image conversion', basic: false, linkqr: true },
  { feature: 'Local history', basic: false, linkqr: true },
  { feature: 'Private browser processing', basic: false, linkqr: true },
  { feature: 'Clean mobile UI', basic: false, linkqr: true },
  { feature: 'Firebase-powered redirects', basic: false, linkqr: true },
]
