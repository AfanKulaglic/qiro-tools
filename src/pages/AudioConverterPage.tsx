import { motion } from 'framer-motion'
import { AudioLines, History, Trash2, CalendarDays, ArrowUpRight } from 'lucide-react'
import { ToolHero } from '@/components/sections/ToolHero'
import { AudioConverterTool } from '@/components/tools/AudioConverterTool'
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
import type { AudioConversionHistoryItem } from '@/types/qr'

export default function AudioConverterPage() {
  useDocumentTitle(
    'Audio Converter — Qiro',
    'Convert audio to MP3, WAV, OGG, M4A or FLAC directly in your browser. Extract audio from video. Private, unlimited and no sign-up required.',
  )

  const [audios, setAudios] = useLocalStorage<AudioConversionHistoryItem[]>(STORAGE_KEYS.audios, [])

  function removeAudio(id: string) {
    setAudios((prev) => prev.filter((a) => a.id !== id))
  }

  const story = getToolStory('audio')

  return (
    <>
      <ToolHero
        eyebrow="Audio Converter"
        title="Convert audio without it leaving your device"
        subtitle="MP3, WAV, OGG, M4A and FLAC — and audio extraction from video. All in your browser, nothing gets uploaded."
        accent="coral"
      />

      {/* ═══ Working tool ═══ */}
      <section className="container-max pb-14">
        <AudioConverterTool />

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
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-coral/10 to-accent-purple/10 text-accent-coral">
                <History className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-[#211A14] dark:text-white">Recent conversions</h2>
                <p className="text-[11px] text-faint">Metadata of converted audio</p>
              </div>
            </div>
            <Badge tone="purple" className="text-[11px]">{audios.length} on device</Badge>
          </div>

          {audios.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#E8E0D6] py-10 text-center dark:border-white/10">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent-coral/10 via-accent-purple/10 to-accent-cyan/10">
                <AudioLines className="h-7 w-7 text-accent-coral" />
              </div>
              <p className="text-sm font-bold text-[#211A14] dark:text-white">No conversions yet</p>
              <p className="mt-1 max-w-[280px] text-xs text-muted">Drop an audio file and convert it. Conversion metadata will be saved automatically.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {audios.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="group flex items-center gap-3 rounded-2xl border border-[#E8E0D6] bg-white p-3.5 transition-all duration-200 hover:border-accent-coral/30 hover:shadow-md dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-accent-coral/20"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-coral/10 to-accent-purple/10 text-accent-coral">
                    <AudioLines className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#211A14] dark:text-white">{a.fileName}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-faint">
                      <ArrowUpRight className="h-3 w-3" />
                      <span className="font-bold text-accent-coral dark:text-accent-cyan">{a.outputFormat}</span>
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDateTime(a.createdAt)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => removeAudio(a.id)}
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
