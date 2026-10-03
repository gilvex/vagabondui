import { rm } from 'node:fs/promises'

// This path is fixed to this package's generated output, independent of the caller's cwd.
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true })
