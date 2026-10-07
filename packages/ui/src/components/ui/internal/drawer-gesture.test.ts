import { describe, expect, it } from 'vitest'
import { shouldDismissDrawer } from './drawer-gesture.js'

describe('drawer gesture intent', () => {
  it('keeps taps and short accidental flicks open', () => {
    expect(shouldDismissDrawer(3, 2000, 480)).toBe(false)
    expect(shouldDismissDrawer(40, 0, 480)).toBe(false)
  })
  it('accepts an intentional outward flick before the distance threshold', () => {
    expect(shouldDismissDrawer(30, 800, 480)).toBe(true)
  })
  it('requires a quarter-panel drag, bounded for small and large panels', () => {
    expect(shouldDismissDrawer(119, 0, 480)).toBe(false)
    expect(shouldDismissDrawer(120, 0, 480)).toBe(true)
    expect(shouldDismissDrawer(63, 0, 100)).toBe(false)
    expect(shouldDismissDrawer(64, 0, 100)).toBe(true)
    expect(shouldDismissDrawer(160, 0, 1200)).toBe(true)
  })
  it('ignores inward, unmeasured, and invalid gestures', () => {
    expect(shouldDismissDrawer(-180, -900, 480)).toBe(false)
    expect(shouldDismissDrawer(180, 0, 0)).toBe(false)
    expect(shouldDismissDrawer(NaN, 800, 480)).toBe(false)
    expect(shouldDismissDrawer(30, Infinity, 480)).toBe(false)
  })
})
