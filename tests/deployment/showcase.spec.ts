import { expect, test, type Page } from '@playwright/test'

function captureFailures(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('requestfailed', (request) => {
    if (request.failure()?.errorText === 'net::ERR_ABORTED') return
    errors.push(`${request.url()}: ${request.failure()?.errorText}`)
  })
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
  })
  return errors
}

test('the production showcase loads its assets under the Pages subpath', async ({
  page,
  baseURL,
}) => {
  const errors = captureFailures(page)
  const response = await page.goto('./')
  expect(response?.status()).toBe(200)
  await expect(
    page.getByRole('heading', { name: 'React components for product interfaces.' }),
  ).toBeVisible()
  await expect(page.locator('.component-card')).toHaveCount(12)
  await page.evaluate(() => document.fonts.ready)

  const basePath = new URL(baseURL!).pathname
  const scriptURLs = await page
    .locator('script[type="module"][src]')
    .evaluateAll((scripts) => scripts.map((script) => (script as HTMLScriptElement).src))
  expect(scriptURLs.length).toBeGreaterThan(0)
  for (const url of scriptURLs)
    expect(new URL(url).pathname.startsWith(`${basePath}assets/`)).toBe(true)
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', `${basePath}favicon.svg`)
  const icon = await page.request.get(`${basePath}favicon.svg`)
  expect(icon.status()).toBe(200)
  expect(icon.headers()['content-type']).toContain('image/svg+xml')
  expect(errors).toEqual([])
})

test('deployed hash routes and lazy-loaded template source work', async ({ page }) => {
  test.setTimeout(90000)
  const errors = captureFailures(page)
  const routes = [
    ['template/dashboard', 'Workspace overview'],
    ['template/projects', 'Project tasks'],
    ['template/settings', 'Workspace settings'],
    ['template/chat', 'general'],
    ['template/hr', 'People & culture'],
    ['template/sorting', 'Sorting center'],
    ['template/pickup', 'Pickup point'],
    ['template/support', 'Support inbox'],
    ['template/banking', 'A clearer view of your money.'],
    ['template/banking/accounts', 'Your accounts'],
    ['template/banking/transactions', 'Transactions'],
    ['template/banking/transfers', 'Move money'],
    ['template/banking/cards', 'Your cards'],
    ['template/billing', 'Billing & invoices'],
  ]

  for (const [route, heading] of routes) {
    await page.goto(`./#${route}`)
    await expect(page.getByRole('heading', { name: heading, exact: true, level: 1 })).toBeVisible()
  }
  await page.getByRole('button', { name: 'View source', exact: true }).click()
  await expect(page.getByRole('dialog').locator('pre')).toContainText(
    'export default function Billing',
  )
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await page.goto('./#component/dialog')
  await expect(page.getByRole('heading', { name: 'Dialog', exact: true, level: 1 })).toBeVisible()
  await page.getByRole('button', { name: 'Edit project', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Edit project', exact: true })).toBeVisible()
  await page.goto('./?brand=gilgil&theme=light#design-preview')
  await expect(page.getByRole('heading', { name: 'Brand directions.', exact: true })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'gilgil')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('body')).toHaveCSS('font-family', /DM Sans Variable/)
  expect(errors).toEqual([])
})
