import { useId, useState, type FormEvent } from 'react'
import { Plus, UserRound } from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../../components/ui/sheet'
import { toast } from '../../components/ui/sonner'
import { departments, type Employee } from './data'
import { useBusiness } from './store'
import { employeeSchema } from './schema'
import { Initials, StatusBadge } from './shared'
import { formatDate } from '../format'

export function AddEmployee() {
  const id = useId()
  const { data, setData } = useBusiness()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [department, setDepartment] = useState('Engineering')
  const [date, setDate] = useState('2026-10-12')
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    if (
      data.employees.some((employee) => employee.email.toLowerCase() === email.trim().toLowerCase())
    ) {
      setError('An employee with this email already exists.')
      return
    }
    const employee: Employee = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      department,
      startDate: date,
      location: 'London',
      status: 'Onboarding',
      manager: 'Nina Patel',
      onboarding: [false, false, false],
    }
    const parsed = employeeSchema.safeParse(employee)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Check the employee details.')
      return
    }
    setData((current) => ({ ...current, employees: [...current.employees, parsed.data] }))
    setOpen(false)
    toast.success('Employee added', { description: `${employee.name} is ready for onboarding.` })
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (value) {
          setName('')
          setEmail('')
          setRole('')
          setError('')
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} /> Add employee
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Add an employee"
        description="Create a profile and an onboarding checklist in this demo."
      >
        <form className="template-form mt-6" onSubmit={submit}>
          <div className="form-field">
            <Label htmlFor={`${id}-name`}>Full name</Label>
            <Input
              id={`${id}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={70}
            />
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-email`}>Work email</Label>
            <Input
              id={`${id}-email`}
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError('')
              }}
              required
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            {error && (
              <p id={`${id}-error`} role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-role`}>Job title</Label>
            <Input
              id={`${id}-role`}
              value={role}
              onChange={(event) => setRole(event.target.value)}
              required
              maxLength={80}
            />
          </div>
          <div className="form-columns">
            <div className="form-field">
              <Label htmlFor={`${id}-department`}>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id={`${id}-department`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="form-field">
              <Label htmlFor={`${id}-date`}>Start date</Label>
              <Input
                id={`${id}-date`}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={!name.trim() || !role.trim()}>
              Create employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EmployeeProfile({
  employee,
  onClose,
}: {
  employee: Employee
  onClose: () => void
}) {
  const id = useId()
  const { setData } = useBusiness()
  const [draft, setDraft] = useState(employee)
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    const parsed = employeeSchema.safeParse(draft)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Check the employee details.')
      return
    }
    setData((current) => ({
      ...current,
      employees: current.employees.map((item) => (item.id === employee.id ? parsed.data : item)),
    }))
    onClose()
    toast.success('Employee profile updated')
  }
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="business-detail-sheet">
        <SheetHeader>
          <SheetTitle>Employee profile</SheetTitle>
          <SheetDescription>Contact information and employment details.</SheetDescription>
        </SheetHeader>
        <div className="employee-profile-hero">
          <Initials name={employee.name} className="size-16" color="blue" />
          <div>
            <h2>{employee.name}</h2>
            <p>{employee.email}</p>
            <StatusBadge status={employee.status} />
          </div>
        </div>
        <form onSubmit={submit} className="template-form">
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <div className="form-field">
            <Label htmlFor={`${id}-role`}>Job title</Label>
            <Input
              id={`${id}-role`}
              value={draft.role}
              onChange={(event) => setDraft({ ...draft, role: event.target.value })}
              required
            />
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-department`}>Department</Label>
            <Select
              value={draft.department}
              onValueChange={(value) => setDraft({ ...draft, department: value })}
            >
              <SelectTrigger id={`${id}-department`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-location`}>Location</Label>
            <Input
              id={`${id}-location`}
              value={draft.location}
              onChange={(event) => setDraft({ ...draft, location: event.target.value })}
              required
            />
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-status`}>Employment status</Label>
            <Select
              value={draft.status}
              onValueChange={(value) => setDraft({ ...draft, status: value as Employee['status'] })}
            >
              <SelectTrigger id={`${id}-status`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Active', 'On leave', 'Onboarding'].map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="profile-facts">
            <p>
              <UserRound size={16} /> Manager: {employee.manager}
            </p>
            <p>Joined {formatDate(employee.startDate)}</p>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit">Save profile</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
