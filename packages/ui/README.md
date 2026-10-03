# Vagabond UI

35 React component families, semantic light/dark themes, and Motion interactions.

[Live showcase](https://gilvex.github.io/vagabondui/) · [Source](https://github.com/gilvex/vagabondui) · [Documentation](https://gilvex.github.io/vagabondui/#installation)

This package is prepared for npm publication. Registry publication is a separate release step; until it is published, use a packed tarball or a workspace dependency as described below.

## Install from npm after publication

```sh
npm install vagabond-ui react@^19 react-dom@^19
```

React and React DOM are peers. Radix, Motion, icons, and the remaining implementation dependencies are installed automatically.

## Use the components

```tsx
import 'vagabond-ui/styles.css'
import { Button } from 'vagabond-ui/button'
import { Card, CardContent, CardTitle } from 'vagabond-ui/card'

export function Example() {
  return (
    <Card>
      <CardContent>
        <CardTitle>Project settings</CardTitle>
        <Button onClick={() => console.log('Saved')}>Save changes</Button>
      </CardContent>
    </Card>
  )
}
```

The precompiled stylesheet supplies the component utilities, tokens, and base reset. **It does not require a Tailwind build step.** Import it once near your application's entry point. Application-specific Tailwind utilities still require your own Tailwind setup.

Root imports are supported too:

```tsx
import { Button, Dialog, SelectTree, type SelectTreeOption } from 'vagabond-ui'
```

The package is ESM with TypeScript declarations and per-component subpaths. Use modern TypeScript resolution (`bundler` or `NodeNext`). Hook-based entry points preserve their `use client` directives; application event handlers belong in your React client components.

## Tailwind CSS 4 integration

Instead of the precompiled stylesheet, use the source CSS entry in your Tailwind application:

```css
/* src/styles.css */
@import 'vagabond-ui/tailwind.css';
@source './';
```

This entry imports Tailwind CSS 4 and scans the packaged component source. Configure Tailwind in your app and use **one** styling entry: `styles.css` or `tailwind.css`.

## Themes and fonts

Set attributes on the document root:

```html
<html data-theme="dark" data-brand="gilvex"></html>
```

- Modes: `dark`, `light`.
- Brands: `vagabond`, `gilvex`, `gilgil`.
- Override semantic CSS variables to customize your own theme.

Fonts are optional and are not bundled. Defaults fall back to sans-serif/monospace. For the showcase's exact typography, load Inter Variable and JetBrains Mono Variable for Vagabond, or Manrope Variable, DM Sans Variable, and IBM Plex Mono for the branded presets. Fontsource is one self-hosted option.

## Workspace use

With `packages/ui` included in a pnpm workspace, the consuming application declares:

```json
{
  "dependencies": {
    "vagabond-ui": "workspace:*"
  }
}
```

Build the library with `pnpm --filter vagabond-ui build` before consuming its default exports. This repository's showcase uses exactly that dependency.

For live source development, the package also exposes the opt-in `vagabond-source` export condition. The showcase enables it in Vite development and TypeScript; production builds and external consumers use the compiled exports. See the root repository's [packaging guide](https://github.com/gilvex/vagabondui/blob/main/docs/packaging.md).

## Local tarball

From the repository root:

```sh
pnpm package:pack
npm install ./artifacts/vagabond-ui-0.2.0.tgz
```

The archive contains compiled ES modules, declarations/maps, CSS, copyable component source, README, and license. It excludes showcase applications, sample business data, tests, and build scripts.

## Exports

- Root: `vagabond-ui`
- Components: `vagabond-ui/button`, `vagabond-ui/dialog`, `vagabond-ui/select-tree`, and the other documented component filenames
- Helpers: `vagabond-ui/utils`, `vagabond-ui/brands`, `vagabond-ui/motion`
- Styles: `vagabond-ui/styles.css` or `vagabond-ui/tailwind.css`
- Metadata: `vagabond-ui/package.json`

Code: MIT. Dependency and font licenses remain with their authors.
