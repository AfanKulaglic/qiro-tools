import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
}

export function Card({ children, className, hover, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#E8E0D6] dark:border-white/[0.08] bg-white dark:bg-white/[0.03] shadow-card',
        hover &&
          'transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-blue/30 hover:shadow-glow',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
