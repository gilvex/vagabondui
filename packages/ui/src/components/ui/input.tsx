import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils.js'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-background px-3 text-base text-foreground placeholder:text-muted disabled:opacity-40 aria-invalid:border-danger md:text-sm',
        className,
      )}
      {...props}
    />
  )
}
