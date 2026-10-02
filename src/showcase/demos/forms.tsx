import { useId, useState } from 'react'
import {
  Button,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Textarea,
} from '../../lib'

export function InputDemo() {
  const id = useId()
  return (
    <div className="demo-form">
      <Label htmlFor={id}>Email address</Label>
      <Input id={id} type="email" placeholder="you@example.com" aria-describedby={`${id}-hint`} />
      <p id={`${id}-hint`} className="text-sm text-muted">
        Used for account notifications.
      </p>
    </div>
  )
}

export function CheckboxDemo() {
  const id = useId()
  return (
    <div className="demo-form">
      <div className="flex items-center gap-3">
        <Checkbox id={`${id}-terms`} defaultChecked />
        <Label htmlFor={`${id}-terms`}>Accept terms and conditions</Label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id={`${id}-news`} />
        <Label htmlFor={`${id}-news`}>Receive product updates</Label>
      </div>
    </div>
  )
}

export function TextareaDemo() {
  const id = useId()
  const [value, setValue] = useState('')
  return (
    <div className="demo-form">
      <Label htmlFor={id}>Project description</Label>
      <Textarea
        id={id}
        value={value}
        maxLength={160}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Describe your project…"
        aria-describedby={`${id}-count`}
      />
      <p id={`${id}-count`} className="text-sm text-muted">
        {value.length} / 160 characters
      </p>
    </div>
  )
}

export function SelectDemo() {
  const id = useId()
  const [role, setRole] = useState('reader')
  return (
    <div className="demo-form">
      <Label htmlFor={id}>Workspace role</Label>
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="reader">Reader</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="admin">Administrator</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-muted">
        {role === 'reader'
          ? 'Can view projects.'
          : role === 'editor'
            ? 'Can create and edit projects.'
            : 'Can manage projects and members.'}
      </p>
    </div>
  )
}

export function SwitchDemo() {
  const id = useId()
  return (
    <div className="demo-form">
      {[
        { key: 'email', title: 'Email notifications', checked: true },
        { key: 'analytics', title: 'Usage analytics', checked: false },
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between gap-4">
          <Label htmlFor={`${id}-${item.key}`}>{item.title}</Label>
          <Switch id={`${id}-${item.key}`} defaultChecked={item.checked} />
        </div>
      ))}
    </div>
  )
}

export function RadioGroupDemo() {
  const id = useId()
  return (
    <RadioGroup defaultValue="monthly" aria-label="Billing interval" className="demo-form">
      {['Monthly', 'Yearly'].map((item) => (
        <div key={item} className="flex items-center gap-3">
          <RadioGroupItem value={item.toLowerCase()} id={`${id}-${item}`} />
          <Label htmlFor={`${id}-${item}`}>{item}</Label>
          {item === 'Yearly' && <span className="text-sm text-muted">Save 20%</span>}
        </div>
      ))}
    </RadioGroup>
  )
}

export function SliderDemo() {
  const [value, setValue] = useState([50])
  return (
    <div className="demo-form">
      <div className="flex justify-between text-sm">
        <span>Volume</span>
        <output>{value[0]}%</output>
      </div>
      <Slider value={value} onValueChange={setValue} aria-label="Volume" />
      <p className="text-sm text-muted">Use arrow keys to adjust.</p>
    </div>
  )
}

export function FieldDemo() {
  const id = useId()
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const invalid = submitted && name.trim().length < 3
  return (
    <form
      className="demo-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
    >
      <Field id={id}>
        <FieldLabel>Username</FieldLabel>
        <Input
          id={id}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setSubmitted(false)
          }}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : `${id}-description`}
          placeholder="alex"
        />
        <FieldDescription>At least 3 characters.</FieldDescription>
        {invalid && <FieldError>Enter at least 3 characters.</FieldError>}
      </Field>
      <Button type="submit" variant="outline" size="sm">
        Validate
      </Button>
      {submitted && !invalid && (
        <p role="status" className="text-sm text-success">
          Username is valid.
        </p>
      )}
    </form>
  )
}

export function LabelDemo() {
  const id = useId()
  return (
    <div className="demo-form">
      <Label htmlFor={id}>Full name</Label>
      <Input id={id} placeholder="Alex Morgan" autoComplete="name" />
      <p className="text-sm text-muted">Click the label to focus the input.</p>
    </div>
  )
}
