import { useState, type ReactNode } from 'react'
import { ArrowUpRight, Check, Copy, RotateCcw } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Button, Card, CardContent, transitions } from 'vagabond-ui'
import type { DocPageId } from './catalog'
import { CodeBlock } from './CodeBlock'
import { useAppearance } from './appearance'

function Heading({ title, children }: { title: string; children: ReactNode }) {
  return (
    <header className="doc-heading">
      <h1>{title}</h1>
      <p>{children}</p>
    </header>
  )
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="doc-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

const colors = [
  ['Background', '--background', '#09090b', '#fafafa'],
  ['Surface', '--surface', '#101012', '#ffffff'],
  ['Raised', '--surface-raised', '#18181b', '#f0f0f2'],
  ['Border', '--border', '#27272b', '#e0e0e5'],
  ['Foreground', '--foreground', '#f4f4f5', '#18181b'],
  ['Muted', '--muted', '#a1a1aa', '#62626d'],
  ['Accent', '--accent', '#d4f5a0', '#d4f5a0'],
  ['Success', '--success', '#99dca7', '#28753a'],
  ['Warning', '--warning', '#f2cc8f', '#876020'],
  ['Danger', '--danger', '#fda4af', '#b91c36'],
  ['Info', '--info', '#9ebeff', '#335db6'],
]

function Colors() {
  const { theme } = useAppearance()
  const [copied, setCopied] = useState('')
  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(`var(${token})`)
      setCopied(token)
    } catch {
      setCopied('Clipboard unavailable. Select the token to copy it.')
    }
  }
  return (
    <>
      <Heading title="Colors">
        The default Vagabond palette, shown in light and dark values. Components reference a color’s
        role rather than a hard-coded value. Brand overrides are available in the Design preview.
      </Heading>
      <div className="token-grid" data-brand="vagabond" data-theme={theme}>
        {colors.map(([name, token, dark, light]) => (
          <article className="token-card" key={token}>
            <div className="token-swatch" style={{ background: `var(${token})` }} />
            <div className="token-info">
              <div className="flex items-center justify-between">
                <h2>{name}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copy(token)}
                  aria-label={`Copy ${name} token`}
                >
                  {copied === token ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
              <code>{token}</code>
              <dl>
                <div>
                  <dt>Dark</dt>
                  <dd>{dark}</dd>
                </div>
                <div>
                  <dt>Light</dt>
                  <dd>{light}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
      <p role="status" className="mt-4 min-h-6 text-sm text-muted">
        {copied && (copied.startsWith('--') ? `Copied var(${copied})` : copied)}
      </p>
      <Section title="Usage">
        <p>
          Set <code>data-theme="light"</code> on the document root to change themes. Use the accent
          for surfaces; use the success token for green text, since the pale accent is not readable
          on white.
        </p>
        <CodeBlock
          code={
            '<div className="border border-border bg-surface text-foreground">\n  <p className="text-muted">Supporting text</p>\n</div>'
          }
        />
      </Section>
    </>
  )
}

function Typography() {
  const { theme } = useAppearance()
  return (
    <>
      <Heading title="Typography">
        The original preset uses Inter and JetBrains Mono. Gilvex and GilGil introduce Manrope, DM
        Sans, and IBM Plex Mono in the Design preview. All presets keep a 14px minimum.
      </Heading>
      <div className="type-pair" data-brand="vagabond" data-theme={theme}>
        <Card>
          <CardContent>
            <p className="text-sm text-muted">Interface</p>
            <p className="type-specimen">Aa</p>
            <h2>Inter Variable</h2>
            <p className="text-muted">Headings, body text, labels, and controls.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted">Code</p>
            <p className="type-specimen font-mono">Aa</p>
            <h2>JetBrains Mono</h2>
            <p className="text-muted">Code examples, tokens, and values.</p>
          </CardContent>
        </Card>
      </div>
      <Section title="Type scale">
        <div className="type-scale">
          {[
            { name: 'Display', size: 48, sample: 'Component library' },
            { name: 'Page heading', size: 36, sample: 'Project settings' },
            { name: 'Section heading', size: 24, sample: 'Workspace members' },
            { name: 'Subheading', size: 20, sample: 'Notification preferences' },
            { name: 'Body', size: 16, sample: 'Choose how you receive project updates.' },
            { name: 'Label and code', size: 14, sample: 'Email notifications' },
          ].map((item) => (
            <div key={item.name} className="type-row">
              <div>
                <span>{item.name}</span>
                <code>{item.size}px</code>
              </div>
              <p style={{ fontSize: `${item.size}px` }}>{item.sample}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Readability">
        <p>
          Body copy is 16px with a 1.6 line height. Labels, metadata, helper text, and code are 14px
          with at least a 1.5 line height. Inputs use 16px on mobile to avoid automatic browser
          zoom.
        </p>
        <p>
          If a label no longer fits, the container should grow, wrap, or scroll. Do not shrink the
          text to fit the layout.
        </p>
      </Section>
    </>
  )
}

function Spacing() {
  return (
    <>
      <Heading title="Spacing & layout">
        A 4px spacing scale, fluid content, and explicit overflow handling.
      </Heading>
      <Section title="Spacing scale">
        <div className="spacing-scale">
          {[4, 8, 12, 16, 24, 32, 48, 64, 96].map((value) => (
            <div key={value}>
              <code>{value}px</code>
              <span style={{ width: `${value * 3}px` }} />
              <code>space-{value / 4}</code>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Layout rules">
        <ul className="doc-list">
          <li>Use 16px between related controls and 32–48px between sections.</li>
          <li>
            Use a minimum card width of 340px where space permits. On phones, use a single column.
          </li>
          <li>Keep controls at least 36px tall; use 40px for default buttons and inputs.</li>
          <li>Use 6px radii on controls and 8px on surfaces.</li>
          <li>Tables and code blocks scroll horizontally instead of shrinking text.</li>
        </ul>
        <CodeBlock
          code={
            '<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">\n  {/* Keep every label at 14px or larger. */}\n</div>'
          }
        />
      </Section>
    </>
  )
}

function MotionPage() {
  const [replay, setReplay] = useState(0)
  const [position, setPosition] = useState(false)
  const reduced = useReducedMotion()
  return (
    <>
      <Heading title="Motion">
        Use animation to show a state change. Layout and readability must not depend on it.
      </Heading>
      <div className="mb-6 flex justify-end">
        <Button variant="outline" onClick={() => setReplay(replay + 1)}>
          <RotateCcw size={16} /> Replay
        </Button>
      </div>
      <div className="motion-grid">
        <Card>
          <div className="motion-stage">
            <motion.div
              key={replay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
              className="motion-tile"
            >
              <ArrowUpRight size={24} />
            </motion.div>
          </div>
          <CardContent>
            <h2>Fade</h2>
            <p>200ms opacity transition. No positional change.</p>
          </CardContent>
        </Card>
        <Card>
          <div className="motion-stage">
            <button
              className="spring-track"
              aria-label="Toggle spring position"
              aria-pressed={position}
              onClick={() => setPosition(!position)}
            >
              <motion.span
                animate={{ x: position ? 88 : 0 }}
                transition={reduced ? { duration: 0 } : transitions.spring}
              />
            </button>
          </div>
          <CardContent>
            <h2>State transition</h2>
            <p>Spring: stiffness 380, damping 30.</p>
          </CardContent>
        </Card>
      </div>
      <Section title="Dialog positioning">
        <p>
          Dialogs are centered by a fixed CSS grid container. Their opacity animates, but their
          position does not. The entrance animation never overrides the centering layout.
        </p>
      </Section>
      <Section title="Motion in the interface">
        <ul className="doc-list">
          <li>
            Tabs use a shared-layout selection indicator. Switch thumbs respond with a spring.
          </li>
          <li>
            Accordion panels animate their measured height; sheets slide from the selected edge.
          </li>
          <li>
            Template charts draw their paths when the period changes, and task cards animate between
            board columns.
          </li>
          <li>
            Cards enter with a short stagger; saved-state messages transition after a form
            submission.
          </li>
        </ul>
        <div className="source-links mt-6">
          <a href="#template/dashboard">
            Try the dashboard chart <ArrowUpRight size={16} />
          </a>
          <a href="#template/projects">
            Try moving a task <ArrowUpRight size={16} />
          </a>
          <a href="#component/tabs">
            Try the animated tabs <ArrowUpRight size={16} />
          </a>
        </div>
      </Section>
      <Section title="Reduced motion">
        <p>
          Respect the operating system preference with{' '}
          <code>MotionConfig reducedMotion="user"</code>. CSS transitions and loading pulses are
          also disabled under <code>prefers-reduced-motion</code>.
        </p>
        <CodeBlock
          code={
            'import { MotionConfig } from "motion/react"\n\n<MotionConfig reducedMotion="user">\n  <App />\n</MotionConfig>'
          }
        />
      </Section>
      <Section title="Library choice">
        <p>
          Motion fits state-driven React interactions. GSAP is a strong option for coordinated
          timelines, scroll scenes, and canvas animation. Neither has a special dependency on the
          Effect runtime.
        </p>
        <div className="source-links">
          <a href="https://motion.dev/docs/react" target="_blank" rel="noreferrer">
            Motion documentation <ArrowUpRight size={16} />
          </a>
          <a href="https://gsap.com/resources/React/" target="_blank" rel="noreferrer">
            GSAP React integration <ArrowUpRight size={16} />
          </a>
        </div>
      </Section>
    </>
  )
}

function Installation() {
  return (
    <>
      <Heading title="Installation">
        Use Vagabond UI as an npm-compatible package or a workspace dependency. React 19 is
        required. Install from npm, use a packed tarball, or link it in your monorepo.
      </Heading>
      <Section title="Run this repository">
        <p>
          Use Node.js 22.13+ (22.x) or 24+. CI uses Node 24. The pnpm version is pinned in
          package.json.
        </p>
        <CodeBlock
          label="Terminal"
          code={'corepack enable\npnpm install --frozen-lockfile\npnpm dev'}
        />
      </Section>
      <Section title="Install the package">
        <p>
          Install version 0.4.0 for Action Bar and the full component catalog. React and React DOM
          are peers; implementation dependencies install automatically.
        </p>
        <CodeBlock
          label="Terminal"
          code={
            'npm install vagabond-ui@^0.4.0 react@^19 react-dom@^19\n\n# Or test a local build from this repository:\npnpm package:pack\n\n# In a separate app, using the generated archive:\nnpm install /path/to/artifacts/vagabond-ui-0.4.0.tgz'
          }
        />
      </Section>
      <Section title="Use compiled styles">
        <p>
          Import the stylesheet once. It includes component utilities, semantic themes, and a base
          reset, so a Tailwind build step is optional. Fonts are supplied by your application.
        </p>
        <CodeBlock
          code={
            'import "vagabond-ui/styles.css"\nimport { Button } from "vagabond-ui/button"\n\nexport function SaveButton() {\n  return <Button onClick={() => console.log("Saved")}>Save changes</Button>\n}'
          }
        />
      </Section>
      <Section title="Tailwind CSS 4 integration">
        <p>
          For an application that already uses Tailwind, use the source stylesheet instead of the
          precompiled one. Configure the Tailwind Vite plugin and declare your application source
          directory.
        </p>
        <CodeBlock
          label="src/styles.css"
          code={'@import "vagabond-ui/tailwind.css";\n@source "./";'}
        />
      </Section>
      <Section title="Workspace dependency">
        <p>
          The showcase consumes the UI package using the same dependency setup. The default exports
          point to compiled modules; Vite development opts into a source condition for live updates.
        </p>
        <CodeBlock
          label="package.json"
          code={'{\n  "dependencies": {\n    "vagabond-ui": "workspace:*"\n  }\n}'}
        />
        <CodeBlock
          label="Files"
          code={
            'packages/ui/\n  src/components/ui/   # Component source\n  src/lib/             # Tokens, helpers, exports\n  dist/                # Built ESM, types, and CSS\nsrc/                   # Showcase using workspace:*'
          }
        />
        <p>
          Component subpaths such as <code>vagabond-ui/dialog</code> expose composable parts and
          TypeScript declarations. The tarball also includes source files if you prefer to copy and
          adapt a component.
        </p>
      </Section>
      <Section title="Build and test">
        <CodeBlock
          label="Terminal"
          code={
            'pnpm build:lib\npnpm exec playwright install chromium\npnpm check\n\n# Verify only the packed distribution:\npnpm test:package'
          }
        />
        <p>
          The library build writes to <code>packages/ui/dist/</code>. Package verification installs
          the tarball with npm in an isolated application, type-checks its declarations, and tests
          the production output in a browser.
        </p>
      </Section>
    </>
  )
}

function Principles() {
  return (
    <>
      <Heading title="Design principles">
        Conventions for adding components and reviewing changes.
      </Heading>
      <div className="principle-grid">
        {[
          [
            'Readable at default zoom',
            '14px is the minimum for all text, including metadata, code, tooltips, and navigation. Body text is 16px.',
          ],
          [
            'Native behavior first',
            'Use actual buttons, labels, and form controls. Use Radix for interactions that need focus management or keyboard patterns.',
          ],
          [
            'Source-owned components',
            'One component family per file. Forward native and primitive props. Keep styling overrides predictable with cn().',
          ],
          [
            'Content before decoration',
            'Document behavior and usage. Avoid slogans, decorative status badges, and repeated promotional sections.',
          ],
          [
            'Stable layout',
            'Do not animate centering properties. Provide overflow for long code, tables, and labels. Keep dialogs within the viewport.',
          ],
          [
            'Test the interaction',
            'Check keyboard behavior, focus restoration, disabled states, light and dark contrast, and reduced-motion preferences.',
          ],
        ].map(([title, text]) => (
          <Card key={title}>
            <CardContent>
              <h2>{title}</h2>
              <p>{text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

function Research() {
  return (
    <>
      <Heading title="Reference notes">
        Effect’s website informed the palette and typography. shadcn/ui informed the component
        organization and documentation structure.
      </Heading>
      <Section title="Effect website">
        <p>
          The Effect 4.0 release page uses zinc surfaces, Inter and JetBrains Mono, one-pixel
          borders, and a restrained article layout. Vagabond keeps those broad visual conventions,
          with its own tokens and components.
        </p>
        <p>
          The earlier showcase added geometric artwork, repeated slogans, and undersized metadata.
          Those additions have been removed. The current interface prioritizes component previews,
          source examples, and navigation.
        </p>
      </Section>
      <Section title="shadcn-style structure">
        <p>
          Each family has a source file in <code>packages/ui/src/components/ui/</code>. Composite
          components expose named parts. Examples use direct imports, and each component has a
          dedicated documentation route.
        </p>
        <p>
          This is an independent library, not an official shadcn registry and not an Effect product.
          It does not claim full feature parity with shadcn’s larger catalog.
        </p>
      </Section>
      <Section title="Sources">
        <div className="source-links">
          <a href="https://effect.website/blog/releases/effect/40" target="_blank" rel="noreferrer">
            Effect 4.0 release page <ArrowUpRight size={16} />
          </a>
          <a href="https://ui.shadcn.com/docs/components" target="_blank" rel="noreferrer">
            shadcn/ui component index <ArrowUpRight size={16} />
          </a>
          <a
            href="https://www.radix-ui.com/primitives/docs/overview/accessibility"
            target="_blank"
            rel="noreferrer"
          >
            Radix accessibility <ArrowUpRight size={16} />
          </a>
          <a href="https://motion.dev/docs/react" target="_blank" rel="noreferrer">
            Motion for React <ArrowUpRight size={16} />
          </a>
          <a href="https://gsap.com/resources/React/" target="_blank" rel="noreferrer">
            GSAP and React <ArrowUpRight size={16} />
          </a>
        </div>
      </Section>
    </>
  )
}

function Changelog() {
  return (
    <>
      <Heading title="Changelog">Changes to the component library and documentation.</Heading>
      <Section title="0.4.0 — Action Bar">
        <p>
          <time dateTime="2026-10-07">October 7, 2026</time> · 38 component families
        </p>
        <ul className="doc-list">
          <li>
            Added a bottom Action Bar with floating/docked styles and fixed, sticky, or inline
            placement.
          </li>
          <li>
            Included non-modal toolbar keyboard navigation, focus restoration, reduced motion, and
            mobile safe-area spacing.
          </li>
          <li>
            Added interactive file-selection and save/discard examples, with pattern references and
            API documentation.
          </li>
          <li>
            Added typed root and subpath exports, compiled styles, and composable label, group,
            button, close, and separator parts.
          </li>
          <li>
            Verified keyboard navigation, nested menus, disabled actions, focus restoration after
            archiving all rows, all-brand light/dark accessibility, narrow layouts, and isolated
            package consumption.
          </li>
        </ul>
        <CodeBlock label="Update from npm" code="npm install vagabond-ui@^0.4.0" />
      </Section>
      <Section title="0.3.0 — Drawer and Fridge">
        <p>
          <time dateTime="2026-10-07">October 7, 2026</time> · 37 component families
        </p>
        <ul className="doc-list">
          <li>
            Added <a href="#component/drawer">Drawer</a>, an animated bottom panel with a working
            report-scheduling example.
          </li>
          <li>
            Added <a href="#component/fridge">Fridge</a>, the right-opening Drawer variant, with
            editable order details and a nested cancellation confirmation.
          </li>
          <li>
            Both panels support handle-only drag dismissal, independently scrolling content, pinned
            footers, keyboard focus management, and reduced motion.
          </li>
          <li>
            Added typed root and subpath exports, compiled styles, and usage/API documentation for
            both components.
          </li>
          <li>
            Improved primary-button hover contrast in light themes and overlay focus restoration
            when the previous target was the document body.
          </li>
          <li>
            Added mouse/touch gesture, nested overlay, narrow-screen, all-brand accessibility, and
            isolated package-consumer checks.
          </li>
          <li>
            Unified the Meridian Bank app into one template with five internal pages, responsive
            navigation, and textured payment cards.
          </li>
        </ul>
        <CodeBlock label="Update from npm" code="npm install vagabond-ui@^0.3.0" />
      </Section>
      <Section title="0.2.0 — Package and component expansion">
        <p>
          <time dateTime="2026-10-03">October 3, 2026</time> · First npm package release
        </p>
        <ul className="doc-list">
          <li>
            Published the ESM package with TypeScript declarations, source files, compiled CSS, and
            Tailwind CSS 4 integration.
          </li>
          <li>Added Vagabond, Gilvex, and GilGil visual presets with light and dark themes.</li>
          <li>Added an opt-in hierarchical picker with searchable branches and selected paths.</li>
          <li>
            Included keyboard navigation, disabled choices, selectable groups, and native form
            integration.
          </li>
          <li>Added location and project-scope examples alongside the existing flat Select.</li>
          <li>
            Expanded the template catalog to nine pages, with category filtering and independent
            loading.
          </li>
          <li>Added team chat with channels, DMs, threads, reactions, and pins.</li>
          <li>Added HR directory, employee profiles, leave approvals, and onboarding.</li>
          <li>
            Connected sorting-center and pickup-point workflows through shared parcel records.
          </li>
          <li>Added a support inbox with linked orders and a billing/invoice ledger.</li>
          <li>
            Added dashboard, task workspace, and settings templates with shared browser-local state.
          </li>
          <li>
            Added source inspection, CSV export, task editing, and member management examples.
          </li>
          <li>
            Added shared-layout tabs, spring switches, expanding accordions, sliding sheets, and
            animated task cards.
          </li>
          <li>Fixed notification actions shrinking and wrapping on narrow screens.</li>
          <li>Expanded the catalog from 10 to 35 component families, including Select Tree.</li>
          <li>Moved components into individual files with composable APIs.</li>
          <li>Added dedicated documentation routes for every component.</li>
          <li>Fixed dialog entrance positioning by separating layout from animation.</li>
          <li>Set a 14px minimum for all typography and 16px body text.</li>
          <li>Replaced promotional sections with a documentation-first layout.</li>
        </ul>
      </Section>
      <Section title="0.1.0 — Initial source preview">
        <p>
          Initial React and Tailwind implementation with semantic themes and ten component families.
        </p>
      </Section>
    </>
  )
}

export function Docs({ page }: { page: DocPageId }) {
  const content = {
    colors: <Colors />,
    typography: <Typography />,
    spacing: <Spacing />,
    motion: <MotionPage />,
    installation: <Installation />,
    principles: <Principles />,
    research: <Research />,
    changelog: <Changelog />,
    overview: null,
    components: null,
    templates: null,
    'design-preview': null,
  }[page]
  return <div className="docs-page">{content}</div>
}
