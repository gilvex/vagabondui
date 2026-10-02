import { z } from 'zod'

const identifier = z.string().min(1)
const email = z
  .string()
  .trim()
  .pipe(z.email({ error: 'Enter a valid email address.' }))
const timestamp = z.iso.datetime({ offset: true, local: true })
const uniqueIds = (items: { id: string }[]) =>
  new Set(items.map((item) => item.id)).size === items.length

export const chatMessageSchema = z.object({
  id: identifier,
  room: identifier,
  author: identifier,
  text: z.string().trim().min(1),
  time: timestamp,
  pinned: z.boolean(),
  replyTo: identifier.optional(),
  reactions: z.array(
    z.object({
      emoji: z.string().min(1),
      count: z.number().int().positive(),
      mine: z.boolean(),
    }),
  ),
})
export const employeeSchema = z.object({
  id: identifier,
  name: z.string().trim().min(1),
  email,
  role: z.string().trim().min(1, 'Enter a job title.'),
  department: z.string().min(1),
  location: z.string().trim().min(1, 'Enter a location.'),
  status: z.enum(['Active', 'On leave', 'Onboarding']),
  startDate: z.iso.date(),
  manager: z.string(),
  onboarding: z.array(z.boolean()).length(3),
})
export const leaveSchema = z
  .object({
    id: identifier,
    employeeId: identifier,
    kind: z.string().min(1),
    start: z.iso.date(),
    end: z.iso.date(),
    status: z.enum(['Pending', 'Approved', 'Declined']),
    note: z.string(),
  })
  .refine((request) => request.end >= request.start, {
    message: 'Leave dates are reversed.',
    path: ['end'],
  })

export const parcelStatusSchema = z.enum([
  'received',
  'sorted',
  'transit',
  'ready',
  'collected',
  'exception',
])
export const parcelEventSchema = z.object({
  id: identifier,
  label: z.string().min(1),
  time: timestamp,
})
export const parcelSchema = z
  .object({
    id: identifier,
    customer: z.string().min(1),
    phone: z.string(),
    destination: z.string().min(1),
    status: parcelStatusSchema,
    lane: z.string(),
    shelf: z.string(),
    code: z.string().regex(/^\d{6}$/),
    items: z.string(),
    weight: z.string(),
    holdUntil: z.iso.date(),
    exception: z.string(),
    holdFrom: z.enum(['received', 'sorted', 'transit', 'ready']).optional(),
    events: z.array(parcelEventSchema).refine(uniqueIds, 'Tracking event IDs must be unique.'),
  })
  .superRefine((parcel, context) => {
    if (
      ['sorted', 'transit', 'ready', 'collected'].includes(parcel.status) &&
      !parcel.lane.trim()
    ) {
      context.addIssue({
        code: 'custom',
        path: ['lane'],
        message: 'Processed parcels require a lane.',
      })
    }
    if (['ready', 'collected'].includes(parcel.status) && !parcel.shelf.trim()) {
      context.addIssue({
        code: 'custom',
        path: ['shelf'],
        message: 'Pickup parcels require a shelf.',
      })
    }
    if (parcel.status === 'exception' && (!parcel.holdFrom || !parcel.exception.trim())) {
      context.addIssue({
        code: 'custom',
        path: ['exception'],
        message: 'Exceptions require an origin state and reason.',
      })
    }
  })
export const ticketSchema = z.object({
  id: identifier,
  subject: z.string().trim().min(1),
  customer: z.string().trim().min(1),
  email,
  status: z.enum(['Open', 'Pending', 'Resolved']),
  priority: z.enum(['Low', 'Normal', 'Urgent']),
  assignee: identifier,
  orderId: z.string(),
  messages: z
    .array(
      z.object({
        id: identifier,
        author: z.string().min(1),
        text: z.string().trim().min(1),
        internal: z.boolean(),
        time: timestamp,
      }),
    )
    .refine(uniqueIds, 'Ticket message IDs must be unique.'),
})
export const invoiceSchema = z
  .object({
    id: identifier,
    customer: z.string().trim().min(1),
    email,
    description: z.string().trim().min(1),
    cents: z.number().int().positive().max(99_999_999),
    due: z.iso.date(),
    status: z.enum(['Draft', 'Sent', 'Overdue', 'Paid']),
    reference: z.string(),
  })
  .refine((invoice) => invoice.status !== 'Paid' || !!invoice.reference.trim(), {
    message: 'Paid invoices require a payment reference.',
    path: ['reference'],
  })
export const businessSchema = z
  .object({
    version: z.literal(1),
    messages: z.array(chatMessageSchema).refine(uniqueIds, 'Message IDs must be unique.'),
    employees: z.array(employeeSchema).refine(uniqueIds, 'Employee IDs must be unique.'),
    leave: z.array(leaveSchema).refine(uniqueIds, 'Leave request IDs must be unique.'),
    parcels: z.array(parcelSchema).refine(uniqueIds, 'Parcel IDs must be unique.'),
    tickets: z.array(ticketSchema).refine(uniqueIds, 'Ticket IDs must be unique.'),
    invoices: z.array(invoiceSchema).refine(uniqueIds, 'Invoice IDs must be unique.'),
  })
  .superRefine((data, context) => {
    const employees = new Set(data.employees.map((employee) => employee.id))
    data.leave.forEach((request, index) => {
      if (!employees.has(request.employeeId))
        context.addIssue({
          code: 'custom',
          path: ['leave', index, 'employeeId'],
          message: 'Employee does not exist.',
        })
    })
    const messages = new Map(data.messages.map((message) => [message.id, message]))
    data.messages.forEach((message, index) => {
      if (!message.replyTo) return
      const parent = messages.get(message.replyTo)
      if (!parent || parent.replyTo || parent.room !== message.room) {
        context.addIssue({
          code: 'custom',
          path: ['messages', index, 'replyTo'],
          message: 'Replies must reference a root message in the same room.',
        })
      }
    })
  })

export type ChatMessage = z.infer<typeof chatMessageSchema>
export type Employee = z.infer<typeof employeeSchema>
export type LeaveRequest = z.infer<typeof leaveSchema>
export type ParcelStatus = z.infer<typeof parcelStatusSchema>
export type ParcelEvent = z.infer<typeof parcelEventSchema>
export type Parcel = z.infer<typeof parcelSchema>
export type Ticket = z.infer<typeof ticketSchema>
export type Invoice = z.infer<typeof invoiceSchema>
export type BusinessData = z.infer<typeof businessSchema>
