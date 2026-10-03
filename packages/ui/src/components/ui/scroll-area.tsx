import type { ComponentProps } from 'react'
import { ScrollArea as Primitive } from 'radix-ui'
import { cn } from '../../lib/utils.js'

export function ScrollArea({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Root>) {
  return (
    <Primitive.Root
      role={props['aria-label'] || props['aria-labelledby'] ? 'region' : undefined}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <Primitive.Viewport tabIndex={0} className="size-full rounded-[inherit]">
        {children}
      </Primitive.Viewport>
      <ScrollBar />
      <Primitive.Corner />
    </Primitive.Root>
  )
}
export function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: ComponentProps<typeof Primitive.Scrollbar>) {
  return (
    <Primitive.Scrollbar
      orientation={orientation}
      className={cn(
        'flex touch-none select-none p-0.5',
        orientation === 'vertical' ? 'h-full w-2.5' : 'h-2.5 flex-col',
        className,
      )}
      {...props}
    >
      <Primitive.Thumb className="relative flex-1 rounded-full bg-[var(--border-strong)]" />
    </Primitive.Scrollbar>
  )
}
