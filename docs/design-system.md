# Design-system specification

## Typography

**No text below 14px.** This includes code, labels, captions, helper text, tooltips, metadata, badges, navigation, and loading/error messages.

| Role                      | Size    | Line height |
| ------------------------- | ------- | ----------- |
| Display                   | 44–48px | 1.15        |
| Page title                | 32–40px | 1.2         |
| Section title             | 24px    | 1.3         |
| Subheading                | 18–20px | 1.4         |
| Body                      | 16px    | 1.6–1.75    |
| Labels, helper text, code | 14px    | 1.5–1.8     |

Inter is the interface font. JetBrains Mono is reserved for code and literal values. Inputs use 16px below the desktop breakpoint. Do not scale a container to make its text fit; wrap, reflow, or provide a scrollable region instead.

`text-xs` is mapped to 14px as a defensive token, but the component source uses `text-sm` or larger. Browser tests inspect computed sizes on all routes at three widths.

## Color

Source of truth: `src/lib/tokens.css`.

| Token                 | Dark      | Light     |
| --------------------- | --------- | --------- |
| `--background`        | `#09090b` | `#fafafa` |
| `--surface`           | `#101012` | `#ffffff` |
| `--surface-raised`    | `#18181b` | `#f0f0f2` |
| `--surface-hover`     | `#222225` | `#e7e7eb` |
| `--foreground`        | `#f4f4f5` | `#18181b` |
| `--muted`             | `#a1a1aa` | `#62626d` |
| `--border`            | `#27272b` | `#e0e0e5` |
| `--border-strong`     | `#3f3f46` | `#c7c7ce` |
| `--accent`            | `#d4f5a0` | `#d4f5a0` |
| `--accent-foreground` | `#202c12` | `#202c12` |
| `--success`           | `#99dca7` | `#28753a` |
| `--warning`           | `#f2cc8f` | `#876020` |
| `--danger`            | `#fda4af` | `#b91c36` |
| `--info`              | `#9ebeff` | `#335db6` |

Use semantic utilities: `bg-surface`, `text-muted`, `border-border`. The accent is an optional surface color, not body text on white. Status colors must have text labels.

## Spacing and layout

- 4px base rhythm: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Default controls: 40px; small buttons: 36px; large: 44px.
- Radius: 6px controls, 8px surfaces.
- Borders: 1px. Floating layers use shadows; cards do not need them.
- Gallery cards reflow rather than shrinking labels; the compact layout targets a 340px minimum before switching to one column.
- Tables and code blocks provide horizontal scrolling.
- Dialogs stay inside 16px viewport margins and scroll internally when needed.

## Motion and modal positioning

The original modal combined Tailwind’s percentage `translate` centering with keyframes that set the same property to pixel values. At the start of its entrance it was positioned by its top-left corner, then returned to centered when the animation ended.

The replacement uses a fixed grid wrapper with `place-items-center`. The content has no centering transform, and its only entrance animation is a 120ms opacity fade. Alert Dialog uses the same layout pattern. Sheet uses fixed edge positioning.

Motion is used for shared-layout tab indicators, spring switch thumbs, template entrances, chart paths, task-card movement, and saved-state feedback. CSS animates accordion heights, sheet entrance/exit, and small menu transitions. The application sets `reducedMotion="user"`; CSS also suppresses animation when the user requests reduction. No ambient loops or scroll hijacking are used.

| Interaction   | Motion                                           |
| ------------- | ------------------------------------------------ |
| Tabs          | Shared-layout spring, stiffness 420 / damping 34 |
| Switch        | Spring, stiffness 480 / damping 30               |
| Accordion     | 240ms measured-height open, 200ms close          |
| Sheet         | 280ms directional entrance, 200ms exit           |
| Template page | 300ms, 8px entrance                              |
| Chart         | 750–850ms path drawing on period changes         |
| Task cards    | Shared layout, spring 350 / 30, 180ms opacity    |

Notification actions use `shrink-0` and `whitespace-nowrap`; the content region uses `min-w-0 flex-1` and wrapping. Long descriptions must not compress an action label.

## Component conventions

- One component family per `src/components/ui/*.tsx` file.
- Named parts for composite components: e.g. Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter.
- Native and primitive props are forwarded; React 19 refs pass through.
- Components accept `className`, merged through `cn()`.
- Buttons default to `type="button"`. Set `type="submit"` explicitly.
- Use labels connected by `htmlFor`/`id`; Field can generate related description and error IDs.
- Programmatic dialogs capture the active element and restore it when still connected.
- A dialog needs an accessible title and description, either through named parts or the convenience string props.
- ScrollArea’s viewport is keyboard-focusable, including in browsers that do not focus scrolling regions automatically.
- Progress clamps non-finite and out-of-range values safely.
- Command uses cmdk for navigation/filtering; Toast uses Sonner with system typography.

## Verification

Playwright checks modal positions during entrance, readable computed text sizes, overflow, interaction behavior, and axe results. The tests are not a complete screen-reader audit; applications still own their content and full user journeys.
