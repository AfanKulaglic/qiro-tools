import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

/**
 * Standard wrapper for a studio page: a compact, left-aligned workspace header
 * (eyebrow + title + description + optional actions) followed by the working
 * area. The marketing pages use the big centred PageShell hero; the Studio uses
 * this tighter, app-like header instead.
 */
export function StudioPanel({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto w-full max-w-screen-xl px-5 py-8 sm:px-8 sm:py-10"
    >
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && (
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-faint">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-[#211A14] dark:text-white sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>

      {children}
    </motion.div>
  )
}
