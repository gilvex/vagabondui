import type { ComponentProps } from 'react'
import { RadioGroup as Primitive } from 'radix-ui'
import { cn } from '../../lib/utils'

export function RadioGroup({ className, ...props }: ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root className={cn('grid gap-3', className)} {...props} />
}
export function RadioGroupItem({ className, ...props }: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      className={cn(
        'size-5 shrink-0 rounded-full border border-[var(--border-strong)] bg-background text-foreground disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <Primitive.Indicator className="flex items-center justify-center">
        <span className="size-2.5 rounded-full bg-current" />
      </Primitive.Indicator>
    </Primitive.Item>
  )
}
