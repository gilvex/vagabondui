import { expect, test, type Locator, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function settled(panel: Locator) {
  await expect(panel).toHaveCSS('transform', /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/)
}

async function drag(page: Page, panel: Locator, x: number, y: number) {
  const box = await panel.locator('[data-slot="drawer-handle"]').boundingBox()
  if (!box) throw new Error('Missing drag handle')
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(start.x + x, start.y + y, { steps: 12 })
  await page.mouse.up()
}

test('Drawer saves preferences, keeps focus inside, and restores its trigger', async ({ page }) => {
  await page.goto('/#component/drawer')
  const trigger = page.getByRole('button', { name: 'Schedule report', exact: true })
  await trigger.click()
  const panel = page.getByRole('dialog', { name: 'Schedule report' })
  await settled(panel)
  await expect(panel).toHaveAttribute('data-direction', 'bottom')
  const box = await panel.boundingBox()
  expect(box!.y + box!.height).toBeCloseTo(page.viewportSize()!.height, 0)
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    expect(await panel.evaluate((node) => node.contains(document.activeElement))).toBe(true)
  }
  await panel.getByRole('radio', { name: /Every month/ }).check()
  await panel.getByRole('textbox', { name: 'Send to' }).fill('reports@example.com')
  await panel.getByRole('button', { name: 'Save schedule' }).click()
  await expect(panel).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect(page.getByRole('status').filter({ hasText: 'Monthly report' })).toContainText(
    'reports@example.com',
  )
  await trigger.click()
  await expect(panel.getByRole('textbox', { name: 'Send to' })).toHaveValue('reports@example.com')
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await trigger.click()
  await settled(panel)
  await page.mouse.click(8, 8)
  await expect(panel).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('Fridge scrolls independently, saves notes, and dismisses only the top nested overlay', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 650 })
  await page.goto('/#component/fridge')
  const trigger = page.getByRole('button', { name: 'View order', exact: true })
  await trigger.click()
  const panel = page.getByRole('dialog', { name: 'Order #1045' })
  await settled(panel)
  const footer = panel.locator('[data-slot="drawer-footer"]')
  const before = await footer.boundingBox()
  const body = panel.locator('[data-slot="drawer-body"]')
  await body.hover()
  await page.mouse.wheel(0, 900)
  await expect.poll(() => body.evaluate((node) => node.scrollTop)).toBeGreaterThan(0)
  expect(await footer.boundingBox()).toEqual(before)
  await panel.getByRole('textbox', { name: 'Delivery note' }).fill('Ring the bell twice.')
  await panel.getByRole('button', { name: 'Cancel order', exact: true }).click()
  const confirmation = page.getByRole('alertdialog')
  await expect(confirmation).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(confirmation).toHaveCount(0)
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Cancel order', exact: true })).toBeFocused()
  await panel.getByRole('button', { name: 'Save changes' }).click()
  await expect(panel).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(panel.getByRole('textbox', { name: 'Delivery note' })).toHaveValue(
    'Ring the bell twice.',
  )
  await panel.getByRole('button', { name: 'Cancel order', exact: true }).click()
  await confirmation.getByRole('button', { name: 'Confirm cancellation' }).click()
  await expect(confirmation).toHaveCount(0)
  await expect(panel.getByText('Cancelled', { exact: true })).toBeVisible()
  await panel.getByRole('button', { name: 'Reset example' }).click()
  await expect(panel.getByText('Paid', { exact: true })).toBeVisible()
})

