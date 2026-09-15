import { lazy, Suspense } from 'react'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { ToolKey } from '@/hooks/useToolGate'

/**
 * Lazily-loaded tool embeds for the home/hero segmented switchers. Each tool is
 * its own chunk, so heavy tools (ffmpeg-based video/audio/GIF, onnx background
 * removal) are fetched only when their tab is opened — the landing page bundle
 * stays small even though all eight tools are selectable.
 */

const QRGeneratorTool = lazy(() => import('./QRGeneratorTool').then((m) => ({ default: m.QRGeneratorTool })))
const ShortenerForm = lazy(() => import('./ShortenerForm').then((m) => ({ default: m.ShortenerForm })))
const ImageConverterTool = lazy(() => import('./ImageConverterTool').then((m) => ({ default: m.ImageConverterTool })))
const VideoConverterTool = lazy(() => import('./VideoConverterTool').then((m) => ({ default: m.VideoConverterTool })))
const AudioConverterTool = lazy(() => import('./AudioConverterTool').then((m) => ({ default: m.AudioConverterTool })))
const GifMakerTool = lazy(() => import('./GifMakerTool').then((m) => ({ default: m.GifMakerTool })))
const UtmBuilderTool = lazy(() => import('./UtmBuilderTool').then((m) => ({ default: m.UtmBuilderTool })))
const BackgroundRemoverTool = lazy(() => import('./BackgroundRemoverTool').then((m) => ({ default: m.BackgroundRemoverTool })))
const ImageEnhancerTool = lazy(() => import('./ImageEnhancerTool').then((m) => ({ default: m.ImageEnhancerTool })))
const PdfEditorTool = lazy(() => import('./PdfEditorTool').then((m) => ({ default: m.PdfEditorTool })))

function ToolFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <LoadingSpinner className="text-2xl" />
    </div>
  )
}

export function EmbeddedTool({ toolKey, simple = false }: { toolKey: ToolKey; simple?: boolean }) {
  return (
    <Suspense fallback={<ToolFallback />}>
      {toolKey === 'qr' && <QRGeneratorTool simple={simple} />}
      {toolKey === 'shorten' && <ShortenerForm onCreated={() => toast.success('Short link created')} simple={simple} />}
      {toolKey === 'convert' && <ImageConverterTool simple={simple} />}
      {toolKey === 'video' && <VideoConverterTool simple={simple} />}
      {toolKey === 'audio' && <AudioConverterTool simple={simple} />}
      {toolKey === 'gif' && <GifMakerTool simple={simple} />}
      {toolKey === 'utm' && <UtmBuilderTool simple={simple} />}
      {toolKey === 'bg' && <BackgroundRemoverTool simple={simple} />}
      {toolKey === 'enhance' && <ImageEnhancerTool simple={simple} />}
      {toolKey === 'pdf' && <PdfEditorTool simple={simple} />}
    </Suspense>
  )
}
