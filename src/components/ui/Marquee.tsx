import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

/**
 * Infinite, seamless horizontal marquee with faded edges.
 * Duplicates its children and slides -50% on a linear loop.
 */
export function Marquee({
  children,
  duration = 26,
  className,
}: {
  children: ReactNode
  duration?: number
  className?: string
}) {
  return (
    <div
      className={className}
      style={{
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <motion.div
        className="flex w-max items-center gap-3"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        <div className="flex shrink-0 items-center gap-3">{children}</div>
        <div className="flex shrink-0 items-center gap-3" aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  )
}
