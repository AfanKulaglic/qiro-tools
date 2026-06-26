import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/**
 * Page container — two widths:
 *   - default:  max-w-7xl (Qiro-standard body container)
 *   - `full`:   max-w-[1400px] (Essentio `container-full`, used by hero /
 *               feature bento / footer for extra breathing room)
 */
export function Container({
  children,
  className,
  full = false,
}: {
  children: ReactNode
  className?: string
  full?: boolean
}) {
  return <div className={cn(full ? 'container-full' : 'container-max', className)}>{children}</div>
}
