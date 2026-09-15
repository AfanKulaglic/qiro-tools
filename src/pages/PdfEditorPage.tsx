import { ToolHero } from '@/components/sections/ToolHero'
import { EmbeddedTool } from '@/components/tools/EmbeddedTool'
import { BentoFeatures } from '@/components/sections/BentoFeatures'
import { Pricing } from '@/components/sections/Pricing'
import { TestimonialsMasonry } from '@/components/sections/TestimonialsMasonry'
import { FeatureBanner } from '@/components/sections/FeatureBanner'
import { getToolStory } from '@/data/toolStory'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function PdfEditorPage() {
  useDocumentTitle(
    'AI PDF Studio — Qiro',
    'Edit, create and chat with PDFs. AI proofreading, vision analysis and document generation — on one flat plan, right in your browser.',
  )

  const story = getToolStory('pdf')

  return (
    <>
      <ToolHero
        eyebrow="AI PDF Studio"
        title="Your documents, supercharged with AI"
        subtitle="Edit text without breaking layout, generate documents from a prompt, and ask any PDF questions — AI included."
        accent="purple"
      />

      {/* ═══ Working tool — upload / create, viewer, AI (embedded) ═══ */}
      <section className="container-max pb-14">
        <EmbeddedTool toolKey="pdf" />
      </section>

      {/* ═══ Home-style marketing sections ═══ */}
      <BentoFeatures story={story.bento} />
      <Pricing intro={story.pricing} defaultService={story.pricing?.service} />
      <TestimonialsMasonry {...story.testimonials} />
      <FeatureBanner {...story.banner} />
    </>
  )
}