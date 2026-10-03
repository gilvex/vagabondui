import { lazy, Suspense } from 'react'
import type { TemplateDefinition } from './catalog'
import type { BankPage } from './banking/navigation'
import { TemplateIndex } from './TemplateIndex'
import './templates.css'
import './thumbnails.css'

const WorkspaceTemplate = lazy(() => import('./WorkspaceTemplate'))
const BusinessTemplate = lazy(() => import('./BusinessTemplate'))
const BankingTemplate = lazy(() => import('./BankingTemplate'))

export function Templates({
  template,
  bankPage,
}: {
  template?: TemplateDefinition
  bankPage?: BankPage
}) {
  if (!template) return <TemplateIndex />
  const View =
    template.suite === 'banking'
      ? BankingTemplate
      : template.suite === 'workspace'
        ? WorkspaceTemplate
        : BusinessTemplate
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-muted">
          Loading template…
        </p>
      }
    >
      <View template={template} bankPage={bankPage} />
    </Suspense>
  )
}
