import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { CalendarDays, Circle, Columns3, List, MoreHorizontal, Search, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Checkbox } from '../components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { toast } from '../components/ui/sonner'
import { Reveal } from '../lib/motion'
import { statusLabels, type Task, type TaskStatus } from './data'
import { useWorkspace } from './store'
import { NewTaskDialog, Person, TaskDetails, TaskStatusBadge } from './TaskControls'

export default function Projects() {
  const { workspace, setWorkspace } = useWorkspace()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const reduced = useReducedMotion()
  const filtered = workspace.tasks.filter(
    (task) =>
      (status === 'all' || task.status === status) &&
      `${task.title} ${task.project}`.toLowerCase().includes(query.toLowerCase()),
  )
  const selectedTask = workspace.tasks.find((task) => task.id === selectedId)
  const done = workspace.tasks.filter((task) => task.status === 'done').length

  function moveTask(task: Task, next: TaskStatus) {
    if (task.status === next) return
    setWorkspace((current) => ({
      ...current,
      tasks: current.tasks.map((item) => (item.id === task.id ? { ...item, status: next } : item)),
    }))
    toast(`Moved to ${statusLabels[next]}`, {
      description: task.title,
      action: {
        label: 'Undo',
        onClick: () =>
          setWorkspace((current) => ({
            ...current,
            tasks: current.tasks.map((item) =>
              item.id === task.id ? { ...item, status: task.status } : item,
            ),
          })),
      },
    })
  }

  function deleteTask(task: Task) {
    setWorkspace((current) => ({
      ...current,
      tasks: current.tasks.filter((item) => item.id !== task.id),
    }))
    toast('Task deleted', {
      description: task.title,
      action: {
        label: 'Undo',
        onClick: () =>
          setWorkspace((current) =>
            current.tasks.some((item) => item.id === task.id)
              ? current
              : { ...current, tasks: [task, ...current.tasks] },
          ),
      },
    })
  }

  function taskMenu(task: Task) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            aria-label={`Actions for ${task.title}`}
          >
            <MoreHorizontal size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setSelectedId(task.id)}>Edit task</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Move to</DropdownMenuLabel>
          {Object.entries(statusLabels).map(([value, label]) => (
            <DropdownMenuItem
              key={value}
              disabled={task.status === value}
              onSelect={() => moveTask(task, value as TaskStatus)}
            >
              {label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-danger" onSelect={() => deleteTask(task)}>
            <Trash2 size={16} /> Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="template-content">
      <header className="template-page-heading">
        <div>
          <p className="eyebrow">Workspace / Projects</p>
          <h1>Project tasks</h1>
          <p>
            {workspace.tasks.length} tasks across your projects · {done} completed
          </p>
        </div>
        <NewTaskDialog />
      </header>
      <Reveal>
        <Tabs defaultValue="board" className="task-workspace">
          <div className="tasks-toolbar">
            <TabsList aria-label="Task view">
              <TabsTrigger value="board">
                <span className="flex items-center gap-2">
                  <Columns3 size={16} /> Board
                </span>
              </TabsTrigger>
              <TabsTrigger value="list">
                <span className="flex items-center gap-2">
                  <List size={16} /> List
                </span>
              </TabsTrigger>
            </TabsList>
            <div className="tasks-filters">
              <div className="task-search">
                <Search size={16} />
                <Input
                  aria-label="Search tasks"
                  placeholder="Search tasks…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger aria-label="Filter tasks by status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <TabsContent value="board">
            <LayoutGroup id="task-board">
              <div className="task-board">
                {(Object.entries(statusLabels) as [TaskStatus, string][]).map(([column, label]) => (
                  <section key={column} className="board-column" aria-label={`${label} tasks`}>
                    <header>
                      <span>
                        <Circle
                          size={13}
                          className={`status-${column}`}
                          fill={column === 'done' ? 'currentColor' : 'none'}
                        />
                        {label}
                        <span className="board-count">
                          {filtered.filter((task) => task.status === column).length}
                        </span>
                      </span>
                    </header>
                    <div className="board-items">
                      <AnimatePresence initial={false} mode="popLayout">
                        {filtered
                          .filter((task) => task.status === column)
                          .map((task) => (
                            <motion.article
                              key={task.id}
                              layout={reduced ? false : 'position'}
                              layoutId={reduced ? undefined : task.id}
                              data-task-id={task.id}
                              className="task-card"
                              initial={reduced ? false : { opacity: 0, y: 12, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
                              transition={
                                reduced
                                  ? { duration: 0 }
                                  : {
                                      type: 'spring',
                                      stiffness: 350,
                                      damping: 30,
                                      opacity: { duration: 0.18 },
                                    }
                              }
                            >
                              <div className="task-card-top">
                                <span className="task-project">{task.project}</span>
                                {taskMenu(task)}
                              </div>
                              <button
                                className="task-card-title"
                                onClick={() => setSelectedId(task.id)}
                              >
                                {task.title}
                              </button>
                              <p className="task-card-description">
                                {task.description || 'No description added.'}
                              </p>
                              <div className="task-card-meta">
                                <Badge tone={task.priority === 'High' ? 'warning' : 'neutral'}>
                                  {task.priority}
                                </Badge>
                                <Person id={task.assignee} showName={false} />
                              </div>
                              <div className="task-card-footer">
                                <span>
                                  <CalendarDays size={14} /> {task.due}
                                </span>
                                <span className="font-mono">{task.id}</span>
                              </div>
                            </motion.article>
                          ))}
                      </AnimatePresence>
                      {!filtered.some((task) => task.status === column) && (
                        <div className="board-empty">
                          {query || status !== 'all'
                            ? 'No matching tasks.'
                            : 'No tasks in this column.'}
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </LayoutGroup>
          </TabsContent>
          <TabsContent value="list">
            <div className="task-list-panel">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <span className="sr-only">Complete</span>
                    </TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Checkbox
                          checked={task.status === 'done'}
                          aria-label={`Complete ${task.title}`}
                          onCheckedChange={(checked) =>
                            moveTask(task, checked === true ? 'done' : 'todo')
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <button className="task-title-link" onClick={() => setSelectedId(task.id)}>
                          {task.title}
                        </button>
                        <p className="mt-1 text-sm text-muted">{task.project}</p>
                      </TableCell>
                      <TableCell>
                        <TaskStatusBadge status={task.status} />
                      </TableCell>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell>
                        <Person id={task.assignee} />
                      </TableCell>
                      <TableCell>{taskMenu(task)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!filtered.length && (
                <p className="p-8 text-center text-muted">No tasks match these filters.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Reveal>
      <p className="template-footnote">
        Use a task’s menu to move it between columns. Open its title to edit details.
      </p>
      {selectedTask && (
        <TaskDetails
          key={selectedTask.id}
          task={selectedTask}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
