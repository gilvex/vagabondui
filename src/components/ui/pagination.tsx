import type { ComponentProps } from 'react'
import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react'
import { cn } from '../../lib/utils'
import { buttonVariants } from './button'

export function Pagination({ className, ...props }: ComponentProps<'nav'>) {
  return <nav aria-label="Pagination" className={cn('flex justify-center', className)} {...props} />
}
export function PaginationContent({ className, ...props }: ComponentProps<'ul'>) {
  return <ul className={cn('flex flex-wrap items-center gap-1', className)} {...props} />
}
export function PaginationItem(props: ComponentProps<'li'>) {
  return <li {...props} />
}
export function PaginationLink({
  className,
  isActive,
  ...props
}: ComponentProps<'a'> & { isActive?: boolean }) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({ variant: isActive ? 'outline' : 'ghost', size: 'icon' }),
        className,
      )}
      {...props}
    />
  )
}
export function PaginationPrevious(props: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Previous page" {...props}>
      <ChevronLeft size={18} />
    </PaginationLink>
  )
}
export function PaginationNext(props: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Next page" {...props}>
      <ChevronRight size={18} />
    </PaginationLink>
  )
}
export function PaginationEllipsis() {
  return (
    <span className="flex size-10 items-center justify-center">
      <Ellipsis size={18} aria-hidden="true" />
      <span className="sr-only">More pages</span>
    </span>
  )
}
