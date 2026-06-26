import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * Thin neon progress bar pinned to the very top, tracking page scroll.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-purple shadow-[0_0_12px_rgba(79,70,229,0.9)]"
    />
  )
}
