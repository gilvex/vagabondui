import type { ComponentProps } from 'react'
import { AlertDialog as Primitive } from 'radix-ui'
import { cn } from '../../lib/utils.js'
import { buttonVariants } from './button.js'

export const AlertDialog = Primitive.Root
export const AlertDialogTrigger = Primitive.Trigger
export function AlertDialogContent({
  className,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/65" />
      <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
        <Primitive.Content
          className={cn(
            'dialog-content pointer-events-auto max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-6 shadow-xl',
            className,
          )}
          {...props}
        />
      </div>
    </Primitive.Portal>
  )
}
export function AlertDialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('space-y-2', className)} {...props} />
}
export function AlertDialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mt-6 flex flex-wrap justify-end gap-3', className)} {...props} />
}
export function AlertDialogTitle({ className, ...props }: ComponentProps<typeof Primitive.Title>) {
  return <Primitive.Title className={cn('text-xl font-semibold', className)} {...props} />
}
export function AlertDialogDescription({
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
export function AlertDialogAction({
  className,
  ...props
}: ComponentProps<typeof Primitive.Action>) {
  return (
    <Primitive.Action
      className={cn(buttonVariants({ variant: 'destructive' }), className)}
      {...props}
    />
  )
}
export function AlertDialogCancel({
  className,
  ...props
}: ComponentProps<typeof Primitive.Cancel>) {
  return (
    <Primitive.Cancel
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    />
  )
}
