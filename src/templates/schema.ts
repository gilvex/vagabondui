import { z } from 'zod'

const identifier = z.string().min(1)
const email = z
  .string()
  .trim()
  .pipe(z.email({ error: 'Enter a valid email address.' }))
const uniqueIds = (items: { id: string }[]) =>
  new Set(items.map((item) => item.id)).size === items.length

export const taskSchema = z.object({
  id: identifier,
  title: z.string().trim().min(1),
  description: z.string(),
  project: z.string().min(1),
  status: z.enum(['todo', 'in-progress', 'done']),
  priority: z.enum(['Low', 'Medium', 'High']),
  assignee: identifier,
  due: z.string(),
})
export const memberSchema = z.object({
  id: identifier,
  name: z.string().trim().min(1),
  email,
  role: z.enum(['Owner', 'Admin', 'Member']),
  invited: z.boolean(),
})
export const settingsSchema = z.object({
  name: z.string().trim().min(2, 'Enter a workspace name with at least 2 characters.'),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and single hyphens.'),
  email,
  timezone: z.string().min(1),
  mentions: z.boolean(),
  deployments: z.boolean(),
  digest: z.boolean(),
})
export const workspaceSchema = z.object({
  version: z.literal(1),
  tasks: z.array(taskSchema).refine(uniqueIds, 'Task IDs must be unique.'),
  members: z.array(memberSchema).refine(uniqueIds, 'Member IDs must be unique.'),
  settings: settingsSchema,
})

export type Task = z.infer<typeof taskSchema>
export type TaskStatus = Task['status']
export type Priority = Task['priority']
export type Member = z.infer<typeof memberSchema>
export type Settings = z.infer<typeof settingsSchema>
export type Workspace = z.infer<typeof workspaceSchema>
