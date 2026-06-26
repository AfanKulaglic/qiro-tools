import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/60 disabled:opacity-50 disabled:pointer-events-none select-none'

const variants: Record<Variant, string> = {
  primary:
    'text-white bg-gradient-to-r from-accent-blue to-accent-cyan shadow-glow-soft hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'text-[#211A14] dark:text-white bg-[#211A14]/[0.04] dark:bg-white/10 border border-[#E8E0D6] dark:border-white/15 hover:bg-[#211A14]/[0.08] dark:hover:bg-white/15',
  outline:
    'text-[#211A14] dark:text-white border border-[#E8E0D6] dark:border-white/20 hover:border-accent-blue/60 hover:text-accent-blue dark:hover:text-white',
  ghost:
    'text-muted hover:text-[#211A14] dark:hover:text-white hover:bg-[#211A14]/[0.04] dark:hover:bg-white/10',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3.5 py-2',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-6 py-3.5',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

interface ButtonAsButton
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  to?: undefined
  href?: undefined
}

interface ButtonAsLink extends CommonProps {
  to: string
  onClick?: () => void
}

interface ButtonAsAnchor extends CommonProps {
  href: string
  target?: string
  rel?: string
  onClick?: () => void
}

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, children, ...props },
  ref,
) {
  const classes = cn(base, variants[variant], sizes[size], className)

  if ('to' in props && props.to !== undefined) {
    const { to, ...rest } = props
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  if ('href' in props && props.href !== undefined) {
    const { href, ...rest } = props
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button ref={ref} className={classes} {...(props as ButtonAsButton)}>
      {children}
    </button>
  )
})
