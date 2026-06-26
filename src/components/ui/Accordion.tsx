import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface AccordionItem {
  q: string
  a: string
}

export function Accordion({
  items,
  className,
}: {
  items: AccordionItem[]
  className?: string
}) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className={cn('divide-y divide-[#E8E0D6] dark:divide-white/10', className)}>
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={i} className="py-1">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-[#211A14] dark:text-white">{item.q}</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 text-faint transition-transform duration-300',
                  isOpen && 'rotate-180 text-accent-blue',
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-8 text-sm leading-relaxed text-muted">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
