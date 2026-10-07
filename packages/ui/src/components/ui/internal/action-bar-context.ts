'use client'

import { createContext, useContext } from 'react'

export const ActionBarContext = createContext<{ dismiss: () => void } | null>(null)

export function useActionBar() {
  const context = useContext(ActionBarContext)
  if (!context) throw new Error('ActionBarClose must be rendered inside ActionBar.')
  return context
}
