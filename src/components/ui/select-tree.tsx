import type { ComponentProps } from 'react'
import { Popover as Primitive } from 'radix-ui'
import { ChevronDown, Search, X } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { cn } from '../../lib/utils'
import { SelectTreeNodes } from './internal/select-tree-view'
import { useSelectTree, type SelectTreeStateProps } from './internal/use-select-tree'

export type { SelectTreeOption } from './internal/select-tree-model'
export type SelectTreeProps = Omit<
  ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'children'
> &
  SelectTreeStateProps & {
    /** Accessible field name; also labels the tree and its search field. */
    label: string
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    searchable?: boolean
    clearable?: boolean
    contentClassName?: string
  }

export function SelectTree({
  options,
  label,
  value,
  defaultValue,
  onValueChange,
  defaultExpandedValues,
  placeholder = 'Choose an option…',
  searchPlaceholder = 'Search options…',
  emptyMessage = 'No matching options.',
  searchable = true,
  clearable = false,
  required = false,
  disabled = false,
  contentClassName,
  className,
  id,
  name,
  form,
  onKeyDown,
  ...triggerProps
}: SelectTreeProps) {
  const tree = useSelectTree({
    options,
    value,
    defaultValue,
    onValueChange,
    defaultExpandedValues,
    required,
    disabled,
    id,
    form,
  })

  return (
    <div data-slot="select-tree" className="relative w-full">
      <Primitive.Root modal open={tree.open} onOpenChange={tree.changeOpen}>
        <Primitive.Trigger asChild>
          <button
            {...triggerProps}
            id={tree.triggerId}
            type="button"
            role="combobox"
            aria-label={label}
            aria-expanded={tree.open}
            aria-haspopup="dialog"
            aria-controls={tree.open ? tree.popupId : undefined}
            aria-required={required || undefined}
            aria-invalid={tree.fieldInvalid || triggerProps['aria-invalid']}
            aria-describedby={
              [triggerProps['aria-describedby'], tree.fieldInvalid ? `${tree.triggerId}-error` : '']
                .filter(Boolean)
                .join(' ') || undefined
            }
            disabled={disabled}
            className={cn(
              'flex min-h-10 w-full items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-background px-3 py-2 text-left text-sm text-foreground disabled:opacity-40 aria-invalid:border-danger',
              className,
            )}
            title={tree.selectedPath}
            data-placeholder={!tree.selectedValue || undefined}
            onKeyDown={(event) => {
              onKeyDown?.(event)
              tree.onTriggerKeyDown(event)
            }}
          >
            <span className={cn('min-w-0 flex-1 truncate', !tree.selectedValue && 'text-muted')}>
              {tree.selectedPath || placeholder}
            </span>
            <ChevronDown size={16} className="shrink-0 text-muted" aria-hidden="true" />
          </button>
        </Primitive.Trigger>
        <Primitive.Portal>
          <Primitive.Content
            id={tree.popupId}
            role="dialog"
            aria-modal="true"
            aria-label={`${label} tree selector`}
            align="start"
            sideOffset={6}
            collisionPadding={16}
            className={cn(
              'select-tree-content z-[70] flex max-h-[var(--radix-popover-content-available-height)] w-[max(var(--radix-popover-trigger-width),18rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[var(--radius-panel)] border border-border bg-surface text-foreground shadow-lg outline-none',
              contentClassName,
            )}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              tree.focusOnOpen(searchable)
            }}
            onEscapeKeyDown={(event) => event.stopImmediatePropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border p-2">
              {searchable ? (
                <>
                  <Search size={16} className="ml-1 shrink-0 text-muted" aria-hidden="true" />
                  <Input
                    ref={tree.searchRef}
                    aria-label={`Search ${label}`}
                    placeholder={searchPlaceholder}
                    value={tree.query}
                    className="min-w-0 border-0 bg-transparent px-1 shadow-none focus-visible:outline-offset-0"
                    onChange={(event) => tree.search(event.target.value)}
                    onKeyDown={tree.onSearchKeyDown}
                  />
                </>
              ) : (
                <span className="flex-1 px-2 text-sm font-medium">{label}</span>
              )}
              <Primitive.Close asChild>
                <Button
                  data-select-tree-close=""
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label="Close options"
                >
                  <X size={16} />
                </Button>
              </Primitive.Close>
            </div>
            <div className="h-72 min-h-0 overflow-y-auto p-1">
              {tree.filtered.length ? (
                <div
                  id={tree.treeId}
                  role="tree"
                  aria-label={`${label} options`}
                  aria-describedby={`${tree.treeId}-help`}
                >
                  <SelectTreeNodes
                    nodes={tree.filtered}
                    expanded={tree.effectiveExpanded}
                    selected={tree.selectedValue}
                    active={tree.activeValue}
                    nodeId={tree.nodeId}
                    onFocus={tree.setActive}
                    onToggle={tree.toggle}
                    onChoose={(node) => tree.commit(node.option.value)}
                    onKeyDown={tree.onTreeKeyDown}
                  />
                </div>
              ) : (
                <p role="status" className="px-3 py-6 text-center text-sm text-muted">
                  {emptyMessage}
                </p>
              )}
            </div>
            <div className="select-tree-footer border-t border-border px-3 py-2.5">
              <p className="min-h-10 text-sm text-muted" aria-live="polite">
                {tree.searching
                  ? `${tree.availableCount} available ${tree.availableCount === 1 ? 'option' : 'options'}`
                  : tree.selectedPath ||
                    (tree.model.roots.length
                      ? 'Select a value. Use chevrons to browse groups.'
                      : 'No options available.')}
              </p>
              {clearable && tree.selectedValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 px-0"
                  onClick={() => tree.commit('')}
                >
                  Clear selection
                </Button>
              )}
              <span id={`${tree.treeId}-help`} className="sr-only">
                Use Up and Down to navigate, Right to expand, Left to collapse or return to a
                parent, Enter to select, and Escape to close.
              </span>
            </div>
          </Primitive.Content>
        </Primitive.Portal>
      </Primitive.Root>
      <select
        ref={tree.nativeRef}
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        name={name}
        form={form}
        required={required}
        disabled={disabled}
        value={tree.selectedValue}
        onChange={(event) => tree.commit(event.target.value)}
        onInvalid={(event) => {
          event.preventDefault()
          tree.reportInvalid()
        }}
      >
        <option value="" />
        {tree.model.choices.map((node) => (
          <option key={node.option.value} value={node.option.value} disabled={node.disabled}>
            {node.path.join(' / ')}
          </option>
        ))}
      </select>
      {tree.fieldInvalid && (
        <p id={`${tree.triggerId}-error`} role="alert" className="mt-2 text-sm text-danger">
          Choose an option.
        </p>
      )}
    </div>
  )
}
