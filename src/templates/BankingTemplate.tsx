import { lazy, Suspense } from 'react'
import {
  ArrowLeftRight,
  CreditCard,
  House,
  Landmark,
  ListFilter,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import type { TemplateDefinition } from './catalog'
import { TemplateFrame } from './TemplateFrame'
import { BankingProvider, useBanking } from './banking/store'
import { bankHref, bankPages, type BankPage } from './banking/navigation'
import './banking/banking.css'

const views = {
  overview: lazy(() => import('./banking/Overview')),
  accounts: lazy(() => import('./banking/Accounts')),
  transactions: lazy(() => import('./banking/Transactions')),
  transfers: lazy(() => import('./banking/Transfers')),
  cards: lazy(() => import('./banking/Cards')),
}
const icons = {
  overview: House,
  accounts: Wallet,
  transactions: ListFilter,
  transfers: ArrowLeftRight,
  cards: CreditCard,
}

function BankingView({ template, bankPage }: { template: TemplateDefinition; bankPage: BankPage }) {
  const { persistent } = useBanking()
  const Page = views[bankPage]
  return (
    <TemplateFrame template={template} persistent={persistent}>
      <div className="banking-app bank-shell">
        <aside className="bank-sidebar">
          <a className="bank-shell-brand" href={bankHref('overview')}>
            <span className="bank-brand-mark">
              <Landmark size={22} />
            </span>
            <span>
              Meridian<span className="bank-brand-caption">Bank app</span>
            </span>
          </a>
          <nav className="bank-navigation" aria-label="Template navigation">
            {bankPages.map((page) => {
              const Icon = icons[page.id]
              return (
                <a
                  key={page.id}
                  href={bankHref(page.id)}
                  aria-label={page.label}
                  aria-current={page.id === bankPage ? 'page' : undefined}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span className="bank-nav-desktop-label">{page.label}</span>
                  <span className="bank-nav-mobile-label">{page.mobileLabel}</span>
                </a>
              )
            })}
          </nav>
          <div className="bank-sidebar-note">
            <ShieldCheck size={20} aria-hidden="true" />
            <p>
              Your money.
              <br />
              Your possibilities.
            </p>
            <span>Personal banking demo</span>
          </div>
        </aside>
        <div className="bank-main">
          <header className="bank-topbar">
            <div>
              <span className="bank-desktop-greeting">Your personal space</span>
              <span className="bank-mobile-brand">
                Meridian <span>Bank app</span>
              </span>
            </div>
            <div className="bank-profile">
              <span>Alex Morgan</span>
              <span className="workspace-user" aria-label="Signed in as Alex Morgan" role="img">
                AM
              </span>
            </div>
          </header>
          <Suspense
            fallback={
              <p role="status" className="p-8 text-muted">
                Loading your banking space…
              </p>
            }
          >
            <Page />
          </Suspense>
        </div>
      </div>
    </TemplateFrame>
  )
}

export default function BankingTemplate({
  template,
  bankPage = 'overview',
}: {
  template: TemplateDefinition
  bankPage?: BankPage
}) {
  return (
    <BankingProvider>
      <BankingView template={template} bankPage={bankPage} />
    </BankingProvider>
  )
}
