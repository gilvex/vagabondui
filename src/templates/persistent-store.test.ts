import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { createPersistentStore } from './persistent-store'

function setup(raw: string | null = null) {
  let saved = raw
  let failWrite = false
  const storage = {
    getItem: () => saved,
    setItem: vi.fn((_key: string, value: string) => {
      if (failWrite) throw new Error('Quota exceeded')
      saved = value
    }),
  }
  const store = createPersistentStore({
    key: 'counter',
    schema: z.object({ count: z.number().int() }),
    createDefault: () => ({ count: 0 }),
    getStorage: () => storage,
  })
  return {
    store,
    storage,
    failWrites: (value: boolean) => {
      failWrite = value
    },
  }
}

describe('persistent store', () => {
  it('persists before an update returns and composes consecutive functional updates', () => {
    const { store, storage } = setup()
    store.setData((current) => ({ count: current.count + 1 }))
    store.setData((current) => ({ count: current.count + 1 }))
    expect(store.getSnapshot().data.count).toBe(2)
    expect(JSON.parse(storage.getItem() || '{}')).toEqual({ count: 2 })
  })

  it.each(['{broken', '{"count":"not a number"}', '{"count":null}'])(
    'recovers from invalid storage: %s',
    (raw) => {
      const { store, storage } = setup(raw)
      expect(store.getSnapshot()).toEqual({ data: { count: 0 }, persistent: true })
      expect(storage.setItem).not.toHaveBeenCalled()
    },
  )

  it('loads valid data without writing on mount', () => {
    const { store, storage } = setup('{"count":8}')
    expect(store.getSnapshot().data.count).toBe(8)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('keeps stable snapshots, skips no-ops, and unsubscribes listeners', () => {
    const { store, storage } = setup()
    const initial = store.getSnapshot()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    const result = store.transact((current) => ({ data: current, result: 'rejected' }))
    expect(result).toBe('rejected')
    expect(store.getSnapshot()).toBe(initial)
    expect(storage.setItem).not.toHaveBeenCalled()
    store.setData({ count: 1 })
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    store.setData({ count: 2 })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('keeps changes in memory when storage fails, and recovers on a later write', () => {
    const { store, failWrites } = setup()
    failWrites(true)
    store.setData({ count: 3 })
    expect(store.getSnapshot()).toEqual({ data: { count: 3 }, persistent: false })
    failWrites(false)
    store.setData({ count: 4 })
    expect(store.getSnapshot()).toEqual({ data: { count: 4 }, persistent: true })
  })

  it('handles denied access to storage without throwing', () => {
    const store = createPersistentStore({
      key: 'test',
      schema: z.string(),
      createDefault: () => 'fallback',
      getStorage: () => {
        throw new Error('Access denied')
      },
    })
    expect(store.getSnapshot()).toEqual({ data: 'fallback', persistent: false })
    store.setData('updated')
    expect(store.getSnapshot()).toEqual({ data: 'updated', persistent: false })
  })
})
