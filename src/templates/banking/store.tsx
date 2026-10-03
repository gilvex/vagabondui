import { createContext, useContext, type ReactNode } from 'react'
import { usePersistentStore } from '../persistent-store'
import { createBankingData } from './data'
import { bankingSchema, type BankingData } from './schema'

export const BANKING_KEY = 'vagabond-banking-template-v1'
type BankingStore = ReturnType<typeof usePersistentStore<BankingData>>
const BankingContext = createContext<BankingStore | null>(null)

export function BankingProvider({ children }: { children: ReactNode }) {
  const store = usePersistentStore({
    key: BANKING_KEY,
    schema: bankingSchema,
    createDefault: createBankingData,
  })
  return <BankingContext.Provider value={store}>{children}</BankingContext.Provider>
}

export function useBanking() {
  const store = useContext(BankingContext)
  if (!store) throw new Error('Banking pages require BankingProvider.')
  return store
}
