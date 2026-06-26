import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: ReactNode
  error?: string
  prefix?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, prefix, className, id, ...props },
  ref,
) {
  const inputId = id || props.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center rounded-xl border bg-white dark:bg-white/[0.04] transition-colors',
          error
            ? 'border-red-400/70 focus-within:border-red-400'
            : 'border-[#E8E0D6] dark:border-white/12 focus-within:border-accent-blue/70',
        )}
      >
        {prefix && (
          <span className="pl-3.5 text-sm text-faint whitespace-nowrap select-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-transparent px-3.5 py-3 text-sm text-[#211A14] dark:text-white placeholder:text-faint focus:outline-none',
            prefix && 'pl-1',
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-faint">{hint}</p>
      ) : null}
    </div>
  )
})
