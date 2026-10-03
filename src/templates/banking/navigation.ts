export const bankPages = [
  { id: 'overview', label: 'Overview', mobileLabel: 'Home' },
  { id: 'accounts', label: 'Accounts', mobileLabel: 'Wallet' },
  { id: 'transactions', label: 'Transactions', mobileLabel: 'Activity' },
  { id: 'transfers', label: 'Transfers', mobileLabel: 'Pay' },
  { id: 'cards', label: 'Cards', mobileLabel: 'Cards' },
] as const

export type BankPage = (typeof bankPages)[number]['id']

export function bankHref(page: BankPage) {
  return page === 'overview' ? '#template/banking' : `#template/banking/${page}`
}

/** Keep previously shared page URLs working while exposing just one gallery entry. */
export function resolveBankPage(path: string): BankPage | undefined {
  return bankPages.find(
    (page) => path === bankHref(page.id).slice(1) || path === `template/banking-${page.id}`,
  )?.id
}
