'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { useAnimationControls, useDragControls, useReducedMotion, type PanInfo } from 'motion/react'
import { shouldDismissDrawer, type DrawerDirection } from './drawer-gesture.js'

export function useDrawerMotion({
  open,
  direction,
  setOpen,
  draggable,
}: {
  open: boolean
  direction: DrawerDirection
  setOpen: (open: boolean) => void
  draggable: boolean
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const openRef = useRef(open)
  const mounted = useRef(false)
  const controls = useAnimationControls()
  const dragControls = useDragControls()
  const reduced = useReducedMotion()
  const [dragging, setDragging] = useState(false)
  const axis: 'x' | 'y' = direction === 'bottom' ? 'y' : 'x'
  const transition = reduced
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 38, mass: 0.85 }

  useLayoutEffect(() => {
    openRef.current = open
  }, [open])
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  useEffect(() => {
    if (open) void controls.start({ x: 0, y: 0 })
  }, [open, direction, controls])

  const start = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!draggable || !openRef.current || !event.isPrimary || event.button !== 0) return
      event.preventDefault()
      dragControls.start(event)
    },
    [draggable, dragControls],
  )

  function onDragEnd(_event: MouseEvent | TouchEvent | globalThis.PointerEvent, info: PanInfo) {
    if (!mounted.current || !openRef.current) return
    setDragging(false)
    const bounds = panelRef.current?.getBoundingClientRect()
    const size = axis === 'y' ? bounds?.height : bounds?.width
    if (shouldDismissDrawer(info.offset[axis], info.velocity[axis], size || 0)) {
      setOpen(false)
      // A controlled owner may reject dismissal. In that case return the panel to rest.
      requestAnimationFrame(() => {
        if (mounted.current && openRef.current) void controls.start({ x: 0, y: 0 })
      })
    } else void controls.start({ x: 0, y: 0 })
  }

  return {
    panelRef,
    controls,
    dragControls,
    reduced,
    dragging,
    axis,
    transition,
    start,
    initial: reduced
      ? { x: 0, y: 0 }
      : direction === 'bottom'
        ? { x: 0, y: '100%' }
        : { x: '100%', y: 0 },
    exit: {
      ...(direction === 'bottom' ? { x: 0, y: '100%' } : { x: '100%', y: 0 }),
      transition: { duration: reduced ? 0 : 0.22, ease: [0.32, 0, 0.67, 0] as const },
    },
    onDragStart: () => setDragging(true),
    onDragEnd,
  }
}
