import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { HeroSection } from '@/components/sections/HeroSection'
import { HorizontalShowcase } from '@/components/sections/HorizontalShowcase'
import { ToolStrip } from '@/components/sections/ToolStrip'
import { BentoFeatures } from '@/components/sections/BentoFeatures'
import { StudioCarousel } from '@/components/sections/StudioCarousel'
import { Pricing } from '@/components/sections/Pricing'
import { AppCTA } from '@/components/sections/AppCTA'
import { TestimonialsMasonry } from '@/components/sections/TestimonialsMasonry'
import { FeatureBanner } from '@/components/sections/FeatureBanner'
import { Footer } from '@/components/layout/Footer'

/**
 * Essentio-style home page. Section order mirrors the reference template:
 *
 *   1. Hero           — full-bleed dark editorial hero
 *   2. Showcase       — three quick testimonials
 *   3. Tool strip     — three quick benefits + "More about" CTA
 *   4. Bento          — 4×2 feature grid (split into 2 rows)
 *   5. Studio carousel — three studios, Essentio Products Swiper analogue
 *   6. Pricing        — Qiro-only, kept because it's the homepage CTA
 *   7. App CTA        — inline visual + headline
 *   8. Testimonials   — 4-col review grid
 *   9. Banner         — pre-footer CTA band
 *  10. Footer         — marquee + newsletter + grid
 */
export default function HomePage() {
  useDocumentTitle(
    'Qiro — Short links, QR codes & image conversion in one studio',
    'One clean studio to shorten links, generate QR codes, and convert images. Branded short links, instant QR downloads, and private in-browser image conversion.',
  )

  return (
    <>
      <HeroSection />
      <HorizontalShowcase />
      <ToolStrip />
      <BentoFeatures />
      <StudioCarousel />
      <Pricing />
      <AppCTA />
      <TestimonialsMasonry />
      <FeatureBanner />
      <Footer />
    </>
  )
}