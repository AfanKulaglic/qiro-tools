import { motion } from 'framer-motion'
import { Link2, QrCode, ImageDown } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const ITEMS = [
  {
    Icon: Link2,
    quote:
      'Qiro replaced three different tabs I used to keep open. Short links and QR codes from the same place — finally.',
    name: 'Marketing teams',
    role: 'agencies',
  },
  {
    Icon: QrCode,
    quote:
      'The QR generator is clean and the export is instantly print-ready. No watermark nonsense — exactly what my café needed.',
    name: 'Restaurants & cafés',
    role: 'small business',
  },
  {
    Icon: ImageDown,
    quote:
      'I convert product photos to WebP all day. Knowing nothing gets uploaded is a real relief for client work.',
    name: 'Freelance designers',
    role: 'creative teams',
  },
]

/**
 * Showcase with soul — organic frames around quotes, decorative marks,
 * topliji vizuelni identitet, hover efekti sa karakterom.
 */
export function HorizontalShowcase() {
  return (
    <section className="lg:py-37.5 md:py-25 py-15 relative">
      {/* Dekorativni organski elementi u pozadini */}
      <div className="pointer-events-none absolute left-[5%] top-[15%] w-48 h-48 blob bg-accent-coral/5 blur-[80px] animate-float-slow dark:bg-accent-coral/8" />
      <div className="pointer-events-none absolute right-[10%] bottom-[10%] w-40 h-40 blob bg-accent-blue/5 blur-[70px] animate-drift dark:bg-accent-blue/8" style={{ animationDelay: '-4s' }} />

      <Container full>
        <div className="grid grid-cols-1 items-start gap-12 text-center sm:grid-cols-2 lg:grid-cols-3 lg:gap-20">
          {ITEMS.map((it, i) => (
            <motion.div
              key={it.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative flex flex-col items-center"
            >
              {/* Dekorativni circular bg behind icon */}
              <span className="relative mb-8 grid size-14 place-items-center rounded-full bg-gradient-to-br from-accent-blue/10 to-accent-coral/10 text-default-900 transition-all duration-500 group-hover:scale-110 group-hover:shadow-glow-soft md:mb-10 dark:text-white">
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-blue/5 to-accent-coral/5 blur-sm" />
                <it.Icon className="relative size-7 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-8deg]" />
              </span>

              {/* Quote — sa velikim dekorativnim navodnikom */}
              <div className="relative">
                <span className="absolute -top-3 -left-1 text-5xl font-serif leading-none text-[#E6E2DA]/60 select-none dark:text-white/10">&ldquo;</span>
                <p className="relative z-10 pl-4 text-base leading-relaxed italic text-default-500 dark:text-white/70">
                  {it.quote}
                </p>
              </div>

              <h3 className="mt-6 text-lg font-bold text-default-900 dark:text-white">
                {it.name}
              </h3>
              <p className="mt-1 text-sm uppercase tracking-wide text-default-400 dark:text-white/50">
                {it.role}
              </p>

              {/* Hover gradient bar */}
              <div className="mt-4 h-0.5 w-0 rounded-full bg-gradient-to-r from-accent-blue to-accent-coral transition-all duration-500 group-hover:w-12" />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}