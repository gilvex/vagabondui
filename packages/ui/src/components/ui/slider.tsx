import type { ComponentProps } from 'react'
import { Slider as Primitive } from 'radix-ui'
import { cn } from '../../lib/utils.js'

export function Slider({
  className,
  value,
  defaultValue = [0],
  thumbLabels,
  ...props
}: ComponentProps<typeof Primitive.Root> & { thumbLabels?: string[] }) {
  const values = value || defaultValue
  return (
    <Primitive.Root
      value={value}
      defaultValue={defaultValue}
      className={cn(
        'relative flex h-8 w-full touch-none select-none items-center data-[disabled]:opacity-40 data-[orientation=vertical]:h-48 data-[orientation=vertical]:w-8 data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <Primitive.Track className="relative grow overflow-hidden rounded-full bg-raised data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2">
        <Primitive.Range className="absolute rounded-full bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
      </Primitive.Track>
      {values.map((_, index) => (
        <Primitive.Thumb
          key={index}
          aria-label={thumbLabels?.[index] || props['aria-label']}
          className="block size-5 rounded-full border-2 border-primary bg-background shadow-sm"
        />
      ))}
    </Primitive.Root>
  )
}
