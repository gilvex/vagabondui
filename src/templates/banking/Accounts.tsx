import { useState } from 'react'
import { ArrowUpRight, Landmark, PiggyBank } from 'lucide-react'
import { Badge } from 'vagabond-ui/badge'
import { Button } from 'vagabond-ui/button'
import { Card } from 'vagabond-ui/card'
import { Dialog, DialogContent } from 'vagabond-ui/dialog'
import { BankHeading } from './shared'
import { money } from './format'
import { useBanking } from './store'

export default function Accounts() {
  const { data } = useBanking()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = data.accounts.find((account) => account.id === selectedId)
  return (
    <div className="template-content">
      <BankHeading
        title="Your accounts"
        description="A place for your everyday, your rainy day, and your someday."
      >
        <Button asChild>
          <a href="#template/banking/transfers">
            <ArrowUpRight size={16} /> Move money
          </a>
        </Button>
      </BankHeading>
      <div className="bank-account-grid">
        {data.accounts.map((account) => (
          <Card className="bank-panel bank-account-detail" key={account.id}>
            <div className="bank-section-heading">
              <span className="bank-icon">
                {account.kind === 'Savings' ? <PiggyBank size={22} /> : <Landmark size={22} />}
              </span>
              <Badge tone="success">Active</Badge>
            </div>
            <h2>{account.name}</h2>
            <p className="bank-muted">
              {account.kind} account · •••• {account.last4}
            </p>
            <strong className="bank-account-amount">{money(account.balance)}</strong>
            <p className="bank-muted">Available balance</p>
            <dl className="bank-details">
              <div>
                <dt>Annual percentage yield</dt>
                <dd>{account.rate}</dd>
              </div>
              <div>
                <dt>Monthly fee</dt>
                <dd>{money(0)}</dd>
              </div>
            </dl>
            <Button variant="outline" onClick={() => setSelectedId(account.id)}>
              Details for {account.name}
            </Button>
          </Card>
        ))}
      </div>
      <Card className="bank-panel bank-spaced">
        <h2>A little clarity goes a long way.</h2>
        <p className="bank-muted">
          Available balances already account for pending holds. Transfers between your Meridian
          accounts are instant in this demo. Rates and account details are illustrative.
        </p>
      </Card>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      >
        <DialogContent
          title={selected?.name ?? 'Account details'}
          description="Sample account details. Only masked account numbers are displayed."
        >
          {selected && (
            <dl className="bank-details">
              <div>
                <dt>Account holder</dt>
                <dd>Alex Morgan</dd>
              </div>
              <div>
                <dt>Account number</dt>
                <dd>•••• {selected.last4}</dd>
              </div>
              <div>
                <dt>Account type</dt>
                <dd>{selected.kind}</dd>
              </div>
              <div>
                <dt>Currency</dt>
                <dd>USD · US dollar</dd>
              </div>
              <div>
                <dt>Available balance</dt>
                <dd>{money(selected.balance)}</dd>
              </div>
              <div>
                <dt>Annual percentage yield</dt>
                <dd>{selected.rate}</dd>
              </div>
            </dl>
          )}
          <Button variant="outline" onClick={() => setSelectedId(null)}>
            Close details
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
