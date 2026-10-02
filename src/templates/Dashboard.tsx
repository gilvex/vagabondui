import { useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Folder,
  GitBranch,
  ListTodo,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Checkbox } from '../components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion'
import { Reveal } from '../lib/motion'
import { useWorkspace } from './store'
import { downloadCSV } from './csv'
import { NewTaskDialog, Person, TaskDetails, TaskStatusBadge } from './TaskControls'

const chartData = {
  week: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    created: [18, 27, 21, 38, 32, 44, 49],
    completed: [12, 17, 15, 28, 23, 36, 42],
  },
  month: {
    labels: ['Sep 3', 'Sep 7', 'Sep 11', 'Sep 15', 'Sep 19', 'Sep 23', 'Sep 27', 'Oct 2'],
    created: [28, 48, 39, 63, 51, 76, 68, 91],
    completed: [19, 31, 29, 48, 40, 58, 55, 78],
  },
}

function ActivityChart({ period }: { period: keyof typeof chartData }) {
  const reduced = useReducedMotion()
  const gradientId = useId().replace(/:/g, '')
  const data = chartData[period]
  const ceiling = Math.ceil(Math.max(...data.created) / 20) * 20
  const points = (values: number[]) =>
    values.map(
      (value, index) =>
        `${20 + (index * 600) / (values.length - 1)},${180 - (value / ceiling) * 150}`,
    )
  const completedPoints = points(data.completed)
  const completed = `M${completedPoints.join(' L')}`
  const created = `M${points(data.created).join(' L')}`
  return (
    <div className="activity-chart">
      <div className="chart-legend">
        <span>
          <i className="legend-completed" /> Completed
        </span>
        <span>
          <i className="legend-created" /> Created
        </span>
        <span className="chart-unit">Tasks / period</span>
      </div>
      <svg
        viewBox="0 0 640 210"
        role="img"
        aria-label={`Sample task throughput: ${data.completed.join(', ')} completed and ${data.created.join(', ')} created across the selected period.`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--success)" stopOpacity=".18" />
            <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[30, 80, 130, 180].map((y) => (
          <line
            key={y}
            x1="20"
            x2="620"
            y1={y}
            y2={y}
            stroke="var(--border)"
            strokeDasharray="4 5"
          />
        ))}
        <motion.path
          key={`${period}-area`}
          d={`${completed} L620,190 L20,190 Z`}
          fill={`url(#${gradientId})`}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.6 }}
        />
        <motion.path
          data-chart-line="created"
          key={`${period}-created`}
          d={created}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="2"
          strokeDasharray="5 6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.75 }}
          transition={{ duration: reduced ? 0 : 0.75 }}
        />
        <motion.path
          data-chart-line="completed"
          key={`${period}-completed`}
          d={completed}
          fill="none"
          stroke="var(--success)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduced ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="chart-labels">
        {data.labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { workspace, setWorkspace } = useWorkspace()
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const reduced = useReducedMotion()
  const done = workspace.tasks.filter((task) => task.status === 'done').length
  const open = workspace.tasks.length - done
  const activeProjects = new Set(workspace.tasks.map((task) => task.project)).size
  const selectedTask = workspace.tasks.find((task) => task.id === selectedId)
  const metrics = [
    {
      name: 'Open tasks',
      value: String(open),
      description: 'To do and in progress',
      icon: ListTodo,
    },
    {
      name: 'Completed',
      value: String(done),
      description: 'In this workspace',
      icon: CheckCircle2,
    },
    {
      name: 'Completion rate',
      value: `${workspace.tasks.length ? Math.round((done / workspace.tasks.length) * 100) : 0}%`,
      description: `${done} of ${workspace.tasks.length} tasks`,
      icon: Clock3,
    },
    {
      name: 'Active projects',
      value: String(activeProjects),
      description: `${workspace.members.length} workspace members`,
      icon: Folder,
    },
  ]

  function exportReport() {
    const data = chartData[period]
    downloadCSV(
      `northstar-activity-${period}.csv`,
      ['Period', 'Created', 'Completed'],
      data.labels.map((label, index) => [label, data.created[index], data.completed[index]]),
    )
  }

  return (
    <div className="template-content">
      <header className="template-page-heading">
        <div>
          <p className="eyebrow">Workspace / Overview</p>
          <h1>Workspace overview</h1>
          <p>Track project activity and the work that needs your attention.</p>
        </div>
        <div className="template-heading-actions">
          <Button variant="outline" onClick={exportReport}>
            <ArrowDownToLine size={16} /> Export report
          </Button>
          <NewTaskDialog />
        </div>
      </header>
      <div className="metric-grid">
        {metrics.map(({ name, value, description, icon: Icon }, index) => (
          <Reveal key={name} delay={index * 0.055}>
            <Card className="metric-card">
              <CardContent>
                <div className="metric-label">
                  <span>{name}</span>
                  <Icon size={17} />
                </div>
                <div className="metric-value">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.strong
                      key={value}
                      initial={reduced ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: reduced ? 0 : -8 }}
                      transition={{ duration: reduced ? 0 : 0.22 }}
                    >
                      {value}
                    </motion.strong>
                  </AnimatePresence>
                </div>
                <p>{description}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
      <div className="dashboard-middle">
        <Reveal delay={0.12}>
          <Card className="chart-card">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle>Task throughput</CardTitle>
                <CardDescription>Created and completed tasks. Sample analytics.</CardDescription>
              </div>
              <Select
                value={period}
                onValueChange={(value) => setPeriod(value as 'week' | 'month')}
              >
                <SelectTrigger aria-label="Activity period" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="pt-0">
              <ActivityChart period={period} />
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="data" className="border-0">
                  <AccordionTrigger>View chart data</AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Completed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chartData[period].labels.map((label, index) => (
                          <TableRow key={label}>
                            <TableCell>{label}</TableCell>
                            <TableCell>{chartData[period].created[index]}</TableCell>
                            <TableCell>{chartData[period].completed[index]}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.18}>
          <Card className="activity-card">
            <CardHeader>
              <CardTitle>Project activity</CardTitle>
              <CardDescription>Sample events from the workspace.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ol className="activity-feed">
                {[
                  {
                    name: 'Sam updated the API project',
                    detail: 'Webhook delivery improvements',
                    time: '10:42',
                    icon: GitBranch,
                  },
                  {
                    name: 'Jordan published documentation',
                    detail: 'Design system · v0.3',
                    time: '09:18',
                    icon: Check,
                  },
                  {
                    name: 'Riley opened a new task',
                    detail: 'Mobile navigation review',
                    time: 'Yesterday',
                    icon: ListTodo,
                  },
                  {
                    name: 'Alex created the workspace',
                    detail: 'Northstar',
                    time: 'Sep 28',
                    icon: Folder,
                  },
                ].map((item) => (
                  <li key={item.name}>
                    <span className="activity-icon">
                      <item.icon size={16} />
                    </span>
                    <div>
                      <p>{item.name}</p>
                      <span>{item.detail}</span>
                      <time>{item.time}</time>
                    </div>
                  </li>
                ))}
              </ol>
              <Button asChild variant="outline" className="mt-6 w-full">
                <a href="#template/settings">
                  Workspace settings <ArrowRight size={16} />
                </a>
              </Button>
            </CardContent>
          </Card>
        </Reveal>
      </div>
      <Reveal delay={0.2}>
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Recent tasks</CardTitle>
              <CardDescription>Check off a task or open it to edit the details.</CardDescription>
            </div>
            <Button asChild variant="ghost">
              <a href="#template/projects">
                View all tasks <ArrowRight size={16} />
              </a>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <span className="sr-only">Complete</span>
                  </TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspace.tasks.slice(0, 5).map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Checkbox
                        checked={task.status === 'done'}
                        onCheckedChange={(checked) =>
                          setWorkspace((current) => ({
                            ...current,
                            tasks: current.tasks.map((item) =>
                              item.id === task.id
                                ? { ...item, status: checked === true ? 'done' : 'todo' }
                                : item,
                            ),
                          }))
                        }
                        aria-label={`Complete ${task.title}`}
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
                    <TableCell>
                      <Person id={task.assignee} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted">{task.due}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!workspace.tasks.length && (
              <p className="p-6 text-center text-muted">
                No tasks yet. Create a task to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </Reveal>
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
