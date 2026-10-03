import { useId, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowDownToLine,
  ArrowUpDown,
  CalendarDays,
  Check,
  LayoutGrid,
  List,
  Plus,
  UserRoundCheck,
  Users,
  X,
} from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'vagabond-ui/card'
import { Checkbox } from 'vagabond-ui/checkbox'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from 'vagabond-ui/dialog'
import { Input } from 'vagabond-ui/input'
import { Label } from 'vagabond-ui/label'
import { Progress } from 'vagabond-ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'vagabond-ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'vagabond-ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'vagabond-ui/tabs'
import { Textarea } from 'vagabond-ui/textarea'
import { toast } from 'vagabond-ui/sonner'
import { departments, onboardingSteps, type LeaveRequest } from './business/data'
import { useBusiness } from './business/store'
import { AddEmployee, EmployeeProfile } from './business/EmployeeForms'
import {
  EmptyState,
  Initials,
  PageHeading,
  SearchField,
  StatusBadge,
  SummaryCards,
} from './business/shared'
import { downloadCSV } from './csv'
import { formatDate } from './format'

function RequestLeave() {
  const id = useId()
  const { data, setData } = useBusiness()
  const [open, setOpen] = useState(false)
  const [employeeId, setEmployeeId] = useState(data.employees[0]?.id || '')
  const [kind, setKind] = useState('Annual leave')
  const [start, setStart] = useState('2026-10-19')
  const [end, setEnd] = useState('2026-10-20')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    if (end < start) {
      setError('The end date must be on or after the start date.')
      return
    }
    if (
      data.leave.some(
        (item) =>
          item.employeeId === employeeId &&
          item.status !== 'Declined' &&
          start <= item.end &&
          end >= item.start,
      )
    ) {
      setError('These dates overlap an existing leave request.')
      return
    }
    const request: LeaveRequest = {
      id: crypto.randomUUID(),
      employeeId,
      kind,
      start,
      end,
      note: note.trim(),
      status: 'Pending',
    }
    setData((current) => ({ ...current, leave: [request, ...current.leave] }))
    setOpen(false)
    toast.success('Leave request submitted')
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        setError('')
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus size={16} /> Request leave
        </Button>
      </DialogTrigger>
      <DialogContent title="Request time off" description="Create a leave request for an employee.">
        <form className="template-form mt-6" onSubmit={submit}>
          <div className="form-field">
            <Label htmlFor={`${id}-employee`}>Employee</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger id={`${id}-employee`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-type`}>Leave type</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger id={`${id}-type`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Annual leave">Annual leave</SelectItem>
                <SelectItem value="Personal leave">Personal leave</SelectItem>
                <SelectItem value="Other leave">Other leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="form-columns">
            <div className="form-field">
              <Label htmlFor={`${id}-start`}>Start date</Label>
              <Input
                id={`${id}-start`}
                type="date"
                value={start}
                onChange={(event) => {
                  setStart(event.target.value)
                  setError('')
                }}
                required
              />
            </div>
            <div className="form-field">
              <Label htmlFor={`${id}-end`}>End date</Label>
              <Input
                id={`${id}-end`}
                type="date"
                value={end}
                onChange={(event) => {
                  setEnd(event.target.value)
                  setError('')
                }}
                required
              />
            </div>
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-note`}>Note (optional)</Label>
            <Textarea
              id={`${id}-note`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={500}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={!employeeId}>
              Submit request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function HR() {
  const { data, setData } = useBusiness()
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('all')
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [ascending, setAscending] = useState(true)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [leaveFilter, setLeaveFilter] = useState('all')
  const [declining, setDeclining] = useState<LeaveRequest | null>(null)
  const [reason, setReason] = useState('')
  const reduced = useReducedMotion()
  const reasonId = useId()
  const employees = data.employees
    .filter(
      (employee) =>
        (department === 'all' || employee.department === department) &&
        `${employee.name} ${employee.email} ${employee.role}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => (ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)))
  const selected = data.employees.find((employee) => employee.id === profileId)
  const pending = data.leave.filter((request) => request.status === 'Pending')
  const starters = data.employees.filter((employee) => employee.status === 'Onboarding')
  function approve(request: LeaveRequest) {
    setData((current) => ({
      ...current,
      leave: current.leave.map((item) =>
        item.id === request.id ? { ...item, status: 'Approved' } : item,
      ),
    }))
    toast.success('Leave request approved')
  }
  return (
    <div className="template-content business-page">
      <PageHeading
        section="People / Workspace"
        title="People & culture"
        description="Your team, time off, and new-starter workflows in one place."
      >
        <Button
          variant="outline"
          onClick={() =>
            downloadCSV(
              'employee-directory.csv',
              ['Name', 'Email', 'Role', 'Department', 'Location', 'Status'],
              employees.map((employee) => [
                employee.name,
                employee.email,
                employee.role,
                employee.department,
                employee.location,
                employee.status,
              ]),
            )
          }
        >
          <ArrowDownToLine size={16} /> Export
        </Button>
        <AddEmployee />
      </PageHeading>
      <SummaryCards
        items={[
          {
            label: 'Team members',
            value: data.employees.length,
            detail: `${departments.length} departments`,
          },
          {
            label: 'Active',
            value: data.employees.filter((employee) => employee.status === 'Active').length,
            detail: 'Current employment status',
          },
          { label: 'Leave requests', value: pending.length, detail: 'Awaiting approval' },
          { label: 'Onboarding', value: starters.length, detail: 'New starters in progress' },
        ]}
      />
      <Tabs defaultValue="people">
        <TabsList aria-label="HR sections">
          <TabsTrigger value="people">
            <span className="flex items-center gap-2">
              <Users size={16} /> People
            </span>
          </TabsTrigger>
          <TabsTrigger value="leave">
            <span className="flex items-center gap-2">
              <CalendarDays size={16} /> Time off
            </span>
          </TabsTrigger>
          <TabsTrigger value="onboarding">
            <span className="flex items-center gap-2">
              <UserRoundCheck size={16} /> Onboarding
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="people">
          <div className="business-toolbar">
            <SearchField
              label="Search employees"
              placeholder="Search name, role, or email…"
              value={query}
              onChange={setQuery}
            />
            <div className="business-toolbar-actions">
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger aria-label="Filter by department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="view-switch" role="group" aria-label="Directory view">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="List view"
                  aria-pressed={view === 'list'}
                  onClick={() => setView('list')}
                  className={view === 'list' ? 'selected' : ''}
                >
                  <List size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Grid view"
                  aria-pressed={view === 'grid'}
                  onClick={() => setView('grid')}
                  className={view === 'grid' ? 'selected' : ''}
                >
                  <LayoutGrid size={16} />
                </Button>
              </div>
            </div>
          </div>
          {view === 'list' ? (
            <div className="business-table-panel">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        className="flex items-center gap-2"
                        onClick={() => setAscending(!ascending)}
                        aria-label="Sort employees by name"
                      >
                        Employee <ArrowUpDown size={14} />
                      </button>
                    </TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start date</TableHead>
                    <TableHead>
                      <span className="sr-only">Profile</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <button
                          className="employee-identity"
                          onClick={() => setProfileId(employee.id)}
                        >
                          <Initials
                            name={employee.name}
                            color={employee.department === 'Design' ? 'violet' : 'blue'}
                          />
                          <span>
                            <strong>{employee.name}</strong>
                            <small>{employee.role}</small>
                          </span>
                        </button>
                      </TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell className="text-muted">{employee.location}</TableCell>
                      <TableCell>
                        <StatusBadge status={employee.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted">
                        {formatDate(employee.startDate)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setProfileId(employee.id)}
                          aria-label={`View ${employee.name}`}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="employee-grid">
              <AnimatePresence initial={false}>
                {employees.map((employee) => (
                  <motion.article
                    key={employee.id}
                    className="employee-card"
                    layout={!reduced}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <Initials name={employee.name} color="blue" className="size-12" />
                      <StatusBadge status={employee.status} />
                    </div>
                    <h2>{employee.name}</h2>
                    <p>{employee.role}</p>
                    <div className="employee-card-meta">
                      <span>{employee.department}</span>
                      <span>{employee.location}</span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setProfileId(employee.id)}
                      aria-label={`View ${employee.name}`}
                    >
                      View profile
                    </Button>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
          {!employees.length && (
            <EmptyState title="No employees found">
              Try another department or search term.
            </EmptyState>
          )}
        </TabsContent>
        <TabsContent value="leave">
          <div className="business-toolbar">
            <div>
              <h2 className="section-title">Leave requests</h2>
              <p className="text-sm text-muted">Review dates and notes before approving.</p>
            </div>
            <div className="business-toolbar-actions">
              <Select value={leaveFilter} onValueChange={setLeaveFilter}>
                <SelectTrigger aria-label="Filter leave requests">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All requests</SelectItem>
                  {['Pending', 'Approved', 'Declined'].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <RequestLeave />
            </div>
          </div>
          <div className="business-table-panel">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.leave
                  .filter((request) => leaveFilter === 'all' || request.status === leaveFilter)
                  .map((request) => {
                    const employee = data.employees.find((item) => item.id === request.employeeId)
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="employee-identity">
                            <Initials name={employee?.name || 'Employee'} />
                            <span>
                              <strong>{employee?.name || 'Employee'}</strong>
                              <small>{employee?.department}</small>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.kind}
                          {request.note && (
                            <p className="mt-1 max-w-64 text-sm text-muted">{request.note}</p>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(request.start)}
                          <p className="text-sm text-muted">to {formatDate(request.end)}</p>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={request.status} />
                        </TableCell>
                        <TableCell>
                          {request.status === 'Pending' ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approve(request)}
                                aria-label={`Approve leave for ${employee?.name}`}
                              >
                                <Check size={15} /> Approve
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={`Decline leave for ${employee?.name}`}
                                onClick={() => {
                                  setDeclining(request)
                                  setReason('')
                                }}
                              >
                                <X size={17} />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted">Reviewed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="onboarding">
          <div className="business-toolbar">
            <div>
              <h2 className="section-title">New-starter checklists</h2>
              <p className="text-sm text-muted">Complete all steps to activate an employee.</p>
            </div>
          </div>
          <div className="onboarding-grid">
            {starters.map((employee) => (
              <Card key={employee.id}>
                <CardHeader>
                  <div className="employee-identity">
                    <Initials name={employee.name} color="green" />
                    <span>
                      <CardTitle>{employee.name}</CardTitle>
                      <CardDescription>
                        {employee.role} · {formatDate(employee.startDate)}
                      </CardDescription>
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                  <div className="flex justify-between text-sm">
                    <span>Onboarding progress</span>
                    <span>{employee.onboarding.filter(Boolean).length} / 3</span>
                  </div>
                  <Progress
                    label={`Onboarding for ${employee.name}`}
                    value={(employee.onboarding.filter(Boolean).length / 3) * 100}
                  />
                  <div className="space-y-4">
                    {onboardingSteps.map((step, index) => (
                      <label className="flex items-center gap-3 text-sm" key={step}>
                        <Checkbox
                          checked={employee.onboarding[index]}
                          aria-label={`${step} for ${employee.name}`}
                          onCheckedChange={(checked) =>
                            setData((current) => ({
                              ...current,
                              employees: current.employees.map((item) =>
                                item.id === employee.id
                                  ? {
                                      ...item,
                                      onboarding: item.onboarding.map((done, i) =>
                                        i === index ? checked === true : done,
                                      ),
                                    }
                                  : item,
                              ),
                            }))
                          }
                        />
                        {step}
                      </label>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    disabled={!employee.onboarding.every(Boolean)}
                    onClick={() => {
                      setData((current) => ({
                        ...current,
                        employees: current.employees.map((item) =>
                          item.id === employee.id ? { ...item, status: 'Active' } : item,
                        ),
                      }))
                      toast.success(`${employee.name} is now active`)
                    }}
                  >
                    Complete onboarding
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {!starters.length && (
            <EmptyState title="All onboarding is complete">
              Add an employee to start a new checklist.
            </EmptyState>
          )}
        </TabsContent>
      </Tabs>
      {selected && (
        <EmployeeProfile key={selected.id} employee={selected} onClose={() => setProfileId(null)} />
      )}
      <Dialog open={!!declining} onOpenChange={(open) => !open && setDeclining(null)}>
        <DialogContent
          title="Decline leave request"
          description="Add a reason that the employee can review."
        >
          <form
            className="template-form mt-6"
            onSubmit={(event) => {
              event.preventDefault()
              if (!reason.trim() || !declining) return
              setData((current) => ({
                ...current,
                leave: current.leave.map((item) =>
                  item.id === declining.id
                    ? { ...item, status: 'Declined', note: reason.trim() }
                    : item,
                ),
              }))
              setDeclining(null)
              toast('Leave request declined')
            }}
          >
            <div className="form-field">
              <Label htmlFor={reasonId}>Reason</Label>
              <Textarea
                id={reasonId}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="destructive" disabled={!reason.trim()}>
                Decline request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
