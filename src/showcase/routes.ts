import { catalog, pages, type CatalogEntry, type DocPageId, type PageId } from './catalog'
import { templateCatalog, type TemplateDefinition } from '../templates/catalog'

export type NavigationSection = 'components' | 'templates' | 'foundations' | 'installation' | null
type RouteBase = { id: PageId; name: string; section: NavigationSection }
export type Route = RouteBase &
  (
    | { kind: 'overview' }
    | { kind: 'components' }
    | { kind: 'component'; component: CatalogEntry }
    | { kind: 'templates' }
    | { kind: 'template'; template: TemplateDefinition }
    | { kind: 'docs'; page: Exclude<DocPageId, 'overview' | 'components' | 'templates'> }
  )

const overview: Route = {
  kind: 'overview',
  id: 'overview',
  name: 'Overview',
  section: 'components',
}

export function resolveRoute(hash: string): Route {
  const path = hash.replace(/^#/, '')
  const component = catalog.find((item) => path === `component/${item.id}`)
  if (component)
    return {
      kind: 'component',
      id: `component/${component.id}`,
      name: component.name,
      component,
      section: 'components',
    }
  const template = templateCatalog.find((item) => path === `template/${item.id}`)
  if (template)
    return {
      kind: 'template',
      id: `template/${template.id}`,
      name: template.name,
      template,
      section: 'templates',
    }
  const page = pages.find((item) => item.id === path)
  if (!page) return overview
  switch (page.id) {
    case 'overview':
      return overview
    case 'components':
      return { kind: 'components', id: page.id, name: page.name, section: 'components' }
    case 'templates':
      return { kind: 'templates', id: page.id, name: page.name, section: 'templates' }
    default:
      return {
        kind: 'docs',
        id: page.id,
        page: page.id,
        name: page.name,
        section:
          page.group === 'Foundations'
            ? 'foundations'
            : page.id === 'installation'
              ? 'installation'
              : null,
      }
  }
}
