import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Option {
  value: string
  label: string
  hint?: string
}

type Accent = 'blue' | 'cyan' | 'purple'

interface DropdownProps {
  label?: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  accent?: Accent
  className?: string
  placeholder?: string
}

const ACCENT: Record<Accent, { open: string; sel: string }> = {
  blue: {
    open: 'border-accent-blue ring-2 ring-accent-blue/20',
    sel: 'bg-accent-blue/10 text-accent-blue',
  },
  cyan: {
    open: 'border-accent-cyan ring-2 ring-accent-cyan/20',
    sel: 'bg-accent-cyan/10 text-accent-cyan',
  },
  purple: {
    open: 'border-accent-purple ring-2 ring-accent-purple/20',
    sel: 'bg-accent-purple/10 text-accent-purple dark:text-accent-cyan',
  },
}

const GAP = 8 // px between trigger and menu
const MAX_MENU_H = 256

interface MenuPos {
  left: number
  width: number
  top: number // anchor edge in viewport coords
  maxH: number
  up: boolean // menu opens upward
}

/**
 * Fully styled select — a button trigger + an animated popover list, so the
 * menu matches the app's design instead of the native OS dropdown.
 *
 * The menu is rendered in a portal with `position: fixed`, so it escapes any
 * ancestor with `overflow-hidden` (e.g. the hero card) instead of being clipped.
 * It flips above the trigger when there isn't enough room below.
 */
export function Dropdown({
  label, options, value, onChange, accent = 'blue', className, placeholder = 'Select...',
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<MenuPos | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const selected = options.find((o) => o.value === value)
  const a = ACCENT[accent]

  const measure = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom - GAP
    const spaceAbove = r.top - GAP
    const up = spaceBelow < Math.min(MAX_MENU_H, 220) && spaceAbove > spaceBelow
    const maxH = Math.min(MAX_MENU_H, Math.max(120, up ? spaceAbove : spaceBelow))
    setPos({
      left: r.left,
      width: r.width,
      top: up ? r.top - GAP : r.bottom + GAP,
      maxH,
      up,
    })
  }, [])

  // Position when opening, and keep it pinned while scrolling / resizing.
  useLayoutEffect(() => {
    if (!open) return
    measure()
    const onScroll = () => measure()
    window.addEventListener('scroll', onScroll, true) // capture: catch scroll in any container
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open, measure])

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={cn('w-full', className)}>
      {label && <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-3 text-left text-sm font-semibold text-[#211A14] transition-all focus:outline-none dark:bg-white/[0.04] dark:text-white',
          open ? a.open : 'border-[#E8E0D6] hover:border-[#211A14]/25 dark:border-white/12 dark:hover:border-white/25',
        )}
      >
        <span className={cn('truncate', !selected && 'font-normal text-faint')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-faint transition-transform', open && 'rotate-180')} />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.ul
              ref={menuRef}
              initial={{ opacity: 0, y: pos.up ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: pos.up ? 6 : -6, scale: 0.98 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              role="listbox"
              style={{
                position: 'fixed',
                left: pos.left,
                width: pos.width,
                top: pos.top,
                maxHeight: pos.maxH,
                transform: pos.up ? 'translateY(-100%)' : undefined,
              }}
              className="z-[100] overflow-auto rounded-xl border border-[#E8E0D6] bg-white p-1.5 shadow-[0_24px_50px_-20px_rgba(33,26,20,0.4)] dark:border-white/10 dark:bg-ink-850"
            >
              {options.map((opt) => {
                const active = opt.value === value
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => { onChange(opt.value); setOpen(false) }}
                      className={cn(
                        'flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors',
                        active
                          ? cn('font-bold', a.sel)
                          : 'text-[#211A14] hover:bg-[#211A14]/[0.04] dark:text-white dark:hover:bg-white/[0.06]',
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold leading-tight">{opt.label}</span>
                        {opt.hint && <span className="mt-0.5 block text-[11px] font-normal leading-tight text-faint">{opt.hint}</span>}
                      </span>
                      {active && <Check className="mt-0.5 h-4 w-4 shrink-0" />}
                    </button>
                  </li>
                )
              })}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
