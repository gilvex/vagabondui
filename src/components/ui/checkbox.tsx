import type { ComponentProps } from 'react'
import { Checkbox as Primitive } from 'radix-ui'
import { Check, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Checkbox({ className, checked, ...props }: ComponentProps<typeof Primitive.Root>) {
  return (
    <Primitive.Root
      data-slot="checkbox"
      checked={checked}
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded border border-[var(--border-strong)] bg-background disabled:opacity-40 data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background data-[state=indeterminate]:bg-foreground data-[state=indeterminate]:text-background',
        className,
      )}
      {...props}
    >
      <Primitive.Indicator>
        {checked === 'indeterminate' ? <Minus size={14} /> : <Check size={14} />}
      </Primitive.Indicator>
    </Primitive.Root>
  )
}
