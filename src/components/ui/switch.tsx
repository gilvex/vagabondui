import { useState, type ComponentProps } from 'react'
import { Switch as Primitive } from 'radix-ui'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/utils'

export function Switch({
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  ...props
}: ComponentProps<typeof Primitive.Root>) {
  const [localChecked, setLocalChecked] = useState(defaultChecked)
  const active = checked ?? localChecked
  const reduced = useReducedMotion()
  return (
    <Primitive.Root
      data-slot="switch"
      checked={active}
      onCheckedChange={(next) => {
        setLocalChecked(next)
        onCheckedChange?.(next)
      }}
      className={cn(
        'inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-[var(--border-strong)] bg-raised p-0.5 transition-colors data-[state=checked]:border-transparent data-[state=checked]:bg-foreground disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <Primitive.Thumb asChild>
        <motion.span
          data-slot="switch-thumb"
          initial={false}
          animate={{ x: active ? 20 : 0 }}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 30 }}
          className="block size-4.5 rounded-full bg-muted data-[state=checked]:bg-background"
        />
      </Primitive.Thumb>
    </Primitive.Root>
  )
}
