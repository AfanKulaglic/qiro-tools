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
  key: 'link' | 'qr' | 'convert' | 'bundle'
  /** Short label shown in the tab switch. */
  tabLabel: string
  /** Full service name shown above the cards. */
  name: string
  tagline: string
  bundle?: boolean
  saveNote?: string
  tiers: Tier[]
}

/** Sum of the three individual Pro plans — used to show bundle savings. */
export const SEPARATE_PRO_MONTHLY = 12 // 3 × €4

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    key: 'link',
    tabLabel: 'Link',
    name: 'Link Studio',
    tagline: 'Branded short links with real click insight.',
    tiers: [
      {
        name: 'Free',
        monthly: 0,
        halfYearTotal: 0,
        blurb: 'Everything to start sharing short links.',
        features: ['25 short links / month', 'Custom alias', 'Basic click counter', '7-day history'],
        cta: 'Start free',
        ctaTo: '/studio/shorten',
      },
      {
        name: 'Link Pro',
        monthly: 4,
        halfYearTotal: 20,
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
        ctaTo: '/studio/shorten',
      },
    ],
  },
  {
    key: 'qr',
    tabLabel: 'QR',
    name: 'QR Studio',
    tagline: 'Customizable QR codes, ready to print.',
    tiers: [
      {
        name: 'Free',
        monthly: 0,
        halfYearTotal: 0,
        blurb: 'Unlimited basic codes in your browser.',
        features: ['Unlimited basic QR codes', 'PNG download', 'Standard colors', 'Instant, in-browser'],
        cta: 'Start free',
        ctaTo: '/studio/qr',
      },
      {
        name: 'QR Pro',
        monthly: 4,
        halfYearTotal: 20,
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
        ctaTo: '/studio/qr',
      },
    ],
  },
  {
    key: 'convert',
    tabLabel: 'Convert',
    name: 'Convert Studio',
    tagline: 'Private image conversion that never leaves your device.',
    tiers: [
      {
        name: 'Free',
        monthly: 0,
        halfYearTotal: 0,
        blurb: 'Convert one image at a time, privately.',
        features: ['JPG · PNG · WebP', '100% in-browser', 'One file at a time', 'Nothing uploaded'],
        cta: 'Start free',
        ctaTo: '/studio/convert',
      },
      {
        name: 'Convert Pro',
        monthly: 4,
        halfYearTotal: 20,
        highlight: true,
        blurb: 'For people who convert all day.',
        features: [
          'Batch conversion',
          'AVIF & more formats',
          'Resize & compress presets',
          'No daily limit',
        ],
        cta: 'Get Convert Pro',
        ctaTo: '/studio/convert',
      },
    ],
  },
  {
    key: 'bundle',
    tabLabel: 'All-in-one',
    name: 'All-in-one',
    tagline: 'Every Pro feature, across all three studios — for less.',
    bundle: true,
    saveNote: 'Save 25% vs three separate Pro plans',
    tiers: [
      {
        name: 'Complete',
        monthly: 9,
        halfYearTotal: 45,
        highlight: true,
        blurb: 'One subscription unlocks Link, QR, and Convert — fully.',
        features: [
          'Everything in Link Pro',
          'Everything in QR Pro',
          'Everything in Convert Pro',
          'One bill for all studios',
          'Priority support',
        ],
        cta: 'Get All-in-one',
        ctaTo: '/studio',
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
