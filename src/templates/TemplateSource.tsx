import { useState } from 'react'
import { Code2 } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { Dialog, DialogContent } from 'vagabond-ui/dialog'
import { CodeBlock } from '../showcase/CodeBlock'
import type { TemplateDefinition } from './catalog'
import { templateModules } from './registry'

type SourceState = { status: 'idle' | 'loading' | 'error' } | { status: 'ready'; code: string }

export function TemplateSource({ template }: { template: TemplateDefinition }) {
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState<SourceState>({ status: 'idle' })

  async function showSource() {
    setOpen(true)
    if (source.status === 'ready' || source.status === 'loading') return
    setSource({ status: 'loading' })
    try {
      setSource({
        status: 'ready',
        code: (await templateModules[template.id].loadSource()).default,
      })
    } catch {
      setSource({ status: 'error' })
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={showSource}>
        <Code2 size={16} /> View source
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title={`${template.name} source`}
          description="Source from src/templates. Copy this page with its relative imports, shared store, and styles."
          className="max-w-4xl"
        >
          {source.status === 'error' ? (
            <div className="py-8">
              <p role="alert">The source could not be loaded.</p>
              <Button onClick={showSource} className="mt-4">
                Try again
              </Button>
            </div>
          ) : source.status === 'ready' ? (
            <CodeBlock code={source.code} />
          ) : (
            <p role="status" className="py-8 text-muted">
              Loading source…
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
