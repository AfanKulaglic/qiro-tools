import { StudioPanel } from '@/components/studio/StudioPanel'
import { QRGeneratorTool } from '@/components/tools/QRGeneratorTool'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function QRStudioPage() {
  useDocumentTitle(
    'QR studio — Qiro',
    'Kreiraj, podesi i preuzmi QR kodove. PNG i SVG izvoz, sve u browseru.',
  )

  return (
    <StudioPanel
      eyebrow="QR studio"
      title="QR kodovi"
      description="Podesi sadržaj, boje i veličinu, pa preuzmi kao PNG ili SVG. Preuzeti kodovi se čuvaju u Historiji."
    >
      <QRGeneratorTool />
    </StudioPanel>
  )
}
