import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion'
import { cn } from '@/utils/cn'

/**
 * Card with a cursor-following radial spotlight overlay + scroll-reveal entrance.
 * The signature interactive surface for the neon-spatial direction.
 */
export function SpotlightCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)
  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, rgba(99,102,241,0.18), transparent 70%)`

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mx.set(e.clientX - r.left)
    my.set(e.clientY - r.top)
  }
  const onLeave = () => {
    mx.set(-200)
    my.set(-200)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn('group relative', className)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      {children}
    </motion.div>
  )
}
