import type { ComponentProps, ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'
import { Reveal } from '../../lib/motion'

export function Initials({
  name,
  color = '',
  className = '',
}: {
  name: string
  color?: string
  className?: string
}) {
  return (
    <Avatar className={className}>
      <AvatarFallback className={`person-color ${color ? `person-${color}` : ''}`}>
        {name
          .split(' ')
          .filter(Boolean)
          .map((part) => part[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

export function PageHeading({
  section,
  title,
  description,
  children,
}: {
  section: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <header className="template-page-heading">
      <div>
        <p className="eyebrow">{section}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="template-heading-actions">{children}</div>}
    </header>
  )
}

export function SummaryCards({
  items,
}: {
  items: { label: string; value: string | number; detail: string }[]
}) {
  return (
    <div className="business-summary">
      {items.map((item, index) => (
        <Reveal key={item.label} delay={index * 0.035}>
          <Card>
            <CardContent>
              <p className="summary-label">{item.label}</p>
              <strong>{item.value}</strong>
              <p className="summary-detail">{item.detail}</p>
            </CardContent>
          </Card>
        </Reveal>
      ))}
    </div>
  )
}

export function SearchField({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder?: string
}) {
  return (
    <div className="business-search">
      <Search size={16} />
      <Input
        aria-label={label}
        placeholder={placeholder || label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

const statusTones: Readonly<Record<string, ComponentProps<typeof Badge>['tone']>> = {
  Active: 'success',
  Approved: 'success',
  Paid: 'success',
  Resolved: 'success',
  Collected: 'success',
  'Ready for pickup': 'success',
  Urgent: 'danger',
  Overdue: 'danger',
  Exception: 'danger',
  Declined: 'danger',
  Pending: 'warning',
  'On leave': 'warning',
  Sent: 'warning',
  Sorted: 'warning',
  Onboarding: 'info',
  Open: 'info',
  'In transit': 'info',
}
export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTones[status] ?? 'neutral'}>{status}</Badge>
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="business-empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  )
}
