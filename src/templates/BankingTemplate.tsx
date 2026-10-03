import type { TemplateDefinition } from './catalog'
import { TemplateFrame } from './TemplateFrame'
import { templateModules } from './registry'
import { BankingProvider, useBanking } from './banking/store'
import './banking/banking.css'

function BankingView({ template }: { template: TemplateDefinition }) {
  const { persistent } = useBanking()
  const { Component } = templateModules[template.id]
  return (
    <TemplateFrame template={template} persistent={persistent}>
      <div className="banking-app">
        <Component />
      </div>
    </TemplateFrame>
  )
}

export default function BankingTemplate({ template }: { template: TemplateDefinition }) {
  return (
    <BankingProvider>
      <BankingView template={template} />
    </BankingProvider>
  )
}
