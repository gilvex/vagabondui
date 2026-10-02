import { useEffect, useRef, useSyncExternalStore } from 'react'
import { resolveRoute } from './routes'

function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}
const getSnapshot = () => window.location.hash

export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, getSnapshot, () => '')
  const previous = useRef(hash)
  useEffect(() => {
    if (previous.current === hash) return
    previous.current = hash
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [hash])
  return resolveRoute(hash)
}
