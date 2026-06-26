import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  gradientBorder?: boolean
  glow?: boolean
}

export function GlassCard({
  children,
  className,
  gradientBorder,
  glow,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass rounded-3xl',
        gradientBorder && 'gradient-border',
        glow && 'shadow-glow',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
