export interface Plan {
  name: string
  price: string
  priceNote?: string
  badge?: string
  highlight?: boolean
  comingSoon?: boolean
  description: string
  features: string[]
  cta: string
  ctaTo: string
}

export const FREE_PLAN: Plan = {
  name: 'Free',
  price: '$0',
  priceNote: 'forever',
  badge: 'Available now',
  highlight: true,
  description: 'Everything you need to shorten links, make QR codes, and convert images.',
  features: [
    'QR generation in browser',
    'Image conversion in browser',
    'Short links powered by Firebase',
    'Custom aliases',
    'Basic click tracking',
    'Local history',
    'No signup required',
  ],
  cta: 'Start free',
  ctaTo: '/shorten',
}

export const PRO_PLAN: Plan = {
  name: 'Pro',
  price: 'Coming soon',
  comingSoon: true,
  description: 'For creators and teams who need accounts, analytics, and link control.',
  features: [
    'User accounts',
    'Advanced analytics',
    'Branded dashboards',
    'Bulk QR generation',
    'Expiring links',
    'Password-protected links',
  ],
  cta: 'Notify me',
  ctaTo: '/contact',
}

export const BUSINESS_PLAN: Plan = {
  name: 'Business',
  price: 'Coming soon',
  comingSoon: true,
  description: 'For agencies and organizations that need scale and white-label control.',
  features: [
    'Custom domain setup',
    'Team workspace',
    'White label',
    'API access',
    'Campaign reports',
    'Priority support',
  ],
  cta: 'Talk to us',
  ctaTo: '/contact',
}

export const PRICING_NOTE =
  'QR generation and image conversion run locally in your browser. Short links use Firebase infrastructure and may be subject to fair-use and Firebase quota limits.'

/* ------------------------------------------------------------------ *
 * Per-service packages — each studio is its own service with a free
 * tier + Pro, plus a discounted "All-in-one" bundle that unlocks every
 * Pro for less than buying them separately. Billed monthly, with a
 * cheaper 6-month option.
 * ------------------------------------------------------------------ */

export type BillingPeriod = 'monthly' | 'halfyear'

export interface Tier {
  /** 'Free' | 'Pro' | 'Complete' */
  name: string
  /** € per month (0 = free) */
  monthly: number
  /** € total billed once for 6 months (0 = free) */
  halfYearTotal: number
  highlight?: boolean
  blurb: string
  features: string[]
  cta: string
  ctaTo: string
}

export interface ServicePackage {
  key:
    | 'link'
    | 'qr'
    | 'convert'
    | 'video'
    | 'audio'
    | 'gif'
    | 'utm'
    | 'bg'
    | 'pdf'
    | 'bundle'
  /** Short label shown in the tab switch. */
  tabLabel: string
  /** Full service name shown above the cards. */
  name: string
  tagline: string
  bundle?: boolean
  saveNote?: string
  /** How this price compares to the best-known competitor for the service. */
  vsNote?: string
  tiers: Tier[]
}

/**
 * Sum of all ten individual Pro plans — used to show bundle savings.
 * 5 + 5 + 5 + 6 + 4 + 4 + 4 + 5 + 9 = €47
 */
