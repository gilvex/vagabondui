import type { BankingData } from './schema'

/** Parse decimal dollars without floating-point rounding or silent precision loss. */
export function parseAmount(value: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return null
  const [dollars, fraction = ''] = value.trim().split('.')
  const cents = Number(dollars) * 100 + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null
}

export type Transfer = {
  id: string
  from: string
  to: string
  amount: number
  note: string
  date: string
}
export type TransferResult = { ok: true } | { ok: false; error: string }

export function moveMoney(
  data: BankingData,
  transfer: Transfer,
): { data: BankingData; result: TransferResult } {
  const reject = (error: string) => ({ data, result: { ok: false as const, error } })
  const from = data.accounts.find((account) => account.id === transfer.from)
  const to = data.accounts.find((account) => account.id === transfer.to)
  if (!from || !to) return reject('Choose two available accounts.')
  if (from.id === to.id) return reject('Choose different source and destination accounts.')
  if (!Number.isSafeInteger(transfer.amount) || transfer.amount <= 0)
    return reject('Enter a valid amount greater than zero.')
  if (transfer.amount > from.balance) return reject('This amount exceeds your available balance.')
  if (!Number.isSafeInteger(to.balance + transfer.amount))
    return reject('This amount exceeds the destination balance limit.')
  if (data.transactions.some((item) => item.transferId === transfer.id))
    return reject('This transfer has already been completed.')
  const base = {
    category: 'Transfers',
    date: transfer.date,
    status: 'Completed' as const,
    transferId: transfer.id,
  }
  const note = transfer.note.trim().slice(0, 80)
  return {
    data: {
      ...data,
      accounts: data.accounts.map((account) => ({
        ...account,
        balance:
          account.balance +
          (account.id === from.id ? -transfer.amount : account.id === to.id ? transfer.amount : 0),
      })),
      transactions: [
        {
          ...base,
          id: `${transfer.id}-out`,
          accountId: from.id,
          amount: -transfer.amount,
          description: `To ${to.name}${note ? ` · ${note}` : ''}`,
        },
        {
          ...base,
          id: `${transfer.id}-in`,
          accountId: to.id,
          amount: transfer.amount,
          description: `From ${from.name}${note ? ` · ${note}` : ''}`,
        },
        ...data.transactions,
      ],
    },
    result: { ok: true },
  }
}
