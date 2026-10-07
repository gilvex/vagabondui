import { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button, Card, CardContent } from 'vagabond-ui'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'vagabond-ui/dialog'
import { SelectTree, type SelectTreeOption } from 'vagabond-ui/select-tree'
import { Switch } from 'vagabond-ui/switch'
import { ActionBar, ActionBarButton, ActionBarClose, ActionBarLabel } from 'vagabond-ui/action-bar'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from 'vagabond-ui/drawer'
import {
  Fridge,
  FridgeTrigger,
  FridgeContent,
  FridgeTitle,
  FridgeDescription,
  FridgeBody,
  FridgeFooter,
  FridgeClose,
} from 'vagabond-ui/fridge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'vagabond-ui/tabs'
import 'vagabond-ui/styles.css'

const options: SelectTreeOption[] = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      { value: 'london', label: 'London' },
      { value: 'berlin', label: 'Berlin' },
    ],
  },
]

function App() {
  const [saved, setSaved] = useState(false)
  const [region, setRegion] = useState('')
  const [actionsOpen, setActionsOpen] = useState(false)
  const actionsTrigger = useRef<HTMLButtonElement>(null)
  return (
    <main style={{ maxWidth: 460, padding: 32 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Installed package test</h1>
      <Card>
        <CardContent style={{ display: 'grid', gap: 20 }}>
          <Button onClick={() => setSaved(true)}>{saved ? 'Saved' : 'Save changes'}</Button>
          <SelectTree label="Region" options={options} value={region} onValueChange={setRegion} />
          <output aria-label="Selected region">{region || 'None'}</output>
          <label style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Switch aria-label="Notifications" defaultChecked /> Notifications
          </label>
          <Tabs defaultValue="preview">
            <TabsList aria-label="Example views">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">Preview content</TabsContent>
            <TabsContent value="details">Details content</TabsContent>
          </Tabs>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Package dialog</DialogTitle>
                <DialogDescription>Rendered from the installed tarball.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>Done</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Drawer>
            <DrawerTrigger asChild>
              <Button>Open drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerBody>
                <DrawerTitle>Package drawer</DrawerTitle>
                <DrawerDescription>Bottom panel from the tarball.</DrawerDescription>
              </DrawerBody>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button>Done</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Fridge>
            <FridgeTrigger asChild>
              <Button>Open fridge</Button>
            </FridgeTrigger>
            <FridgeContent>
              <FridgeBody>
                <FridgeTitle>Package fridge</FridgeTitle>
                <FridgeDescription>Right panel from the tarball.</FridgeDescription>
              </FridgeBody>
              <FridgeFooter>
                <FridgeClose asChild>
                  <Button>Done</Button>
                </FridgeClose>
              </FridgeFooter>
            </FridgeContent>
          </Fridge>
          <Button ref={actionsTrigger} onClick={() => setActionsOpen(true)}>
            Show actions
          </Button>
          <ActionBar
            label="Package actions"
            open={actionsOpen}
            onOpenChange={setActionsOpen}
            returnFocusRef={actionsTrigger}
          >
            <ActionBarLabel>2 selected</ActionBarLabel>
            <ActionBarButton>Apply actions</ActionBarButton>
            <ActionBarButton disabled>Unavailable action</ActionBarButton>
            <ActionBarClose />
          </ActionBar>
        </CardContent>
      </Card>
    </main>
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('Missing consumer root')
createRoot(root).render(<App />)
