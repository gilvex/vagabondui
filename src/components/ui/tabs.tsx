import { createContext, useContext, useId, useMemo, useState, type ComponentProps } from 'react'
import { Tabs as Primitive } from 'radix-ui'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/utils'

const TabsContext = createContext({ value: '', indicatorId: '' })

export function Tabs({
  value,
  defaultValue = '',
  onValueChange,
  ...props
}: ComponentProps<typeof Primitive.Root>) {
  const [localValue, setLocalValue] = useState(defaultValue)
  const indicatorId = useId()
  const selected = value ?? localValue
  const context = useMemo(() => ({ value: selected, indicatorId }), [selected, indicatorId])
  return (
    <TabsContext.Provider value={context}>
      <Primitive.Root
        value={selected}
        onValueChange={(next) => {
          setLocalValue(next)
          onValueChange?.(next)
        }}
        {...props}
      />
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }: ComponentProps<typeof Primitive.List>) {
  return (
    <Primitive.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex max-w-full gap-1 overflow-x-auto rounded-md border border-border bg-background p-1',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  children,
  value,
  ...props
}: ComponentProps<typeof Primitive.Trigger>) {
  const context = useContext(TabsContext)
  const reduced = useReducedMotion()
  return (
    <Primitive.Trigger
      data-slot="tabs-trigger"
      value={value}
      className={cn(
        'relative isolate whitespace-nowrap rounded px-3 py-2 text-sm text-muted hover:text-foreground data-[state=active]:text-foreground',
        className,
      )}
      {...props}
    >
      {context.value === value && (
        <motion.span
          data-slot="tabs-indicator"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 rounded bg-raised"
          layoutId={`tab-${context.indicatorId}`}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
      {children}
    </Primitive.Trigger>
  )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Content
      data-slot="tabs-content"
      className={cn('ui-panel-enter mt-4', className)}
      {...props}
    />
  )
}
