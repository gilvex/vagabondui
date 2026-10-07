export type DrawerDirection = 'bottom' | 'right'

/** Only an outward drag can dismiss. Tiny fast motions should still behave as a tap. */
export function shouldDismissDrawer(offset: number, velocity: number, size: number) {
  if (!Number.isFinite(offset) || !Number.isFinite(velocity) || !Number.isFinite(size)) return false
  if (size <= 0 || offset <= 0) return false
  const threshold = Math.min(160, Math.max(64, size * 0.25))
  return offset >= threshold || (offset >= 24 && velocity >= 700)
}
