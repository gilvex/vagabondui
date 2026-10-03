import { useState, type FormEvent } from 'react'
import { Wifi, Landmark, LockKeyhole } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from 'vagabond-ui/badge'
import { Button } from 'vagabond-ui/button'
import { Card } from 'vagabond-ui/card'
import { Input } from 'vagabond-ui/input'
import { Label } from 'vagabond-ui/label'
import { Progress } from 'vagabond-ui/progress'
import { Switch } from 'vagabond-ui/switch'
import { parseAmount } from './commands'
import type { BankCard } from './schema'
import { BankHeading } from './shared'
import { money } from './format'
import { useBanking } from './store'

function CardControls({ card }: { card: BankCard }) {
  const { data, setData } = useBanking()
  const [limit, setLimit] = useState(String(card.limit / 100))
  const [error, setError] = useState('')
  function update(patch: Partial<Pick<BankCard, 'frozen' | 'online' | 'limit'>>) {
    setData((current) => ({
      ...current,
      cards: current.cards.map((item) => (item.id === card.id ? { ...item, ...patch } : item)),
    }))
  }
  function saveLimit(event: FormEvent) {
    event.preventDefault()
    const cents = parseAmount(limit)
    if (cents === null || cents < 10000 || cents > 2000000) {
      setError('Enter a monthly limit between $100 and $20,000.')
      return
    }
    if (cents < card.spent) {
      setError('The limit cannot be lower than spending already recorded this month.')
      return
    }
    update({ limit: cents })
    setError('')
    toast.success(`Spending limit updated for ${card.name}`)
  }
  return (
    <Card className="bank-panel" role="region" aria-label={card.name}>
      <div
        className={`bank-debit-card ${card.kind === 'Virtual' ? 'bank-virtual-card' : ''} ${card.frozen ? 'bank-frozen-card' : ''}`}
      >
        <div className="bank-section-heading">
          <span>
            <Landmark size={18} aria-hidden="true" /> Meridian
          </span>
          <Wifi size={24} aria-hidden="true" />
        </div>
        <span className="bank-chip" aria-hidden="true" />
        <p className="bank-card-number">•••• •••• •••• {card.last4}</p>
        <div className="bank-section-heading">
          <span>Alex Morgan</span>
          <span>{card.kind} · Debit</span>
        </div>
      </div>
      <div className="bank-section-heading bank-spaced">
        <h2>{card.name}</h2>
        <Badge tone={card.frozen ? 'warning' : 'success'}>
          {card.frozen ? 'Frozen' : 'Active'}
        </Badge>
      </div>
      <p className="bank-muted">
        Linked to {data.accounts.find((account) => account.id === card.accountId)?.name}
      </p>
      <div className="bank-switch-row">
        <div>
          <Label htmlFor={`freeze-${card.id}`}>Freeze {card.name}</Label>
          <p className="bank-muted">Pause all new card payments.</p>
        </div>
        <Switch
          id={`freeze-${card.id}`}
          checked={card.frozen}
          onCheckedChange={(frozen) => {
            update({ frozen })
            toast.success(`${card.name} ${frozen ? 'frozen' : 'unfrozen'}`)
          }}
        />
      </div>
      <div className="bank-switch-row">
        <div>
          <Label htmlFor={`online-${card.id}`}>Online payments for {card.name}</Label>
          <p className="bank-muted">Allow purchases on the web.</p>
        </div>
        <Switch
          id={`online-${card.id}`}
          checked={card.online}
          disabled={card.frozen}
          onCheckedChange={(online) => update({ online })}
        />
      </div>
      {card.frozen && (
        <p className="bank-muted" role="status">
          All payments are paused. Unfreeze this card to change online payment access.
        </p>
      )}
      <div className="bank-spaced">
        <div className="bank-section-heading">
          <span>September spending</span>
          <strong>{money(card.spent)}</strong>
        </div>
        <Progress value={(card.spent / card.limit) * 100} label={`${card.name} monthly spending`} />
        <p className="bank-muted mt-2">
          {money(card.limit - card.spent)} remaining of {money(card.limit)}
        </p>
      </div>
      <form onSubmit={saveLimit} className="template-form bank-spaced">
        <div className="form-field">
          <Label htmlFor={`limit-${card.id}`}>Monthly limit (USD)</Label>
          <Input
            id={`limit-${card.id}`}
            inputMode="decimal"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? `limit-error-${card.id}` : undefined}
          />
          {error && (
            <p id={`limit-error-${card.id}`} role="alert" className="text-danger">
              {error}
            </p>
          )}
        </div>
        <Button variant="outline" type="submit">
          Save spending limit
        </Button>
      </form>
    </Card>
  )
}

export default function Cards() {
  const { data } = useBanking()
  return (
    <div className="template-content">
      <BankHeading
        title="Your cards"
        description="A little more control. A lot more peace of mind."
      />
      <div className="bank-overview-grid">
        {data.cards.map((card) => (
          <CardControls key={card.id} card={card} />
        ))}
      </div>
      <p className="template-footnote bank-inline">
        <LockKeyhole size={16} aria-hidden="true" /> Only sample, masked card numbers are shown.
        Controls are saved locally for this demo.
      </p>
    </div>
  )
}
