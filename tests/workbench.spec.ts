import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { catalog, pages } from '../src/showcase/catalog'

async function assertReadable(page: Page) {
  const violations = await page.evaluate(() => {
    return [...document.querySelectorAll('body *')].flatMap((element) => {
      const hasText = [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
      )
      const isControl = ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)
      if (!hasText && !isControl) return []
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height || style.visibility === 'hidden' || style.display === 'none')
        return []
      const fontSize = parseFloat(style.fontSize)
      return fontSize < 14
        ? [{ tag: element.tagName, text: element.textContent?.slice(0, 70), fontSize }]
        : []
    })
  })
  expect(violations, 'All rendered text and input text must be at least 14px').toEqual([])
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'No page-level horizontal overflow',
  ).toBe(true)
}

test('gallery filtering, live states, source view and API', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'React components for product interfaces.' }),
  ).toBeVisible()
  await expect(page.locator('.component-card')).toHaveCount(12)
  await page.getByRole('button', { name: 'Forms', exact: true }).click()
  await expect(page.locator('.component-card')).toHaveCount(
    catalog.filter((item) => item.category === 'Forms').length,
  )
  const notifications = page.getByRole('switch', { name: 'Email notifications' })
  await notifications.focus()
  await page.keyboard.press('Space')
  await expect(notifications).not.toBeChecked()
  await page.getByRole('button', { name: 'View Input details' }).click()
  const dialog = page.getByRole('dialog', { name: 'Input', exact: true })
  await dialog.getByRole('tab', { name: 'API reference' }).click()
  await expect(dialog.getByRole('tabpanel')).toContainText('Native input props')
  await assertReadable(page)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'View Input details' })).toBeFocused()
  await page.getByRole('button', { name: 'Show source code' }).click()
  await expect(page.locator('.component-card pre').first()).toContainText('@/components/ui/input')
  await page.getByRole('textbox', { name: 'Filter components by name' }).fill('doesnotexist')
  await expect(page.getByRole('heading', { name: 'No components found' })).toBeVisible()
})

test('dialogs are centered on every entrance frame with motion enabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await page.evaluate(() => {
      type Sample = { x: number; y: number; width: number; height: number; time: number }
      const targetWindow = window as typeof window & { modalFrames: Sample[] }
      targetWindow.modalFrames = []
      const observer = new MutationObserver(() => {
        const dialog = document.querySelector('[data-slot="dialog-content"]')
        if (!dialog) return
        observer.disconnect()
        const start = performance.now()
        function record() {
          const rect = dialog!.getBoundingClientRect()
          targetWindow.modalFrames.push({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            time: performance.now() - start,
          })
          if (performance.now() - start < 250) requestAnimationFrame(record)
        }
        record()
      })
      observer.observe(document.body, { childList: true, subtree: true })
    })
    await page.getByRole('button', { name: 'View Input details' }).click()
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as typeof window & { modalFrames: { time: number }[] }).modalFrames.at(-1)
              ?.time ?? 0,
        ),
      )
      .toBeGreaterThanOrEqual(250)
    const frames = await page.evaluate(
      () =>
        (
          window as typeof window & {
            modalFrames: { x: number; y: number; width: number; height: number }[]
          }
        ).modalFrames,
    )
    for (const frame of frames) {
      expect(Math.abs(frame.x + frame.width / 2 - viewport.width / 2)).toBeLessThan(1)
      expect(Math.abs(frame.y + frame.height / 2 - viewport.height / 2)).toBeLessThan(1)
    }
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  }
})

