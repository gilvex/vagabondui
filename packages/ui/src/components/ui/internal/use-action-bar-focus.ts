'use client'

import { useLayoutEffect, useRef, type FocusEvent, type RefObject } from 'react'

/** Non-modal bars never take focus on open; restore only if focus was inside on dismissal. */
export function useActionBarFocus(
  present: boolean,
  returnFocusRef?: RefObject<HTMLElement | null>,
) {
  const ref = useRef<HTMLDivElement>(null)
  const previous = useRef<HTMLElement | null>(null)
  const ownedFocus = useRef(false)

  useLayoutEffect(() => {
    const node = ref.current
    if (present) {
      previous.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      return
    }
    const active = document.activeElement
    const target = returnFocusRef?.current ?? previous.current
    if (
      ownedFocus.current &&
      (node?.contains(active) || active === document.body) &&
      target?.isConnected &&
      target !== document.body &&
      !node?.contains(target)
    ) {
      target.focus({ preventScroll: true })
    }
  }, [present, returnFocusRef])

  return {
    ref,
    onFocusCapture(event: FocusEvent<HTMLDivElement>) {
      if (event.currentTarget.contains(event.target)) ownedFocus.current = true
    },
    onBlurCapture(event: FocusEvent<HTMLDivElement>) {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget))
        ownedFocus.current = false
    },
  }
}