export const SEPARATE_PRO_MONTHLY = 47

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    key: 'link',
    tabLabel: 'Link',
    name: 'Short Links',
    tagline: 'Branded short links with real click insight.',
    vsNote: 'Bitly charges $10–$35/mo, Short.io Pro $18/mo. Link Pro is €5/mo.',
    tiers: [
      {
        name: 'Free',
        monthly: 0,
        halfYearTotal: 0,
        blurb: 'Everything to start sharing short links.',
        features: ['25 short links / month', 'Custom alias', 'Basic click counter', '7-day history'],
        cta: 'Start free',
        ctaTo: '/shorten',
      },
      {
        name: 'Link Pro',
        monthly: 5,
        halfYearTotal: 25,
        highlight: true,
        blurb: 'For creators who share constantly.',
        features: [
          'Unlimited short links',
          'Full click analytics',
          'Custom domain',
          'Password & expiring links',
          'Bulk shortening',
          'Permanent history',
        ],
        cta: 'Get Link Pro',
        ctaTo: '/shorten',
      },
    ],
  },
  {
    key: 'qr',
    tabLabel: 'QR',
    name: 'QR Codes',
    tagline: 'Customizable QR codes, ready to print.',
    vsNote: 'Uniqode & QR Tiger run $5–$30/mo. QR Pro is €5/mo.',
    tiers: [
      {
        name: 'Free',
        monthly: 0,
        halfYearTotal: 0,
        blurb: 'Unlimited basic codes in your browser.',
        features: ['Unlimited basic QR codes', 'PNG download', 'Standard colors', 'Instant, in-browser'],
        cta: 'Start free',
        ctaTo: '/',
      },
      {
        name: 'QR Pro',
        monthly: 5,
        halfYearTotal: 25,
        highlight: true,
        blurb: 'Codes that match your brand, at scale.',
        features: [
          'Logo & full color styling',
          'SVG + high-res export',
          'Dynamic (editable) QR',
          'Bulk generation',
          'Saved templates',
        ],
        cta: 'Get QR Pro',
        ctaTo: '/',
      },
    ],
  },
  {
    key: 'convert',
    tabLabel: 'Convert',
    name: 'Image Convert',
    tagline: 'Private image conversion that never leaves your device.',
    vsNote: 'CloudConvert starts at ~€9/mo in credits. Convert Pro is €5/mo flat.',
    tiers: [
      {
        name: 'Free',
        monthly: 0,
        halfYearTotal: 0,
        blurb: 'Convert one image at a time, privately.',
        features: ['JPG · PNG · WebP', '100% in-browser', 'One file at a time', 'Nothing uploaded'],
        cta: 'Start free',
        ctaTo: '/image-converter',
      },
      {
        name: 'Convert Pro',
        monthly: 5,
        halfYearTotal: 25,
        highlight: true,
        blurb: 'For people who convert all day.',
        features: [
          'Batch conversion',
          'AVIF & more formats',
          'Resize & compress presets',
          'No daily limit',
        ],
        cta: 'Get Convert Pro',
        ctaTo: '/image-converter',
      },
    ],
  },
  {
    key: 'video',
    tabLabel: 'Video',
    name: 'Video Convert',
    tagline: 'MP4, WebM, MOV and more — converted in your browser.',
    vsNote: 'Online video converters bill $9–$18/mo. Video Pro is €6/mo.',
    tiers: [
      {
        name: 'Free',
        monthly: 0,
        halfYearTotal: 0,
        blurb: 'Short clips, converted privately on-device.',
        features: ['MP4 · WebM · MOV', '100% in-browser', 'Files up to 200 MB', 'Nothing uploaded'],
        cta: 'Start free',
        ctaTo: '/',
      },
      {
        name: 'Video Pro',
        monthly: 6,
        halfYearTotal: 30,
        highlight: true,
        blurb: 'Longer videos, more formats, zero uploads.',
        features: [
          'Files up to 2 GB',
          'All formats + audio extraction',
          'Batch queue',
          'Quality & resolution presets',
          'No daily limit',
        ],
        cta: 'Get Video Pro',
        ctaTo: '/',
      },
    ],
  },
  {
    key: 'audio',
    tabLabel: 'Audio',
    name: 'Audio Convert',
    tagline: 'MP3, WAV, FLAC, OGG — converted locally, instantly.',
    vsNote: 'Dedicated audio converters bill $6–$10/mo. Audio Pro is €4/mo.',
    tiers: [
      {
        name: 'Free',
        monthly: 0,
        halfYearTotal: 0,
        blurb: 'Quick one-off audio conversions, privately.',
        features: ['MP3 · WAV · OGG', '100% in-browser', 'One file at a time', 'Nothing uploaded'],
        cta: 'Start free',
        ctaTo: '/',
      },
      {
        name: 'Audio Pro',
        monthly: 4,
        halfYearTotal: 20,
        highlight: true,
        blurb: 'For musicians, podcasters and editors.',
        features: [
          'All formats incl. FLAC',
          'Batch conversion',
          'Bitrate & channel presets',
          'Metadata kept intact',
          'No daily limit',
        ],
        cta: 'Get Audio Pro',
        ctaTo: '/',
      },
    ],
  },
  {
    key: 'gif',
    tabLabel: 'GIF',
    name: 'GIF Maker',
    tagline: 'Video and image clips turned into crisp, light GIFs.',
    vsNote: 'EZGIF Pro & similar tools charge $5+/mo. GIF Pro is €4/mo.',
    tiers: [
      {
        name: 'Free',
        monthly: 0,
        halfYearTotal: 0,
        blurb: 'Make short GIFs right in your browser.',
        features: ['Up to 5 seconds', 'Basic speed & size', '100% in-browser', 'Nothing uploaded'],
        cta: 'Start free',
        ctaTo: '/',
      },
      {
        name: 'GIF Pro',
        monthly: 4,
        halfYearTotal: 20,
        highlight: true,
        blurb: 'Meme-ready GIFs without watermarks.',
        features: [
          'Up to 60 seconds',
          'Frame-rate & trim control',
          'Palette tuning for tiny files',
          'Watermark-free export',
          'Batch from video',
        ],
        cta: 'Get GIF Pro',
        ctaTo: '/',
      },
    ],
  },
  {
    key: 'utm',
    tabLabel: 'UTM',
    name: 'UTM Builder',
    tagline: 'Consistent, typo-free campaign links every time.',
    vsNote: 'utm.io & similar UTM suites charge $25+/mo. UTM Pro is €4/mo.',
    tiers: [
      {
        name: 'Free',
        monthly: 0,
        halfYearTotal: 0,
        blurb: 'Build clean UTM links in seconds.',
        features: ['All UTM parameters', 'Preset templates', 'Copy-ready links', 'Nothing tracked'],
        cta: 'Start free',
        ctaTo: '/',
      },
      {
        name: 'UTM Pro',
        monthly: 4,
        halfYearTotal: 20,
        highlight: true,
        blurb: 'For teams running serious campaigns.',
        features: [
          'Saved naming conventions',
          'Bulk link generation (CSV)',
          'Team-shared presets',
          'QR export per campaign',
          'Shorten + tag in one step',
        ],
        cta: 'Get UTM Pro',
        ctaTo: '/',
      },
    ],
  },
  {
    key: 'bg',
    tabLabel: 'BG Remove',
    name: 'Background Remove',
    tagline: 'AI background removal that runs on your device.',
    vsNote: 'remove.bg charges €9 for just 40 images. BG Pro is €5/mo, unlimited.',
    tiers: [
      {
        name: 'Free',
        monthly: 0,
        halfYearTotal: 0,
        blurb: 'Remove backgrounds, no upload needed.',
        features: ['Standard quality', 'PNG with transparency', '100% on-device', 'Nothing uploaded'],
        cta: 'Start free',
        ctaTo: '/',
      },
      {
        name: 'BG Pro',
        monthly: 5,
        halfYearTotal: 25,
        highlight: true,
        blurb: 'Product shots and portraits, unlimited.',
        features: [
          'Unlimited images',
          'Max quality model',
          'Batch processing',
          'Custom solid backgrounds',
          'Edge refinement',
        ],
        cta: 'Get BG Pro',
        ctaTo: '/',
      },
    ],
  },
  {
    key: 'pdf',
    tabLabel: 'PDF',
    name: 'AI PDF Studio',
    tagline: 'Edit, sign and talk to your documents — AI included.',
    vsNote: 'Adobe Acrobat Pro runs $24.99/mo and AI Assistant costs extra. PDF Pro is €9/mo with AI included.',
    tiers: [
      {
        name: 'Free',
        monthly: 0,
        halfYearTotal: 0,
        blurb: 'Edit and organize PDFs in your browser.',
        features: ['3 documents / month', 'Core editing — text, pages, merge', '20 MB max file', '1 AI generation / month'],
        cta: 'Start free',
        ctaTo: '/pdf-editor',
      },
      {
        name: 'PDF Pro',
        monthly: 9,
        halfYearTotal: 45,
        highlight: true,
        blurb: 'The complete AI document studio.',
        features: [
          'Unlimited documents',
          'AI Chat with page citations',
          'AI Summarize & Translate',
          'AI Vision — scans, tables, layout',
          'AI proofread & rewrite — layout-preserving',
          'OCR search',
          'E-signatures',
          'Watermark & protect',
          '200 MB files',
        ],
        cta: 'Get PDF Pro',
        ctaTo: '/pdf-editor',
      },
    ],
  },  {
    key: 'bundle',
    tabLabel: 'All-in-one',
    name: 'All-in-one',
    tagline: 'Every Pro feature across all ten tools — for less.',
    bundle: true,
    saveNote: 'Save 66% vs buying every Pro separately',
    vsNote: 'Bitly Growth alone is $29/mo for links + QR. The full 9-tool Qiro suite is €16/mo.',
    tiers: [
      {
        name: 'Complete',
        monthly: 16,
        halfYearTotal: 80,
        highlight: true,
        blurb: 'One subscription unlocks all ten tools — fully.',
        features: [
          'Link Pro — unlimited short links',
          'QR Pro — branded, dynamic codes',
          'Convert Pro — every image format',
          'Video & Audio Pro — all formats, batch',
          'GIF Pro + UTM Pro + BG Pro',
          'PDF Pro — AI editing, chat & vision',
          'One bill for everything',
          'Priority support',
        ],
        cta: 'Get All-in-one',
        ctaTo: '/',
      },
    ],
  },
]

/** Format a tier's price for the chosen billing period. */
export function formatTierPrice(tier: Tier, period: BillingPeriod): {
  amount: string
  note: string
} {
  if (tier.monthly === 0) return { amount: '€0', note: 'free forever' }
  if (period === 'monthly') return { amount: `€${tier.monthly}`, note: '/ month' }
  const perMonth = (tier.halfYearTotal / 6).toFixed(2).replace(/\.00$/, '')
  return { amount: `€${tier.halfYearTotal}`, note: `/ 6 months · ≈ €${perMonth}/mo` }
}
