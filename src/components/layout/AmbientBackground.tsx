/**
 * Ambient backdrop with warmth — two organic glows (cool blue + warm coral),
 * a prominent film-grain noise texture, and a faint grid.
 */

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#FAFAF8] dark:bg-ink-950">
      {/* Warm-toned grid */}
      <div className="absolute inset-0 bg-grid-light bg-grid opacity-[0.4] dark:bg-grid-dark dark:opacity-[0.25]" />

      {/* Dual glows — blue (left) + warm coral/peach (right) */}
      <div className="absolute left-[-10%] top-[-18rem] h-[38rem] w-[48rem] rounded-[50%] bg-accent-blue/10 blur-[160px] dark:bg-accent-blue/12" />
      <div className="absolute right-[-8%] top-[-10rem] h-[32rem] w-[40rem] rounded-[50%] bg-accent-coral/8 blur-[140px] dark:bg-accent-coral/10" />

      {/* Warm peach glow from bottom-right */}
      <div className="absolute bottom-[-20%] right-[-5%] h-[36rem] w-[44rem] rounded-[50%] bg-accent-peach/8 blur-[150px] dark:bg-accent-peach/6" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/15 to-white dark:via-ink-950/20 dark:to-ink-950" />

      {/* Film grain — slightly more prominent */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-soft-light dark:opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '160px 160px',
        }}
      />
    </div>
  )
}
