import { useState, type ReactNode } from 'react'
import { ArrowUpRight, Check, Copy, RotateCcw } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Button, Card, CardContent, transitions } from '../lib'
import { catalog, type DocPageId } from './catalog'
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
        Source-owned components for React 19 and Tailwind CSS 4. The library is not published to
        npm.
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
      <Section title="Copy the components">
        <p>
          Copy the component files you need from <code>src/components/ui/</code>, together with{' '}
          <code>src/lib/utils.ts</code> and <code>src/lib/tokens.css</code>. The files use relative
          imports internally, so preserve the same folder structure.
        </p>
        <CodeBlock
          label="Terminal"
          code={
            'pnpm add radix-ui lucide-react class-variance-authority clsx tailwind-merge\n# Command, Toast, and animated Tabs/Switch utilities:\npnpm add cmdk sonner motion\n# Optional self-hosted fonts:\npnpm add @fontsource-variable/inter @fontsource-variable/jetbrains-mono'
          }
        />
      </Section>
      <Section title="Configure styles and imports">
        <p>
          Add <code>@tailwindcss/vite</code> to your Vite plugins. Import the tokens through your
          application stylesheet and declare its source directory. Configure <code>@/</code> to
          resolve to <code>src/</code>, or replace the example aliases with your own relative
          imports.
        </p>
        <CodeBlock label="src/styles.css" code={'@import "./lib/tokens.css";\n@source "./";'} />
        <CodeBlock
          code={
            'import "@fontsource-variable/inter"\nimport "@fontsource-variable/jetbrains-mono"\nimport "./styles.css"\n\nimport { Button } from "@/components/ui/button"\n\nexport function SaveButton() {\n  return <Button onClick={() => console.log("Saved")}>Save changes</Button>\n}'
          }
        />
      </Section>
      <Section title="Component structure">
        <CodeBlock
          label="Files"
          code={
            'src/\n  components/\n    ui/\n      accordion.tsx\n      button.tsx\n      dialog.tsx\n      ...\n  lib/\n    utils.ts\n    tokens.css\n    index.ts       # Optional barrel export'
          }
        />
        <p>
          Components expose composable parts such as <code>DialogHeader</code>,{' '}
          <code>DialogTitle</code>, and <code>DialogFooter</code>. This follows shadcn’s
          source-owned structure; it does not depend on shadcn’s CLI or registry.
        </p>
      </Section>
      <Section title="Build and test">
        <CodeBlock
          label="Terminal"
          code={'pnpm build\npnpm build:lib\npnpm exec playwright install chromium\npnpm test'}
        />
        <p>
          The library build emits ES modules, CSS, and declarations to <code>dist-lib/</code>.
          Import its stylesheet explicitly when consuming the built output.
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
          Each family has a source file in <code>src/components/ui/</code>. Composite components
          expose named parts. Examples use direct imports, and each component has a dedicated
          documentation route.
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
      <Section title="Unreleased — Business applications">
        <ul className="doc-list">
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
        </ul>
      </Section>
      <Section title="Unreleased — Templates and motion">
        <ul className="doc-list">
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
        </ul>
      </Section>
      <Section title="0.2.0 — Component expansion">
        <ul className="doc-list">
          <li>Expanded the catalog from 10 to {catalog.length} component families.</li>
          <li>Moved components into individual files with composable APIs.</li>
          <li>Added dedicated documentation routes for every component.</li>
          <li>Fixed dialog entrance positioning by separating layout from animation.</li>
          <li>Set a 14px minimum for all typography and 16px body text.</li>
          <li>Replaced promotional sections with a documentation-first layout.</li>
        </ul>
      </Section>
      <Section title="0.1.0 — Initial release">
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
