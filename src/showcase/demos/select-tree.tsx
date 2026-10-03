import { useId, useState, type FormEvent } from 'react'
import { Check, Globe2, MapPin, RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { SelectTree, type SelectTreeOption } from '../../components/ui/select-tree'

export const destinationOptions: readonly SelectTreeOption[] = [
  {
    value: 'uk',
    label: 'United Kingdom',
    icon: <Globe2 size={16} />,
    selectable: true,
    children: [
      {
        value: 'london',
        label: 'London',
        icon: <MapPin size={16} />,
        selectable: true,
        children: [
          {
            value: 'central-station',
            label: 'Central Station',
            description: 'Pickup point · A-01',
          },
          { value: 'east-harbor', label: 'East Harbor', description: 'Pickup point · B-02' },
          {
            value: 'northgate',
            label: 'Northgate',
            description: 'Temporarily unavailable',
            disabled: true,
          },
        ],
      },
      {
        value: 'manchester',
        label: 'Manchester',
        icon: <MapPin size={16} />,
        selectable: true,
        children: [
          { value: 'piccadilly', label: 'Piccadilly', description: 'Pickup point · C-01' },
          { value: 'trafford', label: 'Trafford Park', description: 'Sorting center · Hub 02' },
        ],
      },
    ],
  },
  {
    value: 'germany',
    label: 'Germany',
    icon: <Globe2 size={16} />,
    selectable: true,
    children: [
      {
        value: 'berlin',
        label: 'Berlin',
        icon: <MapPin size={16} />,
        selectable: true,
        children: [
          { value: 'mitte', label: 'Mitte', description: 'Pickup point · DE-01' },
          { value: 'kreuzberg', label: 'Kreuzberg', description: 'Pickup point · DE-02' },
        ],
      },
      {
        value: 'munich',
        label: 'München',
        icon: <MapPin size={16} />,
        selectable: true,
        children: [{ value: 'schwabing', label: 'Schwabing', description: 'Pickup point · DE-03' }],
      },
    ],
  },
]

export function SelectTreeDemo() {
  const id = useId()
  const [value, setValue] = useState('central-station')
  return (
    <div className="demo-form">
      <div className="space-y-2">
        <Label htmlFor={id}>Pickup destination</Label>
        <SelectTree
          id={id}
          label="Pickup destination"
          options={destinationOptions}
          value={value}
          onValueChange={setValue}
          placeholder="Choose a location or group…"
          searchPlaceholder="Search locations…"
          clearable
        />
      </div>
      <p className="text-sm leading-relaxed text-muted">
        Choose a country, city, or pickup point. Click a label to select that scope; use its chevron
        to expand.
      </p>
      <p aria-live="polite" className="text-sm text-muted">
        Value: <code className="text-foreground">{value || 'None'}</code>
      </p>
    </div>
  )
}

export function SelectTreeFormExample() {
  const id = useId()
  const [result, setResult] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(String(new FormData(event.currentTarget).get('destination') || ''))
  }
  return (
    <form className="tree-form-example" onSubmit={submit} onReset={() => setResult('')}>
      <div className="space-y-2">
        <Label htmlFor={id}>Required destination</Label>
        <SelectTree
          id={id}
          label="Required destination"
          name="destination"
          options={destinationOptions}
          placeholder="Choose a destination…"
          required
          clearable
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit">
          <Check size={16} /> Submit selection
        </Button>
        <Button type="reset" variant="outline">
          <RotateCcw size={16} /> Reset form
        </Button>
      </div>
      <p role="status" className="text-sm text-muted">
        {result
          ? `FormData: destination = ${result}`
          : 'Uses native form validation, submission, and reset.'}
      </p>
    </form>
  )
}

const projectOptions: readonly SelectTreeOption[] = [
  {
    value: 'workspace',
    label: 'Entire workspace',
    selectable: true,
    children: [
      {
        value: 'design',
        label: 'Design',
        selectable: true,
        children: [
          { value: 'components', label: 'Component library' },
          { value: 'website', label: 'Marketing website' },
        ],
      },
      {
        value: 'engineering',
        label: 'Engineering',
        children: [
          { value: 'frontend', label: 'Frontend platform' },
          { value: 'api', label: 'API services' },
        ],
      },
    ],
  },
  {
    value: 'archived',
    label: 'Archived projects',
    disabled: true,
    children: [{ value: 'legacy', label: 'Legacy app' }],
  },
]

export function SelectTreeBranchExample() {
  const id = useId()
  const [scope, setScope] = useState('design')
  return (
    <form
      className="space-y-3"
      onSubmit={(event) => event.preventDefault()}
      onReset={() => setScope('design')}
    >
      <Label htmlFor={id}>Project scope</Label>
      <SelectTree
        id={id}
        label="Project scope"
        options={projectOptions}
        name="project-scope"
        value={scope}
        onValueChange={setScope}
        searchable={false}
        clearable
      />
      <p className="text-sm leading-relaxed text-muted">
        Select Entire workspace or Design as a group, or use the chevrons to choose a project.
      </p>
      <Button type="reset" variant="outline" size="sm">
        Reset scope
      </Button>
    </form>
  )
}
