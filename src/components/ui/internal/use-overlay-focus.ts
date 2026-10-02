import { useRef, type ComponentProps } from 'react'
import type { Dialog } from 'radix-ui'

type Handlers = Pick<
  ComponentProps<typeof Dialog.Content>,
  'onOpenAutoFocus' | 'onCloseAutoFocus' | 'onEscapeKeyDown'
>

/** Also restores focus for controlled overlays without a Radix Trigger. */
export function useOverlayFocus(handlers: Handlers): Handlers {
  const returnFocus = useRef<HTMLElement | null>(null)
  return {
    onOpenAutoFocus(event) {
      returnFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      handlers.onOpenAutoFocus?.(event)
    },
    onCloseAutoFocus(event) {
      handlers.onCloseAutoFocus?.(event)
      if (!event.defaultPrevented && returnFocus.current?.isConnected) {
        event.preventDefault()
        returnFocus.current.focus({ preventScroll: true })
      }
    },
    onEscapeKeyDown(event) {
      handlers.onEscapeKeyDown?.(event)
      // Only the top layer should handle this native event when overlays are nested.
      event.stopImmediatePropagation()
    },
  }
}
