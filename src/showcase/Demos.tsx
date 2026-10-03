import { Search } from 'lucide-react'
import type { ComponentId } from './catalog'
import { SelectTreeDemo } from './demos/select-tree'
import {
  CheckboxDemo,
  FieldDemo,
  InputDemo,
  LabelDemo,
  RadioGroupDemo,
  SelectDemo,
  SliderDemo,
  SwitchDemo,
  TextareaDemo,
} from './demos/forms'
import {
  AccordionDemo,
  AlertDemo,
  AvatarDemo,
  BadgeDemo,
  ButtonDemo,
  CardDemo,
  CollapsibleDemo,
  ProgressDemo,
  ScrollAreaDemo,
  SeparatorDemo,
  SkeletonDemo,
  TableDemo,
  ToggleDemo,
  ToggleGroupDemo,
} from './demos/display'
import { BreadcrumbDemo, CommandDemo, PaginationDemo, TabsDemo } from './demos/navigation'
import {
  AlertDialogDemo,
  DialogDemo,
  DropdownMenuDemo,
  PopoverDemo,
  SheetDemo,
  ToastDemo,
  TooltipDemo,
} from './demos/overlays'

export { RuntimePreview } from './demos/display'

const demos: Record<ComponentId, React.ComponentType> = {
  button: ButtonDemo,
  input: InputDemo,
  checkbox: CheckboxDemo,
  textarea: TextareaDemo,
  select: SelectDemo,
  'select-tree': SelectTreeDemo,
  switch: SwitchDemo,
  'radio-group': RadioGroupDemo,
  slider: SliderDemo,
  tabs: TabsDemo,
  accordion: AccordionDemo,
  badge: BadgeDemo,
  card: CardDemo,
  dialog: DialogDemo,
  alert: AlertDemo,
  'alert-dialog': AlertDialogDemo,
  avatar: AvatarDemo,
  breadcrumb: BreadcrumbDemo,
  collapsible: CollapsibleDemo,
  command: CommandDemo,
  'dropdown-menu': DropdownMenuDemo,
  field: FieldDemo,
  label: LabelDemo,
  pagination: PaginationDemo,
  popover: PopoverDemo,
  progress: ProgressDemo,
  'scroll-area': ScrollAreaDemo,
  separator: SeparatorDemo,
  sheet: SheetDemo,
  skeleton: SkeletonDemo,
  table: TableDemo,
  toast: ToastDemo,
  toggle: ToggleDemo,
  'toggle-group': ToggleGroupDemo,
  tooltip: TooltipDemo,
}

export function ComponentDemo({ id }: { id: ComponentId }) {
  const Demo = demos[id]
  return <Demo />
}

export function SearchEmpty() {
  return (
    <div className="empty-state">
      <Search size={24} />
      <h3>No components found</h3>
      <p>Try another name or clear the filters.</p>
    </div>
  )
}
