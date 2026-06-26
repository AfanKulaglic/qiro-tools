import { cn } from '@/utils/cn'

export interface TabItem {
  value: string
  label: string
}

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-2xl border border-[#E8E0D6] dark:border-white/10 bg-[#211A14]/[0.03] dark:bg-white/5 p-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium transition-all',
              active
                ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-glow-soft'
                : 'text-muted hover:text-[#211A14] dark:hover:text-white',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
