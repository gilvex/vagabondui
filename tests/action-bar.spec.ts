import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('bulk actions keep selection interactive, export data, and support archive/undo', async ({
  page,
}) => {
  await page.goto('/#component/action-bar')
  const toolbar = page.getByRole('toolbar', { name: 'File actions' })
  const selection = page.getByRole('region', { name: 'Bulk file actions example' })
  await expect(toolbar).toBeVisible()
  await page.getByRole('checkbox', { name: 'Select Budget forecast.csv' }).check()
  await expect(selection.getByRole('status')).toHaveText('3 files selected')
  const download = page.waitForEvent('download')
  await toolbar.getByRole('button', { name: 'Export selected files' }).click()
  expect((await download).suggestedFilename()).toBe('selected-files.csv')
  await toolbar.getByRole('button', { name: 'Archive', exact: true }).click()
  await expect(toolbar).toHaveCount(0)
  await expect(selection.getByRole('status')).toHaveText('3 files archived.')
  await expect(selection.getByRole('button', { name: 'Undo archive' })).toBeFocused()
  await selection.getByRole('button', { name: 'Undo archive' }).click()
  await expect(page.getByRole('checkbox', { name: 'Select Project brief.pdf' })).toBeVisible()
  await page.getByRole('checkbox', { name: 'Select Project brief.pdf' }).check()
  await expect(page.getByRole('checkbox', { name: 'Select Project brief.pdf' })).toBeFocused()
  await expect(toolbar).toBeVisible()
  await toolbar.getByRole('button', { name: 'Clear selection' }).click()
  await expect(toolbar).toHaveCount(0)
  await expect(page.getByRole('checkbox', { name: 'Select all files' })).toBeFocused()
})

