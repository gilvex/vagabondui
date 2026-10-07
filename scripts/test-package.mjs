import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { list } from 'tar'
import { chromium, expect } from '@playwright/test'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const manifest = JSON.parse(await readFile(join(root, 'packages/ui/package.json'), 'utf8'))
const artifacts = join(root, 'artifacts')
await mkdir(artifacts, { recursive: true })

function runNode(file, args, cwd) {
  const result = spawnSync(process.execPath, [file, ...args], { cwd, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`Command failed: ${file} ${args.join(' ')}`)
}

function runNpm(args, cwd) {
  // These arguments are fixed by this test; paths are supplied via cwd or generated JSON.
  const command = process.platform === 'win32' ? process.env.ComSpec || 'cmd.exe' : 'npm'
  const parameters =
    process.platform === 'win32' ? ['/d', '/s', '/c', `npm ${args.join(' ')}`] : args
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !/^npm_config_/i.test(key)),
  )
  const result = spawnSync(command, parameters, { cwd, env, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed`)
}

const pnpm = process.env.npm_execpath
if (!pnpm || !pnpm.includes('pnpm')) throw new Error('Run this check with pnpm test:package.')
runNode(pnpm, ['--filter', 'vagabond-ui', 'pack', '--pack-destination', artifacts], root)
const tarball = join(artifacts, `${manifest.name}-${manifest.version}.tgz`)
await access(tarball)

const files = new Set()
await list({
  file: tarball,
  onReadEntry(entry) {
    files.add(entry.path.replace(/^package\//, ''))
  },
})
for (const required of ['package.json', 'README.md', 'LICENSE', 'dist/styles.css'])
  assert.ok(files.has(required), `Missing ${required}`)
for (const [name, entry] of Object.entries(manifest.exports)) {
  for (const path of typeof entry === 'string' ? [entry] : Object.values(entry)) {
    assert.ok(
      files.has(path.replace(/^\.\//, '')),
      `Export ${name} points outside the tarball: ${path}`,
    )
  }
}
for (const path of files) {
  assert.ok(
    /^(dist\/|src\/|package\.json$|README\.md$|LICENSE$)/.test(path),
    `Unexpected published file: ${path}`,
  )
  assert.ok(
    !/\.test\.|showcase|templates|\.env|node_modules/.test(path),
    `Development data leaked into the package: ${path}`,
  )
}
await writeFile(
  join(artifacts, 'package-contents.json'),
  `${JSON.stringify([...files].sort(), null, 2)}\n`,
)

const temporaryRoot = join(tmpdir(), 'opencode')
await mkdir(temporaryRoot, { recursive: true })
const consumer = await mkdtemp(join(temporaryRoot, 'vagabond-consumer-'))
let server
let browser
let passed = false

async function freePort() {
  const socket = createServer()
  socket.listen(0, '127.0.0.1')
  await once(socket, 'listening')
  const address = socket.address()
  if (!address || typeof address === 'string') throw new Error('Unable to allocate a test port')
  await new Promise((resolve, reject) =>
    socket.close((error) => (error ? reject(error) : resolve())),
  )
  return address.port
}

async function waitForServer(url) {
  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    if (server.exitCode !== null)
      throw new Error('The isolated preview server exited before it was ready.')
    try {
      if ((await fetch(url)).ok) return
    } catch {
      /* Server is still starting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`Preview server did not start: ${url}`)
}

try {
  await cp(join(root, 'tests/package-consumer'), consumer, { recursive: true })
  const installedVersion = (name) => require(`${name}/package.json`).version
  await writeFile(
    join(consumer, 'package.json'),
    JSON.stringify(
      {
        name: 'vagabond-ui-consumer-test',
        private: true,
        type: 'module',
        dependencies: {
          'vagabond-ui': `file:${tarball.replaceAll('\\', '/')}`,
          react: installedVersion('react'),
          'react-dom': installedVersion('react-dom'),
        },
        devDependencies: {
          typescript: installedVersion('typescript'),
          vite: installedVersion('vite'),
          '@types/react': installedVersion('@types/react'),
          '@types/react-dom': installedVersion('@types/react-dom'),
        },
      },
      null,
      2,
    ),
  )
  // This fixture verifies a public installation, independent of a developer's registry login.
  await writeFile(
    join(consumer, '.npmrc'),
    'registry=https://registry.npmjs.org/\n//registry.npmjs.org/:_authToken=\n',
  )
  await writeFile(join(consumer, '.npm-globalrc'), '')
  runNpm(
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--package-lock=false',
      '--userconfig=./.npmrc',
      '--globalconfig=./.npm-globalrc',
    ],
    consumer,
  )
  runNode(join(consumer, 'verify-exports.mjs'), [], consumer)
  const css = await readFile(join(consumer, 'node_modules/vagabond-ui/dist/styles.css'), 'utf8')
  assert.ok(
    !css.includes('@source') && !css.includes('@import "tailwindcss"'),
    'Published styles must already be compiled.',
  )
  runNode(join(consumer, 'node_modules/typescript/bin/tsc'), ['-p', 'tsconfig.json'], consumer)
  const vite = join(consumer, 'node_modules/vite/bin/vite.js')
  runNode(vite, ['build'], consumer)

  const port = await freePort()
  const url = `http://127.0.0.1:${port}`
  server = spawn(
    process.execPath,
    [vite, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { cwd: consumer, stdio: 'pipe' },
  )
  server.stdout.on('data', (chunk) => process.stdout.write(chunk))
  server.stderr.on('data', (chunk) => process.stderr.write(chunk))
  await waitForServer(url)
  browser = await chromium.launch()
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(url)
  await expect(page.getByRole('heading', { name: 'Installed package test' })).toBeVisible()
  const save = page.getByRole('button', { name: 'Save changes', exact: true })
  await expect(save).toHaveCSS('background-color', 'rgb(214, 239, 156)')
  await expect(save).toHaveCSS('height', '40px')
  await save.click()
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeVisible()
  await page.getByRole('combobox', { name: 'Region', exact: true }).click()
  const picker = page.getByRole('dialog', { name: 'Region tree selector' })
  await picker.getByRole('textbox', { name: 'Search Region' }).fill('London')
  await picker.getByRole('textbox').press('Enter')
  await expect(page.getByRole('status', { name: 'Selected region' })).toHaveText('london')
  await page.getByRole('switch', { name: 'Notifications' }).click()
  await expect(page.getByRole('switch', { name: 'Notifications' })).not.toBeChecked()
  await page.getByRole('tab', { name: 'Details', exact: true }).click()
  await expect(page.getByRole('tabpanel')).toHaveText('Details content')
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Package dialog' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveCSS('background-color', 'rgb(27, 30, 25)')
  await page.screenshot({ path: join(artifacts, 'package-consumer.png') })
  await dialog.getByRole('button', { name: 'Done', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  for (const [name, direction] of [
    ['drawer', 'bottom'],
    ['fridge', 'right'],
  ]) {
    const trigger = page.getByRole('button', { name: `Open ${name}`, exact: true })
    await trigger.click()
    const panel = page.getByRole('dialog', { name: `Package ${name}` })
    await expect(panel).toHaveAttribute('data-direction', direction)
    await expect(panel).toHaveCSS('position', 'fixed')
    await expect(panel).toHaveCSS('background-color', 'rgb(27, 30, 25)')
    const box = await panel.boundingBox()
    assert.ok(box && Math.abs(box.y + box.height - page.viewportSize().height) < 2)
    if (direction === 'right')
      assert.ok(Math.abs(box.x + box.width - page.viewportSize().width) < 2)
    await panel.getByRole('button', { name: 'Done', exact: true }).click()
    await expect(panel).not.toBeVisible()
    await expect(trigger).toBeFocused()
  }
  const actionsTrigger = page.getByRole('button', { name: 'Show actions', exact: true })
  await actionsTrigger.click()
  await expect(actionsTrigger).toBeFocused()
  const toolbar = page.getByRole('toolbar', { name: 'Package actions' })
  await expect(toolbar).toBeVisible()
  await expect(toolbar).toHaveCSS('background-color', 'rgb(27, 30, 25)')
  await expect(toolbar.locator('..')).toHaveCSS('position', 'fixed')
  await toolbar.getByRole('button', { name: 'Apply actions' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(toolbar.getByRole('button', { name: 'Dismiss actions' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(toolbar).toHaveCount(0)
  await expect(actionsTrigger).toBeFocused()
  assert.deepEqual(errors, [])
  passed = true
  console.log(`Verified npm tarball: ${manifest.name}@${manifest.version} (${files.size} files).`)
} finally {
  await browser?.close()
  if (server && server.exitCode === null) {
    const exited = once(server, 'exit')
    server.kill()
    await exited
  }
  if (passed) await rm(consumer, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
  else console.error(`Consumer fixture retained for debugging: ${consumer}`)
}
