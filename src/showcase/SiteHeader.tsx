import { Menu, Moon, Search, Sun } from 'lucide-react'
import { Button } from '../components/ui/button'
import type { NavigationSection } from './routes'
import { AppearanceMenu } from './AppearanceMenu'

const navigation = [
  { id: 'components', href: '#components', name: 'Components' },
  { id: 'templates', href: '#templates', name: 'Templates' },
  { id: 'foundations', href: '#colors', name: 'Foundations' },
  { id: 'installation', href: '#installation', name: 'Installation' },
] as const

export function SiteHeader({
  section,
  theme,
  onTheme,
  onSearch,
  onMenu,
}: {
  section: NavigationSection
  theme: 'dark' | 'light'
  onTheme: () => void
  onSearch: () => void
  onMenu: () => void
}) {
  return (
    <header className="site-header">
      <a href="#overview" className="brand" aria-label="Vagabond UI home">
        <svg width="23" height="26" viewBox="0 0 30 32" fill="none" aria-hidden="true">
          <path d="m2 5 10 23h6L28 5h-7l-6 15-6-15H2Z" fill="currentColor" />
        </svg>
        vagabond <span>ui</span>
      </a>
      <nav className="top-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={section === item.id ? 'active' : ''}
            aria-current={section === item.id ? 'page' : undefined}
          >
            {item.name}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <button
          type="button"
          className="header-search"
          aria-label="Search documentation"
          onClick={onSearch}
        >
          <Search size={16} />
          <span>Search documentation</span>
          <kbd>⌘ K</kbd>
        </button>
        <AppearanceMenu />
        <Button
          variant="ghost"
          size="icon"
          onClick={onTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="mobile-menu-button"
          aria-label="Open navigation"
          onClick={onMenu}
        >
          <Menu size={20} />
        </Button>
      </div>
    </header>
  )
}
