import { useId, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '../components/ui/sheet'
import { Textarea } from '../components/ui/textarea'
import { toast } from '../components/ui/sonner'
import { people, projects, statusLabels, type Priority, type Task, type TaskStatus } from './data'
import { useWorkspace } from './store'

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge tone={status === 'done' ? 'success' : status === 'in-progress' ? 'info' : 'neutral'}>
      {statusLabels[status]}
    </Badge>
  )
}

export function Person({ id, showName = true }: { id: string; showName?: boolean }) {
  const person = people.find((item) => item.id === id) || people[0]
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar className="size-8" aria-label={showName ? undefined : person.name}>
        <AvatarFallback>{person.initials}</AvatarFallback>
      </Avatar>
      {showName && <span className="text-sm">{person.name}</span>}
    </span>
  )
}

export function NewTaskDialog() {
  const id = useId()
  const { setWorkspace } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [project, setProject] = useState(projects[0])
  const [priority, setPriority] = useState<Priority>('Medium')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    const task: Task = {
      id: `NS-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      title: title.trim(),
      project,
      priority,
      status: 'todo',
      assignee: 'alex',
      description: '',
      due: 'No due date',
    }
    setWorkspace((current) => ({ ...current, tasks: [task, ...current.tasks] }))
    setOpen(false)
    toast.success('Task created', {
      description: task.title,
      action: {
        label: 'Undo',
        onClick: () =>
          setWorkspace((current) => ({
            ...current,
            tasks: current.tasks.filter((item) => item.id !== task.id),
          })),
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setTitle('')
          setProject(projects[0])
          setPriority('Medium')
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} /> New task
        </Button>
      </DialogTrigger>
      <DialogContent title="Create task" description="Add a task to this demo workspace.">
        <form onSubmit={submit} className="template-form mt-6">
          <div className="form-field">
            <Label htmlFor={`${id}-title`}>Task title</Label>
            <Input
              id={`${id}-title`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs to be done?"
              maxLength={120}
              required
            />
          </div>
          <div className="form-columns">
            <div className="form-field">
              <Label htmlFor={`${id}-project`}>Project</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger id={`${id}-project`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="form-field">
              <Label htmlFor={`${id}-priority`}>Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                <SelectTrigger id={`${id}-priority`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Low', 'Medium', 'High'].map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={!title.trim()}>
              Create task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TaskDetails({ task, onClose }: { task: Task; onClose: () => void }) {
  const id = useId()
  const { setWorkspace } = useWorkspace()
  const [draft, setDraft] = useState(task)
  function save(event: FormEvent) {
    event.preventDefault()
    if (!draft.title.trim()) return
    setWorkspace((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === task.id ? { ...draft, title: draft.title.trim() } : item,
      ),
    }))
    toast.success('Task updated', { description: draft.title })
    onClose()
  }
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="task-details-sheet">
        <SheetHeader>
          <SheetTitle>Task details</SheetTitle>
          <SheetDescription>
            {task.id} · {task.project}
          </SheetDescription>
        </SheetHeader>
        <form className="template-form mt-6" onSubmit={save}>
          <div className="form-field">
            <Label htmlFor={`${id}-title`}>Title</Label>
            <Input
              id={`${id}-title`}
              required
              maxLength={120}
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-description`}>Description</Label>
            <Textarea
              id={`${id}-description`}
              rows={5}
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-status`}>Status</Label>
            <Select
              value={draft.status}
              onValueChange={(value) => setDraft({ ...draft, status: value as TaskStatus })}
            >
              <SelectTrigger id={`${id}-status`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([value, name]) => (
                  <SelectItem key={value} value={value}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-assignee`}>Assignee</Label>
            <Select
              value={draft.assignee}
              onValueChange={(value) => setDraft({ ...draft, assignee: value })}
            >
              <SelectTrigger id={`${id}-assignee`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-priority`}>Priority</Label>
            <Select
              value={draft.priority}
              onValueChange={(value) => setDraft({ ...draft, priority: value as Priority })}
            >
              <SelectTrigger id={`${id}-priority`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Low', 'Medium', 'High'].map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit" disabled={!draft.title.trim()}>
              Save changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
