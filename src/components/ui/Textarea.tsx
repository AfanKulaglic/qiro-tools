import { forwardRef, type TextareaHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: ReactNode
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id, ...props },
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
      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          'w-full rounded-xl border bg-white dark:bg-white/[0.04] px-3.5 py-3 text-sm text-[#211A14] dark:text-white placeholder:text-faint focus:outline-none transition-colors resize-y min-h-[110px]',
          error
            ? 'border-red-400/70 focus:border-red-400'
            : 'border-[#E8E0D6] dark:border-white/12 focus:border-accent-blue/70',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-faint">{hint}</p>
      ) : null}
    </div>
  )
})
