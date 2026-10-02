import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

export function Alert({
  className,
  variant = 'default',
  ...props
}: ComponentProps<'div'> & { variant?: 'default' | 'destructive' }) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(
        'relative rounded-lg border p-4 text-sm [&>svg]:mb-3',
        variant === 'destructive'
          ? 'border-danger/40 text-danger'
          : 'border-border bg-surface text-foreground',
        className,
      )}
      {...props}
    />
  )
}
export function AlertTitle({ className, ...props }: ComponentProps<'h4'>) {
  return <h4 className={cn('mb-1 text-sm font-medium', className)} {...props} />
}
export function AlertDescription({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('text-sm leading-relaxed', className)} {...props} />
}
