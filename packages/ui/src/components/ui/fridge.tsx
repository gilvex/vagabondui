'use client'

import { Drawer, DrawerContent, type DrawerProps, type DrawerContentProps } from './drawer.js'

/** Fridge is the library's named right-opening Drawer variant. */
export type FridgeProps = Omit<DrawerProps, 'direction'>
export function Fridge(props: FridgeProps) {
  return <Drawer {...props} direction="right" />
}
export function FridgeContent(props: DrawerContentProps) {
  return <DrawerContent closeLabel="Close Fridge" {...props} />
}
export {
  DrawerTrigger as FridgeTrigger,
  DrawerClose as FridgeClose,
  DrawerHandle as FridgeHandle,
  DrawerHeader as FridgeHeader,
  DrawerBody as FridgeBody,
  DrawerFooter as FridgeFooter,
  DrawerTitle as FridgeTitle,
  DrawerDescription as FridgeDescription,
} from './drawer.js'
