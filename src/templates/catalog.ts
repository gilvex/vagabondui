/** Lightweight metadata shared by navigation and search; no demo state or page imports. */
export const templateCatalog = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    suite: 'workspace',
    category: 'Productivity',
    description: 'Metrics, an animated activity chart, and a task overview.',
    components: 'Card · Table · Checkbox · Select · Dialog',
    file: 'Dashboard.tsx',
  },
  {
    id: 'projects',
    name: 'Task workspace',
    suite: 'workspace',
    category: 'Productivity',
    description: 'A filterable board and list with editable tasks and undo.',
    components: 'Tabs · Dropdown Menu · Sheet · Badge · Toast',
    file: 'Projects.tsx',
  },
  {
    id: 'settings',
    name: 'Workspace settings',
    suite: 'workspace',
    category: 'Productivity',
    description: 'Validated forms, notification preferences, and member management.',
    components: 'Input · Switch · Select · Alert Dialog · Avatar',
    file: 'Settings.tsx',
  },
  {
    id: 'chat',
    name: 'Team chat',
    suite: 'chat',
    category: 'Communication',
    description: 'Discord-style channels, direct messages, threads, reactions, and pins.',
    components: 'Avatar · Popover · Sheet · Textarea · Dropdown Menu',
    file: 'Chat.tsx',
  },
  {
    id: 'hr',
    name: 'HR workspace',
    suite: 'people',
    category: 'People',
    description: 'An employee directory, profile editing, leave approvals, and onboarding.',
    components: 'Table · Tabs · Progress · Checkbox · Dialog',
    file: 'HR.tsx',
  },
  {
    id: 'sorting',
    name: 'Sorting center',
    suite: 'logistics',
    category: 'Logistics',
    description: 'Barcode lookup, lane assignment, dispatch manifests, and exception handling.',
    components: 'Input · Table · Checkbox · Alert Dialog · Sheet',
    file: 'Sorting.tsx',
  },
  {
    id: 'pickup',
    name: 'Pickup point',
    suite: 'logistics',
    category: 'Logistics',
    description: 'Receive arrivals, assign shelves, and verify customer parcel collection.',
    components: 'Select · Tabs · Dialog · Alert · Badge',
    file: 'Pickup.tsx',
  },
  {
    id: 'support',
    name: 'Support inbox',
    suite: 'support',
    category: 'Communication',
    description: 'A triage inbox with customer replies, internal notes, and linked orders.',
    components: 'Textarea · Tabs · Select · Sheet · Avatar',
    file: 'Support.tsx',
  },
  {
    id: 'billing',
    name: 'Billing & invoices',
    suite: 'finance',
    category: 'Finance',
    description: 'Create drafts, track receivables, record payments, and export invoices.',
    components: 'Table · Checkbox · Dropdown Menu · Dialog · Sheet',
    file: 'Billing.tsx',
  },
] as const

export type TemplateDefinition = (typeof templateCatalog)[number]
export type TemplateId = TemplateDefinition['id']
export type TemplateSuite = TemplateDefinition['suite']
export type TemplatePageId = 'templates' | `template/${TemplateId}`
