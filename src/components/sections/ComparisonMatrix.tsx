import { motion } from 'framer-motion'
import { Check, Minus, Infinity as InfinityIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { cn } from '@/utils/cn'

/**
 * Essentio-style feature comparison matrix — wide table with feature
 * groups on the left, plan columns across the top. Cells use a check /
 * dash / "limited" pattern so the visual hierarchy reads at a glance.
 *
 * Columns: Link Free, Link Pro, QR Pro, Convert Pro, All-in-one.
 * Why: Pro plans are per-service; All-in-one is the only plan that
 *       bundles them. Showing all four side by side makes the bundle
 *       value obvious.
 */

type Cell = true | false | 'limited' | string

interface Row {
  /** Feature group label (left column, spans all rows in the group). */
  group: string
  feature: string
  detail?: string
  link?: Cell
  qr?: Cell
  convert?: Cell
  bundle?: Cell
}

const ROWS: Row[] = [
  // Short Links
  {
    group: 'Short Links',
    feature: 'Short links per month',
    detail: 'Branded short URLs with custom alias',
    link: '25',
    qr: false,
    convert: false,
    bundle: 'Unlimited',
  },
  {
    group: 'Short Links',
    feature: 'Custom domain',
    link: false,
    qr: false,
    convert: false,
    bundle: true,
  },
  {
    group: 'Short Links',
    feature: 'Click analytics',
    link: 'Basic',
    qr: false,
    convert: false,
    bundle: 'Full',
  },
  {
    group: 'Short Links',
    feature: 'Password & expiring links',
    link: false,
    qr: false,
    convert: false,
    bundle: true,
  },
  {
    group: 'Short Links',
    feature: 'Bulk shortening',
    link: false,
    qr: false,
    convert: false,
    bundle: true,
  },

  // QR Codes
  {
    group: 'QR Codes',
    feature: 'QR codes per month',
    detail: 'Generate, style, download',
    link: false,
    qr: 'Unlimited',
    convert: false,
    bundle: 'Unlimited',
  },
  {
    group: 'QR Codes',
    feature: 'Logo & full-color styling',
    link: false,
    qr: true,
    convert: false,
    bundle: true,
  },
  {
    group: 'QR Codes',
    feature: 'SVG + high-res export',
    link: false,
    qr: true,
    convert: false,
    bundle: true,
  },
  {
    group: 'QR Codes',
    feature: 'Dynamic (editable) QR',
    link: false,
    qr: true,
    convert: false,
    bundle: true,
  },
  {
    group: 'QR Codes',
    feature: 'Saved templates',
    link: false,
    qr: true,
    convert: false,
    bundle: true,
  },

  // Image Convert
  {
    group: 'Image Convert',
    feature: 'Image formats',
    detail: 'JPG, PNG, WebP, AVIF (Pro)',
    link: false,
    qr: false,
    convert: 'JPG · PNG · WebP',
    bundle: 'JPG · PNG · WebP · AVIF',
  },
  {
    group: 'Image Convert',
    feature: 'Batch conversion',
    link: false,
    qr: false,
    convert: true,
    bundle: true,
  },
  {
    group: 'Image Convert',
    feature: 'Resize & compress presets',
    link: false,
    qr: false,
    convert: true,
    bundle: true,
  },
  {
    group: 'Image Convert',
    feature: 'Files stay on device',
    detail: 'In-browser, nothing uploaded',
    link: false,
    qr: false,
    convert: true,
    bundle: true,
  },

  // Workspace
  {
    group: 'Workspace',
    feature: 'Priority support',
    link: false,
    qr: false,
    convert: false,
    bundle: true,
  },
  {
    group: 'Workspace',
    feature: 'One bill for all tools',
    link: false,
    qr: false,
    convert: false,
    bundle: true,
  },
]

const COLS: Array<{ key: 'link' | 'qr' | 'convert' | 'bundle'; label: string; price: string; highlight?: boolean }> = [
  { key: 'link', label: 'Link Pro', price: '€4 / mo' },
  { key: 'qr', label: 'QR Pro', price: '€4 / mo' },
  { key: 'convert', label: 'Convert Pro', price: '€4 / mo' },
  { key: 'bundle', label: 'All-in-one', price: '€9 / mo', highlight: true },
]

function CellValue({ value }: { value?: Cell }) {
  if (value === true) {
    return (
      <span className="mx-auto grid size-7 place-items-center rounded-full bg-accent-green/15 text-accent-green">
        <Check className="size-4" strokeWidth={3} />
      </span>
    )
  }
  if (value === false) {
    return (
      <span className="mx-auto grid size-7 place-items-center rounded-full bg-default-100 text-default-400 dark:bg-white/5 dark:text-white/30">
        <Minus className="size-4" />
      </span>
    )
  }
  if (value === 'Unlimited') {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-bold text-accent-blue">
        <InfinityIcon className="size-4" /> Unlimited
      </span>
    )
  }
  if (value === 'limited') {
    return (
      <span className="text-xs font-medium text-default-500 dark:text-white/55">Limited</span>
    )
  }
  // string label
  return <span className="text-sm font-semibold text-default-800 dark:text-white">{value}</span>
}

