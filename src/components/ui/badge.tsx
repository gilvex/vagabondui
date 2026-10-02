import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: ComponentProps<'span'> & {
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium',
        {
          'border-border bg-raised text-muted': tone === 'neutral',
          'border-success/20 bg-success/10 text-success': tone === 'success',
          'border-[var(--warning)]/20 bg-[var(--warning)]/10 text-[var(--warning)]':
            tone === 'warning',
          'border-danger/20 bg-danger/10 text-danger': tone === 'danger',
          'border-[var(--info)]/20 bg-[var(--info)]/10 text-[var(--info)]': tone === 'info',
        },
        className,
      )}
      {...props}
    />
  )
}
