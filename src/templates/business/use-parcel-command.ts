import { useCallback } from 'react'
import { updateParcel, type ParcelCommand } from './parcels'
import { useBusiness } from './store'

export function useParcelCommand() {
  const { transact } = useBusiness()
  return useCallback(
    (id: string, command: ParcelCommand) => {
      const event = { id: crypto.randomUUID(), time: new Date().toISOString() }
      return transact((current) => updateParcel(current, id, command, event))
    },
    [transact],
  )
}
