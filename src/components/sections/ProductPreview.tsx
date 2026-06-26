import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Link2,
  QrCode,
  ImageDown,
  History,
  Copy,
  TrendingUp,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Container } from '@/components/ui/Container'

const RECENT = [
  { short: 'go.dom/sale', dest: 'example.com/sale', clicks: 1248 },
  { short: 'go.dom/menu', dest: 'rest.com/menu', clicks: 642 },
  { short: 'go.dom/event', dest: 'tix.com/show', clicks: 318 },
]

const NAV = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: Link2, label: 'Links' },
  { icon: QrCode, label: 'QR Codes' },
  { icon: ImageDown, label: 'Images' },
  { icon: History, label: 'History' },
]

/**
 * Essentio-style product preview — uppercase eyebrow + oversized serif
 * title, then a dashboard mock on a deep ink background with rounded
 * corners (`lg:rounded-[50px]`). Yellow and blue accent bars in the
 * stat strip mirror the Essentio bento color blocking.
 */
export function ProductPreview() {
  return (
    <section className="lg:py-37.5 md:py-25 py-15">
      <Container>
        <div className="mb-12 lg:mb-12.5">
          <span className="text-lg font-bold uppercase tracking-tight text-default-800 dark:text-white/70">
            Dashboard
          </span>
          <h2 className="mt-2 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
            Designed like a real workspace.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-default-500 dark:text-white/60">
            Recent links, QR codes, and image conversions are organized in a clean local dashboard.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-14"
        >
          <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-3 text-white lg:rounded-[50px] lg:p-5">
            <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-grid opacity-30" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary-2/15 blur-3xl" />

            <div className="relative grid lg:grid-cols-[220px_1fr]">
              {/* sidebar */}
              <div className="hidden border-r border-white/10 p-5 lg:block">
                <div className="mb-7.5 flex items-center gap-2 text-base font-bold text-white">
                  <span className="grid size-7 place-items-center rounded-lg bg-primary text-white">
                    <Link2 className="size-3.5" />
                  </span>
                  Workspace
                </div>
                <nav className="space-y-1">
                  {NAV.map((n) => (
                    <div
                      key={n.label}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm ${
                        n.active
                          ? 'bg-primary/20 text-primary'
                          : 'text-white/55'
                      }`}
                    >
                      <n.icon className="size-4" />
                      {n.label}
                    </div>
                  ))}
                </nav>
              </div>

              {/* main */}
              <div className="p-5 sm:p-7">
                {/* stat cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Total clicks" value="2,208" delta="+12%" tone="yellow" />
                  <StatCard label="Active links" value="14" delta="+3" tone="blue" />
                  <StatCard label="QR scans" value="486" delta="+8%" tone="yellow" />
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                  {/* recent links */}
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="mb-3 text-sm font-semibold text-white">Recent links</p>
                    <div className="space-y-2">
                      {RECENT.map((r) => (
                        <div
                          key={r.short}
                          className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5"
                        >
                          <Link2 className="size-4 text-primary" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">{r.short}</p>
                            <p className="truncate text-xs text-white/45">{r.dest}</p>
                          </div>
                          <span className="text-xs text-white/55">{r.clicks}</span>
                          <Copy className="size-3.5 text-white/35" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* QR + activity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 p-4">
                      <div className="rounded-xl bg-white p-2">
                        <QRCodeSVG value="https://qiro.tools" size={54} level="M" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">QR ready</p>
                        <p className="text-xs text-white/45">PNG · SVG export</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">This week</p>
                        <TrendingUp className="size-4 text-accent-green" />
                      </div>
                      <div className="mt-3 flex items-end gap-1.5">
                        {[40, 65, 35, 80, 55, 95, 70].map((h, i) => (
                          <span
                            key={i}
                            className="flex-1 rounded-t bg-gradient-to-t from-primary/50 to-primary-2/60"
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-center text-xs font-medium text-white/45">
                  Local history — stored only on your device.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}

function StatCard({
  label,
  value,
  delta,
  tone,
}: {
  label: string
  value: string
  delta: string
  tone: 'yellow' | 'blue'
}) {
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <p className="text-xs font-medium text-white/55">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-2xl font-bold text-white">{value}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-tight ${
            tone === 'yellow'
              ? 'bg-primary-2 text-default-900'
              : 'bg-primary text-white'
          }`}
        >
          {delta}
        </span>
      </div>
    </div>
  )
}