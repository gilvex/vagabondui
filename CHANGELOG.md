# Changelog

Release notes for the component library and showcase. The [changelog page](https://gilvex.github.io/vagabondui/#changelog) includes links to live examples.

## 0.4.0 — 2026-10-07

- Added Action Bar with floating/docked styles and fixed, sticky, or inline placement.
- Added non-modal toolbar keyboard navigation, focus restoration, reduced motion, and mobile safe-area spacing.
- Added file-selection actions (archive/undo, export, review) and a sticky save/discard example, with pattern references and API documentation.
- Added typed root and `vagabond-ui/action-bar` exports, compiled styles, and composable label, group, button, close, and separator parts. The catalog now contains 38 component families.
- Verified keyboard navigation, nested menus, disabled actions, focus restoration after archiving all rows, all-brand light/dark accessibility, 320px layouts, and isolated package consumption.

## 0.3.0 — 2026-10-07

### Added

- **Drawer**: animated bottom-opening panel with handle-only drag dismissal, independently scrolling content, and a pinned footer.
- **Fridge**: right-opening Drawer variant using the same interaction implementation.
- Composable header, title, description, body, footer, handle, trigger, and close parts; controlled/uncontrolled state, keyboard focus management, and reduced-motion support.
- Root and typed `vagabond-ui/drawer` / `vagabond-ui/fridge` exports, compiled styles, and usage/API documentation. The catalog now contains 37 component families.
- Interactive report-scheduling and order-details examples, including editable delivery notes and nested cancellation confirmation.
- Gesture, focus, scrolling, narrow-screen, all-brand/theme accessibility, and isolated tarball-consumer coverage.

### Fixed

- Primary-button hover contrast in light themes: brightness replaces opacity to preserve readable foreground/background contrast.
- Overlay focus restoration no longer treats the document body or root as a meaningful return target.
- Stabilized the radio keyboard browser test around Radix's deferred focus behavior.

### Showcase

- Unified Meridian banking into one Bank app template with five internal pages, responsive desktop/mobile navigation, and textured payment-card illustrations.
- Updated npm installation instructions and the existing changelog page.

## 0.2.0 — 2026-10-03

- First npm release of `vagabond-ui`: ESM, TypeScript declarations/maps, component sources, precompiled CSS, and Tailwind CSS 4 integration.
- 35 component families, including hierarchical Select Tree with optional icons, selectable branches, search, keyboard navigation, and native form integration.
- Vagabond, Gilvex, and GilGil visual presets in light and dark modes.
- Documentation routes, composable component APIs, stable dialog entrance positioning, and a 14px minimum text size.
- Interactive dashboard, task management, settings, chat, HR, parcel operations, support, billing, and banking examples.

## 0.1.0 — Initial source preview

- Initial React and Tailwind implementation with semantic themes and ten component families.