test('roving focus, normal Tab exit, and nested menu Escape preserve the bar', async ({ page }) => {
  await page.goto('/#component/action-bar')
  const toolbar = page.getByRole('toolbar', { name: 'File actions' })
  await toolbar.getByRole('button', { name: 'Archive', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(toolbar.getByRole('button', { name: 'Export selected files' })).toBeFocused()
  await page.keyboard.press('End')
  await expect(toolbar.getByRole('button', { name: 'More file actions' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menu')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toHaveCount(0)
  await expect(toolbar).toBeVisible()
  await expect(toolbar.getByRole('button', { name: 'More file actions' })).toBeFocused()
  await page.keyboard.press('Home')
  await expect(toolbar.getByRole('button', { name: 'Clear selection' })).toBeFocused()
  await page.keyboard.press('Tab')
  expect(await toolbar.evaluate((node) => node.contains(document.activeElement))).toBe(false)
  await toolbar.getByRole('button', { name: 'Archive', exact: true }).focus()
  await page.keyboard.press('Escape')
  await expect(toolbar).toHaveCount(0)
  await expect(page.getByRole('checkbox', { name: 'Select all files' })).toBeFocused()
})

test('fixed placement stays at the viewport bottom, without blocking page interactions', async ({
  page,
}) => {
  await page.goto('/#component/action-bar')
  await page.getByRole('switch', { name: 'Pin to viewport' }).click()
  const toolbar = page.getByRole('toolbar', { name: 'File actions' })
  await expect(toolbar.locator('..')).toHaveCSS('position', 'fixed')
  await expect(toolbar).toHaveCSS('transform', 'none')
  const box = (await toolbar.boundingBox())!
  expect(page.viewportSize()!.height - box.y - box.height).toBeCloseTo(16, 0)
  await page.getByRole('heading', { name: 'Action Bar', exact: true }).click()
  await expect(toolbar).toBeVisible()
  await page.mouse.wheel(0, 900)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
  expect((await toolbar.boundingBox())!.y).toBeCloseTo(box.y, 0)
  await toolbar.getByRole('button', { name: 'More file actions' }).click()
  await page.getByRole('menuitem', { name: 'Mark as reviewed' }).click()
  await expect(page.getByText('248 KB · Reviewed')).toHaveCount(1)
})

test('sticky save bar handles edits, disabled actions, save/discard, and focus restoration', async ({
  page,
}) => {
  await page.goto('/#component/action-bar')
  const example = page.getByRole('region', { name: 'Save bar example' })
  const name = example.getByRole('textbox', { name: 'Workspace name' })
  const toolbar = example.getByRole('toolbar', { name: 'Workspace save actions' })
  await expect(toolbar).toHaveCount(0)
  await name.fill('Review workspace')
  await expect(name).toBeFocused()
  await expect(toolbar.locator('..')).toHaveCSS('position', 'sticky')
  await toolbar.getByRole('button', { name: 'Save changes' }).focus()
  await page.keyboard.press('Escape')
  await expect(toolbar).toBeVisible()
  await toolbar.getByRole('button', { name: 'Save changes' }).click()
  await expect(toolbar).toHaveCount(0)
  await expect(name).toBeFocused()
  await expect(example.getByRole('status')).toHaveText('Workspace settings saved.')
  await name.fill('')
  await expect(toolbar.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  await toolbar.getByRole('button', { name: 'Discard' }).click()
  await expect(name).toHaveValue('Review workspace')
  await expect(toolbar).toHaveCount(0)
  await example.getByRole('switch').click()
  await toolbar.getByRole('button', { name: 'Discard' }).click()
  await expect(example.getByRole('switch')).toBeChecked()
})

test('embedded toolbar works inside the expanded modal preview', async ({ page }) => {
  await page.goto('/#component/action-bar')
  await page.getByRole('button', { name: 'Expand', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Action Bar', exact: true })
  const toolbar = dialog.getByRole('toolbar', { name: 'File actions' })
  await toolbar.getByRole('button', { name: 'More file actions' }).click()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeVisible()
  await toolbar.getByRole('button', { name: 'Clear selection' }).click()
  await expect(toolbar).toHaveCount(0)
  await expect(dialog.getByRole('checkbox', { name: 'Select all files' })).toBeFocused()
})

test('both styles stay readable and accessible in every brand and at mobile widths', async ({
  page,
}) => {
  test.setTimeout(120000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const brand of ['vagabond', 'gilvex', 'gilgil']) {
    for (const theme of ['dark', 'light']) {
      await page.setViewportSize({ width: 320, height: 800 })
      await page.goto(`/?brand=${brand}&theme=${theme}#component/action-bar`)
      await page.getByRole('switch', { name: 'Pin to viewport' }).click()
      for (const variant of ['floating', 'docked']) {
        await page
          .getByRole('radio', { name: variant === 'floating' ? 'Floating' : 'Docked', exact: true })
          .click()
        const toolbar = page.getByRole('toolbar', { name: 'File actions' })
        await expect(toolbar).toHaveAttribute('data-variant', variant)
        await expect(toolbar).toHaveCSS('transform', 'none')
        await page.evaluate(() => document.fonts.ready)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
        const box = (await toolbar.boundingBox())!
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(320)
        const smallText = await toolbar.evaluate((node) =>
          [...node.querySelectorAll('*')]
            .filter(
              (element) =>
                [...element.childNodes].some(
                  (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim(),
                ) && parseFloat(getComputedStyle(element).fontSize) < 14,
            )
            .map((element) => element.textContent),
        )
        expect(smallText).toEqual([])
        for (const button of await toolbar.getByRole('button').all())
          expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44)
        const result = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
        expect(result.violations, `${brand}/${theme}/${variant}`).toEqual([])
        if (brand === 'gilvex')
          await page.screenshot({
            path: `test-results/review-action-bar-${variant}-${theme}-mobile.png`,
          })
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/?brand=gilvex&theme=dark#component/action-bar')
  await page.getByRole('switch', { name: 'Pin to viewport' }).click()
  await expect(page.getByRole('toolbar', { name: 'File actions' })).toHaveCSS('transform', 'none')
  await page.screenshot({ path: 'test-results/review-action-bar-desktop.png' })
})
