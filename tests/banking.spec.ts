import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function navigate(page: Page, name: string) {
  await page
    .getByRole('navigation', { name: 'Template navigation' })
    .getByRole('link', { name, exact: true })
    .click()
}

test('transfers validate, review before committing, and persist balances and ledger entries', async ({
  page,
}) => {
  await page.goto('/#template/banking-transfers')
  const amount = page.getByRole('textbox', { name: 'Amount (USD)' })
  await amount.fill('99999')
  await page.getByRole('button', { name: 'Review transfer' }).click()
  await expect(page.getByRole('alert')).toContainText('exceeds your available balance')
  await amount.fill('125.25')
  await page.getByRole('textbox', { name: 'Note (optional)' }).fill('Weekend fund')
  await page.getByRole('button', { name: 'Review transfer' }).click()
  const review = page.getByRole('dialog', { name: 'Review your transfer' })
  await expect(review).toContainText('$125.25')
  await review.getByRole('button', { name: 'Go back' }).click()
  await expect(page.getByText('Available: $8,245.50', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Review transfer' }).click()
  await review.getByRole('button', { name: 'Confirm transfer' }).click()
  await expect(page.getByRole('heading', { name: 'Transfer complete' })).toBeVisible()
  await expect(page.getByText('Available: $8,120.25', { exact: true })).toBeVisible()
  await navigate(page, 'Accounts')
  await page.getByRole('button', { name: 'Details for Rainy day fund' }).click()
  await expect(page.getByRole('dialog')).toContainText('$18,725.25')
  await page.keyboard.press('Escape')
  await navigate(page, 'Overview')
  await expect(page.locator('.bank-total')).toHaveText('$30,095.50')
  await navigate(page, 'Transactions')
  await page.getByRole('textbox', { name: 'Search transactions' }).fill('Weekend fund')
  await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(2)
  await page.reload()
  await page.getByRole('textbox', { name: 'Search transactions' }).fill('Weekend fund')
  await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(2)
  await page.getByRole('button', { name: 'To Rainy day fund · Weekend fund', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('-$125.25')
})

test('transactions filter, empty state clears, details open, and CSV exports the filtered rows', async ({
  page,
}) => {
  await page.goto('/#template/banking-transactions')
  await page.getByRole('combobox', { name: 'Filter by status' }).click()
  await page.getByRole('option', { name: 'Pending', exact: true }).click()
  await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(1)
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export CSV' }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe('meridian-transactions.csv')
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk))
  const csv = Buffer.concat(chunks).toString('utf8')
  expect(csv).toContain('Airline reservation')
  expect(csv).not.toContain('Whole Foods Market')
  await page.getByRole('textbox', { name: 'Search transactions' }).fill('no match')
  await expect(page.getByText('No transactions match your filters.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeDisabled()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await page.getByRole('combobox', { name: 'Filter by account' }).click()
  await page.getByRole('option', { name: 'Rainy day fund', exact: true }).click()
  await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(1)
  await page.getByRole('button', { name: 'Monthly interest', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Transaction details' })).toContainText('$62.50')
})

test('card controls and validated limits persist across navigation and reload', async ({
  page,
}) => {
  await page.goto('/#template/banking-cards')
  const card = page.getByRole('region', { name: 'Everyday debit', exact: true })
  await card.getByRole('switch', { name: 'Freeze Everyday debit' }).click()
  await expect(card.getByText('Frozen', { exact: true })).toBeVisible()
  await expect(
    card.getByRole('switch', { name: 'Online payments for Everyday debit' }),
  ).toBeDisabled()
  await navigate(page, 'Overview')
  await navigate(page, 'Cards')
  await expect(card.getByRole('switch', { name: 'Freeze Everyday debit' })).toBeChecked()
  await card.getByRole('switch', { name: 'Freeze Everyday debit' }).click()
  await card.getByRole('switch', { name: 'Online payments for Everyday debit' }).click()
  await card.getByRole('textbox', { name: 'Monthly limit (USD)' }).fill('50')
  await card.getByRole('button', { name: 'Save spending limit' }).click()
  await expect(card.getByRole('alert')).toContainText('between $100 and $20,000')
  await card.getByRole('textbox', { name: 'Monthly limit (USD)' }).fill('4000')
  await card.getByRole('button', { name: 'Save spending limit' }).click()
  await page.reload()
  await expect(card.getByRole('textbox', { name: 'Monthly limit (USD)' })).toHaveValue('4000')
  await expect(
    card.getByRole('switch', { name: 'Online payments for Everyday debit' }),
  ).not.toBeChecked()
})

test('banking pages have accessible themes, readable mobile layouts, and source previews', async ({
  page,
}) => {
  test.setTimeout(120000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const routes = [
    ['banking', 'A clearer view of your money.', 'Overview'],
    ['banking-accounts', 'Your accounts', 'Accounts'],
    ['banking-transactions', 'Transactions', 'Transactions'],
    ['banking-transfers', 'Move money', 'Transfers'],
    ['banking-cards', 'Your cards', 'Cards'],
  ]
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const [route, heading] of routes) {
      await page.goto(`/#template/${route}`)
      await expect(
        page.getByRole('heading', { name: heading, exact: true, level: 1 }),
      ).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      const smallText = await page
        .locator('.banking-app *')
        .evaluateAll((elements) =>
          elements
            .filter(
              (element) =>
                [...element.childNodes].some(
                  (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
                ) &&
                element.getBoundingClientRect().width &&
                parseFloat(getComputedStyle(element).fontSize) < 14,
            )
            .map((element) => element.textContent),
        )
      expect(smallText).toEqual([])
      await page.screenshot({ path: `test-results/${route}-${width}.png`, fullPage: true })
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const [route, heading, component] of routes) {
    await page.goto(`/#template/${route}`)
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    for (const mode of ['light', 'dark']) {
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(result.violations).toEqual([])
      await page.getByRole('button', { name: `Switch to ${mode} mode` }).click()
    }
    await page.getByRole('button', { name: 'View source', exact: true }).click()
    await expect(page.getByRole('dialog').locator('pre')).toContainText(
      `export default function ${component}`,
    )
    await page.keyboard.press('Escape')
  }
  expect(errors).toEqual([])
})

test('banking state survives navigation when browser storage is unavailable', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Storage unavailable')
      },
    }),
  )
  await page.goto('/#template/banking-cards')
  await page.getByRole('switch', { name: 'Freeze Everyday debit' }).click()
  await navigate(page, 'Accounts')
  await navigate(page, 'Cards')
  await expect(page.getByRole('switch', { name: 'Freeze Everyday debit' })).toBeChecked()
  await expect(page.getByText('Interactive demo · this session only')).toBeVisible()
})
