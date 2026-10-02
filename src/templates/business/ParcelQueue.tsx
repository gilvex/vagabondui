import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { parcelLabels, type Parcel } from './data'
import { EmptyState, StatusBadge } from './shared'
import { formatDate } from '../format'

type ParcelQueueProps = {
  parcels: Parcel[]
  mode: 'sorting' | 'pickup'
  onOpen: (id: string) => void
  selected?: string[]
  onSelect?: (ids: string[]) => void
}

export function ParcelQueue({ parcels, mode, onOpen, selected = [], onSelect }: ParcelQueueProps) {
  const selection = new Set(selected)
  const eligible = parcels.filter((parcel) => parcel.status === 'sorted').map((parcel) => parcel.id)
  const selectedCount = eligible.filter((id) => selection.has(id)).length
  const allChecked = eligible.length > 0 && selectedCount === eligible.length

  return (
    <div className="business-table-panel">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelect && (
              <TableHead>
                <Checkbox
                  aria-label="Select all dispatchable parcels"
                  disabled={!eligible.length}
                  checked={allChecked ? true : selectedCount ? 'indeterminate' : false}
                  onCheckedChange={(checked) => onSelect(checked === true ? eligible : [])}
                />
              </TableHead>
            )}
            <TableHead>Parcel</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>{mode === 'sorting' ? 'Destination' : 'Shelf'}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>{mode === 'sorting' ? 'Lane' : 'Hold until'}</TableHead>
            <TableHead>
              <span className="sr-only">Details</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parcels.map((parcel) => (
            <TableRow key={parcel.id}>
              {onSelect && (
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${parcel.id}`}
                    disabled={parcel.status !== 'sorted'}
                    checked={selection.has(parcel.id)}
                    onCheckedChange={(checked) =>
                      onSelect(
                        checked === true
                          ? [...new Set([...selected, parcel.id])]
                          : selected.filter((id) => id !== parcel.id),
                      )
                    }
                  />
                </TableCell>
              )}
              <TableCell>
                <button type="button" className="parcel-id" onClick={() => onOpen(parcel.id)}>
                  {parcel.id}
                </button>
                <p className="mt-1 text-sm text-muted">{parcel.weight}</p>
              </TableCell>
              <TableCell>
                <span className="whitespace-nowrap">{parcel.customer}</span>
                <p className="mt-1 text-sm text-muted">{parcel.phone}</p>
              </TableCell>
              <TableCell>
                {mode === 'sorting' ? (
                  parcel.destination
                ) : (
                  <span className="shelf-label">{parcel.shelf || 'Unassigned'}</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={parcelLabels[parcel.status]} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted">
                {mode === 'sorting'
                  ? parcel.lane.split(' — ')[0] || '—'
                  : formatDate(parcel.holdUntil)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Open ${parcel.id}`}
                  onClick={() => onOpen(parcel.id)}
                >
                  Open
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!parcels.length && (
        <EmptyState title="No parcels in this queue">
          Change the filter or search for another parcel.
        </EmptyState>
      )}
    </div>
  )
}
