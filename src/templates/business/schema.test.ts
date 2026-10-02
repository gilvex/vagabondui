import { describe, expect, it } from 'vitest'
import { createBusinessData } from './data'
import { businessSchema } from './schema'
import { createWorkspace } from '../data'
import { workspaceSchema } from '../schema'

describe('persisted data schemas', () => {
  it('accepts both fixture datasets', () => {
    expect(businessSchema.parse(createBusinessData())).toEqual(createBusinessData())
    expect(workspaceSchema.parse(createWorkspace())).toEqual(createWorkspace())
  })

  it('rejects duplicate identities and unsupported versions', () => {
    const data = createBusinessData()
    data.messages.push(data.messages[0])
    expect(businessSchema.safeParse(data).success).toBe(false)
    expect(workspaceSchema.safeParse({ ...createWorkspace(), version: 2 }).success).toBe(false)
  })

  it('rejects malformed nested reactions and impossible onboarding checklists', () => {
    const data = createBusinessData()
    data.messages[0].reactions = [{ emoji: '👍', count: -1, mine: true }]
    expect(businessSchema.safeParse(data).success).toBe(false)
    data.messages[0].reactions = []
    data.employees[0].onboarding = []
    expect(businessSchema.safeParse(data).success).toBe(false)
  })

  it('rejects invalid dates, reversed leave ranges, and orphaned employee references', () => {
    const data = createBusinessData()
    data.leave[0].start = '2026-02-30'
    expect(businessSchema.safeParse(data).success).toBe(false)
    data.leave[0].start = '2026-12-01'
    expect(businessSchema.safeParse(data).success).toBe(false)
    data.leave[0].start = '2026-10-12'
    data.leave[0].employeeId = 'missing'
    expect(businessSchema.safeParse(data).success).toBe(false)
  })

  it('rejects replies pointing into another room', () => {
    const data = createBusinessData()
    data.messages.push({ ...data.messages[0], id: 'cross-room', room: 'design', replyTo: 'msg-1' })
    expect(businessSchema.safeParse(data).success).toBe(false)
  })

  it('rejects processed parcels without a location and paid invoices without a reference', () => {
    const data = createBusinessData()
    data.parcels[0].status = 'ready'
    expect(businessSchema.safeParse(data).success).toBe(false)
    data.parcels[0].status = 'received'
    data.invoices[0].status = 'Paid'
    expect(businessSchema.safeParse(data).success).toBe(false)
  })
})
