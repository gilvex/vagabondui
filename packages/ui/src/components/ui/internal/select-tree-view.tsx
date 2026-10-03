import type { KeyboardEvent } from 'react'
import { Check, ChevronRight, LockKeyhole } from 'lucide-react'
import { cn } from '../../../lib/utils.js'
import type { IndexedTreeNode, TreeViewNode } from './select-tree-model.js'

type Props = {
  nodes: readonly TreeViewNode[]
  expanded: ReadonlySet<string>
  selected: string
  active: string | null
  iconColumn?: boolean
  nodeId: (value: string) => string
  onFocus: (value: string) => void
  onToggle: (value: string) => void
  onChoose: (node: IndexedTreeNode) => void
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>, node: IndexedTreeNode) => void
}

function hasOptionIcons(nodes: readonly TreeViewNode[]): boolean {
  return nodes.some((item) => Boolean(item.node.option.icon) || hasOptionIcons(item.children))
}

export function SelectTreeNodes(props: Props) {
  // Reserve the same icon column at every level, so children stay indented even when some
  // options have icons and others do not. Plain trees reserve no icon space at all.
  const iconColumn = props.iconColumn ?? hasOptionIcons(props.nodes)
  return props.nodes.map((item, position) => {
    const { node, children } = item
    const { option } = node
    const branch = node.children.length > 0
    const expanded = branch && !node.disabled && props.expanded.has(option.value)
    const id = props.nodeId(option.value)
    const selected = props.selected === option.value

    return (
      <div
        key={option.value}
        id={id}
        role="treeitem"
        aria-labelledby={`${id}-label`}
        aria-describedby={option.description ? `${id}-description` : undefined}
        aria-expanded={branch ? expanded : undefined}
        aria-selected={node.selectable ? selected : undefined}
        aria-disabled={node.disabled || undefined}
        aria-level={node.depth + 1}
        aria-posinset={position + 1}
        aria-setsize={props.nodes.length}
        tabIndex={props.active === option.value ? 0 : -1}
        data-active={props.active === option.value || undefined}
        data-selected={selected || undefined}
        data-disabled={node.disabled || undefined}
        className="select-tree-node outline-none"
        onFocus={(event) => {
          if (event.target === event.currentTarget) props.onFocus(option.value)
        }}
        onKeyDown={(event) => props.onKeyDown(event, node)}
        onClick={(event) => {
          event.stopPropagation()
          event.currentTarget.focus({ preventScroll: true })
          if (node.disabled) return
          const disclosure =
            event.target instanceof Element && event.target.closest('[data-tree-disclosure]')
          if (branch && (disclosure || !node.selectable)) props.onToggle(option.value)
          else props.onChoose(node)
        }}
      >
        <div
          className={cn(
            'select-tree-row flex min-h-10 items-center gap-2 rounded px-2 py-2 text-sm',
            selected && 'bg-accent-soft text-accent-ink',
            node.disabled && 'text-muted',
          )}
          style={{ paddingInlineStart: `${8 + Math.min(node.depth, 6) * 16}px` }}
        >
          {branch ? (
            <span
              data-tree-disclosure=""
              aria-hidden="true"
              className="inline-flex size-6 shrink-0 items-center justify-center"
              title={
                node.disabled ? undefined : `${expanded ? 'Collapse' : 'Expand'} ${option.label}`
              }
            >
              <ChevronRight
                size={15}
                className={cn('transition-transform', expanded && 'rotate-90')}
              />
            </span>
          ) : (
            <span className="w-6 shrink-0" aria-hidden="true" />
          )}
          {iconColumn && (
            <span
              data-tree-icon-slot=""
              data-tree-option-icon={Boolean(option.icon) || undefined}
              aria-hidden="true"
              className="pointer-events-none inline-flex size-4 shrink-0 items-center justify-center text-muted [&>svg]:size-4"
            >
              {option.icon}
            </span>
          )}
          <span className="min-w-0 flex-1 break-words text-left">
            <span id={`${id}-label`} className={branch ? 'font-medium' : undefined}>
              {option.label}
            </span>
            {option.description && (
              <span id={`${id}-description`} className="mt-1 block text-sm text-muted">
                {option.description}
              </span>
            )}
          </span>
          {node.disabled && (
            <LockKeyhole size={14} className="shrink-0 text-muted" aria-hidden="true" />
          )}
          {selected && <Check size={16} className="shrink-0 text-accent-ink" aria-hidden="true" />}
        </div>
        {expanded && children.length > 0 && (
          <div role="group">
            <SelectTreeNodes {...props} nodes={children} iconColumn={iconColumn} />
          </div>
        )}
      </div>
    )
  })
}
