import { motion } from 'framer-motion'
import { QrCode, History, Trash2, RotateCcw, CalendarDays } from 'lucide-react'
import { ToolHero } from '@/components/sections/ToolHero'
import { QRGeneratorTool } from '@/components/tools/QRGeneratorTool'
import { BentoFeatures } from '@/components/sections/BentoFeatures'
import { Pricing } from '@/components/sections/Pricing'
import { TestimonialsMasonry } from '@/components/sections/TestimonialsMasonry'
import { FeatureBanner } from '@/components/sections/FeatureBanner'
import { getToolStory } from '@/data/toolStory'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { STORAGE_KEYS } from '@/utils/storage'
import { formatDateTime } from '@/utils/format'
import type { QRHistoryItem } from '@/types/qr'

export default function QRGeneratorPage() {
  useDocumentTitle(
    'QR Generator — Qiro',
    'Create, customize and download QR codes. PNG and SVG export, all in your browser. First QR free, no sign-up required.',
  )

  const [qrs, setQrs] = useLocalStorage<QRHistoryItem[]>(STORAGE_KEYS.qr, [])

  function removeQR(id: string) {
    setQrs((prev) => prev.filter((q) => q.id !== id))
  }

  const story = getToolStory('qr')

  return (
    <>
      <ToolHero
        eyebrow="QR generator"
        title="QR codes that look like your brand, not a tool"
        subtitle="Customize content, colors, frame and logo, then download as PNG or SVG — all in your browser."
        accent="cyan"
      />

      {/* ═══ Working tool ═══ */}
      <section className="container-max pb-14">
        <QRGeneratorTool />

        {/* ═══ History ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-12"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-cyan/10 to-accent-blue/10 text-accent-cyan">
                <History className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-[#211A14] dark:text-white">Recently downloaded QR codes</h2>
                <p className="text-[11px] text-faint">Automatically saved when downloaded</p>
              </div>
            </div>
            <Badge tone="cyan" className="text-[11px]">{qrs.length} on device</Badge>
          </div>

          {qrs.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#E8E0D6] py-10 text-center dark:border-white/10">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent-cyan/10 via-accent-blue/10 to-accent-purple/10">
                <QrCode className="h-7 w-7 text-accent-cyan" />
              </div>
              <p className="text-sm font-bold text-[#211A14] dark:text-white">No downloaded QR codes yet</p>
              <p className="mt-1 max-w-[280px] text-xs text-muted">When you download a QR code (PNG or SVG), it will be automatically saved here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {qrs.map((qr, i) => (
                <motion.div
                  key={qr.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="group flex items-center gap-3 rounded-2xl border border-[#E8E0D6] bg-white p-3.5 transition-all duration-200 hover:border-accent-cyan/30 hover:shadow-md dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-accent-cyan/20"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-cyan/10 to-accent-blue/10 text-accent-cyan">
                    <QrCode className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#211A14] dark:text-white">{qr.content}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-faint">
                      <span className="rounded bg-accent-cyan/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent-cyan">{qr.type}</span>
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDateTime(qr.createdAt)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="sm" to="/qr-generator" aria-label="Regenerate">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <button
                      onClick={() => removeQR(qr.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg text-faint transition-colors hover:text-red-400"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* ═══ Home-style marketing sections ═══ */}
      <BentoFeatures story={story.bento} />
      <Pricing intro={story.pricing} defaultService={story.pricing?.service} />
      <TestimonialsMasonry {...story.testimonials} />
      <FeatureBanner {...story.banner} />
    </>
  )
}
