import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'

/**
 * Standard wrapper for non-home pages: animated page transition, a consistent
 * header block (badge + title + subtitle), and a max-width content container.
 */
export function PageShell({
  badge,
  title,
  subtitle,
  children,
  wide,
}: {
  badge?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  wide?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {/* soft top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-radial-glow" />

      <Container className={wide ? 'max-w-screen-xl' : undefined}>
        <header className="pt-14 pb-10 text-center sm:pt-20">
          {badge && (
            <div className="mb-4 flex justify-center">
              {typeof badge === 'string' ? <Badge tone="blue">{badge}</Badge> : badge}
            </div>
          )}
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-[#211A14] dark:text-white sm:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {subtitle}
            </p>
          )}
        </header>

        <div className="pb-24">{children}</div>
      </Container>
    </motion.div>
  )
}
