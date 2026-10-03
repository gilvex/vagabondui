import { lazy, Suspense, useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from 'vagabond-ui/sheet'
import { Toaster } from 'vagabond-ui/sonner'
import { PageErrorBoundary } from './showcase/PageErrorBoundary'
import { RouteContent } from './showcase/RouteContent'
import { Sidebar } from './showcase/Sidebar'
import { SiteHeader } from './showcase/SiteHeader'
import { useHashRoute } from './showcase/use-hash-route'
import { useAppearance } from './showcase/appearance'
import { version } from 'vagabond-ui/package.json'

const SearchDialog = lazy(() =>
  import('./showcase/SearchDialog').then((module) => ({ default: module.SearchDialog })),
)

export default function App() {
  const route = useHashRoute()
  const { theme, toggleTheme } = useAppearance()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const fullWidth = route.kind === 'template'

  function navigate(path: string) {
    setMobileOpen(false)
    setSearchOpen(false)
    window.location.hash = path
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.title = `${route.name} — Vagabond UI`
  }, [route.name])

  return (
    <>
      <a
        href="#main-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to content
      </a>
      <SiteHeader
        section={route.section}
        theme={theme}
        onTheme={toggleTheme}
        onSearch={() => setSearchOpen(true)}
        onMenu={() => setMobileOpen(true)}
      />
      {!fullWidth && (
        <aside className="sidebar">
          <Sidebar page={route.id} navigate={navigate} />
        </aside>
      )}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="mobile-navigation">
          <SheetHeader>
            <SheetTitle>Documentation</SheetTitle>
            <SheetDescription>Components and foundations.</SheetDescription>
          </SheetHeader>
          <Sidebar page={route.id} navigate={navigate} />
        </SheetContent>
      </Sheet>
      <main
        id="main-content"
        className={`main-content ${fullWidth ? 'template-main' : ''}`}
        tabIndex={-1}
      >
        <div className="page-topline">
          <a href="#overview">Documentation</a>
          <ChevronRight size={14} />
          <span>{route.name}</span>
        </div>
        <PageErrorBoundary resetKey={route.id}>
          <Suspense
            fallback={
              <p role="status" className="docs-page">
                Loading page…
              </p>
            }
          >
            <RouteContent route={route} />
          </Suspense>
        </PageErrorBoundary>
        <footer className="site-footer">
          <span>Vagabond UI · MIT License</span>
          <a href="#research">Effect-inspired, independently built.</a>
          <span>v{version}</span>
        </footer>
      </main>
      <Suspense fallback={null}>
        {searchOpen && (
          <SearchDialog open={searchOpen} setOpen={setSearchOpen} navigate={navigate} />
        )}
      </Suspense>
      <Toaster theme={theme} />
    </>
  )
}
