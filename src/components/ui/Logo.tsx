import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export function Logo({
  className,
  withText = true,
}: {
  className?: string
  withText?: boolean
}) {
  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2.5', className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent-blue via-accent-cyan to-accent-purple shadow-glow-soft">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M9 15l6-6M10 7h2.2a3.3 3.3 0 0 1 0 6.6H10M14 17h-2.2a3.3 3.3 0 0 1 0-6.6H14"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {withText && (
        <span className="text-lg font-extrabold tracking-tight text-[#211A14] dark:text-white">
          Qiro
        </span>
      )}
    </Link>
  )
}
