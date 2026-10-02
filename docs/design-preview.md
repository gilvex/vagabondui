# Brand-direction demo

This is a visual review pass based on PersonalHeroSite and GilGil. Use the original Vagabond preset as a comparison baseline.

## Open the demo

```sh
pnpm dev --port 5175
```

- Comparison: `http://localhost:5175/?brand=gilvex&theme=dark#design-preview`
- Gilvex dashboard: `http://localhost:5175/?brand=gilvex&theme=dark#template/dashboard`
- Gilvex chat: `http://localhost:5175/?brand=gilvex&theme=dark#template/chat`
- GilGil billing: `http://localhost:5175/?brand=gilgil&theme=dark#template/billing`
- GilGil light: `http://localhost:5175/?brand=gilgil&theme=light#design-preview`

The header’s appearance menu works on every page. The comparison page also provides three independent, interactive component specimens and dark/light controls. Applying a preset preserves the mounted application’s state. Explicit choices persist locally and are reflected in the URL for sharing.

## Directions

| Preset   | Source            | Treatment                                                       |
| -------- | ----------------- | --------------------------------------------------------------- |
| Vagabond | Original system   | Zinc, Inter, JetBrains Mono, monochrome primary actions         |
| Gilvex   | PersonalHeroSite  | Olive surfaces, `#d6ef9c` lime, Manrope / DM Sans, 7px controls |
| GilGil   | GilGil brand site | Obsidian, `#e7c17c` gold, Manrope / DM Sans, 4px controls       |

Both branded directions use IBM Plex Mono for technical values. Gilvex light is adapted from the personal site. GilGil light is an additional ivory/bronze palette designed for this system; it is not a palette copied from the current dark-only brand site.

## Changes to inspect

- **Core components:** semantic primary colors, branded selection/focus states, and controlled corner geometry.
- **Dashboard:** editorial headings, brand-aware chart colors, a highlighted primary metric, and consistent activity icons.
- **Chat:** accent-led channel navigation, 16px messages, themed composer/actions, and distinct pinned/reaction states.
- **Billing:** warmer panels, stronger heading hierarchy, a tinted table header, readable mono amounts, and selected-row feedback.
- **Documentation:** explicit baseline color/type specimens, plus a new design-comparison page.

Status colors retain their meaning. The 14px text floor, keyboard behavior, reduced-motion support, and fixed-grid dialog centering remain part of the system.

## Implementation

- `src/lib/tokens.css`: component-safe brand tokens for dark and light modes.
- `src/lib/brands.ts`: typed preset metadata.
- `src/showcase/appearance.tsx`: root-level appearance state and shareable preferences. Root attributes ensure Radix portals receive the same theme.
- `src/showcase/DesignPreview.tsx`: interactive side-by-side specimens and template entry points.
- `src/brand-preview.css`: opt-in refinements for the two branded directions.

Consumers can apply `data-brand="gilvex"` or `data-brand="gilgil"` together with `data-theme="dark"` or `data-theme="light"` on the document root. Branded consumers should load these self-hosted font packages:

```tsx
import '@fontsource-variable/manrope'
import '@fontsource-variable/dm-sans'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
```

## Review captures

`tests/appearance.spec.ts` checks appearance persistence, form-state retention, portal inheritance, font sizes, responsive overflow, and automated accessibility. It captures the comparison and representative applications under `test-results/review-*.png`.

```sh
pnpm exec playwright test tests/appearance.spec.ts
```
