'use client'

import { useCallback, useMemo, useState, type ComponentProps, type RefObject } from 'react'
import { Portal, Toolbar as Primitive } from 'radix-ui'
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { Button, type ButtonProps } from './button.js'
import { ActionBarContext, useActionBar } from './internal/action-bar-context.js'
import { useActionBarFocus } from './internal/use-action-bar-focus.js'

export type ActionBarProps = Omit<
  ComponentProps<typeof Primitive.Root>,
  | 'asChild'
  | 'aria-label'
  | 'orientation'
  | 'onAnimationStart'
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
> & {
  label: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: 'floating' | 'docked'
  position?: 'fixed' | 'sticky' | 'inline'
  align?: 'start' | 'center' | 'end'
  closeOnEscape?: boolean
  returnFocusRef?: RefObject<HTMLElement | null>
  positionerClassName?: string
  /** Fixed bars portal to body by default. Disable inside a dialog or scoped theme. */
  portalled?: boolean
  container?: ComponentProps<typeof Portal.Root>['container']
}

function ActionBarSurface({
  label,
  variant,
  position,
  align,
  closeOnEscape,
  returnFocusRef,
  positionerClassName,
  className,
  onKeyDown,
  children,
  ...props
}: Omit<ActionBarProps, 'open' | 'defaultOpen' | 'onOpenChange' | 'portalled' | 'container'>) {
  const { dismiss } = useActionBar()
  const present = useIsPresent()
  const reduced = useReducedMotion()
  const focus = useActionBarFocus(present, returnFocusRef)
  return (
    <div
      data-slot="action-bar-positioner"
      data-position={position}
      data-variant={variant}
      data-align={align}
      className={cn('ui-action-bar-positioner', positionerClassName)}
    >
      <Primitive.Root
        {...props}
        asChild
        orientation="horizontal"
        aria-label={label}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          // Portalled menus keep their own Escape behavior despite React event bubbling.
          if (
            !event.defaultPrevented &&
            event.currentTarget.contains(event.target as Node) &&
            event.key === 'Escape' &&
            closeOnEscape
          ) {
            event.preventDefault()
            event.stopPropagation()
            dismiss()
          }
        }}
      >
        <motion.div
          {...focus}
          data-slot="action-bar"
          data-variant={variant}
          className={cn('ui-action-bar', className)}
          inert={!present || undefined}
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : 12 }}
          transition={{ duration: reduced ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </Primitive.Root>
    </div>
  )
}

/** A non-modal bottom toolbar for selection actions or save/discard workflows. */
export function ActionBar({
  open,
  defaultOpen = true,
  onOpenChange,
  variant = 'floating',
  position = 'fixed',
  align = 'center',
  closeOnEscape = true,
  portalled = position === 'fixed',
  container,
  ...props
}: ActionBarProps) {
  const [localOpen, setLocalOpen] = useState(defaultOpen)
  const currentOpen = open ?? localOpen
  const dismiss = useCallback(() => {
    if (open === undefined) setLocalOpen(false)
    if (currentOpen) onOpenChange?.(false)
  }, [open, currentOpen, onOpenChange])
  const context = useMemo(() => ({ dismiss }), [dismiss])
  const content = (
    <AnimatePresence>
      {currentOpen && (
        <ActionBarSurface
          key="action-bar"
          {...props}
          variant={variant}
          position={position}
          align={align}
          closeOnEscape={closeOnEscape}
        />
      )}
    </AnimatePresence>
  )
  return (
    <ActionBarContext.Provider value={context}>
      {portalled ? (
        <Portal.Root asChild container={container}>
          <div data-slot="action-bar-portal">{content}</div>
        </Portal.Root>
      ) : (
        content
      )}
    </ActionBarContext.Provider>
  )
}

export function ActionBarButton({ disabled, loading, ...props }: ButtonProps) {
  return (
    <Primitive.Button asChild disabled={disabled || loading}>
      <Button variant="outline" disabled={disabled} loading={loading} {...props} />
    </Primitive.Button>
  )
}

export function ActionBarClose({ onClick, children, ...props }: ButtonProps) {
  const { dismiss } = useActionBar()
  return (
    <ActionBarButton
      variant="ghost"
      size="icon"
      aria-label="Dismiss actions"
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) dismiss()
      }}
    >
      {children ?? <X size={18} aria-hidden="true" />}
    </ActionBarButton>
  )
}

export function ActionBarLabel({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div data-slot="action-bar-label" className={cn('ui-action-bar-label', className)} {...props} />
  )
}

export function ActionBarGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div data-slot="action-bar-group" className={cn('ui-action-bar-group', className)} {...props} />
  )
}

export function ActionBarSeparator({
  className,
  ...props
}: ComponentProps<typeof Primitive.Separator>) {
  return (
    <Primitive.Separator
      data-slot="action-bar-separator"
      orientation="vertical"
      className={cn('h-6 w-px shrink-0 bg-border', className)}
      {...props}
    />
  )
}
