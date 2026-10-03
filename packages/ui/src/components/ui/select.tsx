import type { ComponentProps } from 'react'
import { Select as Primitive } from 'radix-ui'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../lib/utils.js'

export const Select = Primitive.Root
export const SelectValue = Primitive.Value
export const SelectGroup = Primitive.Group
export function SelectTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Trigger>) {
  return (
    <Primitive.Trigger
      className={cn(
        'flex h-10 w-full items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-background px-3 text-left text-sm data-[placeholder]:text-muted disabled:opacity-40 [&>span:first-child]:min-w-0 [&>span:first-child]:truncate',
        className,
      )}
      {...props}
    >
      {children}
      <Primitive.Icon asChild>
        <ChevronDown size={16} />
      </Primitive.Icon>
    </Primitive.Trigger>
  )
}
export function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        position={position}
        sideOffset={5}
        className={cn(
          'z-[60] max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-surface p-1 text-sm shadow-lg',
          className,
        )}
        {...props}
      >
        <Primitive.ScrollUpButton className="flex justify-center py-1">
          <ChevronUp size={16} />
        </Primitive.ScrollUpButton>
        <Primitive.Viewport>{children}</Primitive.Viewport>
        <Primitive.ScrollDownButton className="flex justify-center py-1">
          <ChevronDown size={16} />
        </Primitive.ScrollDownButton>
      </Primitive.Content>
    </Primitive.Portal>
  )
}
export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      className={cn(
        'relative flex cursor-default select-none items-center rounded py-2 pr-8 pl-3 outline-none data-[highlighted]:bg-raised data-[disabled]:opacity-40',
        className,
      )}
      {...props}
    >
      <Primitive.ItemText>{children}</Primitive.ItemText>
      <Primitive.ItemIndicator className="absolute right-2">
        <Check size={16} />
      </Primitive.ItemIndicator>
    </Primitive.Item>
  )
}
export function SelectLabel({ className, ...props }: ComponentProps<typeof Primitive.Label>) {
  return <Primitive.Label className={cn('px-3 py-2 font-medium', className)} {...props} />
}
export function SelectSeparator({
  className,
  ...props
}: ComponentProps<typeof Primitive.Separator>) {
  return <Primitive.Separator className={cn('my-1 h-px bg-border', className)} {...props} />
}
