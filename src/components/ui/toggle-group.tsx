import type { ComponentProps } from 'react'
import { ToggleGroup as Primitive } from 'radix-ui'
import { cn } from '../../lib/utils'

export function ToggleGroup({ className, ...props }: ComponentProps<typeof Primitive.Root>) {
  return (
    <Primitive.Root
      className={cn('inline-flex gap-1 rounded-md border border-border p-1', className)}
      {...props}
    />
  )
}
export function ToggleGroupItem({ className, ...props }: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      className={cn(
        'inline-flex h-9 min-w-9 items-center justify-center rounded px-3 text-sm text-muted hover:bg-raised data-[state=on]:bg-accent-soft data-[state=on]:text-accent-ink disabled:opacity-40',
        className,
      )}
      {...props}
    />
  )
}
