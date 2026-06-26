import { StudioPanel } from '@/components/studio/StudioPanel'
import { ImageConverterTool } from '@/components/tools/ImageConverterTool'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function ConvertStudioPage() {
  useDocumentTitle(
    'Konverter studio — Qiro',
    'Konvertuj JPG, PNG i WebP fajlove direktno u browseru. Privatno i brzo.',
  )

  return (
    <StudioPanel
      eyebrow="Konverter studio"
      title="Konverter slika"
      description="Konvertuj JPG, PNG i WebP fajlove u browseru — ništa se ne uploaduje. Sačuvaj u cloud za pristup sa bilo kog uređaja."
    >
      <ImageConverterTool />
    </StudioPanel>
  )
}
