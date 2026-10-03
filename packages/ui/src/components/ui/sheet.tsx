'use client'

import type { ComponentProps } from 'react'
import { Dialog as Primitive } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { Button } from './button.js'
import { useOverlayFocus } from './internal/use-overlay-focus.js'

export const Sheet = Primitive.Root
export const SheetTrigger = Primitive.Trigger
export const SheetClose = Primitive.Close
export function SheetContent({
  className,
  children,
  side = 'right',
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  ...props
}: ComponentProps<typeof Primitive.Content> & { side?: 'left' | 'right' }) {
  const focusHandlers = useOverlayFocus({ onOpenAutoFocus, onCloseAutoFocus, onEscapeKeyDown })
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/65" />
      <Primitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          'ui-sheet-content fixed inset-y-0 z-50 w-[min(400px,calc(100%-1rem))] overflow-y-auto border-border bg-surface p-6 shadow-xl',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          className,
        )}
        {...focusHandlers}
        {...props}
      >
        {children}
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3"
            aria-label="Close panel"
          >
            <X size={18} />
          </Button>
        </SheetClose>
      </Primitive.Content>
    </Primitive.Portal>
  )
}
export function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('space-y-2 pr-9', className)} {...props} />
}
export function SheetFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mt-6 flex gap-3', className)} {...props} />
}
export function SheetTitle({ className, ...props }: ComponentProps<typeof Primitive.Title>) {
  return <Primitive.Title className={cn('text-xl font-semibold', className)} {...props} />
}
export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof Primitive.Description>) {
  return (
    <Primitive.Description
      className={cn('text-sm leading-relaxed text-muted', className)}
      {...props}
    />
  )
}
