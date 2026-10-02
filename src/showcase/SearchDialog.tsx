import {
  Dialog,
  DialogContent,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../lib'
import { catalog, pages } from './catalog'
import { templateCatalog } from '../templates/catalog'

export function SearchDialog({
  open,
  setOpen,
  navigate,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  navigate: (page: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        title="Search documentation"
        description="Find components and usage guides."
        className="search-dialog"
      >
        <Command label="Search documentation" className="mt-5 border-0" loop>
          <CommandInput
            placeholder="Search components and guides…"
            aria-label="Search documentation"
            autoFocus
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Documentation">
              {pages.map((page) => (
                <CommandItem
                  key={page.id}
                  value={`guide ${page.name}`}
                  onSelect={() => navigate(page.id)}
                >
                  {page.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Components">
              {[...catalog]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`component ${item.name}`}
                    onSelect={() => navigate(`component/${item.id}`)}
                  >
                    {item.name}
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandGroup heading="Templates">
              {templateCatalog.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`template ${item.name}`}
                  onSelect={() => navigate(`template/${item.id}`)}
                >
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <p className="search-footer">↑ ↓ to navigate · Enter to open · Esc to close</p>
      </DialogContent>
    </Dialog>
  )
}
