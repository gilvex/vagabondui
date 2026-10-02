import { useId, useState } from 'react'
import { AlertTriangle, Check, MapPin, Package, Truck } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../components/ui/sheet'
import { toast } from '../../components/ui/sonner'
import { parcelLabels } from './data'
import { sortLanes, sortingLanes, storageShelves } from './logistics'
import { useBusiness } from './store'
import { StatusBadge } from './shared'
import { formatDate } from '../format'
import { useParcelCommand } from './use-parcel-command'
import { ParcelActionDialog, type ParcelDialogAction } from './ParcelActionDialog'
import type { ParcelCommand } from './parcels'

const eventTime = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function ParcelDetails({
  parcelId,
  mode,
  onClose,
}: {
  parcelId: string
  mode: 'sorting' | 'pickup'
  onClose: () => void
}) {
  const { data } = useBusiness()
  const execute = useParcelCommand()
  const id = useId()
  const parcel = data.parcels.find((item) => item.id === parcelId)
  const [lane, setLane] = useState<string>(
    parcel?.lane ||
      sortingLanes.find((item) => item.destination === parcel?.destination)?.label ||
      sortLanes[0],
  )
  const [shelf, setShelf] = useState(parcel?.shelf || storageShelves[0])
  const [action, setAction] = useState<ParcelDialogAction | null>(null)
  if (!parcel) return null

  function advance(command: ParcelCommand) {
    const result = execute(parcelId, command)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(result.message, { description: parcelId })
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="business-detail-sheet">
        <SheetHeader>
          <SheetTitle>{parcel.id}</SheetTitle>
          <SheetDescription>Shipment details and processing history.</SheetDescription>
        </SheetHeader>
        <div className="parcel-detail-status">
          <span className="parcel-icon">
            <Package size={24} />
          </span>
          <div>
            <StatusBadge status={parcelLabels[parcel.status]} />
            <p>{parcel.items}</p>
          </div>
        </div>
        <dl className="business-detail-list">
          <div>
            <dt>Customer</dt>
            <dd>{parcel.customer}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{parcel.phone}</dd>
          </div>
          <div>
            <dt>Pickup point</dt>
            <dd>{parcel.destination}</dd>
          </div>
          <div>
            <dt>Weight</dt>
            <dd>{parcel.weight}</dd>
          </div>
          <div>
            <dt>Shelf</dt>
            <dd>{parcel.shelf || 'Not assigned'}</dd>
          </div>
          <div>
            <dt>Hold until</dt>
            <dd>{formatDate(parcel.holdUntil)}</dd>
          </div>
        </dl>
        {parcel.status === 'exception' && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle size={18} />
            <AlertTitle>Parcel on hold</AlertTitle>
            <AlertDescription>{parcel.exception}</AlertDescription>
          </Alert>
        )}
        <div className="parcel-processing">
          {mode === 'sorting' && parcel.status === 'received' && (
            <>
              <Label htmlFor={`${id}-lane`}>Sorting lane</Label>
              <Select value={lane} onValueChange={setLane}>
                <SelectTrigger id={`${id}-lane`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortLanes.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => advance({ type: 'sort', lane })}>
                <Check size={16} /> Sort parcel
              </Button>
            </>
          )}
          {mode === 'sorting' && parcel.status === 'sorted' && (
            <Button onClick={() => advance({ type: 'dispatch' })}>
              <Truck size={16} /> Dispatch parcel
            </Button>
          )}
          {mode === 'pickup' && parcel.status === 'transit' && (
            <>
              <Label htmlFor={`${id}-shelf`}>Storage shelf</Label>
              <Select value={shelf} onValueChange={setShelf}>
                <SelectTrigger id={`${id}-shelf`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {storageShelves.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => advance({ type: 'receive', shelf })}>
                <MapPin size={16} /> Receive parcel
              </Button>
            </>
          )}
          {mode === 'pickup' && parcel.status === 'ready' && (
            <Button onClick={() => setAction('collect')}>
              <Check size={16} /> Verify collection
            </Button>
          )}
          {parcel.status === 'exception' ? (
            <Button variant="outline" onClick={() => setAction('resolve')}>
              Resolve exception
            </Button>
          ) : (
            parcel.status !== 'collected' && (
              <Button variant="outline" onClick={() => setAction('exception')}>
                <AlertTriangle size={16} /> Report exception
              </Button>
            )
          )}
          {parcel.status === 'collected' && (
            <p className="text-sm text-success">
              Collection completed. No further processing is required.
            </p>
          )}
          {mode === 'pickup' && ['received', 'sorted'].includes(parcel.status) && (
            <p className="text-sm text-muted">
              This parcel must be dispatched by the sorting center before it can be received.
            </p>
          )}
        </div>
        <section className="parcel-history">
          <h2>Tracking history</h2>
          <ol>
            {[...parcel.events].reverse().map((event) => (
              <li key={event.id}>
                <span />
                <div>
                  <p>{event.label}</p>
                  <time dateTime={event.time}>{eventTime.format(new Date(event.time))}</time>
                </div>
              </li>
            ))}
          </ol>
        </section>
        {action && (
          <ParcelActionDialog
            key={action}
            parcel={parcel}
            action={action}
            onClose={() => setAction(null)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
