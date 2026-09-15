import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { HeroSection } from '@/components/sections/HeroSection'
import { HorizontalShowcase } from '@/components/sections/HorizontalShowcase'
import { ToolStrip } from '@/components/sections/ToolStrip'
import { BentoFeatures } from '@/components/sections/BentoFeatures'
import { Pricing } from '@/components/sections/Pricing'
import { AppCTA } from '@/components/sections/AppCTA'
import { TestimonialsMasonry } from '@/components/sections/TestimonialsMasonry'
import { FeatureBanner } from '@/components/sections/FeatureBanner'

/**
 * Essentio-style home page. Section order:
 *
 *   1. Hero       — dark editorial hero with the live editor for all tools
 *                   (QR / short link / image convert / ...) embedded directly.
 *                   NOTE: the tool switcher + card live ONLY here — don't add
 *                   a second tools section (HomeTools) below, it duplicates.
 *   2. Showcase   — three quick testimonials
 *   3. Tool strip — three quick benefits + "More about" CTA
 *   4. Bento      — 4×2 feature grid (split into 2 rows)
 *   5. Pricing    — Qiro-only, kept because it's the homepage CTA
 *   6. App CTA    — inline visual + headline
 *   7. Testimonials — 4-col review grid
 *   8. Banner     — pre-footer CTA band
 *
 * The Footer itself is rendered by MarketingLayout (one global instance for
 * every marketing page) — don't add a second <Footer /> here.
 */
export default function HomePage() {
  useDocumentTitle(
    'Qiro — Short links, QR codes, image conversion & AI PDF editing',
    'One clean place to shorten links, generate QR codes, convert images, and edit PDFs with AI. Branded short links, instant QR downloads, and private in-browser conversion.',
  )

  return (
    <>
      <HeroSection />
      <HorizontalShowcase />
      <ToolStrip />
      <BentoFeatures />
      <Pricing />
      <AppCTA />
      <TestimonialsMasonry />
      <FeatureBanner />
    </>
  )
}
