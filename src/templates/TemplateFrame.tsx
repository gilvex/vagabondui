import { Suspense, useId, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import type { TemplateDefinition } from './catalog'
import { TemplateSource } from './TemplateSource'
import { suites } from './suites'

export function TemplateFrame({
  template,
  persistent,
  workspaceName,
  children,
}: {
  template: TemplateDefinition
  persistent: boolean
  workspaceName?: string
  children: ReactNode
}) {
  const navId = useId()
  const reduced = useReducedMotion()
  const suite = suites[template.suite]
  const Icon = suite.icon

  return (
    <>
      <div className="template-preview-bar">
        <a href="#templates">
          <ArrowLeft size={16} /> All templates
        </a>
        <p>Interactive demo · {persistent ? 'saved in this browser' : 'this session only'}</p>
        <TemplateSource key={template.id} template={template} />
      </div>
      <div className={`template-app template-${template.id}`}>
        {suite.showHeader && (
          <header className="template-app-header">
            <a href={`#template/${suite.home}`} className="template-brand">
              <span className="workspace-mark">
                <Icon size={18} />
              </span>
              <span>{workspaceName || suite.brand}</span>
            </a>
            <nav aria-label="Template navigation">
              {suite.navigation.map((item) => (
                <a
                  key={item.id}
                  href={`#template/${item.id}`}
                  aria-current={template.id === item.id ? 'page' : undefined}
                  className={template.id === item.id ? 'active' : ''}
                >
                  {item.label}
                  {template.id === item.id && (
                    <motion.span
                      className="template-nav-indicator"
                      layoutId={`template-nav-${navId}`}
                      transition={
                        reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }
                      }
                    />
                  )}
                </a>
              ))}
            </nav>
            <div className="workspace-user" role="img" aria-label="Signed in as Alex Morgan">
              AM
            </div>
          </header>
        )}
        <motion.div
          key={template.id}
          initial={reduced || template.id === 'chat' ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense
            fallback={
              <p role="status" className="p-8 text-muted">
                Loading template…
              </p>
            }
          >
            {children}
          </Suspense>
        </motion.div>
        <footer className="template-app-footer">
          <span>{suite.footerBrand} example workspace</span>
          <span>Built with Vagabond UI</span>
        </footer>
      </div>
    </>
  )
}
