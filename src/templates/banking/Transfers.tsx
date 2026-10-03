import { useState, type FormEvent } from 'react'
import { ArrowDown, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { Card } from 'vagabond-ui/card'
import { Dialog, DialogContent } from 'vagabond-ui/dialog'
import { Input } from 'vagabond-ui/input'
import { Label } from 'vagabond-ui/label'
import { moveMoney, parseAmount, type Transfer } from './commands'
import { BankHeading, BankSelect, TransactionTable } from './shared'
import { money } from './format'
import { useBanking } from './store'

export default function Transfers() {
  const { data, transact } = useBanking()
  const [from, setFrom] = useState(data.accounts[0].id)
  const [to, setTo] = useState(data.accounts[1].id)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [review, setReview] = useState<Transfer | null>(null)
  const [receipt, setReceipt] = useState<Transfer | null>(null)
  const source = data.accounts.find((account) => account.id === from)!
  const accountName = (id: string) => data.accounts.find((account) => account.id === id)!.name
  const options = data.accounts.map((account) => ({
    value: account.id,
    label: `${account.name} · ${account.last4}`,
  }))

  function reviewTransfer(event: FormEvent) {
    event.preventDefault()
    setReceipt(null)
    const cents = parseAmount(amount)
    if (cents === null) {
      setError('Enter an amount greater than zero with at most two decimal places.')
      return
    }
    const transfer = {
      id: crypto.randomUUID(),
      from,
      to,
      amount: cents,
      note: note.trim(),
      date: new Date().toISOString(),
    }
    const { result } = moveMoney(data, transfer)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError('')
    setReview(transfer)
  }

  function confirmTransfer() {
    if (!review) return
    const result = transact((current) => moveMoney(current, review))
    setReview(null)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setReceipt(review)
    setAmount('')
    setNote('')
  }

  return (
    <div className="template-content">
      <BankHeading
        title="Move money"
        description="From everyday plans to bigger dreams. Transfer between your accounts."
      />
      <div className="bank-overview-grid">
        <Card className="bank-panel">
          <h2>New transfer</h2>
          <form className="template-form bank-spaced" onSubmit={reviewTransfer}>
            <div className="form-field">
              <Label htmlFor="transfer-from">From account</Label>
              <BankSelect
                id="transfer-from"
                label="From account"
                value={from}
                onChange={setFrom}
                options={options}
              />
              <p className="bank-muted">Available: {money(source.balance)}</p>
            </div>
            <ArrowDown className="bank-transfer-arrow" size={20} aria-hidden="true" />
            <div className="form-field">
              <Label htmlFor="transfer-to">To account</Label>
              <BankSelect
                id="transfer-to"
                label="To account"
                value={to}
                onChange={setTo}
                options={options}
              />
            </div>
            <div className="form-field">
              <Label htmlFor="transfer-amount">Amount (USD)</Label>
              <Input
                id="transfer-amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                aria-describedby={error ? 'transfer-error' : undefined}
              />
            </div>
            <div className="form-field">
              <Label htmlFor="transfer-note">Note (optional)</Label>
              <Input
                id="transfer-note"
                maxLength={80}
                placeholder="What are you saving for?"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
            {error && (
              <p id="transfer-error" role="alert" className="text-danger">
                {error}
              </p>
            )}
            <Button type="submit">
              Review transfer <ArrowRight size={16} />
            </Button>
          </form>
        </Card>
        <div className="bank-transfer-aside">
          {receipt && (
            <Card className="bank-panel bank-receipt" role="status">
              <CheckCircle2 size={28} aria-hidden="true" />
              <h2>Transfer complete</h2>
              <p>
                {money(receipt.amount)} moved to {accountName(receipt.to)}.
              </p>
              <p className="bank-muted">
                Your account balances and transaction history are updated.
              </p>
              <Button variant="outline" asChild>
                <a href="#template/banking-transactions">View transactions</a>
              </Button>
            </Card>
          )}
          <Card className="bank-panel">
            <ShieldCheck size={28} aria-hidden="true" />
            <h2 className="mt-4">Simple. Instant. Yours.</h2>
            <dl className="bank-details">
              <div>
                <dt>Transfer fee</dt>
                <dd>{money(0)}</dd>
              </div>
              <div>
                <dt>Arrival</dt>
                <dd>Instant</dd>
              </div>
              <div>
                <dt>Currency</dt>
                <dd>USD</dd>
              </div>
            </dl>
            <p className="bank-muted">
              This is an interactive demo. Transfers update sample accounts in this browser only.
            </p>
          </Card>
        </div>
      </div>
      <Card className="bank-panel bank-spaced">
        <h2 className="mb-4">Recent transfers</h2>
        {data.transactions.some((item) => item.transferId) ? (
          <TransactionTable
            transactions={data.transactions
              .filter((item) => item.transferId && item.amount < 0)
              .slice(0, 5)}
          />
        ) : (
          <p className="bank-empty">
            Your transfers will appear here. Start with a little toward your next goal.
          </p>
        )}
      </Card>
      <Dialog
        open={review !== null}
        onOpenChange={(open) => {
          if (!open) setReview(null)
        }}
      >
        <DialogContent
          title="Review your transfer"
          description="Confirm the details before moving your demo money."
        >
          {review && (
            <dl className="bank-details">
              <div>
                <dt>From</dt>
                <dd>{accountName(review.from)}</dd>
              </div>
              <div>
                <dt>To</dt>
                <dd>{accountName(review.to)}</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>{money(review.amount)}</dd>
              </div>
              <div>
                <dt>Fee</dt>
                <dd>{money(0)}</dd>
              </div>
              {review.note && (
                <div>
                  <dt>Note</dt>
                  <dd>{review.note}</dd>
                </div>
              )}
            </dl>
          )}
          <div className="bank-dialog-actions">
            <Button variant="outline" onClick={() => setReview(null)}>
              Go back
            </Button>
            <Button onClick={confirmTransfer}>Confirm transfer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
