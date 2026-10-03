import { useState, type FormEvent } from 'react'
import { MapPin, Search } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'vagabond-ui/card'
import { Input } from 'vagabond-ui/input'
import { Label } from 'vagabond-ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'vagabond-ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'vagabond-ui/tabs'
import { pickupLocations } from './business/data'
import { ParcelDetails, ParcelQueue } from './business/ParcelControls'
import { findParcel } from './business/parcels'
import { useBusiness } from './business/store'
import { PageHeading, SearchField, SummaryCards } from './business/shared'

const queues = [
  { value: 'ready', label: 'Awaiting pickup' },
  { value: 'transit', label: 'Arrivals' },
  { value: 'collected', label: 'Collected' },
  { value: 'exception', label: 'Exceptions' },
]

export default function Pickup() {
  const { data } = useBusiness()
  const [location, setLocation] = useState('Central Station')
  const [queue, setQueue] = useState('ready')
  const [query, setQuery] = useState('')
  const [lookup, setLookup] = useState('')
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const local = data.parcels.filter(
    (parcel) => location === 'all' || parcel.destination === location,
  )
  const rows = local.filter(
    (parcel) =>
      parcel.status === queue &&
      `${parcel.id} ${parcel.customer} ${parcel.phone}`.toLowerCase().includes(query.toLowerCase()),
  )
  function find(event: FormEvent) {
    event.preventDefault()
    const parcel = findParcel(data.parcels, lookup)
    if (!parcel) {
      setError('Parcel not found. Try sample order PKG-1045.')
      return
    }
    if (location !== 'all' && parcel.destination !== location) {
      setError(
        `This parcel belongs to ${parcel.destination}. Change the pickup-point filter first.`,
      )
      return
    }
    setError('')
    setSelectedId(parcel.id)
    setLookup('')
  }
  return (
    <div className="template-content business-page">
      <PageHeading
        section="ParcelFlow / Collection desk"
        title="Pickup point"
        description="Receive deliveries, locate parcels, and verify customer collections."
      >
        <div className="location-select">
          <MapPin size={18} />
          <Select
            value={location}
            onValueChange={(value) => {
              setLocation(value)
              setError('')
            }}
          >
            <SelectTrigger aria-label="Pickup location">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All pickup points</SelectItem>
              {pickupLocations.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeading>
      <SummaryCards
        items={[
          {
            label: 'Awaiting pickup',
            value: local.filter((parcel) => parcel.status === 'ready').length,
            detail: 'Stored and ready for collection',
          },
          {
            label: 'Inbound deliveries',
            value: local.filter((parcel) => parcel.status === 'transit').length,
            detail: 'Receive and assign a shelf',
          },
          {
            label: 'Collected',
            value: local.filter((parcel) => parcel.status === 'collected').length,
            detail: 'Verified customer handovers',
          },
          {
            label: 'On hold',
            value: local.filter((parcel) => parcel.status === 'exception').length,
            detail: 'Exceptions to resolve',
          },
        ]}
      />
      <div className="pickup-workbench">
        <Card>
          <CardHeader>
            <CardTitle>Customer collection</CardTitle>
            <CardDescription>Find the parcel, then verify its collection code.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={find} className="scan-form">
              <Label htmlFor="pickup-lookup" className="sr-only">
                Find collection parcel
              </Label>
              <Input
                id="pickup-lookup"
                value={lookup}
                onChange={(event) => {
                  setLookup(event.target.value)
                  setError('')
                }}
                placeholder="Enter parcel ID, e.g. PKG-1045"
                aria-invalid={!!error}
              />
              <Button type="submit" disabled={!lookup.trim()}>
                <Search size={16} /> Find order
              </Button>
            </form>
            {error && (
              <p role="alert" className="mt-3 text-sm text-danger">
                {error}
              </p>
            )}
            <p className="mt-3 text-sm text-muted">
              Sample collection codes are shown inside each parcel’s verification dialog.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shelf overview</CardTitle>
            <CardDescription>Ready parcels at the selected pickup point.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="shelf-grid">
              {['A-01', 'A-02', 'A-03', 'B-01', 'B-02', 'C-01'].map((shelf) => {
                const parcels = local.filter(
                  (parcel) => parcel.shelf === shelf && parcel.status === 'ready',
                )
                return (
                  <div key={shelf} className={parcels.length ? 'occupied' : ''}>
                    <span>{shelf}</span>
                    <strong>{parcels.length}</strong>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs value={queue} onValueChange={setQueue}>
        <TabsList aria-label="Pickup queues">
          {queues.map((item) => (
            <TabsTrigger value={item.value} key={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="business-toolbar">
          <SearchField
            label="Search pickup orders"
            placeholder="Search customer, parcel, or phone…"
            value={query}
            onChange={setQuery}
          />
          <span className="text-sm text-muted">
            {rows.length} {rows.length === 1 ? 'parcel' : 'parcels'}
          </span>
        </div>
        {queues.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            <ParcelQueue parcels={rows} mode="pickup" onOpen={setSelectedId} />
          </TabsContent>
        ))}
      </Tabs>
      {selectedId && (
        <ParcelDetails
          key={selectedId}
          parcelId={selectedId}
          mode="pickup"
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
