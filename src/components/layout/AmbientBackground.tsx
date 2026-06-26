/**
 * Backdrop (z -10): a near-solid monochrome base with one soft accent glow,
 * a barely-there grid, and faint film grain. Restraint is the point —
 * the content and typography carry the page (Linear/Vercel approach).
 */

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-ink-950">
      {/* barely-there grid */}
      <div className="absolute inset-0 bg-grid-light bg-grid opacity-[0.5] dark:bg-grid-dark dark:opacity-[0.35]" />

      {/* single soft accent glow from the top */}
      <div className="absolute left-1/2 top-[-22rem] h-[42rem] w-[64rem] -translate-x-1/2 rounded-[50%] bg-accent-blue/12 blur-[170px] dark:bg-accent-blue/15" />

      {/* gentle vignette to keep content legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white dark:via-ink-950/20 dark:to-ink-950" />

      {/* faint film grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-soft-light dark:opacity-[0.06]"
        style={{ backgroundImage: GRAIN, backgroundSize: '160px 160px' }}
      />
    </div>
  )
}
