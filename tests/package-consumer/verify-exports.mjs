import assert from 'node:assert/strict'
import { readFile, realpath } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, relative } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const require = createRequire(import.meta.url)
const manifestPath = require.resolve('vagabond-ui/package.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const packageRoot = await realpath(dirname(manifestPath))
assert.ok(
  !relative(process.cwd(), packageRoot).startsWith('..'),
  'Package must be unpacked inside the isolated consumer.',
)
assert.match(
  require.resolve('vagabond-ui'),
  /dist[\\/]lib[\\/]index\.js$/,
  'Default resolution must use compiled JS.',
)
assert.equal(
  createRequire(manifestPath).resolve('react'),
  require.resolve('react'),
  'React must resolve to the consumer peer, not a bundled copy.',
)

for (const [subpath, entry] of Object.entries(manifest.exports)) {
  if (typeof entry !== 'object' || !entry.import) continue
  const specifier = subpath === '.' ? manifest.name : `${manifest.name}/${subpath.slice(2)}`
  const exported = await import(specifier)
  assert.ok(Object.keys(exported).length > 0, `${specifier} has no exports`)
}
const root = await import('vagabond-ui')
const direct = await import('vagabond-ui/button')
assert.equal(root.Button, direct.Button, 'Root and subpath imports must share module identity.')
assert.match(
  renderToStaticMarkup(createElement(root.Button, null, 'Server render')),
  /Server render/,
)
assert.equal(root.cn('px-2', 'px-4'), 'px-4')
for (const subpath of ['dialog', 'sheet', 'select-tree', 'switch', 'tabs']) {
  const source = await readFile(require.resolve(`vagabond-ui/${subpath}`), 'utf8')
  assert.match(source, /^['"]use client['"];?/, `${subpath} lost its client directive.`)
}
console.log('Package exports, peer identity, client directives, and server rendering verified.')
