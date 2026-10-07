import assert from 'node:assert/strict'
import { appendFile, readFile } from 'node:fs/promises'

const manifest = JSON.parse(
  await readFile(new URL('../packages/ui/package.json', import.meta.url), 'utf8'),
)
assert.match(manifest.version, /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/, 'Invalid package version')
assert.equal(
  process.env.RELEASE_VERSION,
  manifest.version,
  'Commit the intended package version before dispatching publication.',
)
assert.ok(process.env.GITHUB_OUTPUT, 'This script runs in the publish workflow.')
await appendFile(
  process.env.GITHUB_OUTPUT,
  `tarball=./artifacts/${manifest.name}-${manifest.version}.tgz\n`,
)
console.log(`Publishing requested for ${manifest.name}@${manifest.version}`)