for (const [route, name, trigger, offset] of [
  ['drawer', 'Schedule report', 'Schedule report', { x: 0, y: 190 }],
  ['fridge', 'Order #1045', 'View order', { x: 190, y: 0 }],
] as const) {
  test(`${route}: handle-only drag, snap-back, and nested preview focus`, async ({ page }) => {
    await page.goto(`/#component/${route}`)
    await page.getByRole('button', { name: 'Expand', exact: true }).click()
    const outer = page.getByRole('dialog', {
      name: route === 'drawer' ? 'Drawer' : 'Fridge',
      exact: true,
    })
    await outer.getByRole('button', { name: trigger, exact: true }).click()
    const panel = page.getByRole('dialog', { name, exact: true })
    await settled(panel)
    const bodyBox = (await panel.locator('[data-slot="drawer-body"]').boundingBox())!
    await page.mouse.move(bodyBox.x + 20, bodyBox.y + 25)
    await page.mouse.down()
    await page.mouse.move(bodyBox.x + 20 + offset.x, bodyBox.y + 25 + offset.y, { steps: 8 })
    await page.mouse.up()
    await settled(panel)
    await drag(page, panel, offset.x ? 12 : 0, offset.y ? 12 : 0)
    await settled(panel)
    await drag(page, panel, offset.x, offset.y)
    await expect(panel).toHaveCount(0)
    await expect(outer).toBeVisible()
    await expect(outer.getByRole('button', { name: trigger, exact: true })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(outer).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Expand', exact: true })).toBeFocused()
  })
}

test('panels remain readable and accessible in all brands, themes, and narrow viewports', async ({
  page,
}) => {
  test.setTimeout(120000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const brand of ['vagabond', 'gilvex', 'gilgil']) {
    for (const theme of ['dark', 'light']) {
      for (const [route, name, trigger] of [
        ['drawer', 'Schedule report', 'Schedule report'],
        ['fridge', 'Order #1045', 'View order'],
      ]) {
        await page.setViewportSize({ width: 320, height: 640 })
        await page.goto(`/?brand=${brand}&theme=${theme}#component/${route}`)
        await page.getByRole('button', { name: trigger, exact: true }).click()
        const panel = page.getByRole('dialog', { name, exact: true })
        await settled(panel)
        await page.evaluate(() => document.fonts.ready)
        const box = (await panel.boundingBox())!
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(321)
        expect(box.y + box.height).toBeLessThanOrEqual(641)
        expect(await panel.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true)
        const smallText = await panel.evaluate((node) =>
          [...node.querySelectorAll('*')]
            .filter((element) => {
              const text = [...element.childNodes].some(
                (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim(),
              )
              return (
                (text || ['INPUT', 'TEXTAREA'].includes(element.tagName)) &&
                parseFloat(getComputedStyle(element).fontSize) < 14
              )
            })
            .map((element) => element.textContent),
        )
        expect(smallText).toEqual([])
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
        expect(results.violations, `${brand}/${theme}/${route}`).toEqual([])
        if (brand === 'gilvex')
          await page.screenshot({ path: `test-results/review-${route}-${theme}-mobile.png` })
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const [route, trigger] of [
    ['drawer', 'Schedule report'],
    ['fridge', 'View order'],
  ]) {
    await page.goto(`/?brand=gilvex&theme=dark#component/${route}`)
    await page.getByRole('button', { name: trigger, exact: true }).click()
    await settled(page.locator('[data-drawer-panel]'))
    await page.screenshot({ path: `test-results/review-${route}-desktop.png` })
  }
})

test('touch handle dismisses while touch body scrolling stays in the panel', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  const session = await context.newCDPSession(page)
  async function swipe(x: number, y: number, dx: number, dy: number) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    for (let i = 1; i <= 12; i++)
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x + (dx * i) / 12, y: y + (dy * i) / 12 }],
      })
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  try {
    await page.goto('http://127.0.0.1:5173/#component/fridge')
    await page.getByRole('button', { name: 'View order', exact: true }).tap()
    const panel = page.getByRole('dialog', { name: 'Order #1045' })
    await settled(panel)
    const body = panel.locator('[data-slot="drawer-body"]')
    const rect = (await body.boundingBox())!
    await swipe(rect.x + rect.width / 2, rect.y + rect.height - 60, 0, -200)
    await expect.poll(() => body.evaluate((node) => node.scrollTop)).toBeGreaterThan(0)
    await settled(panel)
    const handle = (await panel.locator('[data-slot="drawer-handle"]').boundingBox())!
    await swipe(handle.x + handle.width / 2, handle.y + handle.height / 2, 170, 0)
    await expect(panel).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'View order', exact: true })).toBeFocused()
  } finally {
    await context.close()
  }
})
