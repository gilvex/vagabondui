import type { ComponentProps } from 'react'
import { Dialog as Primitive } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './button'
import { useOverlayFocus } from './internal/use-overlay-focus'

export const Dialog = Primitive.Root
export const DialogTrigger = Primitive.Trigger
export const DialogClose = Primitive.Close
export const DialogPortal = Primitive.Portal

export function DialogOverlay({ className, ...props }: ComponentProps<typeof Primitive.Overlay>) {
  return (
    <Primitive.Overlay
      data-slot="dialog-overlay"
      className={cn('dialog-overlay fixed inset-0 z-50 bg-black/65', className)}
      {...props}
    />
  )
}

export function DialogContent({
  title,
  description,
  children,
  className,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  ...props
}: ComponentProps<typeof Primitive.Content> & { title?: string; description?: string }) {
  const focusHandlers = useOverlayFocus({ onOpenAutoFocus, onCloseAutoFocus, onEscapeKeyDown })

  return (
    <DialogPortal>
      <DialogOverlay />
      {/* Centering is layout, not an animated transform. It remains stable from the first frame. */}
      <div className="dialog-positioner pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
        <Primitive.Content
          data-slot="dialog-content"
          className={cn(
            'dialog-content pointer-events-auto relative max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-lg border border-border bg-surface p-6 text-base shadow-xl',
            className,
          )}
          {...focusHandlers}
          {...props}
        >
          {title && (
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
          )}
          {children}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              aria-label="Close dialog"
            >
              <X size={18} />
            </Button>
          </DialogClose>
        </Primitive.Content>
      </div>
    </DialogPortal>
  )
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('space-y-2 pr-9', className)} {...props} />
}
export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mt-6 flex flex-wrap justify-end gap-3', className)} {...props} />
}
export function DialogTitle({ className, ...props }: ComponentProps<typeof Primitive.Title>) {
  return (
    <Primitive.Title className={cn('text-xl font-semibold tracking-tight', className)} {...props} />
  )
}
export function DialogDescription({
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
