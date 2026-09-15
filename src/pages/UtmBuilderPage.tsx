import { motion } from 'framer-motion'
import { Megaphone, History, Trash2, CalendarDays, ExternalLink } from 'lucide-react'
import { ToolHero } from '@/components/sections/ToolHero'
import { UtmBuilderTool } from '@/components/tools/UtmBuilderTool'
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
import type { UtmHistoryItem } from '@/types/qr'

export default function UtmBuilderPage() {
  useDocumentTitle(
    'UTM builder — Qiro',
    'Build trackable campaign links with utm_source, utm_medium and utm_campaign tags. Free, no sign-up required, in your browser.',
  )

  const [links, setLinks] = useLocalStorage<UtmHistoryItem[]>(STORAGE_KEYS.utm, [])

  function removeLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  const story = getToolStory('utm')

  return (
    <>
      <ToolHero
        eyebrow="UTM builder"
        title="Build trackable campaign links"
        subtitle="Add utm tags and know exactly where your traffic comes from — works with Google Analytics and all tracking tools."
        accent="sage"
      />

      {/* ═══ Working tool ═══ */}
      <section className="container-max pb-14">
        <UtmBuilderTool />

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
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-sage/20 to-accent-blue/10 text-accent-sage">
                <History className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-[#211A14] dark:text-white">Recent links</h2>
                <p className="text-[11px] text-faint">Saved campaign links</p>
              </div>
            </div>
            <Badge tone="green" className="text-[11px]">{links.length} on device</Badge>
          </div>

          {links.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#E8E0D6] py-10 text-center dark:border-white/10">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent-sage/20 via-accent-blue/10 to-accent-cyan/10">
                <Megaphone className="h-7 w-7 text-accent-sage" />
              </div>
              <p className="text-sm font-bold text-[#211A14] dark:text-white">No links yet</p>
              <p className="mt-1 max-w-[280px] text-xs text-muted">Create a campaign link — copying it will automatically save it here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {links.map((l, i) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="group flex items-center gap-3 rounded-2xl border border-[#E8E0D6] bg-white p-3.5 transition-all duration-200 hover:border-accent-sage/40 hover:shadow-md dark:border-white/10 dark:bg-white/[0.02]"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-sage/20 to-accent-blue/10 text-accent-sage">
                    <Megaphone className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[12px] font-semibold text-[#211A14] dark:text-white">{l.url}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-faint">
                      {l.campaign && <span className="font-bold text-accent-sage">{l.campaign}</span>}
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDateTime(l.createdAt)}</span>
                    </p>
                  </div>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-9 w-9 place-items-center rounded-lg text-faint transition-all hover:text-accent-blue"
                    aria-label="Open"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => removeLink(l.id)}
                    className="grid h-9 w-9 place-items-center rounded-lg text-faint opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
