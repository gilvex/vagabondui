import { useId, useRef, useState } from 'react'
import { Archive, Check, Download, Ellipsis, FileText, Undo2 } from 'lucide-react'
import {
  ActionBar,
  ActionBarButton,
  ActionBarClose,
  ActionBarGroup,
  ActionBarLabel,
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
} from 'vagabond-ui'
import { downloadCSV } from '../../templates/csv'

const files = [
  { id: 'brief', name: 'Project brief.pdf', size: '248 KB', owner: 'Alex Morgan' },
  { id: 'research', name: 'Research notes.md', size: '18 KB', owner: 'Sam Rivera' },
  { id: 'budget', name: 'Budget forecast.csv', size: '42 KB', owner: 'Alex Morgan' },
]

export function ActionBarDemo({ allowViewport = false }: { allowViewport?: boolean }) {
  const id = useId()
  const returnFocusRef = useRef<HTMLButtonElement>(null)
  const [selected, setSelected] = useState<string[]>(['brief', 'research'])
  const [archived, setArchived] = useState<string[]>([])
  const [reviewed, setReviewed] = useState<string[]>([])
  const [lastArchived, setLastArchived] = useState<string[]>([])
  const [variant, setVariant] = useState<'floating' | 'docked'>('floating')
  const [pinned, setPinned] = useState(false)
  const visible = files.filter((file) => !archived.includes(file.id))
  const allSelected = visible.length > 0 && selected.length === visible.length
  const [message, setMessage] = useState('')

  function archive() {
    setLastArchived(selected)
    setArchived([...archived, ...selected])
    setMessage(`${selected.length} ${selected.length === 1 ? 'file' : 'files'} archived.`)
    setSelected([])
  }
  return (
    <section
      className="w-full max-w-2xl space-y-4 text-left"
      aria-label="Bulk file actions example"
    >
      {allowViewport && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ToggleGroup
            type="single"
            value={variant}
            onValueChange={(value) => {
              if (value === 'floating' || value === 'docked') setVariant(value)
            }}
            aria-label="Action bar style"
          >
            <ToggleGroupItem value="floating">Floating</ToggleGroupItem>
            <ToggleGroupItem value="docked">Docked</ToggleGroupItem>
          </ToggleGroup>
          <div className="flex items-center gap-2">
            <Switch id={`${id}-pin`} checked={pinned} onCheckedChange={setPinned} />
            <Label htmlFor={`${id}-pin`}>Pin to viewport</Label>
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex items-center gap-3 border-b border-border bg-raised px-4 py-3">
          <Checkbox
            ref={visible.length ? returnFocusRef : undefined}
            aria-label="Select all files"
            disabled={!visible.length}
            checked={allSelected ? true : selected.length ? 'indeterminate' : false}
            onCheckedChange={(checked) =>
              setSelected(checked ? visible.map((file) => file.id) : [])
            }
          />
          <p className="flex-1 text-sm font-medium">Project files</p>
          <span className="text-sm text-muted">{visible.length} files</span>
        </div>
        {visible.map((file) => (
          <label
            key={file.id}
            className="flex cursor-pointer items-center gap-3 border-b border-border px-4 py-3 last:border-0"
          >
            <Checkbox
              aria-label={`Select ${file.name}`}
              checked={selected.includes(file.id)}
              onCheckedChange={(checked) =>
                setSelected(
                  checked ? [...selected, file.id] : selected.filter((value) => value !== file.id),
                )
              }
            />
            <FileText size={20} className="shrink-0 text-muted" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block break-words text-sm font-medium">{file.name}</span>
              <span className="text-sm text-muted">
                {file.size}
                {reviewed.includes(file.id) ? ' · Reviewed' : ''}
              </span>
            </span>
          </label>
        ))}
        {!visible.length && (
          <p className="px-4 py-8 text-center text-sm text-muted">
            All files archived. Undo to restore the last selection.
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-sm text-muted">
          {selected.length
            ? `${selected.length} ${selected.length === 1 ? 'file' : 'files'} selected`
            : message || 'Select a file to show its actions.'}
        </p>
        {lastArchived.length > 0 && (
          <Button
            ref={!visible.length ? returnFocusRef : undefined}
            variant="ghost"
            size="sm"
            onClick={() => {
              setArchived(archived.filter((value) => !lastArchived.includes(value)))
              setMessage(
                `${lastArchived.length} ${lastArchived.length === 1 ? 'file' : 'files'} restored.`,
              )
              setLastArchived([])
            }}
          >
            <Undo2 size={16} /> Undo archive
          </Button>
        )}
      </div>
      <ActionBar
        label="File actions"
        open={selected.length > 0}
        onOpenChange={(open) => {
          if (!open) setSelected([])
        }}
        variant={variant}
        position={pinned ? 'fixed' : 'inline'}
        returnFocusRef={returnFocusRef}
      >
        <ActionBarLabel className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <span className="flex size-7 items-center justify-center rounded-md bg-accent-soft text-accent-ink">
              {selected.length}
            </span>{' '}
            selected
          </span>
          <ActionBarClose aria-label="Clear selection" />
        </ActionBarLabel>
        <ActionBarGroup>
          <ActionBarButton variant="default" onClick={archive}>
            <Archive size={16} /> Archive
          </ActionBarButton>
          <ActionBarButton
            size="icon"
            aria-label="Export selected files"
            onClick={() => {
              downloadCSV(
                'selected-files.csv',
                ['Name', 'Size', 'Owner'],
                files
                  .filter((file) => selected.includes(file.id))
                  .map((file) => [file.name, file.size, file.owner]),
              )
              setMessage('Selected files exported.')
            }}
          >
            <Download size={18} />
          </ActionBarButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ActionBarButton variant="ghost" size="icon" aria-label="More file actions">
                <Ellipsis size={20} />
              </ActionBarButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end">
              <DropdownMenuItem
                onSelect={() => {
                  setReviewed([...new Set([...reviewed, ...selected])])
                  setMessage('Selected files marked as reviewed.')
                }}
              >
                <Check size={16} /> Mark as reviewed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setSelected([])}>Clear selection</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ActionBarGroup>
      </ActionBar>
      {allowViewport && (
        <p className="text-sm text-muted">
          Select files, export their details, or archive and undo. Pin the bar to review it at the
          bottom of the browser.
        </p>
      )}
    </section>
  )
}

export function SaveActionBarDemo() {
  const id = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const [saved, setSaved] = useState({ name: 'Design workspace', notifications: true })
  const [draft, setDraft] = useState(saved)
  const [message, setMessage] = useState('Edit a setting to reveal the save bar.')
  const dirty = draft.name !== saved.name || draft.notifications !== saved.notifications
  function save() {
    const next = { ...draft, name: draft.name.trim() }
    setSaved(next)
    setDraft(next)
    setMessage('Workspace settings saved.')
  }
  return (
    <section
      className="overflow-hidden rounded-lg border border-border bg-surface"
      aria-label="Save bar example"
    >
      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-6 p-6">
          <div>
            <h3 className="font-medium">Workspace settings</h3>
            <p className="mt-1 text-sm text-muted">
              A docked bar stays inside this scrollable panel.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Workspace name</Label>
            <Input
              ref={nameRef}
              id={`${id}-name`}
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              maxLength={80}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor={`${id}-notifications`}>Weekly summary</Label>
              <p className="mt-1 text-sm text-muted">Receive an overview of workspace activity.</p>
            </div>
            <Switch
              id={`${id}-notifications`}
              checked={draft.notifications}
              onCheckedChange={(notifications) => setDraft({ ...draft, notifications })}
            />
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-medium">Current plan</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-sm text-muted">12 members · Monthly billing</p>
              <Badge>Team</Badge>
            </div>
          </div>
          <p role="status" className="text-sm text-muted">
            {dirty ? 'You have unsaved changes.' : message}
          </p>
        </div>
        <ActionBar
          label="Workspace save actions"
          position="sticky"
          variant="docked"
          open={dirty}
          closeOnEscape={false}
          returnFocusRef={nameRef}
        >
          <ActionBarLabel>Unsaved changes</ActionBarLabel>
          <ActionBarGroup>
            <ActionBarButton
              onClick={() => {
                setDraft(saved)
                setMessage('Changes discarded.')
              }}
            >
              Discard
            </ActionBarButton>
            <ActionBarButton variant="default" disabled={!draft.name.trim()} onClick={save}>
              <Check size={16} /> Save changes
            </ActionBarButton>
          </ActionBarGroup>
        </ActionBar>
      </div>
    </section>
  )
}
