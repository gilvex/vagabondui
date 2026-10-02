# Vagabond UI

34 source-owned React component families, with live examples and per-component documentation. The visual tokens are inspired by [Effect’s website](https://effect.website/blog/releases/effect/40); the file structure and composable APIs follow [shadcn/ui conventions](https://ui.shadcn.com/docs/components).

**React 19 · TypeScript · Tailwind CSS 4 · Radix · Motion**

**[Live showcase](https://gilvex.github.io/vagabondui/) · [Browse templates](https://gilvex.github.io/vagabondui/#templates)**

## Run locally

Requires Node.js 22.13+ (22.x) or 24+. Node 24 is used in CI. The repository pins **pnpm 10.34.6** through `packageManager` in `package.json`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open the address printed by Vite, normally `http://localhost:5173`.

```sh
pnpm build       # Type-check and build the documentation app
pnpm preview     # Preview the production app
pnpm build:lib   # Build ES modules, CSS, and declarations
pnpm check       # Run all quality gates, builds, and tests
```

## Deployment

The showcase automatically deploys to **[GitHub Pages](https://gilvex.github.io/vagabondui/)** after a push to `main` passes the Verify workflow. Pull requests run the same checks, including production smoke tests, but do not publish. The workflow can also be started manually from GitHub Actions.

The Pages build uses `/vagabondui/` as its asset base and writes to `dist-pages/`. Only that static output is uploaded. The reusable library build remains separate in `dist-lib/`.

```sh
pnpm build:pages
pnpm test:pages       # Smoke-test the actual built app, assets, and lazy routes
pnpm preview:pages   # http://127.0.0.1:4174/vagabondui/
```

Hash-based routes work directly on Pages, for example `/#template/chat`. Root-hosted services such as Vercel can still use `pnpm build` with `dist/` as their output directory. Pages is sufficient for this static showcase; Vercel is an option if per-PR preview deployments or server-side features become necessary.

The Pages smoke tests can also target a published deployment: set `SHOWCASE_URL` to its full URL (including the trailing slash), then run `pnpm test:pages`. In that mode no local server is started.

## Components

| Category   | Families                                                                        |
| ---------- | ------------------------------------------------------------------------------- |
| Actions    | Button, Dropdown Menu, Toggle, Toggle Group                                     |
| Forms      | Checkbox, Field, Input, Label, Radio Group, Select, Slider, Switch, Textarea    |
| Display    | Accordion, Avatar, Badge, Card, Collapsible, Scroll Area, Separator, Table      |
| Feedback   | Alert, Alert Dialog, Dialog, Popover, Progress, Sheet, Skeleton, Toast, Tooltip |
| Navigation | Breadcrumb, Command, Pagination, Tabs                                           |

All 34 families are separately implemented and exported.

## Source structure

```text
src/
  components/ui/       One file per component family
    button.tsx
    dialog.tsx
    select.tsx
    ...
  lib/
    utils.ts           cn(): clsx + tailwind-merge
    tokens.css         Semantic themes and typography
    motion.tsx         Optional animation utilities
    index.ts           Optional barrel export
  showcase/
    demos/             Stateful examples grouped by purpose
    catalog.ts         Component metadata, usage, and API notes
    Gallery.tsx        Catalog and dedicated component pages
    Docs.tsx           Foundation and installation guides
  App.tsx              Navigation, theme, and search
tests/                 Browser and accessibility regression tests
docs/                  Research, design specification, and review notes
```

Direct imports are the recommended pattern:

```tsx
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

export function ProjectDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Project settings</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project settings</DialogTitle>
          <DialogDescription>Update your project preferences.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

The `@/` alias points to `src/` in this repository. Components use relative internal imports, so copying `src/components/ui`, `src/lib/utils.ts`, and `src/lib/tokens.css` preserves their dependencies.

## Use in another React application

There is no published npm package or shadcn CLI registry. Copy the component files you need and install their dependencies:

```sh
pnpm add radix-ui lucide-react class-variance-authority clsx tailwind-merge
# Motion is used by Tabs, Switch, and animation utilities.
# cmdk and sonner power Command and Toast:
pnpm add cmdk sonner motion
```

Configure Tailwind CSS 4 with `@tailwindcss/vite`. Create an application stylesheet that imports the tokens and declares your application sources. Tokens include Tailwind’s base reset; their own source discovery is limited to the library.

```css
/* src/styles.css */
@import './lib/tokens.css';
@source './';
```

```tsx
import './styles.css'
```

For the bundled fonts:

```sh
pnpm add @fontsource-variable/inter @fontsource-variable/jetbrains-mono
```

```tsx
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
```

The standalone build emits `dist-lib/index.js`, `dist-lib/styles.css`, and declarations under `dist-lib/components/ui/` and `dist-lib/lib/`. Import the CSS explicitly when consuming the built module. React, Radix, cmdk, Sonner, Motion, and Lucide remain external dependencies.

## Workbench

- `/#components` — all components, filters, previews, and code
- `/#component/dialog` — dedicated documentation; every family has a corresponding route
- `/#installation` — setup instructions
- `/#colors`, `/#typography`, `/#spacing`, `/#motion` — design foundations
- `/#research` — reference notes
- `/#templates` — template gallery
- `/#template/dashboard` — metrics, animated chart, task overview, and CSV export
- `/#template/projects` — searchable task board/list, editing, move/delete, and undo
- `/#template/settings` — validated workspace settings, notifications, and members
- `/#template/chat` — Discord-style channels, DMs, reactions, pins, and threads
- `/#template/hr` — employee directory, profile editing, leave approvals, and onboarding
- `/#template/sorting` — barcode lookup, lane assignment, bulk dispatch, and exceptions
- `/#template/pickup` — arrivals, shelf assignment, and verified parcel collection
- `/#template/support` — customer inbox, internal notes, assignment, and linked orders
- `/#template/billing` — invoices, payment recording, bulk actions, and CSV exports

Search with **⌘K / Ctrl+K**. Themes persist locally. Hash routes work on static hosts without rewrite configuration.

## Templates

The nine template pages are implemented in `src/templates/`. Use the **Templates** navigation item to browse them by category, or load a route directly. Each page has a **View source** action that loads the actual source file for inspection and copying. All page implementations and their data providers are lazy-loaded independently of the gallery.

The productivity pages share `WorkspaceProvider` from `src/templates/store.tsx`, persisted under the browser-local key `vagabond-template-workspace-v1`. Both template providers use a common transactional store that writes before an update returns. If storage is unavailable they work for the current session. Explicit Zod schemas validate stored data; invalid records fall back to the sample workspace. Install `zod` when copying the templates; the UI primitives do not require it.

- **Dashboard:** chart period selection, animated chart paths, CSV download, task completion, and task creation/editing.
- **Task workspace:** board/list layouts, search/status filters, card movement, edit sheet, delete and undo.
- **Settings:** workspace validation, save/discard, notification switches, member invitations and roles, removal/undo, and reset-to-sample confirmation.
- **Team chat:** channels and DMs, keyboard message composition, editing, deletion/undo, reactions, pinned-message filtering, threads, and mobile channel/member drawers.
- **HR:** search, department filter, table/card directory, employee profiles, new hires, onboarding checklists, leave requests, approvals, and decline reasons.
- **Sorting center:** scan/ID lookup, lane assignment, selection-based dispatch, exception reporting/resolution, tracking history, and queue export.
- **Pickup point:** location-specific queues, inbound receipt, shelf assignment, parcel lookup, collection-code validation, and completed collections.
- **Support inbox:** customer conversations, public replies, internal notes, saved replies, ownership, priority/status, new tickets, and linked parcel details.
- **Billing:** draft creation, status filtering, bulk sent-state updates, payment references, invoice details, and CSV exports.

The six business pages share `BusinessProvider` in `src/templates/business/store.tsx`, using the separate key `vagabond-business-templates-v1`. Sorting and pickup share parcel states; support tickets link to those same parcels. HR directory, onboarding, and leave views share employee data. The schema is checked before loading stored data; invalid data falls back to the fixtures.

Analytics and business records are sample data. Invitations/replies do not send email; payment recording does not charge money; collection codes validate against local fixtures. No backend is required. Reuse the template, its relative imports, shared provider, styles, and referenced library components when adopting it.

## Motion in the UI

- Tabs: a shared-layout selection indicator and a short panel entrance.
- Switches: spring-driven thumb movement.
- Accordion: measured-height expansion and collapse.
- Sheets: directional entrance/exit; menus: short scale/fade.
- Templates: staggered cards, chart-path drawing, metric changes, task-card movement, and saved-state feedback.
- Toasts: Sonner enter/exit behavior; action text is non-wrapping and non-shrinking.

Dialog centering remains layout-only; dialogs fade without moving. CSS and Motion both respect reduced-motion preferences.

## Design constraints

- **14px minimum** for all text: navigation, labels, helper text, code, tooltips, and metadata. Body text is 16px.
- Inputs use 16px on mobile to avoid automatic browser zoom.
- Dialog centering is CSS layout, independent of animation. Entrances use opacity only.
- Native controls and Radix primitives supply keyboard patterns and focus management.
- Composite components expose named parts and forward native/primitive props.
- Every example demonstrates an interaction or a concrete rendering pattern.
- Motion respects reduced-motion preferences.

See [the specification](docs/design-system.md), [the interface review](docs/review.md), and [the source review](docs/code-review.md).

## Tests

```sh
pnpm exec playwright install chromium
pnpm test:unit
pnpm test
```

Tests cover:

- Frame-by-frame modal centering with motion enabled, on desktop and mobile
- Computed font sizes and page overflow across all component and guide routes at 1440px, 390px, and 320px
- Keyboard search, select, radio group, checkbox, switch, and slider behavior
- Validation, focus restoration, nested dialogs, confirmation, sheets, menus, and toasts
- Clipboard content and pagination
- axe checks on the complete catalog in both themes
- Toast action geometry at 320px, 390px, and desktop widths
- Template CRUD, persistence, CSV export, member management, and source loading
- Template typography, overflow, and dark/light accessibility
- Presence of UI animations and reduced-motion behavior
- Chat threads, reactions, editing, direct-message isolation, and mobile navigation
- HR hiring, onboarding, leave approval/decline, and persistence
- End-to-end parcel processing, invalid scans/codes, exception resolution, and bulk dispatch
- Support notes/replies and linked parcels; invoice draft-to-paid flows and exports

Unit tests additionally cover persistence failure/recovery, schemas, route resolution, parcel commands, and CSV serialization. Run `pnpm format` after editing and `pnpm check` before submitting changes.

Commit `pnpm-lock.yaml` when changing dependencies with `pnpm add` or `pnpm update`. CI installs from that lockfile with `pnpm install --frozen-lockfile`. Dependency build scripts for esbuild and the optional macOS watcher are configured in `pnpm-workspace.yaml`.

Review screenshots are written to `test-results/`. GitHub Actions checks formatting and lint, runs unit tests, builds the app and library, runs browser tests, and uploads the results.

## Attribution

Independent implementation; not affiliated with Effect or shadcn. This catalog does not claim full parity with shadcn’s larger library. [Research notes](docs/research.md) describe the references and the Motion/GSAP decision.

Code is [MIT licensed](LICENSE). Dependencies and fonts retain their respective licenses.
