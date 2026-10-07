'use client'

import { createContext, useContext, type PointerEvent } from 'react'
import type { DrawerDirection } from './drawer-gesture.js'

export type DrawerState = {
  open: boolean
  direction: DrawerDirection
  setOpen: (open: boolean) => void
}
export const DrawerContext = createContext<DrawerState | null>(null)
export const DrawerDragContext = createContext<{
  enabled: boolean
  start: (event: PointerEvent<HTMLDivElement>) => void
} | null>(null)

export function useDrawer() {
  const context = useContext(DrawerContext)
  if (!context) throw new Error('Drawer parts must be rendered inside Drawer or Fridge.')
  return context
}

export function useDrawerDrag() {
  const context = useContext(DrawerDragContext)
  if (!context)
    throw new Error('DrawerHandle must be rendered inside DrawerContent or FridgeContent.')
  return context
}
