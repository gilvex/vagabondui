# Vagabond UI

37 React component families, semantic light/dark themes, and Motion interactions.

Drawer opens from the bottom; Fridge is its right-opening variant. Both provide handle-only drag dismissal, a scrollable body, a pinned footer, focus restoration, and reduced-motion support. Import from `vagabond-ui/drawer` or `vagabond-ui/fridge`, or use the root barrel. Compose Header, Title, Description, Body, and Footer inside Content for an accessible panel.

[Live showcase](https://gilvex.github.io/vagabondui/) · [Source](https://github.com/gilvex/vagabondui) · [Documentation](https://gilvex.github.io/vagabondui/#installation) · [Changelog](https://gilvex.github.io/vagabondui/#changelog)

Version **0.3.0** adds Drawer and Fridge, improves primary-button hover contrast, and refines overlay focus restoration.

## Install from npm

```sh
npm install vagabond-ui@^0.3.0 react@^19 react-dom@^19
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
npm install ./artifacts/vagabond-ui-0.3.0.tgz
```

The archive contains compiled ES modules, declarations/maps, CSS, copyable component source, README, and license. It excludes showcase applications, sample business data, tests, and build scripts.

## Exports

- Root: `vagabond-ui`
- Components: `vagabond-ui/button`, `vagabond-ui/dialog`, `vagabond-ui/select-tree`, and the other documented component filenames
- Helpers: `vagabond-ui/utils`, `vagabond-ui/brands`, `vagabond-ui/motion`
- Styles: `vagabond-ui/styles.css` or `vagabond-ui/tailwind.css`
- Metadata: `vagabond-ui/package.json`

Code: MIT. Dependency and font licenses remain with their authors.
