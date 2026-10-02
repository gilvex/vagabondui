import type { ComponentProps } from 'react'
import { Slot } from 'radix-ui'
import { LoaderCircle } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:opacity-85',
        primary: 'border-transparent bg-primary text-primary-foreground hover:opacity-85',
        secondary: 'border-border bg-raised text-foreground hover:bg-[var(--surface-hover)]',
        outline: 'border-border bg-transparent text-foreground hover:bg-raised',
        ghost: 'border-transparent text-muted hover:bg-raised hover:text-foreground',
        accent: 'border-transparent bg-accent text-accent-foreground hover:brightness-95',
        destructive: 'border-danger/30 bg-danger/10 text-danger hover:bg-danger/20',
        danger: 'border-danger/30 bg-danger/10 text-danger hover:bg-danger/20',
        link: 'border-transparent text-foreground underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3',
        default: 'h-10 px-4',
        md: 'h-10 px-4',
        lg: 'h-11 px-5',
        icon: 'size-10 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }

export function Button({
  className,
  variant,
  size,
  asChild,
  loading,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot.Root : 'button'
  return (
    <Component
      data-slot="button"
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
          {children}
        </>
      )}
    </Component>
  )
}
