import { z } from 'zod'

const cents = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)
const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(['Checking', 'Savings']),
  last4: z.string().regex(/^\d{4}$/),
  balance: cents,
  rate: z.string(),
})
const transactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  description: z.string(),
  category: z.string(),
  date: z.iso.datetime(),
  amount: z.number().int().min(-Number.MAX_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER),
  status: z.enum(['Completed', 'Pending']),
  transferId: z.string().optional(),
})
const cardSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  name: z.string(),
  last4: z.string().regex(/^\d{4}$/),
  kind: z.enum(['Physical', 'Virtual']),
  frozen: z.boolean(),
  online: z.boolean(),
  limit: cents.min(10000).max(2000000),
  spent: cents,
})
export const bankingSchema = z
  .object({
    accounts: z.array(accountSchema).min(2),
    transactions: z.array(transactionSchema),
    cards: z.array(cardSchema),
  })
  .superRefine((data, context) => {
    const ids = new Set(data.accounts.map((account) => account.id))
    if (
      ids.size !== data.accounts.length ||
      data.transactions.some((item) => !ids.has(item.accountId)) ||
      data.cards.some((item) => !ids.has(item.accountId)) ||
      new Set(data.transactions.map((item) => item.id)).size !== data.transactions.length ||
      new Set(data.cards.map((item) => item.id)).size !== data.cards.length
    ) {
      context.addIssue({ code: 'custom', message: 'Invalid banking record references.' })
    }
  })
export type BankingData = z.infer<typeof bankingSchema>
export type BankAccount = z.infer<typeof accountSchema>
export type BankTransaction = z.infer<typeof transactionSchema>
export type BankCard = z.infer<typeof cardSchema>
