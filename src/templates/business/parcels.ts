import type { BusinessData, Parcel } from './schema'
import { sortingLanes, storageShelves } from './logistics'

export type ParcelCommand =
  | { type: 'sort'; lane: string }
  | { type: 'dispatch'; manifest?: boolean }
  | { type: 'receive'; shelf: string }
  | { type: 'collect'; code: string }
  | { type: 'hold'; reason: string }
  | { type: 'resolve'; note: string }

export type TrackingContext = { id: string; time: string }
export type ParcelResult =
  { ok: true; parcel: Parcel; message: string } | { ok: false; error: string }

/** Pure transition function. Forms cannot bypass verification by assigning a status directly. */
export function reduceParcel(
  parcel: Parcel,
  command: ParcelCommand,
  event: TrackingContext,
): ParcelResult {
  function accept(fields: Partial<Parcel>, message: string): ParcelResult {
    return {
      ok: true,
      message,
      parcel: { ...parcel, ...fields, events: [...parcel.events, { ...event, label: message }] },
    }
  }
  const reject = (error: string): ParcelResult => ({ ok: false, error })

  switch (command.type) {
    case 'sort': {
      if (parcel.status !== 'received') return reject('Only received parcels can be sorted.')
      const lane = sortingLanes.find((item) => item.label === command.lane)
      if (!lane) return reject('Choose a valid sorting lane.')
      return accept(
        { status: 'sorted', lane: lane.label, destination: lane.destination },
        `Sorted to ${lane.id}`,
      )
    }
    case 'dispatch':
      if (parcel.status !== 'sorted' || !parcel.lane.trim())
        return reject('Only sorted parcels with an assigned lane can be dispatched.')
      return accept(
        { status: 'transit' },
        command.manifest ? 'Dispatched in outbound manifest' : 'Dispatched to pickup point',
      )
    case 'receive':
      if (parcel.status !== 'transit') return reject('Only in-transit parcels can be received.')
      if (!storageShelves.some((shelf) => shelf === command.shelf))
        return reject('Choose a valid storage shelf.')
      return accept(
        { status: 'ready', shelf: command.shelf },
        `Received at pickup — shelf ${command.shelf}`,
      )
    case 'collect':
      if (parcel.status !== 'ready') return reject('Only ready parcels can be collected.')
      if (command.code.trim() !== parcel.code)
        return reject('The collection code does not match. Check the code and try again.')
      return accept({ status: 'collected' }, 'Parcel collected — code verified')
    case 'hold':
      if (parcel.status === 'collected' || parcel.status === 'exception')
        return reject('This parcel cannot be placed on hold.')
      if (!command.reason.trim())
        return reject('Describe the problem before placing the parcel on hold.')
      return accept(
        { status: 'exception', holdFrom: parcel.status, exception: command.reason.trim() },
        `Exception reported: ${command.reason.trim()}`,
      )
    case 'resolve': {
      if (parcel.status !== 'exception' || !parcel.holdFrom)
        return reject('This parcel has no exception to resolve.')
      if (!command.note.trim()) return reject('Provide a resolution note.')
      if (parcel.holdFrom !== 'received' && !parcel.lane.trim())
        return reject('The previous processing state requires a lane.')
      if (parcel.holdFrom === 'ready' && !parcel.shelf.trim())
        return reject('The previous pickup state requires a shelf.')
      return accept(
        { status: parcel.holdFrom, holdFrom: undefined, exception: '' },
        `Exception resolved: ${command.note.trim()}`,
      )
    }
  }
}

export function updateParcel(
  data: BusinessData,
  id: string,
  command: ParcelCommand,
  event: TrackingContext,
) {
  const parcel = data.parcels.find((item) => item.id === id)
  const result: ParcelResult = parcel
    ? reduceParcel(parcel, command, event)
    : { ok: false, error: 'Parcel not found.' }
  return {
    data: result.ok
      ? { ...data, parcels: data.parcels.map((item) => (item.id === id ? result.parcel : item)) }
      : data,
    result,
  }
}

export function findParcel(parcels: Parcel[], value: string) {
  const term = value.trim().toUpperCase().replace(/\s+/g, '')
  return parcels.find((parcel) => parcel.id === term || parcel.id === `PKG-${term}`)
}