export function ComparisonMatrix() {
  // Group rows by `group` for the left-side group label
  const groups = ROWS.reduce<Record<string, Row[]>>((acc, row) => {
    if (!acc[row.group]) acc[row.group] = []
    acc[row.group].push(row)
    return acc
  }, {})

  return (
    <section className="lg:py-25 md:py-17.5 py-12.5">
      <Container>
        <div className="mb-10 lg:mb-12.5">
          <span className="text-lg font-bold uppercase tracking-tight text-default-800 dark:text-white/70">
            Compare
          </span>
          <h2 className="mt-2 text-4xl font-normal leading-tight text-default-900 sm:text-5xl lg:text-6xl dark:text-white">
            Every feature, side by side.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-default-500 dark:text-white/60">
            Each Pro plan unlocks a single tool. All-in-one unlocks every Pro feature, across every
            tool, for less.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="overflow-x-auto rounded-3xl border border-default-200 bg-white shadow-card dark:border-white/10 dark:bg-white/[0.04]"
        >
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-default-200 dark:border-white/10">
                <th className="w-[34%] px-6 py-5 text-left text-xs font-bold uppercase tracking-tight text-default-500 dark:text-white/55">
                  Feature
                </th>
                {COLS.map((c) => (
                  <th
                    key={c.key}
                    className={cn(
                      'px-4 py-5 text-center text-xs font-bold uppercase tracking-tight',
                      c.highlight
                        ? 'bg-primary/5 text-primary dark:bg-primary/15 dark:text-white'
                        : 'text-default-500 dark:text-white/55',
                    )}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span>{c.label}</span>
                      <span
                        className={cn(
                          'text-[0.65rem] font-medium normal-case tracking-normal',
                          c.highlight ? 'text-primary dark:text-white/80' : 'text-default-400 dark:text-white/40',
                        )}
                      >
                        {c.price}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groups).map(([groupName, rows]) =>
                rows.map((row, idx) => (
                  <tr
                    key={`${groupName}-${row.feature}`}
                    className={cn(
                      'border-b border-default-100 last:border-b-0 dark:border-white/5',
                      idx % 2 === 1 && 'bg-default-50/60 dark:bg-white/[0.02]',
                    )}
                  >
                    <td className="px-6 py-4 align-top">
                      {idx === 0 && (
                        <div className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-primary">
                          {groupName}
                        </div>
                      )}
                      <div className="text-sm font-semibold text-default-900 dark:text-white">
                        {row.feature}
                      </div>
                      {row.detail && (
                        <div className="mt-0.5 text-xs text-default-500 dark:text-white/50">
                          {row.detail}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <CellValue value={row.link} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <CellValue value={row.qr} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <CellValue value={row.convert} />
                    </td>
                    <td
                      className={cn(
                        'px-4 py-4 text-center',
                        'bg-primary/[0.03] dark:bg-primary/10',
                      )}
                    >
                      <CellValue value={row.bundle} />
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </motion.div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-default-500 dark:text-white/55">
          All Free tiers stay free forever — no credit card, no trial, no auto-renew surprise.
        </p>
      </Container>
    </section>
  )
}
