import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { isBrand, isColorMode, type BrandId, type ColorMode } from 'vagabond-ui/brands'

type Appearance = { brand: BrandId; theme: ColorMode }
type AppearanceContextValue = Appearance & {
  setBrand: (brand: BrandId) => void
  setTheme: (theme: ColorMode) => void
  toggleTheme: () => void
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null)

function readInitialAppearance(): Appearance {
  const { brand, theme } = document.documentElement.dataset
  return { brand: isBrand(brand) ? brand : 'vagabond', theme: isColorMode(theme) ? theme : 'dark' }
}

function applyAppearance(appearance: Appearance) {
  const root = document.documentElement
  root.dataset.brand = appearance.brand
  root.dataset.theme = appearance.theme
  try {
    localStorage.setItem('vagabond-brand', appearance.brand)
    localStorage.setItem('vagabond-theme', appearance.theme)
  } catch {
    /* The preview remains usable when browser storage is unavailable. */
  }
  const url = new URL(window.location.href)
  url.searchParams.set('brand', appearance.brand)
  url.searchParams.set('theme', appearance.theme)
  window.history.replaceState(window.history.state, '', url)
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState(readInitialAppearance)
  const setBrand = useCallback(
    (brand: BrandId) => {
      const next = { ...appearance, brand }
      applyAppearance(next)
      setAppearance(next)
    },
    [appearance],
  )
  const setTheme = useCallback(
    (theme: ColorMode) => {
      const next = { ...appearance, theme }
      applyAppearance(next)
      setAppearance(next)
    },
    [appearance],
  )
  const toggleTheme = useCallback(
    () => setTheme(appearance.theme === 'dark' ? 'light' : 'dark'),
    [appearance.theme, setTheme],
  )
  const value = useMemo(
    () => ({ ...appearance, setBrand, setTheme, toggleTheme }),
    [appearance, setBrand, setTheme, toggleTheme],
  )
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance() {
  const context = useContext(AppearanceContext)
  if (!context) throw new Error('Appearance controls require AppearanceProvider.')
  return context
}
