import type { Settings, TaskStatus, Workspace } from './schema'
export type { TaskStatus, Priority, Task, Member, Settings, Workspace } from './schema'

export const projects = ['Console', 'Design system', 'API', 'Website']
export const statusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}
export const people = [
  { id: 'alex', name: 'Alex Morgan', initials: 'AM' },
  { id: 'sam', name: 'Sam Lee', initials: 'SL' },
  { id: 'jordan', name: 'Jordan Chen', initials: 'JC' },
  { id: 'riley', name: 'Riley Park', initials: 'RP' },
]
export const defaultSettings: Settings = {
  name: 'Northstar',
  slug: 'northstar',
  email: 'team@example.com',
  timezone: 'Europe/London',
  mentions: true,
  deployments: true,
  digest: false,
}

export function createWorkspace(): Workspace {
  return {
    version: 1,
    settings: { ...defaultSettings },
    members: people.map((person, index) => ({
      id: person.id,
      name: person.name,
      email: `${person.id}@example.com`,
      role: index === 0 ? 'Owner' : index === 1 ? 'Admin' : 'Member',
      invited: false,
    })),
    tasks: [
      {
        id: 'NS-101',
        title: 'Review authentication flow',
        description: 'Check sign-in, recovery, and session expiry across desktop and mobile.',
        project: 'Console',
        status: 'todo',
        priority: 'High',
        assignee: 'alex',
        due: 'Oct 4',
      },
      {
        id: 'NS-102',
        title: 'Add webhook retry policy',
        description: 'Add exponential backoff and expose delivery attempts in the API response.',
        project: 'API',
        status: 'in-progress',
        priority: 'High',
        assignee: 'sam',
        due: 'Oct 5',
      },
      {
        id: 'NS-103',
        title: 'Publish component documentation',
        description:
          'Include keyboard interaction, props, and usage examples for the first release.',
        project: 'Design system',
        status: 'done',
        priority: 'Medium',
        assignee: 'jordan',
        due: 'Oct 1',
      },
      {
        id: 'NS-104',
        title: 'Update billing settings',
        description: 'Group billing details, invoices, and payment methods on one settings page.',
        project: 'Console',
        status: 'todo',
        priority: 'Medium',
        assignee: 'riley',
        due: 'Oct 8',
      },
      {
        id: 'NS-105',
        title: 'Test keyboard navigation',
        description: 'Verify tab order and focus restoration in all overlays and forms.',
        project: 'Design system',
        status: 'in-progress',
        priority: 'High',
        assignee: 'jordan',
        due: 'Oct 3',
      },
      {
        id: 'NS-106',
        title: 'Add request tracing',
        description: 'Attach a trace identifier to each request and expose it in the console.',
        project: 'API',
        status: 'done',
        priority: 'Medium',
        assignee: 'sam',
        due: 'Sep 30',
      },
      {
        id: 'NS-107',
        title: 'Write the release notes',
        description: 'Summarize the component changes and migration notes for version 0.3.',
        project: 'Website',
        status: 'todo',
        priority: 'Low',
        assignee: 'alex',
        due: 'Oct 9',
      },
      {
        id: 'NS-108',
        title: 'Refine mobile navigation',
        description: 'Review the sidebar behavior and touch targets at narrow viewport widths.',
        project: 'Website',
        status: 'in-progress',
        priority: 'Medium',
        assignee: 'riley',
        due: 'Oct 6',
      },
      {
        id: 'NS-109',
        title: 'Define semantic color tokens',
        description: 'Document the foreground, background, and status palette for both themes.',
        project: 'Design system',
        status: 'done',
        priority: 'Low',
        assignee: 'jordan',
        due: 'Sep 29',
      },
    ],
  }
}
