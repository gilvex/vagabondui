import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Wallet,
  ListFilter,
} from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { Card } from 'vagabond-ui/card'
import { BankHeading, TransactionTable } from './shared'
import { money } from './format'
import { useBanking } from './store'

export default function Overview() {
  const { data } = useBanking()
  const total = data.accounts.reduce((sum, account) => sum + account.balance, 0)
  const monthly = data.transactions.filter(
    (item) => item.date.startsWith('2026-09') && item.status === 'Completed' && !item.transferId,
  )
  const income = monthly.reduce((sum, item) => sum + Math.max(0, item.amount), 0)
  const spending = monthly.reduce((sum, item) => sum + Math.max(0, -item.amount), 0)
  const categories = [
    ...new Set(monthly.filter((item) => item.amount < 0).map((item) => item.category)),
  ]
    .map((name) => ({
      name,
      amount: monthly
        .filter((item) => item.category === name)
        .reduce((sum, item) => sum - item.amount, 0),
    }))
    .sort((a, b) => b.amount - a.amount)
  return (
    <div className="template-content">
      <BankHeading
        title="A clearer view of your money."
        description="Welcome back, Alex. Make room for what matters."
      >
        <Button asChild>
          <a href="#template/banking/transfers">
            <ArrowUpRight size={16} /> Move money
          </a>
        </Button>
      </BankHeading>
      <div className="bank-overview-grid">
        <Card className="bank-balance-hero">
          <div className="bank-section-heading">
            <span>Total available balance</span>
            <Wallet size={22} aria-hidden="true" />
          </div>
          <strong className="bank-total">{money(total)}</strong>
          <p>Across {data.accounts.length} accounts · USD</p>
          <div className="bank-hero-bottom">
            <span>Your next chapter starts here.</span>
            <a href="#template/banking/accounts" aria-label="View all accounts">
              <ArrowRight size={22} />
            </a>
          </div>
        </Card>
        <Card className="bank-panel">
          <div className="bank-section-heading">
            <h2>September cash flow</h2>
            <span className="bank-muted">2026</span>
          </div>
          <div className="bank-cash-flow">
            <div>
              <span className="bank-icon">
                <ArrowDownLeft size={18} aria-hidden="true" />
              </span>
              <p>Money in</p>
              <strong>{money(income)}</strong>
            </div>
            <div>
              <span className="bank-icon">
                <ArrowUpRight size={18} aria-hidden="true" />
              </span>
              <p>Money out</p>
              <strong>{money(spending)}</strong>
            </div>
          </div>
          <p className="bank-muted">
            Net cash flow <strong className="text-success">+{money(income - spending)}</strong>
          </p>
        </Card>
      </div>
      <div className="bank-quick-actions" aria-label="Quick actions">
        <a href="#template/banking/transfers">
          <span>
            <ArrowUpRight size={22} />
          </span>
          Move money
        </a>
        <a href="#template/banking/cards">
          <span>
            <CreditCard size={22} />
          </span>
          My cards
        </a>
        <a href="#template/banking/transactions">
          <span>
            <ListFilter size={22} />
          </span>
          Activity
        </a>
      </div>
      <div className="bank-section-heading bank-spaced">
        <h2>Your accounts</h2>
        <a className="bank-link" href="#template/banking/accounts">
          View accounts <ArrowRight size={16} />
        </a>
      </div>
      <div className="bank-account-grid bank-account-strip">
        {data.accounts.map((account) => (
          <Card key={account.id} className="bank-account-summary">
            <div className="bank-section-heading">
              <span className="bank-icon">
                <Wallet size={18} aria-hidden="true" />
              </span>
              <span className="bank-muted">•• {account.last4}</span>
            </div>
            <h3>{account.name}</h3>
            <strong>{money(account.balance)}</strong>
            <p className="bank-muted">{account.kind} · Available balance</p>
          </Card>
        ))}
      </div>
      <div className="bank-overview-grid bank-spaced">
        <Card className="bank-panel">
          <div className="bank-section-heading">
            <h2>Spending breakdown</h2>
            <span className="bank-muted">September</span>
          </div>
          <div className="bank-spending">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="bank-section-heading">
                  <span>{category.name}</span>
                  <strong>{money(category.amount)}</strong>
                </div>
                <div className="bank-spending-track" aria-hidden="true">
                  <span style={{ width: `${(category.amount / spending) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="bank-panel bank-card-callout">
          <CreditCard size={32} aria-hidden="true" />
          <h2>Everyday spending, on your terms.</h2>
          <p className="bank-muted">
            Freeze a card in a tap, manage online payments, and keep your monthly budget in sight.
          </p>
          <Button variant="outline" asChild>
            <a href="#template/banking/cards">
              Manage your cards <ArrowRight size={16} />
            </a>
          </Button>
          <p className="bank-muted">
            {data.cards.filter((card) => !card.frozen).length} active cards · You’re in control
          </p>
        </Card>
      </div>
      <Card className="bank-panel bank-spaced">
        <div className="bank-section-heading">
          <h2>Recent activity</h2>
          <a href="#template/banking/transactions" className="bank-link">
            View all <ArrowRight size={16} />
          </a>
        </div>
        <TransactionTable transactions={data.transactions.slice(0, 5)} />
      </Card>
      <p className="template-footnote">
        Demo banking workspace. Balances and activity are sample data; no real money moves.
      </p>
    </div>
  )
}
