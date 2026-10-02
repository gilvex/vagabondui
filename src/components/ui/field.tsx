import { createContext, useContext, useId, useMemo, type ComponentProps } from 'react'
import { cn } from '../../lib/utils'
import { Label } from './label'

type FieldContextValue = { id: string; descriptionId: string; errorId: string }
const FieldContext = createContext<FieldContextValue | null>(null)

export function useField() {
  const field = useContext(FieldContext)
  if (!field) throw new Error('useField must be called within a Field.')
  return field
}
export function Field({ id, className, ...props }: ComponentProps<'div'>) {
  const generatedId = useId()
  const inputId = id || generatedId
  const context = useMemo(
    () => ({ id: inputId, descriptionId: `${inputId}-description`, errorId: `${inputId}-error` }),
    [inputId],
  )
  return (
    <FieldContext.Provider value={context}>
      <div data-slot="field" className={cn('space-y-2', className)} {...props} />
    </FieldContext.Provider>
  )
}
export function FieldLabel(props: ComponentProps<typeof Label>) {
  const field = useField()
  return <Label htmlFor={field.id} {...props} />
}
export function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  const field = useField()
  return <p id={field.descriptionId} className={cn('text-sm text-muted', className)} {...props} />
}
export function FieldError({ className, ...props }: ComponentProps<'p'>) {
  const field = useField()
  return (
    <p
      id={field.errorId}
      role="alert"
      className={cn('text-sm text-danger', className)}
      {...props}
    />
  )
}
