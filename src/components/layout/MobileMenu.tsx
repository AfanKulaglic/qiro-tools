import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X, Link2, Sparkles, Layers, Tag, LifeBuoy, QrCode, ImageDown, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import type { LucideIcon } from 'lucide-react'

interface NavLink {
  label: string
  to: string
  icon: LucideIcon
}

const LINKS: NavLink[] = [
  { label: 'URL Shortener', to: '/shorten', icon: Link2 },
  { label: 'QR Generator', to: '/qr-generator', icon: QrCode },
  { label: 'Image Converter', to: '/image-converter', icon: ImageDown },
  { label: 'Features', to: '/features', icon: Sparkles },
  { label: 'Use Cases', to: '/use-cases', icon: Layers },
  { label: 'Pricing', to: '/pricing', icon: Tag },
  { label: 'Help', to: '/help', icon: LifeBuoy },
]

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="absolute inset-x-0 top-0 origin-top bg-ink-950/95 backdrop-blur-xl border-b border-white/10 p-5"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/12 text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                >
                  <Link
                    to={link.to}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-white/90 hover:bg-white/10"
                  >
                    <link.icon className="h-5 w-5 text-accent-blue" />
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-6">
              <Button to="/studio" size="lg" className="w-full" onClick={onClose}>
                <LayoutDashboard className="h-4 w-4" />
                Otvori studio
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
