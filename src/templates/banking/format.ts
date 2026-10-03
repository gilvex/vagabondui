const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export const money = (cents: number) => currencyFormatter.format(cents / 100)
export const bankDate = (date: string) => dateFormatter.format(new Date(date))
