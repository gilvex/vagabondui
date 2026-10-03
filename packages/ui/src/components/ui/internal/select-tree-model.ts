import type { ReactNode } from 'react'

export type SelectTreeOption = {
  value: string
  label: string
  description?: string
  /** Optional decorative content. Keep interactive controls outside the icon slot. */
  icon?: ReactNode
  disabled?: boolean
  /** Branches group options by default; set true to also allow selecting the branch. */
  selectable?: boolean
  children?: readonly SelectTreeOption[]
}

export type IndexedTreeNode = {
  option: SelectTreeOption
  parent: string | null
  ancestors: readonly string[]
  path: readonly string[]
  depth: number
  disabled: boolean
  selectable: boolean
  children: readonly IndexedTreeNode[]
}

export type SelectTreeModel = {
  roots: readonly IndexedTreeNode[]
  byValue: ReadonlyMap<string, IndexedTreeNode>
  choices: readonly IndexedTreeNode[]
}

export type TreeViewNode = {
  node: IndexedTreeNode
  children: readonly TreeViewNode[]
  matches: boolean
}

export function normalizeTreeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export function createSelectTreeModel(options: readonly SelectTreeOption[]): SelectTreeModel {
  const byValue = new Map<string, IndexedTreeNode>()
  const choices: IndexedTreeNode[] = []

  function visit(
    items: readonly SelectTreeOption[],
    parent: IndexedTreeNode | null,
  ): IndexedTreeNode[] {
    return items.map((option) => {
      if (!option.value || byValue.has(option.value)) {
        throw new Error(`SelectTree option values must be non-empty and unique: "${option.value}"`)
      }
      const node: IndexedTreeNode = {
        option,
        parent: parent?.option.value ?? null,
        ancestors: parent ? [...parent.ancestors, parent.option.value] : [],
        path: [...(parent?.path ?? []), option.label],
        depth: parent ? parent.depth + 1 : 0,
        disabled: Boolean(parent?.disabled || option.disabled),
        selectable: option.selectable ?? !option.children?.length,
        children: [],
      }
      // Register before descending, so repeated values also reject cyclic input.
      byValue.set(option.value, node)
      node.children = visit(option.children ?? [], node)
      if (node.selectable) choices.push(node)
      return node
    })
  }

  const roots = visit(options, null)
  return { roots, byValue, choices }
}

/** Retains ancestors and sibling ordering; matching a parent also finds its descendants. */
export function filterSelectTree(model: SelectTreeModel, query: string): readonly TreeViewNode[] {
  const terms = normalizeTreeText(query).split(/\s+/).filter(Boolean)
  function visit(nodes: readonly IndexedTreeNode[]): TreeViewNode[] {
    return nodes.flatMap((node) => {
      const children = terms.length && node.disabled ? [] : visit(node.children)
      const haystack = normalizeTreeText(`${node.path.join(' ')} ${node.option.description ?? ''}`)
      const matches = terms.every((term) => haystack.includes(term))
      return matches || children.length ? [{ node, children, matches }] : []
    })
  }
  return visit(model.roots)
}

export function matchingTreeValues(nodes: readonly TreeViewNode[]): Set<string> {
  return new Set(
    nodes.flatMap((item) => [
      ...(item.matches ? [item.node.option.value] : []),
      ...matchingTreeValues(item.children),
    ]),
  )
}

export function expandedSearchBranches(nodes: readonly TreeViewNode[]): Set<string> {
  const values = new Set<string>()
  function visit(items: readonly TreeViewNode[]) {
    for (const item of items) {
      if (item.children.length && !item.node.disabled) values.add(item.node.option.value)
      visit(item.children)
    }
  }
  visit(nodes)
  return values
}

export function visibleTreeNodes(
  nodes: readonly TreeViewNode[],
  expanded: ReadonlySet<string>,
): IndexedTreeNode[] {
  return nodes.flatMap((item) => [
    item.node,
    ...(!item.node.disabled && expanded.has(item.node.option.value)
      ? visibleTreeNodes(item.children, expanded)
      : []),
  ])
}

export function availableTreeChoices(nodes: readonly TreeViewNode[]): number {
  return nodes.reduce(
    (count, item) =>
      count +
      Number(item.node.selectable && !item.node.disabled) +
      availableTreeChoices(item.children),
    0,
  )
}

export function nextTreeTypeahead(
  nodes: readonly IndexedTreeNode[],
  current: string | null,
  text: string,
) {
  const term = normalizeTreeText(text)
  if (!term) return undefined
  const start = nodes.findIndex((node) => node.option.value === current)
  for (let offset = 1; offset <= nodes.length; offset += 1) {
    const node = nodes[(start + offset) % nodes.length]
    if (!node.disabled && normalizeTreeText(node.option.label).startsWith(term)) return node
  }
  return undefined
}
