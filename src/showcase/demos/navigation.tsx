import { useState } from 'react'
import { File, Settings } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from '../../lib'

export function TabsDemo() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-sm">
      <TabsList aria-label="Project information">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted">Project overview and summary.</p>
      </TabsContent>
      <TabsContent value="activity">
        <p className="text-sm text-muted">All changes are up to date.</p>
      </TabsContent>
      <TabsContent value="settings">
        <a href="#installation" className="text-sm underline underline-offset-4">
          View configuration instructions
        </a>
      </TabsContent>
    </Tabs>
  )
}

export function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#overview">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function CommandDemo() {
  return (
    <Command label="Quick actions" className="max-w-sm">
      <CommandInput placeholder="Search actions…" aria-label="Search quick actions" />
      <CommandList>
        <CommandEmpty>No matching actions.</CommandEmpty>
        <CommandItem onSelect={() => toast('New project selected')}>
          <File size={16} /> New project
        </CommandItem>
        <CommandItem
          onSelect={() => {
            window.location.hash = 'installation'
          }}
        >
          <Settings size={16} /> Installation
        </CommandItem>
      </CommandList>
    </Command>
  )
}

export function PaginationDemo() {
  const [page, setPage] = useState(1)
  function choose(event: React.MouseEvent, next: number) {
    event.preventDefault()
    setPage(Math.max(1, Math.min(3, next)))
  }
  return (
    <div className="demo-form">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={`?page=${Math.max(1, page - 1)}`}
              aria-disabled={page === 1}
              onClick={(e) => choose(e, page - 1)}
            />
          </PaginationItem>
          {[1, 2, 3].map((value) => (
            <PaginationItem key={value}>
              <PaginationLink
                href={`?page=${value}`}
                isActive={page === value}
                onClick={(e) => choose(e, value)}
              >
                {value}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href={`?page=${Math.min(3, page + 1)}`}
              aria-disabled={page === 3}
              onClick={(e) => choose(e, page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p className="text-center text-sm text-muted" aria-live="polite">
        Showing records {(page - 1) * 10 + 1}–{page * 10} of 30
      </p>
    </div>
  )
}
