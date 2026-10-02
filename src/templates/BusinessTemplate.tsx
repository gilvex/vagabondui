import type { TemplateDefinition } from './catalog'
import { TemplateFrame } from './TemplateFrame'
import { templateModules } from './registry'
import { BusinessProvider, useBusiness } from './business/store'
import './business/business.css'

function BusinessView({ template }: { template: TemplateDefinition }) {
  const { persistent } = useBusiness()
  const { Component } = templateModules[template.id]
  return (
    <TemplateFrame template={template} persistent={persistent}>
      <Component />
    </TemplateFrame>
  )
}

export default function BusinessTemplate({ template }: { template: TemplateDefinition }) {
  return (
    <BusinessProvider>
      <BusinessView template={template} />
    </BusinessProvider>
  )
}
