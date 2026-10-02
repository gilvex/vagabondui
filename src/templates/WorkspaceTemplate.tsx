import type { TemplateDefinition } from './catalog'
import { TemplateFrame } from './TemplateFrame'
import { templateModules } from './registry'
import { useWorkspace, WorkspaceProvider } from './store'

function WorkspaceView({ template }: { template: TemplateDefinition }) {
  const { workspace, persistent } = useWorkspace()
  const { Component } = templateModules[template.id]
  return (
    <TemplateFrame
      template={template}
      persistent={persistent}
      workspaceName={workspace.settings.name}
    >
      <Component />
    </TemplateFrame>
  )
}

export default function WorkspaceTemplate({ template }: { template: TemplateDefinition }) {
  return (
    <WorkspaceProvider>
      <WorkspaceView template={template} />
    </WorkspaceProvider>
  )
}
