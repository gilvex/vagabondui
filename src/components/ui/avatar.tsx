import type { ComponentProps } from 'react'
import { Avatar as Primitive } from 'radix-ui'
import { cn } from '../../lib/utils'

export function Avatar({ className, ...props }: ComponentProps<typeof Primitive.Root>) {
  return (
    <Primitive.Root
      role={props['aria-label'] ? 'img' : undefined}
      className={cn(
        'relative inline-flex size-10 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  )
}
export function AvatarImage({ className, ...props }: ComponentProps<typeof Primitive.Image>) {
  return <Primitive.Image className={cn('size-full object-cover', className)} {...props} />
}
export function AvatarFallback({ className, ...props }: ComponentProps<typeof Primitive.Fallback>) {
  return (
    <Primitive.Fallback
      className={cn(
        'flex size-full items-center justify-center rounded-full border border-border bg-raised text-sm font-medium',
        className,
      )}
      {...props}
    />
  )
}
