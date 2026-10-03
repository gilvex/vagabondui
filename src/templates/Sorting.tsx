import { useState, type FormEvent } from 'react'
import { ArrowDownToLine, ScanLine, Truck } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'vagabond-ui/alert-dialog'
import { Button } from 'vagabond-ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'vagabond-ui/card'
import { Input } from 'vagabond-ui/input'
import { Label } from 'vagabond-ui/label'
import { Progress } from 'vagabond-ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'vagabond-ui/tabs'
import { toast } from 'vagabond-ui/sonner'
import { useBusiness } from './business/store'
import { sortingLanes } from './business/logistics'
import { reduceParcel, findParcel } from './business/parcels'
import { ParcelDetails, ParcelQueue } from './business/ParcelControls'
import { PageHeading, SearchField, SummaryCards } from './business/shared'
import { downloadCSV } from './csv'

const queues = [
  { value: 'received', label: 'Inbound' },
  { value: 'sorted', label: 'Ready to dispatch' },
  { value: 'transit', label: 'Dispatched' },
  { value: 'exception', label: 'Exceptions' },
  { value: 'all', label: 'All parcels' },
]

export default function Sorting() {
  const { data, transact } = useBusiness()
  const [queue, setQueue] = useState('received')
  const [query, setQuery] = useState('')
  const [scan, setScan] = useState('')
  const [scanError, setScanError] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selection, setSelection] = useState<string[]>([])
  const rows = data.parcels.filter(
    (parcel) =>
      (queue === 'all' || parcel.status === queue) &&
      `${parcel.id} ${parcel.customer} ${parcel.destination}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  const dispatchable = data.parcels.filter(
    (parcel) => selection.includes(parcel.id) && parcel.status === 'sorted',
  )
  function lookup(event: FormEvent) {
    event.preventDefault()
    const parcel = findParcel(data.parcels, scan)
    if (!parcel) {
      setScanError(`No parcel found for “${scan.trim()}”. Try PKG-1042.`)
      return
    }
    setScanError('')
    setSelectedId(parcel.id)
    setScan('')
  }
  function dispatch() {
    const selectedIds = new Set(selection)
    const count = transact((current) => {
      let dispatched = 0
      const parcels = current.parcels.map((parcel) => {
        if (!selectedIds.has(parcel.id)) return parcel
        const result = reduceParcel(
          parcel,
          { type: 'dispatch', manifest: true },
          { id: crypto.randomUUID(), time: new Date().toISOString() },
        )
        if (!result.ok) return parcel
        dispatched += 1
        return result.parcel
      })
      return { data: dispatched ? { ...current, parcels } : current, result: dispatched }
    })
    if (!count) {
      toast.error('No selected parcels are ready for dispatch.')
      return
    }
    setSelection([])
    toast.success(`${count} parcels dispatched`, {
      description: 'They are now available in the pickup-point arrivals queue.',
    })
  }
  return (
    <div className="template-content business-page">
      <PageHeading
        section="ParcelFlow / East London hub"
        title="Sorting center"
        description="Receive, route, and dispatch parcels from a single queue."
      >
        <Button
          variant="outline"
          onClick={() =>
            downloadCSV(
              'sorting-queue.csv',
              ['Parcel', 'Customer', 'Destination', 'Status', 'Lane'],
              rows.map((parcel) => [
                parcel.id,
                parcel.customer,
                parcel.destination,
                parcel.status,
                parcel.lane,
              ]),
            )
          }
        >
          <ArrowDownToLine size={16} /> Export queue
        </Button>
      </PageHeading>
      <SummaryCards
        items={[
          {
            label: 'Awaiting sort',
            value: data.parcels.filter((parcel) => parcel.status === 'received').length,
            detail: 'Received at this hub',
          },
          {
            label: 'Ready to dispatch',
            value: data.parcels.filter((parcel) => parcel.status === 'sorted').length,
            detail: 'Assigned to sorting lanes',
          },
          {
            label: 'In transit',
            value: data.parcels.filter((parcel) => parcel.status === 'transit').length,
            detail: 'On the way to pickup points',
          },
          {
            label: 'Exceptions',
            value: data.parcels.filter((parcel) => parcel.status === 'exception').length,
            detail: 'Need operator attention',
          },
        ]}
      />
      <div className="sorting-workbench">
        <Card className="scanner-card">
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <ScanLine size={20} /> Scan or enter a parcel
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={lookup} className="scan-form">
              <Label className="sr-only" htmlFor="sorting-scan">
                Parcel barcode
              </Label>
              <Input
                id="sorting-scan"
                value={scan}
                onChange={(event) => {
                  setScan(event.target.value)
                  setScanError('')
                }}
                placeholder="PKG-1042"
                autoComplete="off"
                aria-invalid={!!scanError}
                aria-describedby="sorting-scan-hint"
              />
              <Button type="submit" disabled={!scan.trim()}>
                Find parcel
              </Button>
            </form>
            <p id="sorting-scan-hint" className="mt-3 text-sm text-muted">
              Keyboard scanners can submit with Enter. Sample inbound: PKG-1042.
            </p>
            {scanError && (
              <p className="mt-3 text-sm text-danger" role="alert">
                {scanError}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sorting lanes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="lane-list">
              {sortingLanes.map((lane) => {
                const count = data.parcels.filter(
                  (parcel) => parcel.lane === lane.label && parcel.status === 'sorted',
                ).length
                return (
                  <div key={lane.id}>
                    <div>
                      <span>{lane.label}</span>
                      <strong>
                        {count} / {lane.capacity}
                      </strong>
                    </div>
                    <Progress
                      value={(count / lane.capacity) * 100}
                      label={`${lane.label} capacity`}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs
        value={queue}
        onValueChange={(value) => {
          setQueue(value)
          setSelection([])
        }}
      >
        <TabsList aria-label="Sorting queues">
          {queues.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="business-toolbar">
          <SearchField
            label="Search sorting queue"
            placeholder="Parcel, customer, or destination…"
            value={query}
            onChange={(value) => {
              setQuery(value)
              setSelection([])
            }}
          />
          <div className="business-toolbar-actions">
            <span className="text-sm text-muted">{selection.length} selected</span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!dispatchable.length}>
                  <Truck size={16} /> Dispatch selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Dispatch {dispatchable.length} parcels?</AlertDialogTitle>
                <AlertDialogDescription className="mt-3">
                  The selected parcels will move to “In transit” and appear in the pickup-point
                  arrivals queue.
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="border-transparent bg-foreground text-background"
                    onClick={dispatch}
                  >
                    Confirm dispatch
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {queues.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            <ParcelQueue
              parcels={rows}
              mode="sorting"
              selected={selection}
              onSelect={setSelection}
              onOpen={setSelectedId}
            />
          </TabsContent>
        ))}
      </Tabs>
      <p className="template-footnote">
        Only sorted parcels can be dispatched. Open an exception to record a resolution before
        processing continues.
      </p>
      {selectedId && (
        <ParcelDetails
          key={selectedId}
          parcelId={selectedId}
          mode="sorting"
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
