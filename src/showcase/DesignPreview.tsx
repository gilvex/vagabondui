import { useId, useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, Copy, Moon, Send, Sun } from 'lucide-react'
import { Badge } from 'vagabond-ui/badge'
import { Button } from 'vagabond-ui/button'
import { Input } from 'vagabond-ui/input'
import { Label } from 'vagabond-ui/label'
import { Switch } from 'vagabond-ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'vagabond-ui/table'
import { ToggleGroup, ToggleGroupItem } from 'vagabond-ui/toggle-group'
import { brands, isColorMode, type BrandId } from 'vagabond-ui/brands'
import { ActivityChart } from '../templates/Dashboard'
import { useAppearance } from './appearance'
import '../templates/templates.css'
import './design-preview.css'

function BrandSpecimen({ id }: { id: BrandId }) {
  const controlId = useId()
  const { brand, theme, setBrand } = useAppearance()
  const definition = brands.find((item) => item.id === id) || brands[0]
  const [saved, setSaved] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('Northstar')
  const [notifications, setNotifications] = useState(true)
  return (
    <article
      className={`brand-specimen ${brand === id ? 'selected' : ''}`}
      data-brand={id}
      data-theme={theme}
    >
      <header className="brand-specimen-heading">
        <div>
          <p>{definition.subtitle}</p>
          <h2>{definition.name}</h2>
        </div>
        <span className="specimen-mark" aria-hidden="true">
          <svg viewBox="0 0 30 32" fill="none">
            <path d="m2 5 10 23h6L28 5h-7l-6 15-6-15H2Z" fill="currentColor" />
          </svg>
        </span>
      </header>
      <p className="brand-specimen-description">{definition.description}</p>
      <div className="brand-specimen-controls">
        <div className="specimen-title">
          <h3>Workspace access</h3>
          <Badge tone="success">Active</Badge>
        </div>
        <div className="form-field">
          <Label htmlFor={`${controlId}-name`}>Workspace name</Label>
          <Input
            id={`${controlId}-name`}
            value={workspaceName}
            onChange={(event) => {
              setWorkspaceName(event.target.value)
              setSaved(false)
            }}
          />
        </div>
        <div className="specimen-setting">
          <Label htmlFor={`${controlId}-notifications`}>Email notifications</Label>
          <Switch
            id={`${controlId}-notifications`}
            checked={notifications}
            onCheckedChange={(value) => {
              setNotifications(value)
              setSaved(false)
            }}
          />
        </div>
        <div className="specimen-actions">
          <Button size="sm" onClick={() => setSaved(true)} disabled={!workspaceName.trim()}>
            {saved ? (
              <>
                <Check size={15} /> Saved
              </>
            ) : (
              'Save changes'
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSaved(false)
              setWorkspaceName('Northstar')
              setNotifications(true)
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      <div
        className="specimen-palette"
        aria-label={`${definition.name} surface and action colors`}
        role="img"
      >
        <span className="swatch-background" />
        <span className="swatch-surface" />
        <span className="swatch-raised" />
        <span className="swatch-primary" />
      </div>
      <div className="specimen-type">
        <span>{definition.headingFont}</span>
        <span>
          {definition.bodyFont === definition.headingFont
            ? definition.monoFont
            : definition.bodyFont}
        </span>
      </div>
      <footer>
        <Button
          variant={brand === id ? 'secondary' : 'outline'}
          onClick={() => setBrand(id)}
          aria-label={`Use ${definition.name} appearance`}
          aria-pressed={brand === id}
        >
          {brand === id ? (
            <>
              <Check size={16} /> Selected
            </>
          ) : (
            <>
              Apply {definition.name} <ArrowRight size={16} />
            </>
          )}
        </Button>
        <a
          href={definition.sourceUrl}
          target={id === 'vagabond' ? undefined : '_blank'}
          rel={id === 'vagabond' ? undefined : 'noreferrer'}
          aria-label={definition.source}
        >
          <ArrowUpRight size={17} />
        </a>
      </footer>
    </article>
  )
}

function ChatSpecimen() {
  const [draft, setDraft] = useState('')
  const [sent, setSent] = useState('')
  return (
    <div className="review-chat">
      <div className="review-message">
        <span className="review-avatar">JC</span>
        <div>
          <strong>
            Jordan Chen <span>09:24</span>
          </strong>
          <p>The interface review is ready. Take a look at the updated components.</p>
          <span className="review-reaction">✓ 2</span>
        </div>
      </div>
      {sent && (
        <p className="review-sent" role="status">
          {sent}
        </p>
      )}
      <form
        className="review-composer"
        onSubmit={(event) => {
          event.preventDefault()
          if (draft.trim()) {
            setSent(draft.trim())
            setDraft('')
          }
        }}
      >
        <Input
          aria-label="Preview message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message…"
          maxLength={120}
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send preview message"
          disabled={!draft.trim()}
        >
          <Send size={16} />
        </Button>
      </form>
    </div>
  )
}

function BillingSpecimen() {
  return (
    <div className="review-invoices">
      <div className="review-invoice-summary">
        <span>Outstanding</span>
        <strong>
          $1,529<span>.00</span>
        </strong>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Acme Studio</TableCell>
            <TableCell className="text-right">$249.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Atlas Commerce</TableCell>
            <TableCell className="text-right">$1,280.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

export function DesignPreview() {
  const { brand, theme, setTheme } = useAppearance()
  const selected = brands.find((item) => item.id === brand) || brands[0]
  const [copyState, setCopyState] = useState('Copy preview link')
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyState('Link copied')
    } catch {
      setCopyState('Copy the address bar URL')
    }
  }
  return (
    <div className="design-preview-page">
      <header className="design-preview-heading">
        <div>
          <p className="eyebrow">Design study · PersonalHeroSite × GilGil</p>
          <h1>Brand directions.</h1>
          <p>
            Compare the original system with two directions drawn from your sites. The components
            and interactions are the same; the visual character changes.
          </p>
        </div>
        <div className="review-current">
          <span className="review-current-dot" />
          <span>
            Currently viewing
            <strong>
              {selected.name} / {theme}
            </strong>
          </span>
        </div>
      </header>
      <div className="review-toolbar">
        <div>
          <h2>One system. Three presets.</h2>
          <p>Try the controls, then apply a direction to the full showcase.</p>
        </div>
        <div className="review-toolbar-actions">
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(value) => isColorMode(value) && setTheme(value)}
            aria-label="Preview color mode"
          >
            <ToggleGroupItem value="dark" aria-label="Dark preview">
              <Moon size={15} />
              <span>Dark</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="light" aria-label="Light preview">
              <Sun size={15} />
              <span>Light</span>
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" size="sm" onClick={copyLink} aria-label="Copy preview link">
            <Copy size={15} />
            <span role="status">{copyState}</span>
          </Button>
        </div>
      </div>
      <div className="brand-specimens">
        {brands.map((item) => (
          <BrandSpecimen key={item.id} id={item.id} />
        ))}
      </div>
      <section className="review-context-section">
        <div className="review-section-heading">
          <div>
            <p className="eyebrow">In context</p>
            <h2>See it in an application.</h2>
          </div>
          <p>The active preset carries into every template.</p>
        </div>
        <div className="review-context-grid">
          <article className="review-reference">
            <header>
              <span>01 / Analytics</span>
              <h3>Dashboard</h3>
            </header>
            <div className="review-chart">
              <ActivityChart period="week" />
            </div>
            <footer>
              <p>Brand-colored data, calmer surfaces, clearer hierarchy.</p>
              <Button variant="outline" asChild>
                <a href="#template/dashboard">
                  Explore dashboard <ArrowRight size={16} />
                </a>
              </Button>
            </footer>
          </article>
          <article className="review-reference">
            <header>
              <span>02 / Collaboration</span>
              <h3>Team chat</h3>
            </header>
            <ChatSpecimen />
            <footer>
              <p>Accent-led navigation, readable messages, deliberate contrast.</p>
              <Button variant="outline" asChild>
                <a href="#template/chat">
                  Explore chat <ArrowRight size={16} />
                </a>
              </Button>
            </footer>
          </article>
          <article className="review-reference">
            <header>
              <span>03 / Client workspace</span>
              <h3>Billing & invoices</h3>
            </header>
            <BillingSpecimen />
            <footer>
              <p>Editorial typography, warm panels, and confident actions.</p>
              <Button variant="outline" asChild>
                <a href="#template/billing">
                  Explore billing <ArrowRight size={16} />
                </a>
              </Button>
            </footer>
          </article>
        </div>
      </section>
      <section className="review-notes">
        <div>
          <h2>What this pass changes</h2>
          <p>A first visual pass for your review, grounded in the two sites.</p>
        </div>
        <dl>
          <div>
            <dt>Typography</dt>
            <dd>
              Manrope headings, DM Sans interface text, IBM Plex Mono details. The original preset
              keeps Inter.
            </dd>
          </div>
          <div>
            <dt>Color with a role</dt>
            <dd>
              Primary actions, active navigation, focus, and chart emphasis share a brand token.
              Feedback retains its semantic colors.
            </dd>
          </div>
          <div>
            <dt>Readable by default</dt>
            <dd>
              16px body copy, a 14px text floor, both color modes, and the same keyboard and
              reduced-motion behavior.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
