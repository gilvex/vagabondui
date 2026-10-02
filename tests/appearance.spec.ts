import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const presets = ['vagabond', 'gilvex', 'gilgil'] as const
const modes = ['dark', 'light'] as const
const screens = [
  { route: 'design-preview', heading: 'Brand directions.' },
  { route: 'template/dashboard', heading: 'Workspace overview' },
  { route: 'template/chat', heading: 'general' },
  { route: 'template/billing', heading: 'Billing & invoices' },
] as const

async function assertReadable(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  const smallText = await page.evaluate(() =>
    [...document.querySelectorAll('body *')].flatMap((element) => {
      const hasText = [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
      )
      if (!hasText && !['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) return []
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height || style.visibility === 'hidden' || style.display === 'none')
        return []
      const size = parseFloat(style.fontSize)
      return size < 14 ? [{ text: element.textContent?.slice(0, 50), size }] : []
    }),
  )
  expect(smallText).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
}

test('appearance controls preserve form state and persist the chosen brand and mode', async ({
  page,
}) => {
  await page.goto('/#design-preview')
  const specimen = page.locator('.brand-specimen[data-brand="gilvex"]')
  await specimen.getByRole('textbox', { name: 'Workspace name' }).fill('Review workspace')
  await specimen.getByRole('switch', { name: 'Email notifications' }).click()
  await specimen.getByRole('button', { name: 'Save changes' }).click()
  await expect(specimen.getByRole('button', { name: 'Saved', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Use Gilvex appearance' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'gilvex')
  await expect(specimen.getByRole('textbox', { name: 'Workspace name' })).toHaveValue(
    'Review workspace',
  )
  await expect(specimen.getByRole('switch')).not.toBeChecked()
  await expect(page.locator('.design-preview-heading h1')).toHaveCSS(
    'font-family',
    /Manrope Variable/,
  )
  await expect(page.locator('body')).toHaveCSS('font-family', /DM Sans Variable/)
  await page.getByRole('radio', { name: 'Light preview' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'gilvex')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('link', { name: 'Explore dashboard' }).click()
  await expect(page.getByRole('heading', { name: 'Workspace overview' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'gilvex')
  await page.getByRole('button', { name: 'New task', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Create task' })
  await expect(dialog).toHaveCSS('background-color', 'rgb(239, 241, 232)')
  await expect(dialog.getByRole('heading')).toHaveCSS('font-family', /Manrope Variable/)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Appearance: Gilvex', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'GilGil', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'gilgil')
})

test('all appearance directions keep desktop and mobile text readable without page overflow', async ({
  page,
}) => {
  test.setTimeout(120000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [1440, 800, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const brand of presets) {
      for (const theme of modes) {
        for (const screen of screens) {
          await page.goto(`/?brand=${brand}&theme=${theme}#${screen.route}`)
          await expect(
            page.getByRole('heading', { name: screen.heading, exact: true, level: 1 }),
          ).toBeVisible()
          await assertReadable(page)
        }
      }
    }
  }
})

test('brand presets pass automated accessibility checks in dark and light modes', async ({
  page,
}) => {
  test.setTimeout(180000)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const brand of presets) {
    for (const theme of modes) {
      for (const screen of [...screens, { route: 'components', heading: 'Components' }]) {
        await page.goto(`/?brand=${brand}&theme=${theme}#${screen.route}`)
        await page.reload()
        await expect(
          page.getByRole('heading', { name: screen.heading, exact: true, level: 1 }),
        ).toBeVisible()
        await page.evaluate(() => document.fonts.ready)
        const result = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
        expect(result.violations, `${brand} / ${theme} / ${screen.route}`).toEqual([])
      }
    }
  }
})

test('capture brand directions for visual review', async ({ page }) => {
  test.setTimeout(90000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 1100 })
  for (const brand of presets) {
    for (const screen of screens) {
      await page.goto(`/?brand=${brand}&theme=dark#${screen.route}`)
      await expect(
        page.getByRole('heading', { name: screen.heading, exact: true, level: 1 }),
      ).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({
        path: `test-results/review-${brand}-${screen.route.replace('/', '-')}-desktop.png`,
        fullPage: true,
      })
    }
  }
  for (const theme of modes) {
    await page.goto(`/?brand=gilgil&theme=${theme}#design-preview`)
    await expect(page.getByRole('heading', { name: 'Brand directions.' })).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: `test-results/review-comparison-${theme}.png`, fullPage: true })
  }
  await page.setViewportSize({ width: 390, height: 844 })
  for (const [brand, route, heading] of [
    ['gilvex', 'template/dashboard', 'Workspace overview'],
    ['gilgil', 'template/billing', 'Billing & invoices'],
    ['gilvex', 'template/chat', 'general'],
  ]) {
    await page.goto(`/?brand=${brand}&theme=dark#${route}`)
    await expect(page.getByRole('heading', { name: heading, exact: true, level: 1 })).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({
      path: `test-results/review-${brand}-${route.replace('/', '-')}-mobile.png`,
    })
  }
})
