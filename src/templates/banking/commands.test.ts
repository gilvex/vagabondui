import { describe, expect, it } from 'vitest'
import { moveMoney, parseAmount, type Transfer } from './commands'
import { createBankingData } from './data'
import { bankingSchema } from './schema'

const transfer: Transfer = {
  id: 'transfer-test',
  from: 'checking',
  to: 'savings',
  amount: 12345,
  note: 'A little for later',
  date: '2026-10-03T12:00:00Z',
}

describe('demo banking transfers', () => {
  it('moves exact cents atomically, preserves total funds, and records both sides', () => {
    const initial = createBankingData()
    const { data, result } = moveMoney(initial, transfer)
    expect(result.ok).toBe(true)
    expect(data.accounts.map((account) => account.balance)).toEqual([812205, 1872345, 325000])
    expect(data.accounts.reduce((sum, account) => sum + account.balance, 0)).toBe(
      initial.accounts.reduce((sum, account) => sum + account.balance, 0),
    )
    expect(data.transactions.slice(0, 2).map((item) => item.amount)).toEqual([-12345, 12345])
    expect(bankingSchema.safeParse(data).success).toBe(true)
    expect(initial.accounts[0].balance).toBe(824550)
  })

  it.each([
    { amount: 0 },
    { amount: -1 },
    { amount: 1.5 },
    { amount: NaN },
    { amount: Infinity },
    { amount: 824551 },
    { to: 'checking' },
    { from: 'missing' },
    { to: 'missing' },
  ])('rejects an invalid transfer without changing state: %j', (patch) => {
    const initial = createBankingData()
    const result = moveMoney(initial, { ...transfer, ...patch })
    expect(result.result.ok).toBe(false)
    expect(result.data).toBe(initial)
  })

  it('allows the full available balance', () => {
    const initial = createBankingData()
    const result = moveMoney(initial, { ...transfer, amount: initial.accounts[0].balance })
    expect(result.result.ok).toBe(true)
    expect(result.data.accounts[0].balance).toBe(0)
  })

  it('rejects repeat confirmation without moving money again', () => {
    const first = moveMoney(createBankingData(), transfer)
    const repeated = moveMoney(first.data, transfer)
    expect(repeated.result).toEqual({
      ok: false,
      error: 'This transfer has already been completed.',
    })
    expect(repeated.data).toBe(first.data)
  })

  it('rechecks the latest available balance before committing', () => {
    const initial = createBankingData()
    const first = moveMoney(initial, { ...transfer, amount: 820000 })
    const second = moveMoney(first.data, { ...transfer, id: 'second' })
    expect(second.result.ok).toBe(false)
    expect(second.data.transactions).toHaveLength(initial.transactions.length + 2)
  })

  it('rejects overflowing destination balances', () => {
    const initial = createBankingData()
    initial.accounts[1].balance = Number.MAX_SAFE_INTEGER
    expect(moveMoney(initial, transfer).result.ok).toBe(false)
  })
})

describe('decimal amount parsing and persisted records', () => {
  it.each([
    ['0.29', 29],
    ['123.45', 12345],
    ['10.1', 1010],
    [' 5 ', 500],
  ])('parses %s to exact cents', (input, cents) => {
    expect(parseAmount(input)).toBe(cents)
  })
  it.each(['', '0', '-1', '1.001', '1e3', 'NaN', 'Infinity', '1,000', '9007199254740992'])(
    'rejects %s',
    (input) => {
      expect(parseAmount(input)).toBeNull()
    },
  )
  it('rejects invalid balances and orphaned records', () => {
    const initial = createBankingData()
    expect(bankingSchema.safeParse(initial).success).toBe(true)
    initial.accounts[0].balance = -1
    expect(bankingSchema.safeParse(initial).success).toBe(false)
    initial.accounts[0].balance = 0
    initial.cards[0].accountId = 'missing'
    expect(bankingSchema.safeParse(initial).success).toBe(false)
  })
})
