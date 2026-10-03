import { useState } from 'react'
import { ArrowRight, Code2, ExternalLink } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { Reveal } from 'vagabond-ui/motion'
import { templateCatalog } from './catalog'
import { TemplateThumbnail } from './TemplateThumbnail'

const categories = [
  'All templates',
  ...new Set(templateCatalog.map((template) => template.category)),
]

export function TemplateIndex() {
  const [category, setCategory] = useState('All templates')
  const visible = templateCatalog.filter(
    (template) => category === 'All templates' || template.category === category,
  )

  return (
    <section className="templates-index">
      <header className="doc-heading">
        <p className="eyebrow">Page templates</p>
        <h1>Components in context.</h1>
        <p>
          {templateCatalog.length} application layouts for collaboration, people, logistics,
          finance, and everyday work. Each includes functional workflows and browser-local sample
          data.
        </p>
      </header>
      <div
        className="filter-list template-category-filter"
        role="group"
        aria-label="Template categories"
      >
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={category === item}
            className={`filter-button ${category === item ? 'active' : ''}`}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="template-index-grid">
        {visible.map((template, index) => (
          <Reveal key={template.id} delay={Math.min(index * 0.035, 0.14)}>
            <article className="template-index-card">
              <a href={`#template/${template.id}`} tabIndex={-1} aria-hidden="true">
                <TemplateThumbnail id={template.id} />
              </a>
              <div className="template-index-description">
                <p className="template-category-label">{template.category}</p>
                <h2>
                  <a href={`#template/${template.id}`}>{template.name}</a>
                </h2>
                <p>{template.description}</p>
                <p className="template-component-list">{template.components}</p>
                <Button asChild variant="outline">
                  <a href={`#template/${template.id}`}>
                    Open template <ArrowRight size={16} />
                  </a>
                </Button>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="template-index-note">
        <Code2 size={20} />
        <div>
          <h2>Use the source</h2>
          <p>
            Each template lives in <code>src/templates/</code> and uses the same library components
            as the documentation. Open a template and select “View source” to inspect or copy its
            implementation.
          </p>
          <a href="#installation">
            Component setup <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </section>
  )
}
