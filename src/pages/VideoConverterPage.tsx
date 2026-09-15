import { motion } from 'framer-motion'
import { FileVideo, History, Trash2, CalendarDays, ArrowUpRight } from 'lucide-react'
import { ToolHero } from '@/components/sections/ToolHero'
import { VideoConverterTool } from '@/components/tools/VideoConverterTool'
import { BentoFeatures } from '@/components/sections/BentoFeatures'
import { Pricing } from '@/components/sections/Pricing'
import { TestimonialsMasonry } from '@/components/sections/TestimonialsMasonry'
import { FeatureBanner } from '@/components/sections/FeatureBanner'
import { getToolStory } from '@/data/toolStory'
import { Badge } from '@/components/ui/Badge'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { STORAGE_KEYS } from '@/utils/storage'
import { formatDateTime } from '@/utils/format'
import type { VideoConversionHistoryItem } from '@/types/qr'

export default function VideoConverterPage() {
  useDocumentTitle(
    'Video Converter — Qiro',
    'Convert video to MP4, WebM, GIF, MP3 or MOV directly in your browser. Private and unlimited. First conversion free, no sign-up required.',
  )

  const [videos, setVideos] = useLocalStorage<VideoConversionHistoryItem[]>(STORAGE_KEYS.videos, [])

  function removeVideo(id: string) {
    setVideos((prev) => prev.filter((v) => v.id !== id))
  }

  const story = getToolStory('video')

  return (
    <>
      <ToolHero
        eyebrow="Video Converter"
        title="Convert video without it leaving your device"
        subtitle="MP4, WebM, GIF, MP3 and MOV — conversion happens in your browser. Nothing gets uploaded, everything is private."
        accent="purple"
      />

      {/* ═══ Working tool ═══ */}
      <section className="container-max pb-14">
        <VideoConverterTool />

        {/* ═══ Conversion history ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-12"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-purple/10 to-accent-blue/10 text-accent-purple">
                <History className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-[#211A14] dark:text-white">Recent conversions</h2>
                <p className="text-[11px] text-faint">Metadata of converted videos</p>
              </div>
            </div>
            <Badge tone="purple" className="text-[11px]">{videos.length} on device</Badge>
          </div>

          {videos.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#E8E0D6] py-10 text-center dark:border-white/10">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent-purple/10 via-accent-blue/10 to-accent-cyan/10">
                <FileVideo className="h-7 w-7 text-accent-purple" />
              </div>
              <p className="text-sm font-bold text-[#211A14] dark:text-white">No conversions yet</p>
              <p className="mt-1 max-w-[280px] text-xs text-muted">Drop a video and convert it. Conversion metadata will be saved automatically.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {videos.map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="group flex items-center gap-3 rounded-2xl border border-[#E8E0D6] bg-white p-3.5 transition-all duration-200 hover:border-accent-purple/30 hover:shadow-md dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-accent-purple/20"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-purple/10 to-accent-blue/10 text-accent-purple">
                    <FileVideo className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#211A14] dark:text-white">{v.fileName}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-faint">
                      <ArrowUpRight className="h-3 w-3" />
                      <span className="font-bold text-accent-purple dark:text-accent-cyan">{v.outputFormat}</span>
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDateTime(v.createdAt)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => removeVideo(v.id)}
                    className="grid h-9 w-9 place-items-center rounded-lg text-faint opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
              <p className="px-1 pt-2 text-[11px] italic text-faint">
                The converted files themselves are not saved — only metadata. Download the file to keep it.
              </p>
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
