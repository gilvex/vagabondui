import { useState, type ReactNode } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Badge } from 'vagabond-ui/badge'
import { Button } from 'vagabond-ui/button'
import { Dialog, DialogContent } from 'vagabond-ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'vagabond-ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'vagabond-ui/table'
import type { BankTransaction } from './schema'
import { useBanking } from './store'
import { bankDate, money } from './format'

export function BankHeading({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="template-page-heading">
      <div>
        <p className="eyebrow">PERSONAL BANKING</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="template-heading-actions">{children}</div>}
    </div>
  )
}

export function BankSelect({
  label,
  value,
  onChange,
  options,
  id,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  id?: string
  options: { value: string; label: string }[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function TransactionTable({ transactions }: { transactions: BankTransaction[] }) {
  const { data } = useBanking()
  const [selected, setSelected] = useState<BankTransaction | null>(null)
  const accountName = (id: string) => data.accounts.find((account) => account.id === id)?.name ?? id
  return (
    <>
      <div className="bank-desktop-transactions">
        <Table aria-label="Account transactions">
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="bank-transaction-name">
                    <span className="bank-icon" aria-hidden="true">
                      {item.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </span>
                    <div>
                      <button className="bank-text-button" onClick={() => setSelected(item)}>
                        {item.description}
                      </button>
                      <p className="bank-muted">{item.category}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{accountName(item.accountId)}</TableCell>
                <TableCell className="whitespace-nowrap">{bankDate(item.date)}</TableCell>
                <TableCell>
                  <Badge tone={item.status === 'Completed' ? 'success' : 'warning'}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right whitespace-nowrap font-medium ${item.amount > 0 ? 'text-success' : ''}`}
                >
                  {item.amount > 0 ? '+' : '−'}
                  {money(Math.abs(item.amount))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="bank-mobile-transactions" aria-label="Account transactions">
        {transactions.map((item) => (
          <li key={item.id}>
            <button onClick={() => setSelected(item)} className="bank-mobile-transaction">
              <span className="bank-icon" aria-hidden="true">
                {item.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </span>
              <span className="bank-mobile-transaction-copy">
                <strong>{item.description}</strong>
                <span>
                  {item.category} · {bankDate(item.date)}
                </span>
                <span>{accountName(item.accountId)}</span>
              </span>
              <span className="bank-mobile-transaction-amount">
                <strong className={item.amount > 0 ? 'text-success' : ''}>
                  {item.amount > 0 ? '+' : '−'}
                  {money(Math.abs(item.amount))}
                </strong>
                <span>{item.status}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {transactions.length === 0 && (
        <p className="bank-empty" role="status">
          No transactions match your filters.
        </p>
      )}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent
          title="Transaction details"
          description="Details from your local demo account."
        >
          {selected && (
            <dl className="bank-details">
              <div>
                <dt>Description</dt>
                <dd>{selected.description}</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>{money(selected.amount)}</dd>
              </div>
              <div>
                <dt>Account</dt>
                <dd>{accountName(selected.accountId)}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{bankDate(selected.date)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{selected.status}</dd>
              </div>
              <div>
                <dt>Reference</dt>
                <dd>{selected.transferId ?? selected.id}</dd>
              </div>
            </dl>
          )}
          <Button variant="outline" onClick={() => setSelected(null)}>
            Close details
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
