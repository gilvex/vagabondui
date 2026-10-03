import { useId, useState, type FormEvent } from 'react'
import { ArrowDownToLine, Check, CreditCard, MoreHorizontal, Plus, Send } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { Checkbox } from 'vagabond-ui/checkbox'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from 'vagabond-ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'vagabond-ui/dropdown-menu'
import { Input } from 'vagabond-ui/input'
import { Label } from 'vagabond-ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'vagabond-ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from 'vagabond-ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'vagabond-ui/table'
import { toast } from 'vagabond-ui/sonner'
import type { Invoice } from './business/data'
import { useBusiness } from './business/store'
import { invoiceSchema } from './business/schema'
import { EmptyState, PageHeading, SearchField, StatusBadge, SummaryCards } from './business/shared'
import { downloadCSV } from './csv'
import { formatDate, money } from './format'

function CreateInvoice() {
  const id = useId()
  const { setData } = useBusiness()
  const [open, setOpen] = useState(false)
  const [customer, setCustomer] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [due, setDue] = useState('2026-10-15')
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    const cents = Math.round(Number(amount) * 100)
    if (!Number.isFinite(cents) || cents < 1 || cents > 99999999) {
      setError('Enter an amount between $0.01 and $999,999.99.')
      return
    }
    const invoice: Invoice = {
      id: `INV-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      customer: customer.trim(),
      email: email.trim(),
      description: description.trim(),
      cents,
      due,
      status: 'Draft',
      reference: '',
    }
    const parsed = invoiceSchema.safeParse(invoice)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Check the invoice details.')
      return
    }
    setData((current) => ({ ...current, invoices: [parsed.data, ...current.invoices] }))
    setOpen(false)
    toast.success('Draft invoice created')
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (value) {
          setCustomer('')
          setEmail('')
          setDescription('')
          setAmount('')
          setError('')
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} /> Create invoice
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Create invoice"
        description="Add a draft invoice to the local sample ledger."
      >
        <form className="template-form mt-6" onSubmit={submit}>
          <div className="form-field">
            <Label htmlFor={`${id}-customer`}>Customer or company</Label>
            <Input
              id={`${id}-customer`}
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-email`}>Billing email</Label>
            <Input
              id={`${id}-email`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-description`}>Description</Label>
            <Input
              id={`${id}-description`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              maxLength={160}
            />
          </div>
          <div className="form-columns">
            <div className="form-field">
              <Label htmlFor={`${id}-amount`}>Amount (USD)</Label>
              <Input
                id={`${id}-amount`}
                type="number"
                min="0.01"
                max="999999.99"
                step="0.01"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value)
                  setError('')
                }}
                required
              />
            </div>
            <div className="form-field">
              <Label htmlFor={`${id}-due`}>Due date</Label>
              <Input
                id={`${id}-due`}
                type="date"
                value={due}
                onChange={(event) => setDue(event.target.value)}
                required
              />
            </div>
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
            <Button type="submit" disabled={!customer.trim() || !description.trim()}>
              Save draft
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function exportInvoices(invoices: Invoice[]) {
  downloadCSV(
    'invoices.csv',
    [
      'Invoice',
      'Customer',
      'Email',
      'Description',
      'Amount USD',
      'Due date',
      'Status',
      'Reference',
    ],
    invoices.map((invoice) => [
      invoice.id,
      invoice.customer,
      invoice.email,
      invoice.description,
      (invoice.cents / 100).toFixed(2),
      invoice.due,
      invoice.status,
      invoice.reference,
    ]),
  )
}

export default function Billing() {
  const { data, setData } = useBusiness()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState<string[]>([])
  const [detailId, setDetailId] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [reference, setReference] = useState('')
  const referenceId = useId()
  const rows = data.invoices.filter(
    (invoice) =>
      (status === 'all' || invoice.status === status) &&
      `${invoice.id} ${invoice.customer}`.toLowerCase().includes(query.toLowerCase()),
  )
  const detail = data.invoices.find((invoice) => invoice.id === detailId)
  const payment = data.invoices.find((invoice) => invoice.id === paymentId)
  const selectedInvoices = data.invoices.filter((invoice) => selected.includes(invoice.id))
  const selectedDrafts = selectedInvoices.filter((invoice) => invoice.status === 'Draft')
  const outstanding = data.invoices.filter(
    (invoice) => invoice.status === 'Sent' || invoice.status === 'Overdue',
  )
  function markSent(invoices: Invoice[]) {
    const ids = invoices
      .filter((invoice) => invoice.status === 'Draft')
      .map((invoice) => invoice.id)
    setData((current) => ({
      ...current,
      invoices: current.invoices.map((invoice) =>
        ids.includes(invoice.id) && invoice.status === 'Draft'
          ? { ...invoice, status: invoice.due < '2026-10-02' ? 'Overdue' : 'Sent' }
          : invoice,
      ),
    }))
    setSelected([])
    toast.success(`${ids.length} invoices marked as sent`, {
      description: 'Local ledger updated. No email was sent.',
    })
  }
  function openPayment(invoice: Invoice) {
    setPaymentId(invoice.id)
    setReference('')
  }
  function recordPayment(event: FormEvent) {
    event.preventDefault()
    if (!payment || !reference.trim() || !['Sent', 'Overdue'].includes(payment.status)) return
    setData((current) => ({
      ...current,
      invoices: current.invoices.map((invoice) =>
        invoice.id === payment.id
          ? { ...invoice, status: 'Paid', reference: reference.trim() }
          : invoice,
      ),
    }))
    setPaymentId(null)
    toast.success('Payment recorded', { description: `${payment.id} is now paid.` })
  }
  return (
    <div className="template-content business-page">
      <PageHeading
        section="Finance / Sample ledger · October 2026"
        title="Billing & invoices"
        description="Track receivables, create invoices, and record payments."
      >
        <Button
          variant="outline"
          onClick={() => exportInvoices(selectedInvoices.length ? selectedInvoices : rows)}
        >
          <ArrowDownToLine size={16} /> Export CSV
        </Button>
        <CreateInvoice />
      </PageHeading>
      <SummaryCards
        items={[
          {
            label: 'Outstanding',
            value: money(outstanding.reduce((sum, invoice) => sum + invoice.cents, 0)),
            detail: `${outstanding.length} unpaid invoices`,
          },
          {
            label: 'Overdue',
            value: money(
              data.invoices
                .filter((invoice) => invoice.status === 'Overdue')
                .reduce((sum, invoice) => sum + invoice.cents, 0),
            ),
            detail: 'Past the sample ledger date',
          },
          {
            label: 'Paid',
            value: money(
              data.invoices
                .filter((invoice) => invoice.status === 'Paid')
                .reduce((sum, invoice) => sum + invoice.cents, 0),
            ),
            detail: 'Recorded in this ledger',
          },
          {
            label: 'Drafts',
            value: data.invoices.filter((invoice) => invoice.status === 'Draft').length,
            detail: 'Not marked as sent',
          },
        ]}
      />
      <div className="business-toolbar">
        <SearchField
          label="Search invoices"
          placeholder="Invoice number or customer…"
          value={query}
          onChange={(value) => {
            setQuery(value)
            setSelected([])
          }}
        />
        <div className="business-toolbar-actions">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value)
              setSelected([])
            }}
          >
            <SelectTrigger aria-label="Filter invoice status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All invoices</SelectItem>
              {['Draft', 'Sent', 'Overdue', 'Paid'].map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={!selectedDrafts.length || selectedDrafts.length !== selectedInvoices.length}
            onClick={() => markSent(selectedDrafts)}
          >
            <Send size={16} /> Mark selected as sent
          </Button>
        </div>
      </div>
      <div className="business-table-panel">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  aria-label="Select all invoices"
                  checked={
                    rows.length > 0 && rows.every((invoice) => selected.includes(invoice.id))
                      ? true
                      : rows.some((invoice) => selected.includes(invoice.id))
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={(checked) =>
                    setSelected(checked ? rows.map((invoice) => invoice.id) : [])
                  }
                  disabled={!rows.length}
                />
              </TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((invoice) => (
              <TableRow
                key={invoice.id}
                data-state={selected.includes(invoice.id) ? 'selected' : undefined}
              >
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${invoice.id}`}
                    checked={selected.includes(invoice.id)}
                    onCheckedChange={(checked) =>
                      setSelected(
                        checked
                          ? [...selected, invoice.id]
                          : selected.filter((id) => id !== invoice.id),
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <button className="parcel-id" onClick={() => setDetailId(invoice.id)}>
                    {invoice.id}
                  </button>
                </TableCell>
                <TableCell>
                  <strong className="font-medium">{invoice.customer}</strong>
                  <p className="mt-1 text-sm text-muted">{invoice.email}</p>
                </TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted">
                  {formatDate(invoice.due)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {money(invoice.cents)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Actions for ${invoice.id}`}>
                        <MoreHorizontal size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setDetailId(invoice.id)}>
                        View invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={invoice.status !== 'Draft'}
                        onSelect={() => markSent([invoice])}
                      >
                        Mark as sent
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!['Sent', 'Overdue'].includes(invoice.status)}
                        onSelect={() => openPayment(invoice)}
                      >
                        Record payment
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => exportInvoices([invoice])}>
                        Download CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows.length && (
          <EmptyState title="No invoices found">Change the status filter or search.</EmptyState>
        )}
      </div>
      <p className="template-footnote">
        {selected.length} selected · All amounts are USD. Payment recording updates this demo ledger
        only.
      </p>
      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetailId(null)}>
        <SheetContent className="business-detail-sheet">
          <SheetHeader>
            <SheetTitle>{detail?.id || 'Invoice details'}</SheetTitle>
            <SheetDescription>Customer and payment details.</SheetDescription>
          </SheetHeader>
          {detail && (
            <>
              <div className="invoice-amount">
                <CreditCard size={28} />
                <span>Invoice total</span>
                <strong>{money(detail.cents)}</strong>
                <StatusBadge status={detail.status} />
              </div>
              <dl className="business-detail-list">
                <div>
                  <dt>Customer</dt>
                  <dd>{detail.customer}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{detail.email}</dd>
                </div>
                <div>
                  <dt>Description</dt>
                  <dd>{detail.description}</dd>
                </div>
                <div>
                  <dt>Due date</dt>
                  <dd>{formatDate(detail.due)}</dd>
                </div>
                <div>
                  <dt>Reference</dt>
                  <dd>{detail.reference || 'Not recorded'}</dd>
                </div>
              </dl>
              <div className="parcel-processing">
                {detail.status === 'Draft' && (
                  <Button onClick={() => markSent([detail])}>
                    <Send size={16} /> Mark as sent
                  </Button>
                )}
                {['Sent', 'Overdue'].includes(detail.status) && (
                  <Button onClick={() => openPayment(detail)}>
                    <Check size={16} /> Record payment
                  </Button>
                )}
                <Button variant="outline" onClick={() => exportInvoices([detail])}>
                  <ArrowDownToLine size={16} /> Download invoice CSV
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <Dialog open={!!payment} onOpenChange={(open) => !open && setPaymentId(null)}>
        <DialogContent
          title="Record a payment"
          description={`${payment?.id || ''} · ${payment ? money(payment.cents) : ''}. This records a demo entry; no transaction is processed.`}
        >
          <form className="template-form mt-6" onSubmit={recordPayment}>
            <div className="form-field">
              <Label htmlFor={referenceId}>Payment reference</Label>
              <Input
                id={referenceId}
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                required
                maxLength={80}
                placeholder="e.g. BANK-1002"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={!reference.trim()}>
                Confirm payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
