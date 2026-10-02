import { lazy, Suspense } from 'react'
import type { TemplateDefinition } from './catalog'
import { TemplateIndex } from './TemplateIndex'
import './templates.css'
import './thumbnails.css'

const WorkspaceTemplate = lazy(() => import('./WorkspaceTemplate'))
const BusinessTemplate = lazy(() => import('./BusinessTemplate'))

export function Templates({ template }: { template?: TemplateDefinition }) {
  if (!template) return <TemplateIndex />
  const View = template.suite === 'workspace' ? WorkspaceTemplate : BusinessTemplate
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-muted">
          Loading template…
        </p>
      }
    >
      <View template={template} />
    </Suspense>
  )
}
