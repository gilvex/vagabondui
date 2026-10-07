import { useState } from 'react'
import { ArrowRight, Code2, Expand, Eye, Search } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'vagabond-ui'
import { catalog, categories, type CatalogEntry, type Category } from './catalog'
import { ComponentDemo, SearchEmpty } from './Demos'
import { CodeBlock } from './CodeBlock'
import { SelectTreeExamples, SelectTreeExperimentLink } from './SelectTreeExamples'

export function ComponentDetail({
  entry,
  onClose,
}: {
  entry: CatalogEntry | undefined
  onClose: () => void
}) {
  return (
    <Dialog open={!!entry} onOpenChange={(open) => !open && onClose()}>
      {entry && (
        <DialogContent title={entry.name} description={entry.description} className="max-w-2xl">
          <Tabs defaultValue="preview" className="mt-6">
            <TabsList aria-label="Component details">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Usage</TabsTrigger>
              <TabsTrigger value="api">API reference</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div className="demo-stage expanded-preview">
                <ComponentDemo id={entry.id} />
              </div>
            </TabsContent>
            <TabsContent value="code">
              <CodeBlock code={entry.code} />
            </TabsContent>
            <TabsContent value="api">
              <CodeBlock code={entry.props} label="Props" />
            </TabsContent>
          </Tabs>
        </DialogContent>
      )}
    </Dialog>
  )
}

export function ComponentPage({ entry }: { entry: CatalogEntry }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="docs-page component-page">
      <header className="doc-heading">
        <p className="eyebrow">Components / {entry.category}</p>
        <h1>{entry.name}</h1>
        <p>{entry.description}</p>
      </header>
      <div className="component-path">
        <Code2 size={16} />
        <code>packages/ui/src/components/ui/{entry.file}.tsx</code>
      </div>
      <div className="preview-panel">
        <div className="preview-toolbar">
          <span>Preview</span>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}>
            <Expand size={16} /> Expand
          </Button>
        </div>
        <div className="demo-stage expanded-preview">
          <ComponentDemo id={entry.id} />
        </div>
      </div>
      {entry.id === 'select-tree' && <SelectTreeExamples />}
      {entry.id === 'select' && <SelectTreeExperimentLink />}
      {(entry.id === 'drawer' || entry.id === 'fridge') && (
        <section className="doc-section">
          <h2>Two directions, one interaction</h2>
          <p>
            Drag the handle to dismiss, scroll the body independently, or use Escape and the close
            button. The footer remains visible while you work. Try Expand to review the panel inside
            another dialog.
          </p>
          <a
            className="installation-link"
            href={`#component/${entry.id === 'drawer' ? 'fridge' : 'drawer'}`}
          >
            {entry.id === 'drawer'
              ? 'Review Fridge — opens from the right'
              : 'Review Drawer — opens from the bottom'}{' '}
            <ArrowRight size={16} />
          </a>
        </section>
      )}
      <section className="doc-section">
        <h2>Usage</h2>
        <CodeBlock code={entry.code} />
      </section>
      <section className="doc-section">
        <h2>API reference</h2>
        <CodeBlock code={entry.props} label="Props" />
        <p>
          All styled parts accept <code>className</code>. Native and Radix props are forwarded to
          their underlying elements. Ref props are supported through React 19.
        </p>
      </section>
      <ComponentDetail entry={expanded ? entry : undefined} onClose={() => setExpanded(false)} />
    </div>
  )
}

export function Gallery({ standalone = false }: { standalone?: boolean }) {
  const [category, setCategory] = useState<Category>('All components')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'preview' | 'code'>('preview')
  const [selected, setSelected] = useState<CatalogEntry>()
  const [expanded, setExpanded] = useState(standalone)
  const filtered = catalog.filter(
    (item) =>
      (category === 'All components' || item.category === category) &&
      `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
  )
  const visible =
    expanded || query || category !== 'All components' ? filtered : filtered.slice(0, 12)

  return (
    <section id="library" className="library-section">
      <header className="library-heading">
        <div>
          <p className="eyebrow">Vagabond UI</p>
          <h1>{standalone ? 'Components' : 'React components for product interfaces.'}</h1>
          <p>
            {catalog.length} components built with Radix primitives and Tailwind CSS. Copy the
            source, adjust the tokens, and compose your interface.
          </p>
        </div>
        {!standalone && (
          <a className="installation-link" href="#installation">
            Installation <ArrowRight size={16} />
          </a>
        )}
      </header>
      <div className="gallery-toolbar">
        <div className="filter-list" role="group" aria-label="Filter components">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => {
                setCategory(item)
                setExpanded(true)
              }}
              aria-pressed={category === item}
              className={`filter-button ${category === item ? 'active' : ''}`}
            >
              {item === 'All components' ? `All (${catalog.length})` : item}
            </button>
          ))}
        </div>
        <div className="gallery-tools">
          <div className="component-search">
            <Search size={16} />
            <input
              aria-label="Filter components by name"
              placeholder="Search components…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="view-switch" role="group" aria-label="Preview mode">
            <Button
              variant="ghost"
              size="icon"
              className={view === 'preview' ? 'selected' : ''}
              aria-label="Show previews"
              aria-pressed={view === 'preview'}
              onClick={() => setView('preview')}
            >
              <Eye size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={view === 'code' ? 'selected' : ''}
              aria-label="Show source code"
              aria-pressed={view === 'code'}
              onClick={() => setView('code')}
            >
              <Code2 size={16} />
            </Button>
          </div>
        </div>
      </div>
      <div className="component-grid">
        {visible.map((item) => (
          <article className="component-card" key={item.id}>
            <header className="component-caption">
              <h2>
                <a href={`#component/${item.id}`}>{item.name}</a>
              </h2>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`View ${item.name} details`}
                onClick={() => setSelected(item)}
              >
                <Expand size={16} />
              </Button>
            </header>
            <div className={`demo-stage ${view === 'code' ? 'code-stage' : ''}`}>
              {view === 'preview' ? <ComponentDemo id={item.id} /> : <CodeBlock code={item.code} />}
            </div>
            <footer className="component-description">
              <p>{item.description}</p>
              <a href={`#component/${item.id}`} aria-label={`${item.name} documentation`}>
                <ArrowRight size={16} />
              </a>
            </footer>
          </article>
        ))}
      </div>
      {!visible.length && <SearchEmpty />}
      {!expanded && filtered.length > 12 && (
        <div className="gallery-more">
          <Button variant="outline" onClick={() => setExpanded(true)}>
            View all {catalog.length} components <ArrowRight size={16} />
          </Button>
        </div>
      )}
      <ComponentDetail entry={selected} onClose={() => setSelected(undefined)} />
    </section>
  )
}
