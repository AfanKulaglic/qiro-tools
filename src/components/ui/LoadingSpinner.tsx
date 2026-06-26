import { cn } from '@/utils/cn'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-white/20 border-t-accent-blue',
        className,
      )}
      style={{ width: '1em', height: '1em' }}
      aria-hidden
    />
  )
}
