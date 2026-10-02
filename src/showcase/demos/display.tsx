import { useState } from 'react'
import { Check, ChevronDown, Info, Plus } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Progress,
  ScrollArea,
  Separator,
  Skeleton,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from '../../lib'

export function ButtonDemo() {
  const [saved, setSaved] = useState(false)
  return (
    <div className="demo-form">
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setSaved(true)}>
          {saved ? (
            <>
              <Check size={16} /> Saved
            </>
          ) : (
            'Save changes'
          )}
        </Button>
        <Button variant="outline" onClick={() => setSaved(false)}>
          Reset
        </Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => setSaved(true)}>
          <Plus size={16} /> Add item
        </Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  )
}

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="demo-form" defaultValue="keyboard">
      <AccordionItem value="keyboard">
        <AccordionTrigger>Keyboard support</AccordionTrigger>
        <AccordionContent>Tab to focus a header. Enter or Space to expand it.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="source">
        <AccordionTrigger>Can I edit the source?</AccordionTrigger>
        <AccordionContent>
          Yes. Each component is a separate file you can copy and modify.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function BadgeDemo() {
  return (
    <div className="flex max-w-sm flex-wrap justify-center gap-3">
      <Badge tone="success">Published</Badge>
      <Badge tone="info">In progress</Badge>
      <Badge tone="warning">Pending</Badge>
      <Badge tone="danger">Failed</Badge>
      <Badge>Draft</Badge>
    </div>
  )
}

export function CardDemo() {
  const [joined, setJoined] = useState(false)
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Design workspace</CardTitle>
        <CardDescription>Shared components and project files.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={() => setJoined(!joined)}>
          {joined ? 'Leave workspace' : 'Join workspace'}
        </Button>
        <span className="text-sm text-muted">{joined ? '4 members' : '3 members'}</span>
      </CardFooter>
    </Card>
  )
}

export function AlertDemo() {
  return (
    <Alert className="max-w-sm">
      <Info size={18} aria-hidden="true" />
      <AlertTitle>Update available</AlertTitle>
      <AlertDescription>
        Version 0.2 includes new components and improved keyboard behavior.
      </AlertDescription>
    </Alert>
  )
}

export function AvatarDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar aria-label="Alex Morgan">
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
      <Avatar className="size-12" aria-label="Sam Lee">
        <AvatarFallback>SL</AvatarFallback>
      </Avatar>
      <Avatar className="size-14" aria-label="Jordan Chen">
        <AvatarFallback>JC</AvatarFallback>
      </Avatar>
    </div>
  )
}

export function CollapsibleDemo() {
  return (
    <Collapsible className="demo-form">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          Dependencies <ChevronDown size={16} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="rounded-md border border-border p-4">
        <ul className="space-y-2 font-mono text-sm">
          <li>react</li>
          <li>radix-ui</li>
          <li>tailwindcss</li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function ProgressDemo() {
  const [value, setValue] = useState(68)
  return (
    <div className="demo-form">
      <div className="flex justify-between text-sm">
        <span>Upload progress</span>
        <output>{value}%</output>
      </div>
      <Progress label="Upload progress" value={value} />
      <Button
        size="sm"
        variant="outline"
        onClick={() => setValue(value >= 100 ? 0 : Math.min(100, value + 16))}
      >
        {value >= 100 ? 'Reset progress' : 'Advance progress'}
      </Button>
    </div>
  )
}

export function ScrollAreaDemo() {
  return (
    <ScrollArea
      className="h-48 w-full max-w-sm rounded-md border border-border"
      aria-label="Project activity"
    >
      <div className="p-4">
        <h4 className="mb-3 text-sm font-medium">Recent activity</h4>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} className="border-t border-border py-3 text-sm text-muted">
            Revision {12 - i} saved
          </p>
        ))}
      </div>
    </ScrollArea>
  )
}

export function SeparatorDemo() {
  return (
    <div className="demo-form">
      <p className="font-medium">Project resources</p>
      <p className="text-sm text-muted">Documentation and support.</p>
      <Separator />
      <div className="flex h-6 items-center gap-4 text-sm">
        <a href="#installation">Installation</a>
        <Separator orientation="vertical" />
        <a href="#research">References</a>
      </div>
    </div>
  )
}

export function SkeletonDemo() {
  return (
    <div
      className="flex w-full max-w-sm items-center gap-4"
      role="img"
      aria-label="Loading profile placeholder"
    >
      <Skeleton className="size-12 shrink-0 rounded-full" />
      <div className="w-full space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

export function TableDemo() {
  return (
    <Table>
      <TableCaption>Recent invoices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          { id: 'INV-001', status: 'Paid', amount: '$120' },
          { id: 'INV-002', status: 'Pending', amount: '$80' },
        ].map((row) => (
          <TableRow key={row.id}>
            <TableCell className="whitespace-nowrap font-mono">{row.id}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell className="text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function ToggleDemo() {
  const [pressed, setPressed] = useState(false)
  return (
    <div className="demo-form">
      <Toggle
        pressed={pressed}
        onPressedChange={setPressed}
        aria-label="Bold"
        className="self-start border-border font-bold"
      >
        B
      </Toggle>
      <p className={pressed ? 'text-sm font-bold' : 'text-sm'}>Sample text</p>
    </div>
  )
}

export function ToggleGroupDemo() {
  const [alignment, setAlignment] = useState('left')
  return (
    <div className="demo-form">
      <ToggleGroup
        type="single"
        value={alignment}
        onValueChange={(value) => value && setAlignment(value)}
        aria-label="Text alignment"
      >
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
      <p
        className="text-sm text-muted"
        style={{ textAlign: alignment as 'left' | 'center' | 'right' }}
      >
        Sample text
      </p>
    </div>
  )
}

export function RuntimePreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace settings</CardTitle>
        <CardDescription>A composition of Card, Badge, and Button.</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge tone="success">Active</Badge>
      </CardContent>
    </Card>
  )
}
