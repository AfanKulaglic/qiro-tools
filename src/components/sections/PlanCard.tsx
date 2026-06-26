import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import type { Plan } from '@/data/pricing'

/**
 * Essentio-style pricing card — large rounded corners (`rounded-3xl`),
 * generous padding, green check discs, and a highlighted card that swaps
 * to a primary-blue gradient with white checks (mirrors the "highlight
 * plan" treatment from Pricing).
 */
export function PlanCard({ plan, index = 0 }: { plan: Plan; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        'relative flex flex-col rounded-3xl p-7.5 lg:p-10 transition-all',
        plan.highlight
          ? 'bg-primary text-white shadow-glow-soft'
          : 'border border-default-200 bg-white dark:border-white/10 dark:bg-white/[0.04]',
        plan.comingSoon && 'opacity-95',
      )}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-7">
          <span
            className={cn(
              'inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-tight shadow-glow-soft',
              plan.highlight
                ? 'bg-primary-2 text-default-900'
                : 'bg-gradient-to-r from-accent-blue to-accent-purple text-white',
            )}
          >
            {plan.badge}
          </span>
        </div>
      )}

      <h3
        className={cn(
          'text-xl font-bold',
          plan.highlight ? 'text-white' : 'text-default-900 dark:text-white',
        )}
      >
        {plan.name}
      </h3>
      <div className="mt-3 flex items-end gap-1.5">
        <span
          className={cn(
            'font-extrabold tracking-tight',
            plan.highlight ? 'text-white' : 'text-default-900 dark:text-white',
            plan.comingSoon ? 'text-2xl' : 'text-5xl',
          )}
        >
          {plan.price}
        </span>
        {plan.priceNote && (
          <span className={cn('pb-1 text-sm', plan.highlight ? 'text-white/70' : 'text-faint')}>
            {plan.priceNote}
          </span>
        )}
      </div>
      <p className={cn('mt-4 text-sm leading-relaxed', plan.highlight ? 'text-white/85' : 'text-muted')}>
        {plan.description}
      </p>

      <ul className="mt-7.5 flex-1 space-y-3.5">
        {plan.features.map((f) => (
          <li
            key={f}
            className={cn(
              'flex items-start gap-2.5 text-base leading-relaxed',
              plan.highlight ? 'text-white/90' : 'text-default-500 dark:text-white/70',
            )}
          >
            <span
              className={cn(
                'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full',
                plan.highlight ? 'bg-white/25 text-white' : 'bg-accent-green/15 text-accent-green',
              )}
            >
              <Check className="size-3" />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-7.5">
        <Button
          to={plan.ctaTo}
          variant={plan.highlight ? 'secondary' : 'primary'}
          size="lg"
          className={cn(
            'w-full rounded-full',
            plan.highlight && 'bg-white !text-default-900 hover:bg-primary-2',
          )}
        >
          {plan.cta}
        </Button>
      </div>
    </motion.div>
  )
}