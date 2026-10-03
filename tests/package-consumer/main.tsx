import { useState } from 'react'
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
        </CardContent>
      </Card>
    </main>
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('Missing consumer root')
createRoot(root).render(<App />)
