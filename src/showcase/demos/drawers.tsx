import { useId, useState } from 'react'
import { ArrowDownToLine, ArrowRight, CalendarDays, Check, Package, Truck } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Fridge,
  FridgeBody,
  FridgeClose,
  FridgeContent,
  FridgeDescription,
  FridgeFooter,
  FridgeHeader,
  FridgeTitle,
  FridgeTrigger,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Textarea,
  toast,
} from 'vagabond-ui'

const initialReport = { email: 'alex@acme.com', frequency: 'weekly', comparison: true }

export function DrawerDemo() {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState<typeof initialReport | null>(null)
  const [draft, setDraft] = useState(initialReport)
  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg border border-border bg-raised p-3">
          <CalendarDays size={22} />
        </div>
        <div>
          <p className="font-medium">Workspace report</p>
          <p className="text-sm text-muted">Delivery preferences</p>
        </div>
      </div>
      <Drawer
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(saved ?? initialReport)
          setOpen(next)
        }}
      >
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full">
            <ArrowDownToLine size={16} /> Schedule report
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <p className="text-sm font-medium text-accent-ink">Reports / Delivery</p>
            <DrawerTitle>Schedule report</DrawerTitle>
            <DrawerDescription>
              Choose when and where to receive your workspace summary.
            </DrawerDescription>
          </DrawerHeader>
          <form
            className="contents"
            onSubmit={(event) => {
              event.preventDefault()
              setSaved({ ...draft })
              setOpen(false)
              toast.success('Report schedule saved')
            }}
          >
            <DrawerBody className="space-y-6" aria-label="Report preferences">
              <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-raised p-4">
                {[
                  ['Projects', '12'],
                  ['Completed', '84'],
                  ['On track', '96%'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-sm text-muted">{label}</p>
                    <p className="mt-1 font-heading text-2xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p id={`${id}-frequency`} className="text-sm font-medium">
                  Delivery frequency
                </p>
                <RadioGroup
                  aria-labelledby={`${id}-frequency`}
                  value={draft.frequency}
                  onValueChange={(frequency) => setDraft({ ...draft, frequency })}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {[
                    ['weekly', 'Every week', 'Monday at 9:00 AM UTC'],
                    ['monthly', 'Every month', 'First day at 9:00 AM UTC'],
                  ].map(([value, label, hint]) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4"
                    >
                      <RadioGroupItem value={value} className="mt-1" />
                      <span>
                        <span className="block text-sm font-medium">{label}</span>
                        <span className="mt-1 block text-sm text-muted">{hint}</span>
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-email`}>Send to</Label>
                <Input
                  id={`${id}-email`}
                  type="email"
                  required
                  value={draft.email}
                  onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                  autoComplete="email"
                />
              </div>
              <div className="flex items-center justify-between gap-5 rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor={`${id}-comparison`}>Compare with previous period</Label>
                  <p className="mt-1 text-sm text-muted">
                    Include changes in activity and completion.
                  </p>
                </div>
                <Switch
                  id={`${id}-comparison`}
                  checked={draft.comparison}
                  onCheckedChange={(comparison) => setDraft({ ...draft, comparison })}
                />
              </div>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DrawerClose>
              <Button type="submit">
                <Check size={16} /> Save schedule
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
      <p role="status" className="text-sm text-muted">
        {saved
          ? `${saved.frequency === 'weekly' ? 'Weekly' : 'Monthly'} report → ${saved.email}`
          : 'Opens from the bottom. Pull the top handle down to close.'}
      </p>
    </div>
  )
}

export function FridgeDemo() {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('Leave with reception if nobody is available.')
  const [draft, setDraft] = useState(note)
  const [cancelled, setCancelled] = useState(false)
  const [saved, setSaved] = useState(false)
  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border bg-raised p-3">
            <Package size={22} />
          </div>
          <div>
            <p className="font-medium">Order #1045</p>
            <p className="text-sm text-muted">Alex Morgan · 3 items</p>
          </div>
        </div>
        <Badge tone={cancelled ? 'neutral' : 'success'}>{cancelled ? 'Cancelled' : 'Paid'}</Badge>
      </div>
      <Fridge
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(note)
          setOpen(next)
        }}
      >
        <FridgeTrigger asChild>
          <Button variant="outline" className="w-full">
            View order <ArrowRight size={16} />
          </Button>
        </FridgeTrigger>
        <FridgeContent>
          <FridgeHeader>
            <p className="text-sm font-medium text-accent-ink">Orders / Details</p>
            <FridgeTitle>Order #1045</FridgeTitle>
            <FridgeDescription>Placed October 7, 2026 · Preview order</FridgeDescription>
            <div className="flex gap-2 pt-2">
              <Badge tone={cancelled ? 'neutral' : 'success'}>
                {cancelled ? 'Cancelled' : 'Paid'}
              </Badge>
              {!cancelled && <Badge tone="warning">Processing</Badge>}
            </div>
          </FridgeHeader>
          <FridgeBody className="space-y-6" aria-label="Order details">
            <section className="space-y-3">
              <h3 className="font-medium">Items</h3>
              {[
                ['Canvas backpack', 'Sand / One size', '$89.00'],
                ['Everyday notebook', 'Olive / A5', '$24.00'],
                ['Travel bottle', 'Graphite / 500 ml', '$32.00'],
              ].map(([name, detail, price]) => (
                <div key={name} className="flex items-center gap-3 border-b border-border pb-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-raised">
                    <Package size={20} className="text-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-sm text-muted">{detail} · Qty 1</p>
                  </div>
                  <p className="text-sm font-medium">{price}</p>
                </div>
              ))}
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <dt>Subtotal</dt>
                  <dd>$145.00</dd>
                </div>
                <div className="flex justify-between text-muted">
                  <dt>Shipping</dt>
                  <dd>$8.00</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 font-semibold">
                  <dt>Total</dt>
                  <dd>$153.00</dd>
                </div>
              </dl>
            </section>
            <section className="rounded-lg border border-border p-4">
              <h3 className="mb-3 flex items-center gap-2 font-medium">
                <Truck size={18} /> Delivery
              </h3>
              <p className="text-sm">Alex Morgan</p>
              <p className="text-sm leading-relaxed text-muted">
                24 Bedford Square
                <br />
                London WC1B 3HH
                <br />
                United Kingdom
              </p>
              <p className="mt-3 text-sm text-muted">Standard delivery · 3–5 business days</p>
            </section>
            <div className="space-y-2">
              <Label htmlFor={`${id}-note`}>Delivery note</Label>
              <Textarea
                id={`${id}-note`}
                rows={3}
                maxLength={500}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={cancelled}
              />
              <p className="text-sm text-muted">
                Visible to the fulfillment team. Up to 500 characters.
              </p>
            </div>
            <section className="space-y-3">
              <h3 className="font-medium">Activity</h3>
              <div className="flex gap-3 text-sm">
                <Check size={18} className="mt-0.5 text-success" />
                <div>
                  <p>Payment received</p>
                  <p className="text-muted">October 7, 2026 at 10:42 AM</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <Package size={18} className="mt-0.5 text-muted" />
                <div>
                  <p>{cancelled ? 'Order cancelled in this preview' : 'Preparing your order'}</p>
                  <p className="text-muted">
                    {cancelled ? 'No payment or shipment was changed.' : 'Awaiting fulfillment'}
                  </p>
                </div>
              </div>
            </section>
            {!cancelled && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Cancel order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel order #1045?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This changes the preview order status. No real payment or shipment is
                      affected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep order</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        setCancelled(true)
                        toast('Preview order cancelled')
                      }}
                    >
                      Confirm cancellation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </FridgeBody>
          <FridgeFooter>
            <FridgeClose asChild>
              <Button variant="outline">Close</Button>
            </FridgeClose>
            {cancelled ? (
              <Button
                onClick={() => {
                  setCancelled(false)
                  setSaved(false)
                }}
              >
                Reset example
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setNote(draft)
                  setSaved(true)
                  setOpen(false)
                  toast.success('Delivery note saved')
                }}
              >
                Save changes
              </Button>
            )}
          </FridgeFooter>
        </FridgeContent>
      </Fridge>
      <p role="status" className="text-sm text-muted">
        {cancelled
          ? 'Preview order cancelled.'
          : saved
            ? 'Delivery note saved.'
            : 'Opens from the right. Pull the edge handle right to close.'}
      </p>
    </div>
  )
}
