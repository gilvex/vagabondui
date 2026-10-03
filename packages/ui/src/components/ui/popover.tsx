import type { ComponentProps } from 'react'
import { Popover as Primitive } from 'radix-ui'
import { cn } from '../../lib/utils.js'

export const Popover = Primitive.Root
export const PopoverTrigger = Primitive.Trigger
export const PopoverClose = Primitive.Close
export const PopoverAnchor = Primitive.Anchor
export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 8,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-[60] w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface p-4 text-sm shadow-lg outline-none',
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  )
}
