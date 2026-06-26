import { PageShell } from '@/components/layout/PageShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ArrowRight } from 'lucide-react'

const CONVERSIONS = [
  'JPG → PNG',
  'PNG → JPG',
  'JPG → WebP',
  'PNG → WebP',
  'WebP → PNG',
  'WebP → JPG',
]

export default function ImageConverterPage() {
  useDocumentTitle(
    'Free JPG, PNG and WebP Image Converter — LinkQR Tools',
    'Convert JPG, PNG, and WebP files directly in your browser. Private, fast, and free — your images are never uploaded.',
  )

  return (
    <PageShell
      badge="Private browser conversion"
      title="Free Image Converter"
      subtitle="Convert JPG, PNG, and WebP files directly in your browser. Your images are never uploaded."
      wide
    >
      {/* Open the working tool in the Studio */}
      <div className="flex flex-col items-center gap-4">
        <Button to="/studio/convert" size="lg">
          Otvori Konverter studio
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-sm text-faint">Konverzija i čuvanje slika radi se u studiju.</p>
      </div>

      <div className="mt-20">
        <SectionHeader title="Supported conversions" align="center" />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {CONVERSIONS.map((c) => {
            const [from, to] = c.split(' → ')
            return (
              <span
                key={c}
                className="inline-flex items-center gap-2 rounded-full border border-[#E8E0D6] dark:border-white/12 bg-white dark:bg-white/[0.04] px-4 py-2 text-sm font-medium text-muted"
              >
                {from}
                <ArrowRight className="h-3.5 w-3.5 text-accent-purple" />
                {to}
              </span>
            )
          })}
        </div>
      </div>

      <div className="mt-12">
        <Card className="p-7 sm:p-9 text-center">
          <h2 className="text-xl font-bold text-[#211A14] dark:text-white">
            Your files never leave your device.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
            Conversion uses the browser&apos;s Canvas API. Nothing is uploaded, stored, or sent to a
            server — when you close the tab, the image is gone.
          </p>
        </Card>
      </div>
    </PageShell>
  )
}
