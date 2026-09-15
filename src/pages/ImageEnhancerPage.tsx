import { ToolHero } from '@/components/sections/ToolHero'
import { ImageEnhancerTool } from '@/components/tools/ImageEnhancerTool'
import { BentoFeatures } from '@/components/sections/BentoFeatures'
import { Pricing } from '@/components/sections/Pricing'
import { TestimonialsMasonry } from '@/components/sections/TestimonialsMasonry'
import { FeatureBanner } from '@/components/sections/FeatureBanner'
import { getToolStory } from '@/data/toolStory'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function ImageEnhancerPage() {
  useDocumentTitle(
    'Image Enhancer — Qiro',
    'Upscale and sharpen photos with AI, directly in your browser. 2× / 4× super-resolution adds detail, reduces noise and lifts contrast. Private, no sign-up required.',
  )

  const story = getToolStory('enhance')

  return (
    <>
      <ToolHero
        eyebrow="Image Enhancer"
        title="Upscale & sharpen photos — with AI"
        subtitle="AI super-resolution runs locally: 2× or 4× more pixels, sharper detail and cleaner edges. Images are never uploaded."
        accent="coral"
      />

      {/* ═══ Working tool ═══ */}
      <section className="container-max pb-14">
        <ImageEnhancerTool />
      </section>

      {/* ═══ Home-style marketing sections ═══ */}
      <BentoFeatures story={story.bento} />
      <Pricing intro={story.pricing} defaultService={story.pricing?.service} />
      <TestimonialsMasonry {...story.testimonials} />
      <FeatureBanner {...story.banner} />
    </>
  )
}
