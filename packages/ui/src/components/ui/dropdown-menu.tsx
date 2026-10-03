import type { ComponentProps } from 'react'
import { DropdownMenu as Primitive } from 'radix-ui'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '../../lib/utils.js'

export const DropdownMenu = Primitive.Root
export const DropdownMenuTrigger = Primitive.Trigger
export const DropdownMenuGroup = Primitive.Group
export const DropdownMenuSub = Primitive.Sub
export const DropdownMenuRadioGroup = Primitive.RadioGroup
const contentClass =
  'ui-popover-enter z-[60] min-w-48 rounded-md border border-border bg-surface p-1 text-sm text-foreground shadow-lg'
const itemClass =
  'relative flex cursor-default select-none items-center gap-2 rounded px-3 py-2 outline-none data-[highlighted]:bg-raised data-[disabled]:pointer-events-none data-[disabled]:opacity-40'

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        sideOffset={sideOffset}
        className={cn(
          contentClass,
          'max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto',
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  )
}
export function DropdownMenuItem({ className, ...props }: ComponentProps<typeof Primitive.Item>) {
  return <Primitive.Item className={cn(itemClass, className)} {...props} />
}
export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof Primitive.Label>) {
  return <Primitive.Label className={cn('px-3 py-2 text-sm font-medium', className)} {...props} />
}
export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof Primitive.Separator>) {
  return <Primitive.Separator className={cn('my-1 h-px bg-border', className)} {...props} />
}
export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.CheckboxItem>) {
  return (
    <Primitive.CheckboxItem className={cn(itemClass, 'pl-9', className)} {...props}>
      <span className="absolute left-3">
        <Primitive.ItemIndicator>
          <Check size={14} />
        </Primitive.ItemIndicator>
      </span>
      {children}
    </Primitive.CheckboxItem>
  )
}
export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.RadioItem>) {
  return (
    <Primitive.RadioItem className={cn(itemClass, 'pl-9', className)} {...props}>
      <span className="absolute left-3">
        <Primitive.ItemIndicator>
          <Circle size={10} fill="currentColor" />
        </Primitive.ItemIndicator>
      </span>
      {children}
    </Primitive.RadioItem>
  )
}
export function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.SubTrigger>) {
  return (
    <Primitive.SubTrigger className={cn(itemClass, className)} {...props}>
      {children}
      <ChevronRight className="ml-auto" size={14} />
    </Primitive.SubTrigger>
  )
}
export function DropdownMenuSubContent({
  className,
  ...props
}: ComponentProps<typeof Primitive.SubContent>) {
  return (
    <Primitive.Portal>
      <Primitive.SubContent className={cn(contentClass, className)} {...props} />
    </Primitive.Portal>
  )
}
