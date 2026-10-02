import type { ComponentProps } from 'react'
import { Accordion as Primitive } from 'radix-ui'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export const Accordion = Primitive.Root
export function AccordionItem({ className, ...props }: ComponentProps<typeof Primitive.Item>) {
  return <Primitive.Item className={cn('border-b border-border', className)} {...props} />
}
export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Trigger>) {
  return (
    <Primitive.Header>
      <Primitive.Trigger
        className={cn(
          'group flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium hover:underline',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          size={16}
          className="shrink-0 transition-transform group-data-[state=open]:rotate-180"
        />
      </Primitive.Trigger>
    </Primitive.Header>
  )
}
export function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Content
      data-slot="accordion-content"
      className="ui-accordion-content overflow-hidden text-sm leading-relaxed text-muted"
      {...props}
    >
      <div className={cn('pb-4', className)}>{children}</div>
    </Primitive.Content>
  )
}
