import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

export function Progress({
  value,
  label,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & { value: number; label: string }) {
  const safeValue = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-label={label}
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 overflow-hidden rounded-full bg-raised', className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-foreground transition-[width] duration-200"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}
