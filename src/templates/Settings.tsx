import { useId, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Bell, Check, Mail, Plus, Settings2, Trash2, Users } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
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
import { Switch } from '../components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { toast } from '../components/ui/sonner'
import { Reveal } from '../lib/motion'
import {
  createWorkspace,
  defaultSettings,
  type Member,
  type Settings as SettingsData,
} from './data'
import { useWorkspace } from './store'
import { memberSchema, settingsSchema } from './schema'

const settingsFields = settingsSchema.keyof().options

function Members() {
  const id = useId()
  const { workspace, setWorkspace } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function invite(event: FormEvent) {
    event.preventDefault()
    if (
      workspace.members.some((member) => member.email.toLowerCase() === email.trim().toLowerCase())
    ) {
      setError('This email is already in the workspace.')
      return
    }
    const member: Member = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      role: 'Member',
      invited: true,
    }
    const parsed = memberSchema.safeParse(member)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Check the member details.')
      return
    }
    setWorkspace((current) => ({ ...current, members: [...current.members, parsed.data] }))
    setOpen(false)
    toast.success('Invitation added', {
      description: 'This is a local preview. No email was sent.',
    })
  }

  function removeMember(member: Member) {
    setWorkspace((current) => ({
      ...current,
      members: current.members.filter((item) => item.id !== member.id),
    }))
    toast('Member removed', {
      description: member.name,
      action: {
        label: 'Undo',
        onClick: () =>
          setWorkspace((current) =>
            current.members.some((item) => item.id === member.id)
              ? current
              : { ...current, members: [...current.members, member] },
          ),
      },
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle>Workspace members</CardTitle>
          <CardDescription>
            {workspace.members.length} people have access to this workspace.
          </CardDescription>
        </div>
        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value)
            if (value) {
              setName('')
              setEmail('')
              setError('')
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus size={16} /> Invite member
            </Button>
          </DialogTrigger>
          <DialogContent
            title="Invite a member"
            description="Add a local example invitation. No email will be sent."
          >
            <form className="template-form mt-6" onSubmit={invite}>
              <div className="form-field">
                <Label htmlFor={`${id}-name`}>Full name</Label>
                <Input
                  id={`${id}-name`}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={70}
                  placeholder="Taylor Smith"
                />
              </div>
              <div className="form-field">
                <Label htmlFor={`${id}-email`}>Email address</Label>
                <Input
                  id={`${id}-email`}
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError('')
                  }}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${id}-error` : undefined}
                  placeholder="taylor@example.com"
                />
                {error && (
                  <p id={`${id}-error`} role="alert" className="text-sm text-danger">
                    {error}
                  </p>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={!name.trim() || !email.trim()}>
                  Add invitation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>
                <span className="sr-only">Remove</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workspace.members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="member-identity">
                    <Avatar>
                      <AvatarFallback>
                        {member.name
                          .split(' ')
                          .filter(Boolean)
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{member.name}</p>
                      <span>{member.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge tone={member.invited ? 'warning' : 'success'}>
                    {member.invited ? 'Invited' : 'Active'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {member.role === 'Owner' ? (
                    <span className="text-sm">Owner</span>
                  ) : (
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        setWorkspace((current) => ({
                          ...current,
                          members: current.members.map((item) =>
                            item.id === member.id
                              ? { ...item, role: value as Member['role'] }
                              : item,
                          ),
                        }))
                      }
                    >
                      <SelectTrigger className="w-32" aria-label={`Role for ${member.name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={member.role === 'Owner'}
                    aria-label={`Remove ${member.name}`}
                    onClick={() => removeMember(member)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-4 text-sm text-muted">
          Member roles update immediately. The workspace owner cannot be removed.
        </p>
      </CardContent>
    </Card>
  )
}

export default function Settings() {
  const id = useId()
  const reduced = useReducedMotion()
  const { workspace, setWorkspace } = useWorkspace()
  const [draft, setDraft] = useState<SettingsData>(workspace.settings)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [section, setSection] = useState('general')
  const dirty = settingsFields.some((field) => draft[field] !== workspace.settings[field])

  function update<Key extends keyof SettingsData>(key: Key, value: SettingsData[Key]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setSaved(false)
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function save(event: FormEvent) {
    event.preventDefault()
    const parsed = settingsSchema.safeParse(draft)
    if (!parsed.success) {
      const nextErrors = Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
      )
      setErrors(nextErrors)
      setSection('general')
      requestAnimationFrame(() =>
        document.getElementById(`${id}-${Object.keys(nextErrors)[0]}`)?.focus(),
      )
      return
    }
    setErrors({})
    const settings = parsed.data
    setWorkspace((current) => ({ ...current, settings }))
    setDraft(settings)
    setSaved(true)
    toast.success('Settings saved', {
      description: 'Your workspace preferences have been updated.',
    })
  }

  const saveFooter = (
    <div className="settings-save-bar">
      <div className="settings-save-status">
        <AnimatePresence mode="wait" initial={false}>
          {saved ? (
            <motion.span
              key="saved"
              role="status"
              className="text-success"
              initial={reduced ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
            >
              <Check size={16} /> Changes saved
            </motion.span>
          ) : (
            <motion.span key="dirty" initial={false} animate={{ opacity: 1 }}>
              {dirty ? 'You have unsaved changes.' : 'No unsaved changes.'}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          disabled={!dirty}
          onClick={() => {
            setDraft(workspace.settings)
            setErrors({})
            setSaved(false)
          }}
        >
          Discard
        </Button>
        <Button type="submit" disabled={!dirty}>
          Save changes
        </Button>
      </div>
    </div>
  )

  return (
    <div className="template-content settings-content">
      <header className="template-page-heading">
        <div>
          <p className="eyebrow">Workspace / Settings</p>
          <h1>Workspace settings</h1>
          <p>Manage workspace details, access, and notification preferences.</p>
        </div>
      </header>
      <Reveal>
        <Tabs value={section} onValueChange={setSection}>
          <TabsList aria-label="Settings sections" className="mb-6">
            <TabsTrigger value="general">
              <span className="flex items-center gap-2">
                <Settings2 size={16} /> General
              </span>
            </TabsTrigger>
            <TabsTrigger value="members">
              <span className="flex items-center gap-2">
                <Users size={16} /> Members
              </span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <span className="flex items-center gap-2">
                <Bell size={16} /> Notifications
              </span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <form className="template-form" noValidate onSubmit={save}>
              <Card>
                <CardHeader>
                  <CardTitle>Workspace details</CardTitle>
                  <CardDescription>
                    These details identify your workspace in the demo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-0">
                  <div className="settings-field-row">
                    <div>
                      <Label htmlFor={`${id}-name`}>Workspace name</Label>
                      <p>The name displayed in navigation.</p>
                    </div>
                    <div className="form-field">
                      <Input
                        id={`${id}-name`}
                        value={draft.name}
                        maxLength={50}
                        onChange={(event) => update('name', event.target.value)}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? `${id}-name-error` : undefined}
                      />
                      {errors.name && (
                        <p id={`${id}-name-error`} role="alert" className="text-sm text-danger">
                          {errors.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="settings-field-row">
                    <div>
                      <Label htmlFor={`${id}-slug`}>Workspace URL</Label>
                      <p>A unique identifier for the workspace.</p>
                    </div>
                    <div className="form-field">
                      <div className="url-input">
                        <span>app.local/</span>
                        <Input
                          id={`${id}-slug`}
                          value={draft.slug}
                          maxLength={40}
                          onChange={(event) => update('slug', event.target.value)}
                          aria-invalid={!!errors.slug}
                          aria-describedby={errors.slug ? `${id}-slug-error` : undefined}
                        />
                      </div>
                      {errors.slug && (
                        <p id={`${id}-slug-error`} role="alert" className="text-sm text-danger">
                          {errors.slug}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="settings-field-row">
                    <div>
                      <Label htmlFor={`${id}-email`}>Contact email</Label>
                      <p>Used for workspace communications.</p>
                    </div>
                    <div className="form-field">
                      <Input
                        id={`${id}-email`}
                        type="email"
                        value={draft.email}
                        onChange={(event) => update('email', event.target.value)}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? `${id}-email-error` : undefined}
                      />
                      {errors.email && (
                        <p id={`${id}-email-error`} role="alert" className="text-sm text-danger">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="settings-field-row">
                    <div>
                      <Label htmlFor={`${id}-timezone`}>Time zone</Label>
                      <p>For dates and activity timestamps.</p>
                    </div>
                    <Select
                      value={draft.timezone}
                      onValueChange={(value) => update('timezone', value)}
                    >
                      <SelectTrigger id={`${id}-timezone`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/London">London · Europe/London</SelectItem>
                        <SelectItem value="America/New_York">
                          New York · America/New_York
                        </SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo · Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              {saveFooter}
            </form>
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Demo data</CardTitle>
                <CardDescription>
                  Reset the tasks, members, and settings to their original sample values.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Reset demo workspace</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>Reset the demo workspace?</AlertDialogTitle>
                    <AlertDialogDescription className="mt-3">
                      This removes changes saved by these templates in this browser and restores the
                      sample data.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setWorkspace(createWorkspace())
                          setDraft({ ...defaultSettings })
                          setErrors({})
                          setSaved(false)
                          toast('Demo workspace reset')
                        }}
                      >
                        Reset workspace
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="members">
            <Members />
          </TabsContent>
          <TabsContent value="notifications">
            <form className="template-form" onSubmit={save} noValidate>
              <Card>
                <CardHeader>
                  <CardTitle>Notification preferences</CardTitle>
                  <CardDescription>Choose which updates you want to receive.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {[
                    {
                      key: 'mentions' as const,
                      name: 'Mentions and assignments',
                      description: 'When a teammate mentions you or assigns a task.',
                    },
                    {
                      key: 'deployments' as const,
                      name: 'Deployment updates',
                      description: 'Build results and deployment status changes.',
                    },
                    {
                      key: 'digest' as const,
                      name: 'Weekly digest',
                      description: 'A weekly summary of activity across your projects.',
                    },
                  ].map((item) => (
                    <div className="notification-setting" key={item.key}>
                      <div>
                        <Label htmlFor={`${id}-${item.key}`}>{item.name}</Label>
                        <p id={`${id}-${item.key}-hint`}>{item.description}</p>
                      </div>
                      <Switch
                        id={`${id}-${item.key}`}
                        checked={draft[item.key]}
                        onCheckedChange={(value) => update(item.key, value)}
                        aria-describedby={`${id}-${item.key}-hint`}
                      />
                    </div>
                  ))}
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() =>
                        toast('Test notification', {
                          description: 'This is a preview notification. No email was sent.',
                        })
                      }
                    >
                      <Mail size={16} /> Send test notification
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {saveFooter}
            </form>
          </TabsContent>
        </Tabs>
      </Reveal>
    </div>
  )
}
