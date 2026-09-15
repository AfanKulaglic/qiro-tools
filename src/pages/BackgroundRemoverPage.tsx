import { ToolHero } from '@/components/sections/ToolHero'
import { BackgroundRemoverTool } from '@/components/tools/BackgroundRemoverTool'
import { BentoFeatures } from '@/components/sections/BentoFeatures'
import { Pricing } from '@/components/sections/Pricing'
import { TestimonialsMasonry } from '@/components/sections/TestimonialsMasonry'
import { FeatureBanner } from '@/components/sections/FeatureBanner'
import { getToolStory } from '@/data/toolStory'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function BackgroundRemoverPage() {
  useDocumentTitle(
    'Background Remover — Qiro',
    'Remove image backgrounds using AI, directly in your browser. Transparent PNG, clean edges. Private, unlimited and no sign-up required.',
  )

  const story = getToolStory('bg')

  return (
    <>
      <ToolHero
        eyebrow="Background Remover"
        title="Remove image backgrounds — in your browser"
        subtitle="AI model runs locally: you get a transparent PNG with clean edges. Images are never uploaded."
        accent="green"
      />

      {/* ═══ Working tool ═══ */}
      <section className="container-max pb-14">
        <BackgroundRemoverTool />
      </section>

      {/* ═══ Home-style marketing sections ═══ */}
      <BentoFeatures story={story.bento} />
      <Pricing intro={story.pricing} defaultService={story.pricing?.service} />
      <TestimonialsMasonry {...story.testimonials} />
      <FeatureBanner {...story.banner} />
    </>
  )
}
