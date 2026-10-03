import { describe, expect, it } from 'vitest'
import {
  availableTreeChoices,
  createSelectTreeModel,
  expandedSearchBranches,
  filterSelectTree,
  matchingTreeValues,
  nextTreeTypeahead,
  visibleTreeNodes,
  type SelectTreeOption,
} from './select-tree-model.js'

const options: readonly SelectTreeOption[] = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'uk',
        label: 'United Kingdom',
        children: [
          { value: 'london', label: 'London' },
          { value: 'leeds', label: 'Leeds', disabled: true },
        ],
      },
      {
        value: 'germany',
        label: 'Germany',
        selectable: true,
        children: [
          { value: 'munich', label: 'München', description: 'Southern hub' },
          { value: 'berlin', label: 'Berlin' },
        ],
      },
    ],
  },
  {
    value: 'archived',
    label: 'Archived',
    disabled: true,
    children: [{ value: 'retired', label: 'Retired site' }],
  },
]

describe('Select Tree model', () => {
  it('indexes ancestry, selectable branches, and inherited disabled state', () => {
    const model = createSelectTreeModel(options)
    expect(model.byValue.get('london')).toMatchObject({
      ancestors: ['europe', 'uk'],
      path: ['Europe', 'United Kingdom', 'London'],
      depth: 2,
      selectable: true,
    })
    expect(model.byValue.get('europe')?.selectable).toBe(false)
    expect(model.byValue.get('germany')?.selectable).toBe(true)
    expect(model.byValue.get('retired')?.disabled).toBe(true)
  })

  it('retains matching ancestors and normalizes accents and descriptions', () => {
    const model = createSelectTreeModel(options)
    const filtered = filterSelectTree(model, 'EUROPE munchen')
    const expanded = expandedSearchBranches(filtered)
    expect(visibleTreeNodes(filtered, expanded).map((node) => node.option.value)).toEqual([
      'europe',
      'germany',
      'munich',
    ])
    expect(availableTreeChoices(filtered)).toBe(2)
    expect([...matchingTreeValues(filtered)]).toEqual(['munich'])
    expect(
      visibleTreeNodes(filterSelectTree(model, 'southern'), expanded).map(
        (node) => node.option.value,
      ),
    ).toEqual(['europe', 'germany', 'munich'])
    expect(filterSelectTree(model, 'missing')).toEqual([])
  })

  it('searching a branch includes its descendants without flattening the hierarchy', () => {
    const model = createSelectTreeModel(options)
    const filtered = filterSelectTree(model, 'germany')
    expect(
      visibleTreeNodes(filtered, expandedSearchBranches(filtered)).map((node) => node.option.value),
    ).toEqual(['europe', 'germany', 'munich', 'berlin'])
  })

  it('traverses only expanded branches and excludes disabled descendants from availability', () => {
    const model = createSelectTreeModel(options)
    const all = filterSelectTree(model, '')
    expect(visibleTreeNodes(all, new Set()).map((node) => node.option.value)).toEqual([
      'europe',
      'archived',
    ])
    expect(
      visibleTreeNodes(all, new Set(['europe', 'uk', 'archived'])).map((node) => node.option.value),
    ).toEqual(['europe', 'uk', 'london', 'leeds', 'germany', 'archived'])
    expect(availableTreeChoices(all)).toBe(4)
  })

  it('wraps type-ahead among visible enabled labels', () => {
    const model = createSelectTreeModel(options)
    const all = filterSelectTree(model, '')
    const visible = visibleTreeNodes(all, new Set(['europe', 'uk', 'germany']))
    expect(nextTreeTypeahead(visible, 'berlin', 'l')?.option.value).toBe('london')
    expect(nextTreeTypeahead(visible, 'london', 'le')).toBeUndefined()
    expect(nextTreeTypeahead(visible, 'london', 'MUN')?.option.value).toBe('munich')
    expect(nextTreeTypeahead([], null, 'a')).toBeUndefined()
  })

  it('rejects duplicate or empty values, including cycles', () => {
    expect(() => createSelectTreeModel([{ value: '', label: 'Empty' }])).toThrow(/non-empty/)
    expect(() =>
      createSelectTreeModel([
        { value: 'a', label: 'A', children: [{ value: 'a', label: 'Duplicate' }] },
      ]),
    ).toThrow(/unique/)
    const cyclic: SelectTreeOption = { value: 'cycle', label: 'Cycle' }
    cyclic.children = [cyclic]
    expect(() => createSelectTreeModel([cyclic])).toThrow(/unique/)
  })
})
