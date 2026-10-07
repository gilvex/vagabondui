# Vagabond UI

38 React component families, ten application templates with fourteen interactive pages, and three coordinated visual presets. Built with React 19, TypeScript, Radix, Tailwind CSS 4, and Motion.

**[Live showcase](https://gilvex.github.io/vagabondui/) · [Templates](https://gilvex.github.io/vagabondui/#templates) · [Design preview](https://gilvex.github.io/vagabondui/#design-preview) · [Changelog](https://gilvex.github.io/vagabondui/#changelog)**

## Repository layout

This is a pnpm workspace. The root application consumes the library through a real workspace dependency:

```text
packages/ui/              Publishable vagabond-ui package
  src/components/ui/     Component implementations and internal behavior
  src/lib/               Public exports, tokens, helpers, and motion
  dist/                  Generated ESM, declarations/maps, and compiled CSS
src/                     Showcase application and templates
tests/                   Browser tests and the isolated consumer fixture
scripts/                 Package verification and release helpers
docs/                    Design, research, and integration guides
```

The showcase declares `"vagabond-ui": "workspace:*"`. It imports the public package API rather than maintaining another copy of the components.

## Run locally

Requires Node.js 22.13+ (22.x) or 24+. CI uses Node 24. pnpm **10.34.6** is pinned in `package.json`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Vite normally serves `http://localhost:5173`. Development uses the package's opt-in source condition for live component updates. Production builds consume the compiled package.

```sh
pnpm build:lib     # Build packages/ui/dist
pnpm build         # Build the library and root-hosted showcase
pnpm build:pages   # Build the library and /vagabondui/ Pages showcase
pnpm preview       # Preview dist/
pnpm preview:pages # Preview dist-pages/ on port 4174
pnpm check         # Formatting, lint, unit/browser tests, builds, and package verification
```

## Install the library

The package name is [`vagabond-ui`](https://www.npmjs.com/package/vagabond-ui). Version **0.4.0** adds Action Bar for bulk actions and save/discard workflows. See the [release notes](CHANGELOG.md) for details.

### Install a local tarball with npm

```sh
# In this repository:
pnpm package:pack

# In a separate React application; adjust the path to this checkout:
npm install /path/to/vagabondui/artifacts/vagabond-ui-0.4.0.tgz
```

### Install from npm

```sh
npm install vagabond-ui@^0.4.0 react@^19 react-dom@^19
```

React and React DOM are peers; implementation dependencies are installed automatically. The root application remains private and cannot accidentally be published as the UI package.

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

Root imports such as `import { Button, SelectTree } from 'vagabond-ui'` work too. Every component has a typed subpath export, plus `utils`, `brands`, and `motion` helpers. The ESM package provides declarations and declaration maps for modern TypeScript resolution (`bundler` / `NodeNext`).

### Workspace dependency

Include `packages/ui` in a pnpm workspace and declare this dependency in the consuming application:

```json
{
  "dependencies": {
    "vagabond-ui": "workspace:*"
  }
}
```

Build with `pnpm --filter vagabond-ui build` before using the compiled exports. This repository demonstrates source-aware development and production package consumption. See [the packaging guide](docs/packaging.md) for both modes and npm-workspace guidance.

### CSS and fonts

Choose one CSS entry:

- **`vagabond-ui/styles.css`** — precompiled utilities, semantic tokens, and base reset. No Tailwind build step is needed.
- **`vagabond-ui/tailwind.css`** — source entry for a Tailwind CSS 4 application; scans the packaged component source.

```css
/* src/styles.css in a Tailwind CSS 4 app */
@import 'vagabond-ui/tailwind.css';
@source './';
```

Fonts are consumer-owned. The default preset uses Inter and JetBrains Mono; Gilvex/GilGil use Manrope, DM Sans, and IBM Plex Mono. The showcase self-hosts them with Fontsource. Without those fonts the component CSS uses its sans-serif/monospace fallbacks.

## Components

| Category   | Families                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------- |
| Actions    | Action Bar, Button, Dropdown Menu, Toggle, Toggle Group                                         |
| Forms      | Checkbox, Field, Input, Label, Radio Group, Select, Select Tree, Slider, Switch, Textarea       |
| Display    | Accordion, Avatar, Badge, Card, Collapsible, Scroll Area, Separator, Table                      |
| Feedback   | Alert, Alert Dialog, Dialog, Drawer, Fridge, Popover, Progress, Sheet, Skeleton, Toast, Tooltip |
| Navigation | Breadcrumb, Command, Pagination, Tabs                                                           |

Select Tree supports searchable hierarchies, selectable groups, optional icons, keyboard navigation, and native form behavior. [Experiment notes](docs/select-tree.md).

## Application templates

| Route                             | Features                                                 |
| --------------------------------- | -------------------------------------------------------- |
| `/#template/dashboard`            | Metrics, animated chart, CSV export, task overview       |
| `/#template/projects`             | Board/list, filtering, editing, movement, delete/undo    |
| `/#template/settings`             | Validation, notifications, members, reset                |
| `/#template/chat`                 | Channels, DMs, threads, reactions, pins, message editing |
| `/#template/hr`                   | Directory, profiles, leave approvals, onboarding         |
| `/#template/sorting`              | Barcode lookup, lanes, bulk dispatch, exceptions         |
| `/#template/pickup`               | Arrivals, shelf assignment, verified collection          |
| `/#template/support`              | Replies, internal notes, ownership, linked orders        |
| `/#template/billing`              | Drafts, payment records, invoice details, exports        |
| `/#template/banking`              | Bank app: overview, accounts, activity, transfers, cards |
| `/#template/banking/accounts`     | Checking/savings accounts and masked account details     |
| `/#template/banking/transactions` | Search, account/status filters, details, CSV export      |
| `/#template/banking/transfers`    | Validated transfers, review, receipts, shared balances   |
| `/#template/banking/cards`        | Physical/virtual cards, freeze controls, monthly limits  |

Templates are application examples in the repository, not part of the npm tarball. They use public library imports and browser-local sample data. Sorting/pickup/support share parcel records. Invitations and replies do not send email; payment recording does not charge money. [Template guide](docs/templates.md).

### Bank app · Meridian

Five connected pages live in `src/templates/banking/`, wrapped by `BankingTemplate.tsx`. They share `BankingProvider` and the separate local-storage key `vagabond-banking-template-v1`. The overview shows September 2026 sample cash flow and current available balances; internal transfers are excluded from income and spending.

The gallery and search expose a single **Bank app** entry. Its internal routes support refresh and browser history; the old `banking-accounts`, `banking-transactions`, `banking-transfers`, and `banking-cards` links still work. Desktop uses a sidebar and spacious control panels. Mobile uses a five-item bottom navigation, swipeable account summaries, and activity lists instead of wide tables.

Card illustrations cap at **336px wide** with a **1.586:1** credit-card aspect ratio. They shrink only when space is constrained and never stretch to fill a desktop panel. Forest brushed and graphite satin finishes use CSS textures; the gold chip is an inline SVG with engraved contacts and metallic highlights. The layout takes inspiration from card-first mobile banking patterns, while keeping Meridian branding and the shared theme tokens.

Transfers use integer cents, check the latest available balance, require a review step, and atomically update both accounts and both ledger entries. Repeated confirmations cannot duplicate a transfer. Card freeze/online-payment controls and validated monthly limits persist across pages and reloads. Transaction exports respect the active search, account, and status filters.

All accounts and cards are fixtures with masked numbers. Available balances already include pending holds. Transfers and card controls simulate local state only. To reuse the suite, install the UI package and copy `banking/`, its shared `persistent-store.ts` and `csv.ts` dependencies, and the template frame/styles; adapt hash links to your router. Clear `vagabond-banking-template-v1` from browser storage and reload to restore the sample data.

## Design and accessibility

- 14px minimum text; 16px body copy and mobile input text.
- Semantic light/dark tokens with neutral, Gilvex, and GilGil presets.
- Stable dialog centering, keyboard focus management, and reduced-motion support.
- Radix behavior for complex primitives; native HTML behavior for form controls.

Set `data-theme="light"` / `"dark"` and `data-brand="vagabond"` / `"gilvex"` / `"gilgil"` on the document root. See [the design specification](docs/design-system.md), [brand preview](docs/design-preview.md), and [source review](docs/code-review.md).

## Verification and release

```sh
pnpm exec playwright install chromium
pnpm test:unit
pnpm test
pnpm test:package
```

`test:package` builds and packs the library, inspects its exports and file list, and creates a temporary consumer **outside this repository**. It installs the tarball with npm, checks declarations with `skipLibCheck: false`, imports every JS entry, checks React peer identity, and exercises a production build in a browser using only the compiled package CSS.

Browser and domain tests also cover banking transfer validation, balance conservation, review/confirmation, persistence, filtered exports, card controls, and all five responsive banking routes.

The resulting tarball, file inventory, and consumer screenshot are written to ignored `artifacts/`. CI uploads them as `ui-package`. Component/browser screenshots are in `test-results/`.

The manual **Publish UI package** workflow is prepared for npm trusted publishing. It is not triggered by normal pushes and requires npm-side publisher configuration. First-publication and OIDC setup instructions are in [docs/packaging.md](docs/packaging.md).

## Showcase deployment

Successful pushes to `main` deploy the showcase to [GitHub Pages](https://gilvex.github.io/vagabondui/). Pull requests run the checks without publishing. Pages uses `dist-pages/` and a `/vagabondui/` asset base; root-hosted services can use `dist/`.

`pnpm test:pages` tests a Pages build locally. Set `SHOWCASE_URL` to a published URL with a trailing slash to run those smoke tests against that deployment.

## Attribution

Independent implementation inspired by Effect's visual language and shadcn's source-owned conventions. Not affiliated with either project. [Research notes](docs/research.md).

Code is [MIT licensed](LICENSE). Dependencies and fonts retain their respective licenses.
