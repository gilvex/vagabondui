import { describe, expect, it } from 'vitest'
import { resolveRoute } from './routes'
import { catalog } from './catalog'
import { templateCatalog } from '../templates/catalog'

describe('hash routing', () => {
  it.each(['', '#', '#not-a-page', '#template/missing', '#component/missing'])(
    'falls back safely for %s',
    (hash) => {
      expect(resolveRoute(hash)).toMatchObject({ kind: 'overview', id: 'overview' })
    },
  )
  it('resolves every component and template without type assertions at the render boundary', () => {
    for (const item of catalog)
      expect(resolveRoute(`#component/${item.id}`)).toMatchObject({
        kind: 'component',
        component: item,
        section: 'components',
      })
    for (const item of templateCatalog)
      expect(resolveRoute(`#template/${item.id}`)).toMatchObject({
        kind: 'template',
        template: item,
        section: 'templates',
      })
  })
  it('distinguishes documentation from the two galleries', () => {
    expect(resolveRoute('#colors')).toMatchObject({
      kind: 'docs',
      page: 'colors',
      section: 'foundations',
    })
    expect(resolveRoute('#components').kind).toBe('components')
    expect(resolveRoute('#templates').kind).toBe('templates')
    expect(resolveRoute('#research').section).toBeNull()
  })
  it('groups banking sections and legacy URLs under one app', () => {
    expect(templateCatalog.filter((template) => template.suite === 'banking')).toHaveLength(1)
    for (const page of ['accounts', 'transactions', 'transfers', 'cards']) {
      for (const hash of [`#template/banking/${page}`, `#template/banking-${page}`]) {
        expect(resolveRoute(hash)).toMatchObject({
          kind: 'template',
          id: `template/banking/${page}`,
          bankPage: page,
          template: { id: 'banking', name: 'Bank app' },
          section: 'templates',
        })
      }
    }
    expect(resolveRoute('#template/banking/unknown').kind).toBe('overview')
  })
})
