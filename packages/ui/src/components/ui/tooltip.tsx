import type { ComponentProps, ReactNode } from 'react'
import { Tooltip as Primitive } from 'radix-ui'
import { cn } from '../../lib/utils.js'

export const TooltipProvider = Primitive.Provider
export const TooltipTrigger = Primitive.Trigger
export function Tooltip({
  children,
  content,
  ...props
}: ComponentProps<typeof Primitive.Root> & { content?: ReactNode }) {
  return (
    <TooltipProvider delayDuration={350}>
      <Primitive.Root {...props}>
        {content ? (
          <>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent>{content}</TooltipContent>
          </>
        ) : (
          children
        )}
      </Primitive.Root>
    </TooltipProvider>
  )
}
export function TooltipContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-[70] max-w-xs rounded-md border border-border bg-raised px-3 py-2 text-sm text-foreground shadow-lg',
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  )
}
