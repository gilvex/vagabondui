import type { ComponentProps } from 'react'
import { Label as Primitive } from 'radix-ui'
import { cn } from '../../lib/utils.js'

export function Label({ className, ...props }: ComponentProps<typeof Primitive.Root>) {
  return (
    <Primitive.Root className={cn('text-sm font-medium leading-relaxed', className)} {...props} />
  )
}
