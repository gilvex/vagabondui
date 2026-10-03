import type { ComponentProps } from 'react'
import { Slot } from 'radix-ui'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils.js'

export function Breadcrumb(props: ComponentProps<'nav'>) {
  return <nav aria-label="Breadcrumb" {...props} />
}
export function BreadcrumbList({ className, ...props }: ComponentProps<'ol'>) {
  return (
    <ol
      className={cn('flex flex-wrap items-center gap-2 text-sm text-muted', className)}
      {...props}
    />
  )
}
export function BreadcrumbItem({ className, ...props }: ComponentProps<'li'>) {
  return <li className={cn('inline-flex items-center gap-2', className)} {...props} />
}
export function BreadcrumbLink({
  asChild,
  className,
  ...props
}: ComponentProps<'a'> & { asChild?: boolean }) {
  const Component = asChild ? Slot.Root : 'a'
  return <Component className={cn('hover:text-foreground', className)} {...props} />
}
export function BreadcrumbPage({ className, ...props }: ComponentProps<'span'>) {
  return <span aria-current="page" className={cn('text-foreground', className)} {...props} />
}
export function BreadcrumbSeparator({ children, ...props }: ComponentProps<'li'>) {
  return (
    <li aria-hidden="true" {...props}>
      {children || <ChevronRight size={14} />}
    </li>
  )
}
