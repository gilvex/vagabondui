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
  await page.goto('/#template/banking/transfers')
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
  await page.goto('/#template/banking/transactions')
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
  await page.goto('/#template/banking/cards')
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
    ['banking', 'A clearer view of your money.'],
    ['banking/accounts', 'Your accounts'],
    ['banking/transactions', 'Transactions'],
    ['banking/transfers', 'Move money'],
    ['banking/cards', 'Your cards'],
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
      await page.screenshot({
        path: `test-results/${route.replaceAll('/', '-')}-${width}.png`,
        fullPage: true,
      })
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const [route, heading] of routes) {
    for (const mode of ['dark', 'light']) {
      // Start each axe pass with a fresh document so inherited styles are not cached across themes.
      await page.goto(`/?theme=${mode}#template/${route}`)
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('data-theme', mode)
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(result.violations).toEqual([])
      if (route === 'banking/cards')
        await page.screenshot({ path: `test-results/bank-cards-${mode}.png`, fullPage: true })
    }
    await page.getByRole('button', { name: 'View source', exact: true }).click()
    await expect(page.getByRole('dialog').locator('pre')).toContainText(
      'export default function BankingTemplate',
    )
    await page.keyboard.press('Escape')
  }
  expect(errors).toEqual([])
})

test('one Bank app entry opens internal sections with working history and legacy links', async ({
  page,
}) => {
  await page.goto('/#templates')
  const bankEntry = page
    .locator('.template-index-card')
    .filter({ has: page.getByRole('heading', { name: 'Bank app', exact: true }) })
  await expect(bankEntry).toHaveCount(1)
  await expect(
    page.locator('.template-index-card').filter({
      hasText: /Bank accounts|Bank transactions|Bank transfers|Bank cards|Banking overview/,
    }),
  ).toHaveCount(0)
  await bankEntry.getByRole('link', { name: 'Open template' }).click()
  await navigate(page, 'Cards')
  await expect(page).toHaveURL(/#template\/banking\/cards$/)
  await navigate(page, 'Accounts')
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Your cards', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('link', { name: 'Cards', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await page.goto('/#template/banking-transactions')
  await expect(page.getByRole('heading', { name: 'Transactions', exact: true })).toBeVisible()
})

test('card illustrations keep their size and proportions across desktop and mobile', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#template/banking/cards')
  for (const width of [1920, 1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    for (const name of ['Everyday debit', 'Online purchases']) {
      await page.getByRole('tab', { name, exact: true }).click()
      const card = page.locator('.bank-debit-card:visible')
      const rect = await card.boundingBox()
      expect(rect).not.toBeNull()
      expect(rect!.width).toBeLessThanOrEqual(336)
      if (width >= 768) expect(rect!.width).toBe(336)
      expect(rect!.width / rect!.height).toBeCloseTo(1.586, 2)
      const numberBounds = await card.locator('.bank-card-number').evaluate((element) => {
        const range = document.createRange()
        range.selectNodeContents(element)
        return range.getBoundingClientRect().toJSON()
      })
      expect(numberBounds.right).toBeLessThanOrEqual(rect!.x + rect!.width - 12)
      expect(numberBounds.left).toBeGreaterThanOrEqual(rect!.x + 12)
      await expect(card.locator('.bank-chip')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      await page.screenshot({
        path: `test-results/bank-card-${name.replaceAll(' ', '-')}-${width}.png`,
        fullPage: true,
      })
    }
  }
})

test('mobile bottom navigation and activity details work with touch-sized controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#template/banking')
  const navigation = page.getByRole('navigation', { name: 'Template navigation' })
  await expect(navigation).toHaveCSS('position', 'fixed')
  for (const link of await navigation.getByRole('link').all()) {
    const bounds = await link.boundingBox()
    expect(bounds!.height).toBeGreaterThanOrEqual(44)
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844)
  }
  await navigate(page, 'Transactions')
  await expect(page.getByRole('table', { name: 'Account transactions' })).not.toBeVisible()
  await page.getByRole('button', { name: /Whole Foods Market/ }).click()
  await expect(page.getByRole('dialog', { name: 'Transaction details' })).toContainText('-$86.42')
  await page.getByRole('button', { name: 'Close details' }).click()
  await navigate(page, 'Cards')
  await page.getByRole('tab', { name: 'Online purchases', exact: true }).click()
  await page.getByRole('switch', { name: 'Freeze Online purchases' }).click()
  await expect(page.getByText('Frozen', { exact: true })).toBeVisible()
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(result.violations).toEqual([])
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
