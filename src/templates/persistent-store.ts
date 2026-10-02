import { useState, useSyncExternalStore, type SetStateAction } from 'react'
import type { ZodType } from 'zod'

type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>
type Snapshot<T> = { data: T; persistent: boolean }
export type Transaction<T, Result> = (current: T) => { data: T; result: Result }

type StoreOptions<T> = {
  key: string
  schema: ZodType<T>
  createDefault: () => T
  getStorage?: () => StorageAdapter | null
}

export function createPersistentStore<T>({
  key,
  schema,
  createDefault,
  getStorage = () => (typeof window === 'undefined' ? null : window.localStorage),
}: StoreOptions<T>) {
  let snapshot: Snapshot<T> = { data: createDefault(), persistent: false }
  const listeners = new Set<() => void>()

  try {
    const storage = getStorage()
    snapshot.persistent = storage !== null
    const raw = storage?.getItem(key)
    if (raw) {
      try {
        const parsed = schema.safeParse(JSON.parse(raw))
        if (parsed.success) snapshot.data = parsed.data
      } catch {
        /* Malformed JSON uses defaults without destroying the original record. */
      }
    }
  } catch {
    snapshot.persistent = false
  }

  function commit(data: T) {
    if (Object.is(data, snapshot.data)) return
    let persistent = false
    try {
      const storage = getStorage()
      storage?.setItem(key, JSON.stringify(data))
      persistent = storage !== null
    } catch {
      /* The update still applies in memory if storage is unavailable. */
    }
    snapshot = { data, persistent }
    listeners.forEach((listener) => listener())
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setData(action: SetStateAction<T>) {
      commit(typeof action === 'function' ? (action as (current: T) => T)(snapshot.data) : action)
    },
    transact<Result>(transaction: Transaction<T, Result>): Result {
      const { data, result } = transaction(snapshot.data)
      commit(data)
      return result
    },
  }
}

/** Store configuration is fixed for the lifetime of a provider. Updates persist before returning. */
export function usePersistentStore<T>(options: StoreOptions<T>) {
  const [store] = useState(() => createPersistentStore(options))
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  return { ...snapshot, setData: store.setData, transact: store.transact }
}
