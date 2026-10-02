import { useId, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, ChevronDown, Menu, Plus, Send, SlidersHorizontal } from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '../components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Textarea } from '../components/ui/textarea'
import { toast } from '../components/ui/sonner'
import { chatPeople, parcelLabels, type Ticket } from './business/data'
import { ParcelDetails } from './business/ParcelControls'
import { useBusiness } from './business/store'
import { ticketSchema } from './business/schema'
import { EmptyState, Initials, PageHeading, SearchField, StatusBadge } from './business/shared'
import { formatTime } from './format'

function NewTicket({ onCreated }: { onCreated: (id: string) => void }) {
  const id = useId()
  const { setData } = useBusiness()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    const ticket: Ticket = {
      id: `SUP-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      customer: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      status: 'Open',
      priority: 'Normal',
      assignee: 'alex',
      orderId: '',
      messages: [
        {
          id: crypto.randomUUID(),
          author: name.trim(),
          text: message.trim(),
          internal: false,
          time: new Date().toISOString(),
        },
      ],
    }
    const parsed = ticketSchema.safeParse(ticket)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Check the ticket details.')
      return
    }
    setData((current) => ({ ...current, tickets: [parsed.data, ...current.tickets] }))
    setOpen(false)
    onCreated(ticket.id)
    toast.success('Ticket created')
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (value) {
          setName('')
          setEmail('')
          setSubject('')
          setMessage('')
          setError('')
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} /> New ticket
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Create support ticket"
        description="Add a customer conversation to this local inbox."
      >
        <form className="template-form mt-6" onSubmit={submit}>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <div className="form-columns">
            <div className="form-field">
              <Label htmlFor={`${id}-name`}>Customer name</Label>
              <Input
                id={`${id}-name`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <Label htmlFor={`${id}-email`}>Customer email</Label>
              <Input
                id={`${id}-email`}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-subject`}>Subject</Label>
            <Input
              id={`${id}-subject`}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
              maxLength={120}
            />
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-message`}>Message</Label>
            <Textarea
              id={`${id}-message`}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              maxLength={2000}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={!name.trim() || !subject.trim() || !message.trim()}>
              Create ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TicketProperties({
  ticket,
  onParcel,
}: {
  ticket: Ticket
  onParcel: (id: string) => void
}) {
  const id = useId()
  const { data, setData } = useBusiness()
  const parcel = data.parcels.find((item) => item.id === ticket.orderId)
  function update(fields: Partial<Ticket>) {
    setData((current) => ({
      ...current,
      tickets: current.tickets.map((item) =>
        item.id === ticket.id ? { ...item, ...fields } : item,
      ),
    }))
  }
  return (
    <div className="ticket-properties">
      <h2>Ticket details</h2>
      <div className="form-field">
        <Label htmlFor={`${id}-status`}>Status</Label>
        <Select
          value={ticket.status}
          onValueChange={(value) => update({ status: value as Ticket['status'] })}
        >
          <SelectTrigger id={`${id}-status`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['Open', 'Pending', 'Resolved'].map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="form-field">
        <Label htmlFor={`${id}-priority`}>Priority</Label>
        <Select
          value={ticket.priority}
          onValueChange={(value) => update({ priority: value as Ticket['priority'] })}
        >
          <SelectTrigger id={`${id}-priority`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['Low', 'Normal', 'Urgent'].map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="form-field">
        <Label htmlFor={`${id}-assignee`}>Assigned to</Label>
        <Select value={ticket.assignee} onValueChange={(value) => update({ assignee: value })}>
          <SelectTrigger id={`${id}-assignee`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {chatPeople.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="ticket-customer">
        <h3>Customer</h3>
        <Initials name={ticket.customer} color="violet" />
        <strong>{ticket.customer}</strong>
        <span>{ticket.email}</span>
      </div>
      {parcel && (
        <div className="ticket-order">
          <h3>Linked parcel</h3>
          <strong>{parcel.id}</strong>
          <StatusBadge status={parcelLabels[parcel.status]} />
          <p>{parcel.destination}</p>
          <Button variant="outline" size="sm" onClick={() => onParcel(parcel.id)}>
            Open parcel
          </Button>
        </div>
      )}
    </div>
  )
}

export default function Support() {
  const { data, setData } = useBusiness()
  const [selectedId, setSelectedId] = useState(data.tickets[0]?.id || '')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Open')
  const [draft, setDraft] = useState('')
  const [replyMode, setReplyMode] = useState('reply')
  const [listOpen, setListOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [parcelId, setParcelId] = useState<string | null>(null)
  const history = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const ticket = data.tickets.find((item) => item.id === selectedId)
  const parcel = data.parcels.find((item) => item.id === parcelId)
  const tickets = data.tickets.filter(
    (item) =>
      (filter === 'all' || item.status === filter) &&
      `${item.id} ${item.subject} ${item.customer}`.toLowerCase().includes(query.toLowerCase()),
  )
  function selectTicket(id: string) {
    setSelectedId(id)
    setDraft('')
    setListOpen(false)
  }
  function send(event: FormEvent) {
    event.preventDefault()
    if (!ticket || !draft.trim()) return
    const message = {
      id: crypto.randomUUID(),
      author: 'Alex Morgan',
      text: draft.trim(),
      internal: replyMode === 'note',
      time: new Date().toISOString(),
    }
    setData((current) => ({
      ...current,
      tickets: current.tickets.map((item) =>
        item.id === ticket.id ? { ...item, messages: [...item.messages, message] } : item,
      ),
    }))
    setDraft('')
    requestAnimationFrame(() =>
      history.current?.scrollTo({
        top: history.current.scrollHeight,
        behavior: reduced ? 'instant' : 'smooth',
      }),
    )
  }
  function resolve() {
    if (!ticket) return
    setData((current) => ({
      ...current,
      tickets: current.tickets.map((item) =>
        item.id === ticket.id
          ? { ...item, status: item.status === 'Resolved' ? 'Open' : 'Resolved' }
          : item,
      ),
    }))
  }
  const ticketList = (
    <>
      <div className="support-list-tools">
        <SearchField
          label="Search tickets"
          placeholder="Search inbox…"
          value={query}
          onChange={setQuery}
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger aria-label="Filter support tickets">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tickets</SelectItem>
            {['Open', 'Pending', 'Resolved'].map((value) => (
              <SelectItem key={value} value={value}>
                {value} ({data.tickets.filter((item) => item.status === value).length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <nav className="ticket-list" aria-label="Support tickets">
        {tickets.map((item) => (
          <button
            key={item.id}
            data-ticket-id={item.id}
            className={ticket?.id === item.id ? 'active' : ''}
            aria-current={ticket?.id === item.id ? 'page' : undefined}
            onClick={() => selectTicket(item.id)}
          >
            <div>
              <span>{item.customer}</span>
              <time>{formatTime(item.messages.at(-1)?.time || new Date().toISOString())}</time>
            </div>
            <strong>{item.subject}</strong>
            <p>{item.messages.at(-1)?.text}</p>
            <span className="ticket-list-meta">
              <span>{item.id}</span>
              <StatusBadge status={item.priority === 'Urgent' ? 'Urgent' : item.status} />
            </span>
          </button>
        ))}
      </nav>
      {!tickets.length && (
        <EmptyState title="No tickets found">Change the status filter or search.</EmptyState>
      )}
    </>
  )
  return (
    <div className="template-content business-page support-page">
      <PageHeading
        section="Customer experience / Inbox"
        title="Support inbox"
        description="Triage customer conversations, collaborate with notes, and resolve issues."
      >
        <NewTicket
          onCreated={(id) => {
            selectTicket(id)
            setFilter('Open')
            setQuery('')
          }}
        />
      </PageHeading>
      <div className="support-layout">
        <aside className="support-ticket-list">{ticketList}</aside>
        {ticket ? (
          <>
            <section className="support-conversation" aria-label="Selected ticket">
              <header>
                <div className="support-ticket-heading">
                  <Button
                    className="support-mobile-control"
                    variant="ghost"
                    size="icon"
                    aria-label="Browse tickets"
                    onClick={() => setListOpen(true)}
                  >
                    <Menu size={18} />
                  </Button>
                  <div>
                    <p>
                      {ticket.id} · {ticket.customer}
                    </p>
                    <h2>{ticket.subject}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={ticket.status === 'Resolved' ? 'outline' : 'default'}
                    size="sm"
                    onClick={resolve}
                  >
                    <Check size={15} /> {ticket.status === 'Resolved' ? 'Reopen' : 'Resolve'}
                  </Button>
                  <Button
                    className="support-details-control"
                    variant="ghost"
                    size="icon"
                    aria-label="Show ticket details"
                    onClick={() => setDetailsOpen(true)}
                  >
                    <SlidersHorizontal size={18} />
                  </Button>
                </div>
              </header>
              <div
                className="support-history"
                ref={history}
                role="log"
                aria-label="Ticket conversation"
              >
                <AnimatePresence initial={false}>
                  {ticket.messages.map((message) => (
                    <motion.article
                      key={message.id}
                      className={`support-message ${message.internal ? 'internal-note' : ''}`}
                      initial={reduced ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: reduced ? 0 : 0.2 }}
                    >
                      <div className="message-byline">
                        <Initials
                          name={message.author}
                          className="size-8"
                          color={message.internal ? 'amber' : 'blue'}
                        />
                        <strong>{message.author}</strong>
                        <time>{formatTime(message.time)}</time>
                        {message.internal && (
                          <span className="internal-note-label">Internal note</span>
                        )}
                      </div>
                      <p>{message.text}</p>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
              <div className="support-composer">
                <Tabs value={replyMode} onValueChange={setReplyMode}>
                  <div className="support-reply-toolbar">
                    <TabsList aria-label="Response type">
                      <TabsTrigger value="reply">Reply</TabsTrigger>
                      <TabsTrigger value="note">Internal note</TabsTrigger>
                    </TabsList>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Saved replies <ChevronDown size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {[
                          'We’re checking your order and will update you shortly.',
                          'Your parcel is ready for collection at the selected pickup point.',
                          'Could you share your parcel ID so we can investigate?',
                        ].map((text) => (
                          <DropdownMenuItem key={text} onSelect={() => setDraft(text)}>
                            {text}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {['reply', 'note'].map((value) => (
                    <TabsContent value={value} key={value}>
                      <form onSubmit={send}>
                        <Textarea
                          aria-label={value === 'reply' ? 'Reply to customer' : 'Internal note'}
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          placeholder={
                            value === 'reply'
                              ? 'Write a reply to the customer…'
                              : 'Leave a note for your team…'
                          }
                          rows={3}
                          maxLength={2000}
                        />
                        <div className="support-send-row">
                          <span>Local demo · no email is sent</span>
                          <Button type="submit" disabled={!draft.trim()}>
                            <Send size={16} />
                            {value === 'reply' ? 'Send reply' : 'Add note'}
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </section>
            <aside className="support-properties">
              <TicketProperties ticket={ticket} onParcel={setParcelId} />
            </aside>
          </>
        ) : (
          <EmptyState title="Select a ticket">Choose a conversation from the inbox.</EmptyState>
        )}
      </div>
      <Sheet open={listOpen} onOpenChange={setListOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Support tickets</SheetTitle>
            <SheetDescription>Choose a customer conversation.</SheetDescription>
          </SheetHeader>
          {ticketList}
        </SheetContent>
      </Sheet>
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Ticket properties</SheetTitle>
            <SheetDescription>Status, ownership, and linked orders.</SheetDescription>
          </SheetHeader>
          {ticket && (
            <TicketProperties
              ticket={ticket}
              onParcel={(id) => {
                setDetailsOpen(false)
                setParcelId(id)
              }}
            />
          )}
        </SheetContent>
      </Sheet>
      {parcel && (
        <ParcelDetails
          key={parcel.id}
          parcelId={parcel.id}
          mode={['transit', 'ready', 'collected'].includes(parcel.status) ? 'pickup' : 'sorting'}
          onClose={() => setParcelId(null)}
        />
      )}
    </div>
  )
}
