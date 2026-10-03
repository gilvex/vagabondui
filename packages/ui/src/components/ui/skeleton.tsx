import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils.js'

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse rounded bg-raised', className)}
      {...props}
    />
  )
}
