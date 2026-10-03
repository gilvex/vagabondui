import { access, readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
await writeFile(new URL('dist/styles.css.d.ts', root), 'export {}\n')
const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
for (const [name, target] of Object.entries(manifest.exports)) {
  for (const file of typeof target === 'string' ? [target] : Object.values(target)) {
    try {
      await access(new URL(file, root))
    } catch {
      throw new Error(`Missing package export ${name}: ${file}`)
    }
  }
}
