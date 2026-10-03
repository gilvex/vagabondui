import type { ComponentProps } from 'react'
import { Toggle as Primitive } from 'radix-ui'
import { cn } from '../../lib/utils.js'

export function Toggle({ className, ...props }: ComponentProps<typeof Primitive.Root>) {
  return (
    <Primitive.Root
      className={cn(
        'inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-md border border-transparent px-3 text-sm text-muted hover:bg-raised data-[state=on]:border-border data-[state=on]:bg-raised data-[state=on]:text-foreground disabled:opacity-40',
        className,
      )}
      {...props}
    />
  )
}
