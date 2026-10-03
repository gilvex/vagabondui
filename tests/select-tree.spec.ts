import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function openDestination(page: Page) {
  await page.getByRole('combobox', { name: 'Pickup destination', exact: true }).click()
  const popup = page.getByRole('dialog', { name: 'Pickup destination tree selector' })
  await expect(popup.getByRole('textbox', { name: 'Search Pickup destination' })).toBeFocused()
  return popup
}

test('nested selection, hierarchy-preserving search, disabled leaves, and empty results', async ({
  page,
}) => {
  await page.goto('/#component/select-tree')
  let popup = await openDestination(page)
  await expect(
    popup.getByRole('treeitem', { name: 'United Kingdom', exact: true }),
  ).toHaveAttribute('aria-expanded', 'true')
  await expect(
    popup.getByRole('treeitem', { name: 'Central Station', exact: true }),
  ).toHaveAttribute('aria-selected', 'true')
  await popup
    .getByRole('treeitem', { name: 'Manchester', exact: true })
    .locator(':scope > .select-tree-row [data-tree-disclosure]')
    .click()
  await popup.getByRole('treeitem', { name: 'Piccadilly', exact: true }).click()
  await expect(popup).not.toBeVisible()
  const trigger = page.getByRole('combobox', { name: 'Pickup destination', exact: true })
  await expect(trigger).toHaveText('United Kingdom / Manchester / Piccadilly')
  await expect(trigger).toBeFocused()

  popup = await openDestination(page)
  const search = popup.getByRole('textbox', { name: 'Search Pickup destination' })
  await search.fill('berlin')
  await expect(popup.getByRole('treeitem', { name: 'United Kingdom', exact: true })).toHaveCount(0)
  await expect(popup.getByRole('treeitem', { name: 'Germany', exact: true })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  await expect(popup.getByRole('treeitem', { name: 'Berlin', exact: true })).toBeVisible()
  await search.press('ArrowDown')
  await expect(popup.getByRole('treeitem', { name: 'Berlin', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(popup.getByRole('treeitem', { name: 'Mitte', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveText('Germany / Berlin / Mitte')

  popup = await openDestination(page)
  await popup.getByRole('textbox').fill('Northgate')
  const disabled = popup.getByRole('treeitem', { name: 'Northgate', exact: true })
  await expect(disabled).toHaveAttribute('aria-disabled', 'true')
  await popup.getByRole('textbox').press('Enter')
  await expect(popup).toBeVisible()
  await popup.getByRole('textbox').press('ArrowDown')
  await page.keyboard.press('End')
  await expect(disabled).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(popup).toBeVisible()
  await popup.getByRole('textbox').fill('No such destination')
  await expect(popup.getByRole('status')).toHaveText('No matching options.')
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveText('Germany / Berlin / Mitte')
})

test('tree keyboard navigation supports parents, children, Home/End, and type-ahead', async ({
  page,
}) => {
  await page.goto('/#component/select-tree')
  const trigger = page.getByRole('combobox', { name: 'Pickup destination', exact: true })
  await trigger.focus()
  await trigger.press('ArrowDown')
  const popup = page.getByRole('dialog', { name: 'Pickup destination tree selector' })
  await expect(popup.getByRole('treeitem', { name: 'Central Station', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  const london = popup.getByRole('treeitem', { name: 'London', exact: true })
  await expect(london).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(london).toHaveAttribute('aria-expanded', 'false')
  await page.keyboard.press('ArrowRight')
  await expect(london).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('ArrowRight')
  await expect(popup.getByRole('treeitem', { name: 'Central Station', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(popup.getByRole('treeitem', { name: 'East Harbor', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveText('United Kingdom / London / East Harbor')
  await trigger.press('ArrowDown')
  await page.keyboard.press('Home')
  await expect(popup.getByRole('treeitem', { name: 'United Kingdom', exact: true })).toBeFocused()
  await page.keyboard.press('End')
  await expect(popup.getByRole('treeitem', { name: 'Germany', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(popup.getByRole('treeitem', { name: 'Berlin', exact: true })).toBeFocused()
  await page.keyboard.press('m')
  await expect(popup.getByRole('treeitem', { name: 'München', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(popup.getByRole('treeitem', { name: 'Schwabing', exact: true })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(trigger).toHaveText('Germany / München / Schwabing')
})

test('countries and cities can be selected independently of expanding their descendants', async ({
  page,
}) => {
  await page.goto('/#component/select-tree')
  const trigger = page.getByRole('combobox', { name: 'Pickup destination', exact: true })
  const popup = await openDestination(page)
  const country = popup.getByRole('treeitem', { name: 'United Kingdom', exact: true })
  const countryRow = country.locator(':scope > .select-tree-row')

  await countryRow.locator('[data-tree-disclosure]').click()
  await expect(country).toHaveAttribute('aria-expanded', 'false')
  await expect(country).toHaveAttribute('aria-selected', 'false')
  await expect(popup).toBeVisible()
  await countryRow.locator('[data-tree-disclosure]').click()
  await expect(country).toHaveAttribute('aria-expanded', 'true')
  await countryRow.click()
  await expect(popup).not.toBeVisible()
  await expect(trigger).toHaveText('United Kingdom')
  await expect(page.locator('.demo-stage code')).toHaveText('uk')

  await trigger.click()
  await expect(country).toHaveAttribute('aria-selected', 'true')
  await expect(
    popup.getByRole('treeitem', { name: 'Central Station', exact: true }),
  ).toHaveAttribute('aria-selected', 'false')
  await popup
    .getByRole('treeitem', { name: 'London', exact: true })
    .locator(':scope > .select-tree-row')
    .click()
  await expect(trigger).toHaveText('United Kingdom / London')
  await expect(page.locator('.demo-stage code')).toHaveText('london')

  await trigger.press('ArrowDown')
  await expect(popup.getByRole('treeitem', { name: 'London', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(country).toBeFocused()
  await page.keyboard.press('Space')
  await expect(trigger).toHaveText('United Kingdom')
  await expect(trigger).toBeFocused()
})

test('search and native forms commit the parent scope as one value', async ({ page }) => {
  await page.goto('/#component/select-tree')
  const form = page.locator('.tree-form-example')
  const trigger = form.getByRole('combobox', { name: 'Required destination' })
  for (const [label, value, path] of [
    ['United Kingdom', 'uk', 'United Kingdom'],
    ['London', 'london', 'United Kingdom / London'],
  ]) {
    await trigger.click()
    const popup = page.getByRole('dialog', { name: 'Required destination tree selector' })
    await popup.getByRole('textbox').fill(label)
    await popup.getByRole('textbox').press('Enter')
    await expect(trigger).toHaveText(path)
    await form.getByRole('button', { name: 'Submit selection' }).click()
    await expect(form.getByRole('status')).toHaveText(`FormData: destination = ${value}`)
    await expect(form.locator('select')).toHaveValue(value)
  }
})

test('native required validation, FormData, reset, and clear work', async ({ page }) => {
  await page.goto('/#component/select-tree')
  const form = page.locator('.tree-form-example')
  const trigger = form.getByRole('combobox', { name: 'Required destination' })
  await form.getByRole('button', { name: 'Submit selection' }).click()
  await expect(form.getByRole('alert')).toHaveText('Choose an option.')
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-invalid', 'true')
  await trigger.click()
  const popup = page.getByRole('dialog', { name: 'Required destination tree selector' })
  await popup.getByRole('textbox').fill('Kreuzberg')
  await popup.getByRole('textbox').press('Enter')
  await form.getByRole('button', { name: 'Submit selection' }).click()
  await expect(form.getByRole('status')).toHaveText('FormData: destination = kreuzberg')
  await form.getByRole('button', { name: 'Reset form' }).click()
  await expect(trigger).toHaveText('Choose a destination…')
  await expect(form.locator('select')).toHaveValue('')
  await expect(form.getByRole('alert')).toHaveCount(0)

  const controlled = page.getByRole('combobox', { name: 'Pickup destination', exact: true })
  await controlled.click()
  await page
    .getByRole('dialog', { name: 'Pickup destination tree selector' })
    .getByRole('button', { name: 'Clear selection' })
    .click()
  await expect(controlled).toHaveText('Choose a location or group…')
})

test('option icons are explicit, decorative, and keep nested labels aligned', async ({ page }) => {
  await page.goto('/#component/select-tree')
  const popup = await openDestination(page)
  await expect(popup.getByText('All', { exact: true })).toHaveCount(0)
  await expect(popup.locator('.lucide-folder, .lucide-folder-open')).toHaveCount(0)

  const country = popup
    .getByRole('treeitem', { name: 'United Kingdom', exact: true })
    .locator(':scope > .select-tree-row')
  const city = popup
    .getByRole('treeitem', { name: 'London', exact: true })
    .locator(':scope > .select-tree-row')
  const leaf = popup
    .getByRole('treeitem', { name: 'Central Station', exact: true })
    .locator(':scope > .select-tree-row')
  await expect(country.locator('[data-tree-option-icon]')).toHaveAttribute('aria-hidden', 'true')
  await expect(country.locator('[data-tree-option-icon] svg')).toHaveCount(1)
  await expect(city.locator('[data-tree-option-icon] svg')).toHaveCount(1)
  await expect(leaf.locator('[data-tree-option-icon]')).toHaveCount(0)
  await expect(leaf.locator('[data-tree-icon-slot]')).toHaveCount(1)
  const cityLabel = await city.getByText('London', { exact: true }).boundingBox()
  const leafLabel = await leaf.getByText('Central Station', { exact: true }).boundingBox()
  expect(leafLabel?.x).toBeGreaterThan(cityLabel?.x || 0)

  await page.keyboard.press('Escape')
  await page.getByRole('combobox', { name: 'Project scope', exact: true }).click()
  const plain = page.getByRole('dialog', { name: 'Project scope tree selector' })
  await expect(plain.locator('[data-tree-icon-slot]')).toHaveCount(0)
  await expect(plain.locator('.lucide-folder, .lucide-folder-open')).toHaveCount(0)
  await expect(plain.getByText('All', { exact: true })).toHaveCount(0)
})

test('selectable branches keep expansion separate from choosing a value', async ({ page }) => {
  await page.goto('/#component/select-tree')
  const trigger = page.getByRole('combobox', { name: 'Project scope', exact: true })
  await trigger.click()
  const popup = page.getByRole('dialog', { name: 'Project scope tree selector' })
  const design = popup.getByRole('treeitem', { name: 'Design', exact: true })
  await expect(design).toHaveAttribute('aria-selected', 'true')
  await design.locator(':scope > .select-tree-row [data-tree-disclosure]').click()
  await expect(design).toHaveAttribute('aria-expanded', 'true')
  await expect(popup).toBeVisible()
  await popup.getByRole('treeitem', { name: 'Marketing website', exact: true }).click()
  await expect(trigger).toHaveText('Entire workspace / Design / Marketing website')
  await trigger.click()
  await popup.getByText('Entire workspace', { exact: true }).click()
  await expect(trigger).toHaveText('Entire workspace')
  await trigger.click()
  const archived = popup.getByRole('treeitem', { name: 'Archived projects', exact: true })
  await expect(archived).toHaveAttribute('aria-disabled', 'true')
  await page.keyboard.press('End')
  await expect(archived).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(archived).toHaveAttribute('aria-expanded', 'false')
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveText('Entire workspace')
  await page.getByRole('button', { name: 'Reset scope' }).click()
  await expect(trigger).toHaveText('Entire workspace / Design')
  await expect(page.locator('select[name="project-scope"]')).toHaveValue('design')
})

test('popup focus stays inside the picker and Escape only closes the top layer', async ({
  page,
}) => {
  await page.goto('/#component/select-tree')
  const popup = await openDestination(page)
  await page.keyboard.press('Tab')
  await expect(popup.getByRole('button', { name: 'Close options' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(popup.getByRole('treeitem', { name: 'Central Station', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(popup.getByRole('button', { name: 'Clear selection' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(popup.getByRole('textbox')).toBeFocused()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Expand', exact: true }).click()
  const outer = page.getByRole('dialog', { name: 'Select Tree', exact: true })
  await outer.getByRole('combobox', { name: 'Pickup destination' }).click()
  await expect(popup).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(popup).not.toBeVisible()
  await expect(outer).toBeVisible()
  await expect(outer.getByRole('combobox')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(outer).not.toBeVisible()
})

test('Select Tree remains readable and accessible in all presets and narrow layouts', async ({
  page,
}) => {
  test.setTimeout(120000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const brand of ['vagabond', 'gilvex', 'gilgil']) {
    for (const theme of ['dark', 'light']) {
      for (const width of [1440, 320]) {
        await page.setViewportSize({ width, height: 1000 })
        await page.goto(`/?brand=${brand}&theme=${theme}#component/select-tree`)
        await expect(
          page.getByRole('heading', { name: 'Select Tree', exact: true, level: 1 }),
        ).toBeVisible()
        await page.evaluate(() => document.fonts.ready)
        const popup = await openDestination(page)
        await page.evaluate(() => document.fonts.ready)
        const rect = await popup.boundingBox()
        expect(rect?.x).toBeGreaterThanOrEqual(0)
        expect((rect?.x || 0) + (rect?.width || 0)).toBeLessThanOrEqual(width)
        const small = await popup.evaluate((element) =>
          [...element.querySelectorAll('*')]
            .filter((node) =>
              [...node.childNodes].some(
                (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim(),
              ),
            )
            .filter((node) => {
              const rect = node.getBoundingClientRect()
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                parseFloat(getComputedStyle(node).fontSize) < 14
              )
            })
            .map((node) => node.textContent),
        )
        expect(small).toEqual([])
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
        expect(results.violations, `${brand}/${theme}/${width}`).toEqual([])
        if (theme === 'dark')
          await page.screenshot({ path: `test-results/select-tree-${brand}-${width}.png` })
        await page.keyboard.press('Escape')
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
      }
    }
  }
})
