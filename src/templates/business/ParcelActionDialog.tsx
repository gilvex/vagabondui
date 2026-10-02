import { useId, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { toast } from '../../components/ui/sonner'
import { useParcelCommand } from './use-parcel-command'
import type { Parcel } from './schema'

export type ParcelDialogAction = 'collect' | 'exception' | 'resolve'
const labels = {
  collect: { title: 'Verify parcel collection', submit: 'Release parcel' },
  exception: { title: 'Report parcel exception', submit: 'Place on hold' },
  resolve: { title: 'Resolve parcel exception', submit: 'Resolve exception' },
}

export function ParcelActionDialog({
  parcel,
  action,
  onClose,
}: {
  parcel: Parcel
  action: ParcelDialogAction
  onClose: () => void
}) {
  const id = useId()
  const execute = useParcelCommand()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const collecting = action === 'collect'

  function submit(event: FormEvent) {
    event.preventDefault()
    const command = collecting
      ? { type: 'collect' as const, code: value }
      : action === 'resolve'
        ? { type: 'resolve' as const, note: value }
        : { type: 'hold' as const, reason: value }
    const result = execute(parcel.id, command)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onClose()
    toast.success(result.message, { description: parcel.id })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent title={labels[action].title} description={`${parcel.id} · ${parcel.customer}`}>
        <form className="template-form mt-6" onSubmit={submit}>
          <div className="form-field">
            <Label htmlFor={id}>
              {collecting
                ? '6-digit collection code'
                : action === 'resolve'
                  ? 'Resolution note'
                  : 'Describe the problem'}
            </Label>
            {collecting ? (
              <Input
                id={id}
                inputMode="numeric"
                autoComplete="off"
                maxLength={6}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value.replace(/\D/g, ''))
                  setError('')
                }}
                aria-invalid={!!error}
                aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
                placeholder="000000"
                required
              />
            ) : (
              <Textarea
                id={id}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value)
                  setError('')
                }}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                required
                maxLength={500}
              />
            )}
            {collecting && (
              <p id={`${id}-hint`} className="text-sm text-muted">
                Demo code for this parcel: <code>{parcel.code}</code>
              </p>
            )}
            {error && (
              <p id={`${id}-error`} role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={collecting ? value.length !== 6 : !value.trim()}>
              {labels[action].submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
