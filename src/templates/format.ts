const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.valueOf()) ? '—' : dateFormatter.format(date)
}
export function formatTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? '—' : timeFormatter.format(date)
}
export function money(cents: number) {
  return currencyFormatter.format(cents / 100)
}
