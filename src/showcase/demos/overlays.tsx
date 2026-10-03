import { useId, useState } from 'react'
import { Bookmark, ChevronDown, Settings, Trash2 } from 'lucide-react'
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
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Switch,
  Tooltip,
  toast,
} from 'vagabond-ui'

export function DialogDemo() {
  const id = useId()
  const [name, setName] = useState('Design system')
  const [draft, setDraft] = useState(name)
  return (
    <div className="demo-form items-center">
      <Dialog onOpenChange={(open) => open && setDraft(name)}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit project</Button>
        </DialogTrigger>
        <DialogContent title="Edit project" description="Update the project name for this preview.">
          <div className="mt-6 space-y-2">
            <Label htmlFor={id}>Project name</Label>
            <Input id={id} value={draft} onChange={(e) => setDraft(e.target.value)} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button disabled={!draft.trim()} onClick={() => setName(draft.trim())}>
                Save changes
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="text-sm text-muted">{name}</p>
    </div>
  )
}

export function AlertDialogDemo() {
  const [deleted, setDeleted] = useState(false)
  if (deleted)
    return (
      <div className="demo-form items-center">
        <p role="status" className="text-sm">
          Draft deleted.
        </p>
        <Button variant="outline" onClick={() => setDeleted(false)}>
          Reset example
        </Button>
      </div>
    )
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Trash2 size={16} /> Delete draft
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
          <AlertDialogDescription>
            The draft will be removed from this preview. Cancel to keep it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => setDeleted(true)}>Delete draft</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function DropdownMenuDemo() {
  const [bookmarked, setBookmarked] = useState(false)
  const [copies, setCopies] = useState(0)
  return (
    <div className="demo-form items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Project actions <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuLabel>Project</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setCopies(copies + 1)}>Duplicate</DropdownMenuItem>
          <DropdownMenuCheckboxItem checked={bookmarked} onCheckedChange={setBookmarked}>
            Bookmark
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Transfer ownership</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-sm text-muted" aria-live="polite">
        {copies
          ? `${copies} ${copies === 1 ? 'copy' : 'copies'} created`
          : bookmarked
            ? 'Project bookmarked'
            : 'Choose an action'}
      </p>
    </div>
  )
}

export function PopoverDemo() {
  const id = useId()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Settings size={16} /> Display settings
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <h4 className="mb-4 font-medium">Display settings</h4>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor={id}>Show grid lines</Label>
          <Switch id={id} defaultChecked />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function SheetDemo() {
  const id = useId()
  const [name, setName] = useState('Alex Morgan')
  const [draft, setDraft] = useState(name)
  return (
    <div className="demo-form items-center">
      <Sheet onOpenChange={(open) => open && setDraft(name)}>
        <SheetTrigger asChild>
          <Button variant="outline">Edit profile</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>Update the display name for this preview.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-2">
            <Label htmlFor={id}>Display name</Label>
            <Input id={id} value={draft} onChange={(e) => setDraft(e.target.value)} />
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button disabled={!draft.trim()} onClick={() => setName(draft.trim())}>
                Save changes
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <p className="text-sm text-muted">{name}</p>
    </div>
  )
}

export function ToastDemo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast.success('Settings saved', {
          description: 'Your preferences have been updated.',
          action: { label: 'Undo', onClick: () => toast('Changes reverted') },
        })
      }
    >
      Show notification
    </Button>
  )
}

export function TooltipDemo() {
  const [saved, setSaved] = useState(false)
  return (
    <Tooltip content={saved ? 'Remove bookmark' : 'Bookmark project'}>
      <Button
        variant="outline"
        size="icon"
        aria-label={saved ? 'Remove bookmark' : 'Bookmark project'}
        aria-pressed={saved}
        onClick={() => setSaved(!saved)}
      >
        <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
      </Button>
    </Tooltip>
  )
}
