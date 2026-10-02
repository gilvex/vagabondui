import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { createBusinessData } from './data'
import { businessSchema, type BusinessData } from './schema'
import { usePersistentStore, type Transaction } from '../persistent-store'

export const BUSINESS_KEY = 'vagabond-business-templates-v1'
type BusinessStore = {
  data: BusinessData
  setData: Dispatch<SetStateAction<BusinessData>>
  persistent: boolean
  transact: <Result>(transaction: Transaction<BusinessData, Result>) => Result
}
const BusinessContext = createContext<BusinessStore | null>(null)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { data, setData, persistent, transact } = usePersistentStore({
    key: BUSINESS_KEY,
    schema: businessSchema,
    createDefault: createBusinessData,
  })
  const context = useMemo(
    () => ({ data, setData, persistent, transact }),
    [data, setData, persistent, transact],
  )
  return <BusinessContext.Provider value={context}>{children}</BusinessContext.Provider>
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (!context) throw new Error('Business templates require BusinessProvider.')
  return context
}
