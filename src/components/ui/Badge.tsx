import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type Tone = 'default' | 'blue' | 'green' | 'purple' | 'cyan'

const tones: Record<Tone, string> = {
  default:
    'border-[#E8E0D6] dark:border-white/15 text-muted bg-[#211A14]/[0.03] dark:bg-white/5',
  blue: 'border-accent-blue/30 text-accent-blue bg-accent-blue/10',
  green: 'border-accent-green/30 text-accent-green bg-accent-green/10',
  purple: 'border-accent-purple/30 text-accent-purple bg-accent-purple/10',
  cyan: 'border-accent-cyan/30 text-accent-cyan bg-accent-cyan/10',
}

export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
