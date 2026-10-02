import { Toaster as Sonner, toast, type ToasterProps } from 'sonner'

export { toast }
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      closeButton
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'relative flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-4 text-sm text-foreground shadow-lg',
          content: 'min-w-0 flex-1',
          icon: 'shrink-0 self-start pt-0.5',
          title: 'break-words text-sm font-medium [overflow-wrap:anywhere]',
          description: 'mt-1 break-words text-sm text-muted [overflow-wrap:anywhere]',
          actionButton:
            'ml-auto inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded border border-border px-3 py-1.5 text-sm',
          cancelButton:
            'inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded px-3 py-1.5 text-sm text-muted',
          closeButton:
            'absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-border bg-surface text-foreground',
        },
      }}
      {...props}
    />
  )
}
