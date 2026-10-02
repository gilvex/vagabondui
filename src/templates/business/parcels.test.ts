import { describe, expect, it } from 'vitest'
import { createBusinessData } from './data'
import { reduceParcel, updateParcel, type ParcelCommand } from './parcels'
import { parcelSchema } from './schema'

const event = (index: number) => ({ id: `event-${index}`, time: '2026-10-02T12:00:00Z' })

describe('parcel commands', () => {
  it('completes the full lifecycle without mutating the original parcel', () => {
    const original = createBusinessData().parcels[0]
    let parcel = original
    const commands: ParcelCommand[] = [
      { type: 'sort', lane: 'A1 — Central Station' },
      { type: 'dispatch' },
      { type: 'receive', shelf: 'B-01' },
      { type: 'collect', code: parcel.code },
    ]
    commands.forEach((command, index) => {
      const result = reduceParcel(parcel, command, event(index))
      if (!result.ok) throw new Error(result.error)
      parcel = result.parcel
      expect(parcelSchema.safeParse(parcel).success).toBe(true)
    })
    expect(original.status).toBe('received')
    expect(original.events).toHaveLength(1)
    expect(parcel.status).toBe('collected')
    expect(parcel.events).toHaveLength(5)
    expect(parcel.shelf).toBe('B-01')
  })

  it('rejects out-of-order actions and invalid lanes without changing data', () => {
    const data = createBusinessData()
    for (const command of [
      { type: 'dispatch' },
      { type: 'receive', shelf: 'A-01' },
      { type: 'collect', code: data.parcels[0].code },
      { type: 'sort', lane: 'Unknown lane' },
    ] as ParcelCommand[]) {
      const result = updateParcel(data, data.parcels[0].id, command, event(1))
      expect(result.result.ok).toBe(false)
      expect(result.data).toBe(data)
    }
  })

  it('enforces collection-code verification at the domain boundary', () => {
    const data = createBusinessData()
    const parcel = data.parcels.find((item) => item.status === 'ready')
    if (!parcel) throw new Error('Ready fixture missing')
    expect(reduceParcel(parcel, { type: 'collect', code: '000000' }, event(1))).toMatchObject({
      ok: false,
    })
    expect(reduceParcel(parcel, { type: 'collect', code: parcel.code }, event(2))).toMatchObject({
      ok: true,
      parcel: { status: 'collected' },
    })
  })

  it('resolves exceptions only to their original state and requires notes', () => {
    const parcel = createBusinessData().parcels[3]
    const held = reduceParcel(parcel, { type: 'hold', reason: 'Damaged label' }, event(1))
    if (!held.ok) throw new Error(held.error)
    expect(held.parcel.holdFrom).toBe('ready')
    expect(reduceParcel(held.parcel, { type: 'dispatch' }, event(2)).ok).toBe(false)
    expect(reduceParcel(held.parcel, { type: 'resolve', note: ' ' }, event(3)).ok).toBe(false)
    const resolved = reduceParcel(
      held.parcel,
      { type: 'resolve', note: 'Label replaced' },
      event(4),
    )
    expect(resolved).toMatchObject({
      ok: true,
      parcel: { status: 'ready', exception: '', holdFrom: undefined },
    })
  })

  it('rejects duplicate collection and holds on terminal parcels', () => {
    const parcel = createBusinessData().parcels[5]
    expect(parcel.status).toBe('collected')
    expect(reduceParcel(parcel, { type: 'collect', code: parcel.code }, event(1)).ok).toBe(false)
    expect(reduceParcel(parcel, { type: 'hold', reason: 'Too late' }, event(2)).ok).toBe(false)
  })

  it('updates the latest state atomically and does not emit an event for a rejected command', () => {
    const initial = createBusinessData()
    const sorted = updateParcel(
      initial,
      'PKG-1042',
      { type: 'sort', lane: 'A1 — Central Station' },
      event(1),
    )
    const dispatched = updateParcel(sorted.data, 'PKG-1042', { type: 'dispatch' }, event(2))
    const repeated = updateParcel(dispatched.data, 'PKG-1042', { type: 'dispatch' }, event(3))
    expect(repeated.result.ok).toBe(false)
    expect(repeated.data).toBe(dispatched.data)
    expect(repeated.data.parcels[0].events).toHaveLength(3)
  })
})
