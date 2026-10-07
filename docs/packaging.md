# Package and workspace integration

## Status

`packages/ui` is the npm package **vagabond-ui**, version **0.3.0**. Install it with `npm install vagabond-ui@^0.3.0 react@^19 react-dom@^19`, or use a tested local tarball. See the [changelog](../CHANGELOG.md) for release details.

The root `vagabond-ui-showcase` package is private. It depends on `vagabond-ui` using `workspace:*` and imports the same public paths that external consumers use.

## Package contents and exports

The package includes:

- Unbundled ESM modules, preserving component boundaries and relative `.js` imports.
- TypeScript declarations, declaration maps, and JS source maps.
- Compiled `styles.css`, including component utilities, tokens, and reset.
- A `tailwind.css` source entry for Tailwind CSS 4 integration.
- Copyable component source, README, and MIT license.

Only CSS is declared side-effectful. React and React DOM are peers; they are not bundled. Runtime implementation dependencies are declared on the package, not borrowed from the showcase. Fonts and application templates are not bundled.

Public imports:

```tsx
import 'vagabond-ui/styles.css'
import { Button, SelectTree } from 'vagabond-ui'
import { Dialog, DialogContent } from 'vagabond-ui/dialog'
import { cn } from 'vagabond-ui/utils'
import { brands } from 'vagabond-ui/brands'
```

Use TypeScript `moduleResolution: "bundler"` or `"NodeNext"`. Hook-based entry points preserve `use client` directives. Utility modules remain ordinary ESM. Next.js-style application event handlers should live in client components.

## Precompiled CSS or Tailwind source

For a standard React app, import `vagabond-ui/styles.css`. It is already compiled and does not require Tailwind. It supplies component styles, not every possible utility class your application may use.

For Tailwind CSS 4, configure its plugin and use:

```css
@import 'vagabond-ui/tailwind.css';
@source './';
```

This replaces your Tailwind import and includes the library sources. Do not also import the precompiled stylesheet, which would duplicate the reset and component utilities.

## pnpm workspace dependency

```yaml
# pnpm-workspace.yaml
packages:
  - packages/*
  - apps/*
```

```json
{
  "dependencies": {
    "vagabond-ui": "workspace:*"
  }
}
```

Run `pnpm install`, then `pnpm --filter vagabond-ui build`. Default exports resolve to the generated `packages/ui/dist` modules.

For live source updates, this repository opts into a custom export condition **only during development**:

```ts
import { defaultClientConditions, defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  resolve: {
    conditions:
      command === 'serve'
        ? ['vagabond-source', ...defaultClientConditions]
        : [...defaultClientConditions],
  },
  optimizeDeps: { exclude: ['vagabond-ui'] },
}))
```

The application's TypeScript configuration also includes `"customConditions": ["vagabond-source"]`. Production builds deliberately use compiled exports, and the separate tarball consumer verifies the published declarations without that condition.

In an **npm workspaces** monorepo, include the package folder in the root `workspaces` array and depend on its matching version (`"vagabond-ui": "0.3.0"`). npm links matching local workspaces; pnpm's `workspace:*` protocol is for the pnpm/Yarn workflow and is not required by npm.

## Install an unpublished build

```sh
pnpm package:pack

# In another project:
npm install /absolute/path/to/artifacts/vagabond-ui-0.3.0.tgz
```

The tarball is a normal npm artifact, not a source link. `pnpm test:package` checks it in an isolated temporary project with its own React installation, strict declaration checking, and browser interaction tests.

## npm publication

When you are ready to publish:

1. Choose the version in `packages/ui/package.json`, update installation examples if needed, and commit it.
2. Run `pnpm check` and confirm the matching GitHub Verify run passes.
3. Authenticate locally with `npm login`; confirm the account with `npm whoami`.
4. Publish the verified archive: `npm publish ./artifacts/vagabond-ui-0.3.0.tgz --access public`.

The npm account must have permission to publish the chosen package name. npm versions are immutable, so subsequent releases need a new version. Do not put npm tokens in repository files.

## Trusted publishing from GitHub Actions

After the npm package exists, configure a GitHub Actions trusted publisher in its npm settings:

- Organization/user: `gilvex`
- Repository: `vagabondui`
- Workflow filename: `publish.yml`
- Environment: leave blank (this workflow does not declare an environment)
- Allowed actions: enable direct publishing with `npm publish` (stage-only permission is not sufficient for this workflow)

Then manually dispatch **Publish UI package** on `main`, entering the version already committed in the package manifest. The workflow runs all checks, packs/tests the archive, and publishes that exact tarball using npm's OIDC authentication and provenance. Normal pushes only verify/package/deploy the showcase; they never publish to npm.

See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) for account-side setup and current npm requirements.
