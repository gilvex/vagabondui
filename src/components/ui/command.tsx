import type { ComponentProps } from 'react'
import { Command as Primitive } from 'cmdk'
import { Search } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Command({ className, ...props }: ComponentProps<typeof Primitive>) {
  return (
    <Primitive
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-md border border-border bg-surface text-sm',
        className,
      )}
      {...props}
    />
  )
}
export function CommandInput({ className, ...props }: ComponentProps<typeof Primitive.Input>) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-3">
      <Search size={16} className="text-muted" />
      <Primitive.Input
        className={cn(
          'h-12 w-full bg-transparent text-base outline-none placeholder:text-muted md:text-sm',
          className,
        )}
        {...props}
      />
    </div>
  )
}
export function CommandList({ className, ...props }: ComponentProps<typeof Primitive.List>) {
  return <Primitive.List className={cn('max-h-64 overflow-y-auto p-1', className)} {...props} />
}
export function CommandEmpty(props: ComponentProps<typeof Primitive.Empty>) {
  return <Primitive.Empty className="py-6 text-center text-sm text-muted" {...props} />
}
export function CommandGroup({ className, ...props }: ComponentProps<typeof Primitive.Group>) {
  return (
    <Primitive.Group
      className={cn(
        '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:text-muted',
        className,
      )}
      {...props}
    />
  )
}
export function CommandItem({ className, ...props }: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      className={cn(
        'flex cursor-default select-none items-center gap-3 rounded px-3 py-2.5 text-sm data-[selected=true]:bg-raised data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40',
        className,
      )}
      {...props}
    />
  )
}
export function CommandSeparator({
  className,
  ...props
}: ComponentProps<typeof Primitive.Separator>) {
  return <Primitive.Separator className={cn('my-1 h-px bg-border', className)} {...props} />
}
