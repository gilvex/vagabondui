import { useState } from 'react'
import { Download, Search } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { Card } from 'vagabond-ui/card'
import { Input } from 'vagabond-ui/input'
import { downloadCSV } from '../csv'
import { BankHeading, BankSelect, TransactionTable } from './shared'
import { useBanking } from './store'

export default function Transactions() {
  const { data } = useBanking()
  const [query, setQuery] = useState('')
  const [account, setAccount] = useState('all')
  const [status, setStatus] = useState('all')
  const filtered = data.transactions.filter(
    (item) =>
      (account === 'all' || item.accountId === account) &&
      (status === 'all' || item.status === status) &&
      `${item.description} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase()),
  )
  function exportTransactions() {
    downloadCSV(
      'meridian-transactions.csv',
      ['Reference', 'Date', 'Description', 'Account', 'Category', 'Status', 'Amount (USD)'],
      filtered.map((item) => [
        item.id,
        item.date,
        item.description,
        data.accounts.find((account) => account.id === item.accountId)!.name,
        item.category,
        item.status,
        (item.amount / 100).toFixed(2),
      ]),
    )
  }
  return (
    <div className="template-content">
      <BankHeading title="Transactions" description="Every little detail, all in one place.">
        <Button variant="outline" onClick={exportTransactions} disabled={!filtered.length}>
          <Download size={16} /> Export CSV
        </Button>
      </BankHeading>
      <Card className="bank-panel">
        <div className="bank-filters">
          <div className="bank-search">
            <Search size={18} aria-hidden="true" />
            <Input
              aria-label="Search transactions"
              placeholder="Search description or category…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <BankSelect
            label="Filter by account"
            value={account}
            onChange={setAccount}
            options={[
              { value: 'all', label: 'All accounts' },
              ...data.accounts.map((item) => ({ value: item.id, label: item.name })),
            ]}
          />
          <BankSelect
            label="Filter by status"
            value={status}
            onChange={setStatus}
            options={['all', 'Completed', 'Pending'].map((value) => ({
              value,
              label: value === 'all' ? 'All statuses' : value,
            }))}
          />
        </div>
        <p className="bank-result-count bank-muted" role="status">
          {filtered.length} transactions
          {query || account !== 'all' || status !== 'all'
            ? ' match your filters'
            : ' across your accounts'}
        </p>
        <TransactionTable transactions={filtered} />
        {(query || account !== 'all' || status !== 'all') && (
          <Button
            className="mt-4"
            variant="ghost"
            onClick={() => {
              setQuery('')
              setAccount('all')
              setStatus('all')
            }}
          >
            Clear filters
          </Button>
        )}
      </Card>
    </div>
  )
}