test('command search navigates to guides and individual component pages', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Control+k')
  const search = page.getByRole('combobox', { name: 'Search documentation' })
  await expect(search).toBeFocused()
  await search.fill('typography')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#typography$/)
  await expect(page.getByRole('heading', { name: 'Typography', exact: true })).toBeVisible()
  await page.keyboard.press('Control+k')
  await search.fill('checkbox')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#component\/checkbox$/)
  await expect(page.getByRole('heading', { name: 'Checkbox', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Accept terms and conditions' })).toBeVisible()
})

test('all 34 component pages and guides render readable text without runtime errors', async ({
  page,
}) => {
  test.setTimeout(120000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const routes = [
    ...catalog.map((item) => `component/${item.id}`),
    'installation',
    'principles',
    'colors',
    'typography',
    'spacing',
    'motion',
    'components',
    'changelog',
    'research',
  ]
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of routes) {
      await page.goto(`/#${route}`)
      const name =
        catalog.find((item) => `component/${item.id}` === route)?.name ??
        pages.find((item) => item.id === route)!.name
      await expect(page.locator('.page-topline > span')).toHaveText(name)
      await expect(page.locator('main h1')).toBeVisible()
      await assertReadable(page)
    }
  }
  expect(errors).toEqual([])
})

test('full catalog passes accessibility checks in both themes and mobile navigation works', async ({
  page,
}) => {
  test.setTimeout(60000)
  await page.goto('/#components')
  await expect(page.locator('.component-card')).toHaveCount(34)
  const dark = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(dark.violations).toEqual([])
  await page.getByRole('button', { name: 'Switch to light mode' }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  const light = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(light.violations).toEqual([])
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open navigation' }).click()
  const nav = page.getByRole('dialog', { name: 'Documentation', exact: true })
  await nav.getByRole('link', { name: 'Colors', exact: true }).click()
  await expect(nav).not.toBeVisible()
  await expect(page.getByRole('heading', { name: 'Colors', exact: true })).toBeVisible()
})

test('form components support keyboard input and linked validation', async ({ page }) => {
  await page.goto('/#component/select')
  await page.getByRole('combobox', { name: 'Workspace role' }).focus()
  await page.keyboard.press('Space')
  await page.getByRole('option', { name: 'Editor', exact: true }).click()
  await expect(page.getByText('Can create and edit projects.')).toBeVisible()
  await page.goto('/#component/radio-group')
  await page.getByRole('radio', { name: 'Monthly', exact: true }).focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('radio', { name: 'Yearly', exact: true })).toBeChecked()
  await page.goto('/#component/slider')
  await page.getByRole('slider', { name: 'Volume' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '51')
  await page.goto('/#component/field')
  await page.getByRole('button', { name: 'Validate' }).click()
  await expect(page.getByRole('textbox', { name: 'Username' })).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  await expect(page.getByRole('alert')).toHaveText('Enter at least 3 characters.')
  await page.getByRole('textbox', { name: 'Username' }).fill('alex')
  await page.getByRole('button', { name: 'Validate' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Username is valid.' })).toBeVisible()
})

test('nested dialogs, confirmation, dropdown actions, sheets, and toasts', async ({ page }) => {
  await page.goto('/#component/dialog')
  await page.getByRole('button', { name: 'Expand', exact: true }).click()
  const outer = page.getByRole('dialog', { name: 'Dialog', exact: true })
  await outer.getByRole('button', { name: 'Edit project', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Edit project', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(outer).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Expand', exact: true })).toBeFocused()
  await page.goto('/#component/alert-dialog')
  await page.getByRole('button', { name: 'Delete draft' }).click()
  const confirmation = page.getByRole('alertdialog')
  await expect(confirmation.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await confirmation.getByRole('button', { name: 'Delete draft' }).click()
  await expect(page.getByText('Draft deleted.')).toBeVisible()
  await page.goto('/#component/dropdown-menu')
  await page.getByRole('button', { name: 'Project actions' }).click()
  await page.getByRole('menuitem', { name: 'Duplicate' }).click()
  await expect(page.getByText('1 copy created')).toBeVisible()
  await page.goto('/#component/sheet')
  await page.getByRole('button', { name: 'Edit profile' }).click()
  await page.getByRole('textbox', { name: 'Display name' }).fill('Sam Lee')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Sam Lee', { exact: true })).toBeVisible()
  await page.goto('/#component/toast')
  await page.getByRole('button', { name: 'Show notification' }).click()
  await expect(page.getByText('Settings saved', { exact: true })).toBeVisible()
  await assertReadable(page)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.getByText('Changes reverted', { exact: true })).toBeVisible()
})

test('copyable direct imports and code previews', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/#component/button')
  await page.getByRole('button', { name: 'Copy code' }).first().click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    '@/components/ui/button',
  )
  await page.goto('/#component/accordion')
  await page.getByRole('button', { name: 'Can I edit the source?' }).click()
  await expect(
    page.getByText('Yes. Each component is a separate file you can copy and modify.'),
  ).toBeVisible()
  await page.goto('/#component/pagination')
  await page.getByRole('link', { name: 'Next page' }).click()
  await expect(page.getByText('Showing records 11–20 of 30')).toBeVisible()
})

test('review screenshots', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: 'test-results/overview-desktop.png', fullPage: true })
  await page.getByRole('button', { name: 'View Input details' }).click()
  await page.screenshot({ path: 'test-results/dialog-desktop.png' })
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.locator('main h1')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await assertReadable(page)
  await page.screenshot({ path: 'test-results/overview-mobile.png' })
  await page.goto('/#component/dialog')
  await page.getByRole('button', { name: 'Edit project' }).click()
  await page.screenshot({ path: 'test-results/dialog-mobile.png' })
})
