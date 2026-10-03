'use client'

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import {
  availableTreeChoices,
  createSelectTreeModel,
  expandedSearchBranches,
  filterSelectTree,
  matchingTreeValues,
  nextTreeTypeahead,
  normalizeTreeText,
  visibleTreeNodes,
  type IndexedTreeNode,
  type SelectTreeOption,
} from './select-tree-model.js'

export type SelectTreeStateProps = {
  options: readonly SelectTreeOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  defaultExpandedValues?: readonly string[]
  disabled?: boolean
  required?: boolean
  id?: string
  form?: string
}

export function useSelectTree({
  options,
  value,
  defaultValue = '',
  onValueChange,
  defaultExpandedValues = [],
  disabled = false,
  required = false,
  id,
  form,
}: SelectTreeStateProps) {
  const generatedId = useId()
  const triggerId = id || `select-tree-${generatedId}`
  const popupId = `${triggerId}-popup`
  const treeId = `${triggerId}-tree`
  const model = useMemo(() => createSelectTreeModel(options), [options])
  const [localValue, setLocalValue] = useState(defaultValue)
  const [openState, setOpenState] = useState(false)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(() => new Set(defaultExpandedValues))
  const [searchCollapsed, setSearchCollapsed] = useState<Set<string>>(() => new Set())
  const [active, setActive] = useState<string | null>(null)
  const [invalid, setInvalid] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const nativeRef = useRef<HTMLSelectElement>(null)
  const initialFocus = useRef<'search' | 'selected' | 'last'>('search')
  const typeahead = useRef({ text: '', at: 0 })
  const open = openState && !disabled
  const candidate = model.byValue.get(value ?? localValue)
  const selected = candidate?.selectable && !candidate.disabled ? candidate : undefined
  const selectedValue = selected?.option.value ?? ''
  const committedValue = useRef(selectedValue)
  useLayoutEffect(() => {
    committedValue.current = selectedValue
  }, [selectedValue])
  const selectedPath = selected?.path.join(' / ')
  const searching = Boolean(normalizeTreeText(query))
  const filtered = useMemo(() => filterSelectTree(model, query), [model, query])
  const effectiveExpanded = useMemo(
    () =>
      searching
        ? new Set(
            [...expandedSearchBranches(filtered)].filter((item) => !searchCollapsed.has(item)),
          )
        : expanded,
    [searching, filtered, searchCollapsed, expanded],
  )
  const visible = useMemo(
    () => visibleTreeNodes(filtered, effectiveExpanded),
    [filtered, effectiveExpanded],
  )
  const matches = useMemo(() => matchingTreeValues(filtered), [filtered])
  const activeValue = visible.some((node) => node.option.value === active)
    ? active
    : ((searching
        ? visible.find(
            (node) => node.selectable && !node.disabled && matches.has(node.option.value),
          )
        : visible[0]
      )?.option.value ??
      visible[0]?.option.value ??
      null)
  const fieldInvalid = !disabled && required && invalid && !selectedValue
  const availableCount = useMemo(() => availableTreeChoices(filtered), [filtered])
  const nodeId = (nodeValue: string) => `${treeId}-${encodeURIComponent(nodeValue)}`

  // A disabled control must not reopen when an async update later enables it again.
  useEffect(() => {
    if (disabled) setOpenState(false)
  }, [disabled])

  useEffect(() => {
    const native = nativeRef.current
    const owner = native?.form
    if (!owner) return
    function reset(event: Event) {
      // A microtask can run before the native reset default action. Use the next task so the
      // browser and the owner's onReset handler finish before restoring the current value.
      setTimeout(() => {
        if (!native?.isConnected || event.defaultPrevented) return
        const next = value === undefined ? defaultValue : committedValue.current
        const node = model.byValue.get(next)
        const valid = node?.selectable && !node.disabled ? next : ''
        if (value === undefined) setLocalValue(valid)
        native.value = valid
        setInvalid(false)
        setOpenState(false)
        setQuery('')
      }, 0)
    }
    owner.addEventListener('reset', reset)
    return () => owner.removeEventListener('reset', reset)
  }, [defaultValue, value, model, form])

  function changeOpen(next: boolean) {
    if (disabled && next) return
    if (next) {
      setQuery('')
      setSearchCollapsed(new Set())
      setExpanded((current) => new Set([...current, ...(selected?.ancestors ?? [])]))
      setActive(selectedValue || null)
      typeahead.current = { text: '', at: 0 }
    } else initialFocus.current = 'search'
    setOpenState(next)
  }

  function commit(next: string) {
    if (disabled) return
    const node = model.byValue.get(next)
    if (next && (!node?.selectable || node.disabled)) return
    if (value === undefined) setLocalValue(next)
    if (next !== selectedValue) onValueChange?.(next)
    setInvalid(false)
    changeOpen(false)
  }

  function focusNode(next: string | undefined | null) {
    if (!next) return
    setActive(next)
    const element = document.getElementById(nodeId(next))
    element?.focus({ preventScroll: true })
    element?.querySelector('.select-tree-row')?.scrollIntoView({ block: 'nearest' })
  }

  function toggle(next: string) {
    const node = model.byValue.get(next)
    if (disabled || !node || node.disabled || !node.children.length) return
    const update = (current: Set<string>) => {
      const result = new Set(current)
      if (result.has(next)) result.delete(next)
      else result.add(next)
      return result
    }
    if (searching) setSearchCollapsed(update)
    else setExpanded(update)
  }

  function activate(node: IndexedTreeNode) {
    if (node.disabled) return
    if (node.selectable) commit(node.option.value)
    else {
      toggle(node.option.value)
      focusNode(node.option.value)
    }
  }

  function onTreeKeyDown(event: KeyboardEvent<HTMLDivElement>, node: IndexedTreeNode) {
    if (event.key === 'Tab' || event.key === 'Escape') return
    if (event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return
    event.stopPropagation()
    const position = visible.findIndex((item) => item.option.value === node.option.value)
    const branch = node.children.length > 0
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusNode(visible[Math.min(position + 1, visible.length - 1)]?.option.value)
        return
      case 'ArrowUp':
        event.preventDefault()
        focusNode(visible[Math.max(position - 1, 0)]?.option.value)
        return
      case 'Home':
        event.preventDefault()
        focusNode(visible[0]?.option.value)
        return
      case 'End':
        event.preventDefault()
        focusNode(visible.at(-1)?.option.value)
        return
      case 'ArrowRight':
        event.preventDefault()
        if (branch && !node.disabled) {
          if (!effectiveExpanded.has(node.option.value)) toggle(node.option.value)
          else if (visible[position + 1]?.parent === node.option.value)
            focusNode(visible[position + 1].option.value)
        }
        return
      case 'ArrowLeft':
        event.preventDefault()
        if (branch && effectiveExpanded.has(node.option.value)) toggle(node.option.value)
        else focusNode(node.parent)
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        activate(node)
        return
    }
    if (event.key.length === 1) {
      const now = Date.now()
      const text = now - typeahead.current.at < 600 ? typeahead.current.text + event.key : event.key
      typeahead.current = { text, at: now }
      const term = [...text].every((character) => character === text[0]) ? text[0] : text
      const match = nextTreeTypeahead(visible, node.option.value, term)
      if (match) {
        event.preventDefault()
        focusNode(match.option.value)
      }
    }
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusNode(event.key === 'ArrowUp' ? visible.at(-1)?.option.value : activeValue)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const node = visible.find((item) => item.option.value === activeValue)
      // Context ancestors remain browsable, but Enter from search must not accidentally
      // choose an unrelated parent when the only text match is an unavailable child.
      if (node && (!searching || matches.has(node.option.value))) activate(node)
    }
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.defaultPrevented || event.nativeEvent.isComposing) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      initialFocus.current = event.key === 'ArrowUp' ? 'last' : 'selected'
      changeOpen(true)
    } else if (event.key === 'Enter' || event.key === ' ') initialFocus.current = 'selected'
  }

  function focusOnOpen(searchable: boolean) {
    if (searchable && initialFocus.current === 'search') searchRef.current?.focus()
    else if (visible.length)
      focusNode(
        initialFocus.current === 'last'
          ? visible.at(-1)?.option.value
          : selectedValue || visible[0]?.option.value,
      )
    else
      document
        .getElementById(popupId)
        ?.querySelector<HTMLElement>('[data-select-tree-close]')
        ?.focus()
  }

  function search(next: string) {
    setQuery(next)
    setSearchCollapsed(new Set())
    setActive(null)
  }
  function reportInvalid() {
    setInvalid(true)
    document.getElementById(triggerId)?.focus()
  }

  return {
    model,
    triggerId,
    popupId,
    treeId,
    open,
    query,
    filtered,
    effectiveExpanded,
    activeValue,
    selectedValue,
    selectedPath,
    availableCount,
    searching,
    fieldInvalid,
    searchRef,
    nativeRef,
    nodeId,
    changeOpen,
    commit,
    toggle,
    focusOnOpen,
    setActive,
    onTreeKeyDown,
    onSearchKeyDown,
    onTriggerKeyDown,
    search,
    reportInvalid,
  }
}
