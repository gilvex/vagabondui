'use client'

import { useCallback, useMemo, useState, type ComponentProps } from 'react'
import { Dialog as Primitive } from 'radix-ui'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { Button } from './button.js'
import {
  DrawerContext,
  DrawerDragContext,
  useDrawer,
  useDrawerDrag,
} from './internal/drawer-context.js'
import { useDrawerMotion } from './internal/use-drawer-motion.js'
import { useOverlayFocus } from './internal/use-overlay-focus.js'
import type { DrawerDirection } from './internal/drawer-gesture.js'

export type DrawerProps = ComponentProps<typeof Primitive.Root> & { direction?: DrawerDirection }
export function Drawer({
  open,
  defaultOpen = false,
  onOpenChange,
  direction = 'bottom',
  children,
  ...props
}: DrawerProps) {
  const [localOpen, setLocalOpen] = useState(defaultOpen)
  const currentOpen = open ?? localOpen
  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setLocalOpen(next)
      if (next !== currentOpen) onOpenChange?.(next)
    },
    [open, currentOpen, onOpenChange],
  )
  const context = useMemo(
    () => ({ open: currentOpen, direction, setOpen }),
    [currentOpen, direction, setOpen],
  )
  return (
    <DrawerContext.Provider value={context}>
      <Primitive.Root {...props} open={currentOpen} onOpenChange={setOpen}>
        {children}
      </Primitive.Root>
    </DrawerContext.Provider>
  )
}

export const DrawerTrigger = Primitive.Trigger
export const DrawerClose = Primitive.Close

export type DrawerContentProps = Omit<
  ComponentProps<typeof Primitive.Content>,
  | 'asChild'
  | 'forceMount'
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'draggable'
> & {
  draggable?: boolean
  showHandle?: boolean
  showCloseButton?: boolean
  closeLabel?: string
  overlayClassName?: string
}

function DrawerSurface({
  draggable = true,
  showHandle = draggable,
  showCloseButton = true,
  closeLabel = 'Close drawer',
  className,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  ...props
}: Omit<DrawerContentProps, 'overlayClassName'>) {
  const drawer = useDrawer()
  const gesture = useDrawerMotion({ ...drawer, draggable })
  const focus = useOverlayFocus({ onOpenAutoFocus, onCloseAutoFocus, onEscapeKeyDown })
  const dragContext = useMemo(
    () => ({ enabled: draggable, start: gesture.start }),
    [draggable, gesture.start],
  )

  return (
    <Primitive.Content forceMount asChild {...focus} {...props}>
      <motion.div
        ref={gesture.panelRef}
        data-slot="drawer-content"
        data-drawer-panel=""
        data-direction={drawer.direction}
        data-handle={showHandle || undefined}
        data-dragging={gesture.dragging || undefined}
        className={cn(
          'ui-drawer-panel fixed z-50 flex flex-col border border-border bg-surface text-foreground shadow-2xl outline-none',
          className,
        )}
        initial={gesture.initial}
        animate={gesture.controls}
        exit={gesture.exit}
        transition={gesture.transition}
        drag={draggable ? gesture.axis : false}
        dragControls={gesture.dragControls}
        dragListener={false}
        dragMomentum={false}
        dragConstraints={
          drawer.direction === 'bottom' ? { top: 0, bottom: 0 } : { left: 0, right: 0 }
        }
        dragElastic={drawer.direction === 'bottom' ? { top: 0, bottom: 1 } : { left: 0, right: 1 }}
        onDragStart={gesture.onDragStart}
        onDragEnd={gesture.onDragEnd}
      >
        <DrawerDragContext.Provider value={dragContext}>
          {showHandle && <DrawerHandle />}
          {showCloseButton && (
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ui-drawer-close absolute right-4 top-4 z-10"
                aria-label={closeLabel}
              >
                <X size={18} />
              </Button>
            </DrawerClose>
          )}
          {children}
        </DrawerDragContext.Provider>
      </motion.div>
    </Primitive.Content>
  )
}

export function DrawerContent({ overlayClassName, ...props }: DrawerContentProps) {
  const { open } = useDrawer()
  const reduced = useReducedMotion()
  return (
    <AnimatePresence>
      {open && (
        <Primitive.Portal key="drawer" forceMount>
          <Primitive.Overlay forceMount asChild>
            <motion.div
              data-slot="drawer-overlay"
              className={cn('fixed inset-0 z-50 bg-black/60', overlayClassName)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
            />
          </Primitive.Overlay>
          <DrawerSurface {...props} />
        </Primitive.Portal>
      )}
    </AnimatePresence>
  )
}

export function DrawerHandle({ className, onPointerDown, ...props }: ComponentProps<'div'>) {
  const { direction } = useDrawer()
  const drag = useDrawerDrag()
  return (
    <div
      {...props}
      data-slot="drawer-handle"
      data-direction={direction}
      data-enabled={drag.enabled || undefined}
      aria-hidden="true"
      className={cn('ui-drawer-handle touch-none select-none', className)}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (!event.defaultPrevented) drag.start(event)
      }}
    >
      <span />
    </div>
  )
}
export function DrawerHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn('shrink-0 space-y-2 border-b border-border px-6 pb-5 pt-5 pr-16', className)}
      {...props}
    />
  )
}
export function DrawerBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-body"
      tabIndex={0}
      className={cn(
        'min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 outline-offset-[-3px]',
        className,
      )}
      {...props}
    />
  )
}
export function DrawerFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        'ui-drawer-footer flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-4',
        className,
      )}
      {...props}
    />
  )
}
export function DrawerTitle({ className, ...props }: ComponentProps<typeof Primitive.Title>) {
  return (
    <Primitive.Title
      data-slot="drawer-title"
      className={cn('font-heading text-2xl font-semibold tracking-tight', className)}
      {...props}
    />
  )
}
export function DrawerDescription({
  className,
  ...props
}: ComponentProps<typeof Primitive.Description>) {
  return (
    <Primitive.Description
      data-slot="drawer-description"
      className={cn('text-sm leading-relaxed text-muted', className)}
      {...props}
    />
  )
}
