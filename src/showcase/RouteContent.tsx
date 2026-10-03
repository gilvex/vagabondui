import { lazy } from 'react'
import { ComponentPage, Gallery } from './Gallery'
import type { Route } from './routes'

const Docs = lazy(() => import('./Docs').then((module) => ({ default: module.Docs })))
const DesignPreview = lazy(() =>
  import('./DesignPreview').then((module) => ({ default: module.DesignPreview })),
)
const Templates = lazy(() =>
  import('../templates/Templates').then((module) => ({ default: module.Templates })),
)

export function RouteContent({ route }: { route: Route }) {
  switch (route.kind) {
    case 'overview':
      return <Gallery key={route.id} />
    case 'design-preview':
      return <DesignPreview />
    case 'components':
      return <Gallery key={route.id} standalone />
    case 'component':
      return <ComponentPage key={route.id} entry={route.component} />
    case 'templates':
      return <Templates />
    case 'template':
      return <Templates template={route.template} bankPage={route.bankPage} />
    case 'docs':
      return <Docs key={route.id} page={route.page} />
  }
}
