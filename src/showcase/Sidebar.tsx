import type { MouseEvent } from 'react'
import { catalog, pages, type PageId } from './catalog'
import { templateCatalog } from '../templates/catalog'

const groups = ['Getting started', 'Templates', 'Foundations', 'Components', 'Resources']
const components = [...catalog].sort((a, b) => a.name.localeCompare(b.name))
const links = groups.map((group) => ({
  group,
  entries: [
    ...pages
      .filter((page) => page.group === group)
      .map((page) => ({ id: page.id, name: page.name })),
    ...(group === 'Templates'
      ? templateCatalog.map((item) => ({ id: `template/${item.id}`, name: item.name }))
      : []),
    ...(group === 'Components'
      ? components.map((item) => ({ id: `component/${item.id}`, name: item.name }))
      : []),
  ],
}))

export function Sidebar({ page, navigate }: { page: PageId; navigate: (path: string) => void }) {
  function follow(event: MouseEvent<HTMLAnchorElement>, path: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
      return
    event.preventDefault()
    navigate(path)
  }
  return (
    <nav className="sidebar-nav" aria-label="Documentation">
      {links.map(({ group, entries }) => (
        <div className="nav-group" key={group}>
          <h2>{group}</h2>
          {entries.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`sidebar-link ${page === item.id ? 'active' : ''}`}
              aria-current={page === item.id ? 'page' : undefined}
              onClick={(event) => follow(event, item.id)}
            >
              {item.name}
            </a>
          ))}
        </div>
      ))}
    </nav>
  )
}
