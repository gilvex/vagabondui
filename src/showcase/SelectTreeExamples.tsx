import { ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { ComponentDemo } from './Demos'
import { SelectTreeBranchExample, SelectTreeFormExample } from './demos/select-tree'

export function SelectTreeExamples() {
  return (
    <>
      <section className="doc-section">
        <h2>More ways to try it</h2>
        <div className="tree-example-grid">
          <Card>
            <CardHeader>
              <CardTitle>Form behavior</CardTitle>
              <CardDescription>
                Try submitting empty, selecting a country or city, and resetting.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <SelectTreeFormExample />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Selectable branches</CardTitle>
              <CardDescription>
                A plain tree without option icons. Choose a group or a child.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <SelectTreeBranchExample />
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="doc-section">
        <h2>Keyboard interaction</h2>
        <ul className="doc-list">
          <li>
            Open with Enter, Space, or Arrow Down. Search is available at the top of the popup.
          </li>
          <li>
            Arrow Up / Down moves through visible nodes. Right expands a branch; Left collapses it
            or returns to its parent.
          </li>
          <li>
            Home / End moves to the first / last visible node. Typing while the tree is focused
            jumps to matching labels.
          </li>
          <li>
            Enter or Space chooses an available value. Escape closes the popup without changing the
            selection.
          </li>
          <li>
            Tab moves between search, the tree, and popup controls. Selecting or closing restores
            focus to the trigger.
          </li>
        </ul>
      </section>
    </>
  )
}

export function SelectTreeExperimentLink() {
  return (
    <section className="doc-section">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-medium">Experiment: nested options</h2>
        <Button asChild variant="outline" size="sm">
          <a href="#component/select-tree">
            Select Tree docs <ArrowRight size={16} />
          </a>
        </Button>
      </div>
      <p className="mt-4">
        Use a tree when options have a meaningful hierarchy, such as locations or project groups.
      </p>
      <div className="preview-panel mt-5">
        <div className="demo-stage expanded-preview">
          <ComponentDemo id="select-tree" />
        </div>
      </div>
    </section>
  )
}
