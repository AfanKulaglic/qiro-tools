import { toast } from 'sonner'
import { ToolHero } from '@/components/sections/ToolHero'
import { ShortenerForm } from '@/components/tools/ShortenerForm'
import { BentoFeatures } from '@/components/sections/BentoFeatures'
import { Pricing } from '@/components/sections/Pricing'
import { TestimonialsMasonry } from '@/components/sections/TestimonialsMasonry'
import { FeatureBanner } from '@/components/sections/FeatureBanner'
import { getToolStory } from '@/data/toolStory'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { ShortLink } from '@/types/link'

export default function ShortenPage() {
  useDocumentTitle(
    'Link Shortener — Qiro',
    'Turn long links into clean, shareable URLs with custom aliases, QR codes and click tracking. First link free, no sign-up required.',
  )

  function handleCreated(_link: ShortLink) {
    toast.success('Short link created')
  }

  const story = getToolStory('shorten')

  return (
    <>
      <ToolHero
        eyebrow="Link Shortener"
        title="Long links become clean, shareable URLs"
        subtitle="Custom aliases, QR code with every link, and click tracking — no clutter."
        accent="blue"
      />

      {/* ═══ Working tool — create bar + your link + saved links (all inside the form) ═══ */}
      <section className="container-max pb-14">
        <ShortenerForm onCreated={handleCreated} />
      </section>

      {/* ═══ Home-style marketing sections ═══ */}
      <BentoFeatures story={story.bento} />
      <Pricing intro={story.pricing} defaultService={story.pricing?.service} />
      <TestimonialsMasonry {...story.testimonials} />
      <FeatureBanner {...story.banner} />
    </>
  )
}
