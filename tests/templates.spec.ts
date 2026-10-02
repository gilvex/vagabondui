import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function checkLayout(page: Page) {
  const errors = await page.evaluate(() =>
    [...document.querySelectorAll('body *')].flatMap((element) => {
      const hasText = [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
      )
      if (!hasText && !['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) return []
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      if (!rect.width || !rect.height || style.visibility === 'hidden' || style.display === 'none')
        return []
      return parseFloat(style.fontSize) < 14
        ? [`${element.tagName}: ${element.textContent?.slice(0, 60)} (${style.fontSize})`]
        : []
    }),
  )
  expect(errors).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
}

test('notification actions remain a single line on narrow screens', async ({ page }) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#component/toast')
    await page.reload()
    await page.getByRole('button', { name: 'Show notification' }).click()
    const action = page.getByRole('button', { name: 'Undo', exact: true })
    await expect(action).toBeVisible()
    const dimensions = await action.evaluate((button) => {
      const text = document.createRange()
      text.selectNodeContents(button)
      const toast = button.closest('[data-sonner-toast]')!.getBoundingClientRect()
      const rect = button.getBoundingClientRect()
      return {
        lines: text.getClientRects().length,
        textWidth: text.getBoundingClientRect().width,
        width: rect.width,
        right: rect.right,
        toastRight: toast.right,
        whitespace: getComputedStyle(button).whiteSpace,
        font: parseFloat(getComputedStyle(button).fontSize),
      }
    })
    expect(dimensions.lines).toBe(1)
    expect(dimensions.whitespace).toBe('nowrap')
    expect(dimensions.width).toBeGreaterThan(dimensions.textWidth + 16)
    expect(dimensions.right).toBeLessThanOrEqual(dimensions.toastRight - 10)
    expect(dimensions.font).toBeGreaterThanOrEqual(14)
    if (width === 390) await page.screenshot({ path: 'test-results/toast-mobile.png' })
    await action.click()
    await expect(page.getByText('Changes reverted', { exact: true })).toBeVisible()
  }
})

test('dashboard chart changes, CSV exports, and task state is shared between templates', async ({
  page,
}) => {
  await page.goto('/#template/dashboard')
  await expect(page.getByRole('heading', { name: 'Workspace overview', exact: true })).toBeVisible()
  const path = page.locator('[data-chart-line="completed"]')
  const before = await path.getAttribute('d')
  await page.getByRole('combobox', { name: 'Activity period' }).click()
  await page.getByRole('option', { name: 'Last 30 days' }).click()
  await expect(path).not.toHaveAttribute('d', before!)
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export report' }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe('northstar-activity-month.csv')

  await page.getByRole('button', { name: 'New task', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Create task' })
  await dialog.getByRole('textbox', { name: 'Task title' }).fill('Verify the new template workflow')
  await dialog.getByRole('button', { name: 'Create task' }).click()
  await expect(
    page.getByRole('button', { name: 'Verify the new template workflow', exact: true }),
  ).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Template navigation' })
    .getByRole('link', { name: 'Projects' })
    .click()
  await page.getByRole('textbox', { name: 'Search tasks' }).fill('Verify the new template workflow')
  await expect(page.locator('.task-card')).toHaveCount(1)
  await page.getByRole('button', { name: 'Actions for Verify the new template workflow' }).click()
  await page.getByRole('menuitem', { name: 'Done', exact: true }).click()
  await expect(
    page
      .getByRole('region', { name: 'Done tasks' })
      .getByText('Verify the new template workflow', { exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page
      .getByRole('region', { name: 'Done tasks' })
      .getByText('Verify the new template workflow', { exact: true }),
  ).toBeVisible()
})

test('task board and list support editing, filtering, deleting, and undo', async ({ page }) => {
  await page.goto('/#template/projects')
  await page.getByRole('textbox', { name: 'Search tasks' }).fill('authentication')
  await expect(page.locator('.task-card')).toHaveCount(1)
  await page.getByRole('button', { name: 'Review authentication flow', exact: true }).click()
  const details = page.getByRole('dialog', { name: 'Task details' })
  await details.getByRole('textbox', { name: 'Title', exact: true }).fill('Review account recovery')
  await details.getByRole('button', { name: 'Save changes' }).click()
  await expect(details).not.toBeVisible()
  await page.getByRole('textbox', { name: 'Search tasks' }).fill('account recovery')
  await expect(page.locator('.task-card')).toHaveCount(1)
  await page.getByRole('tab', { name: 'List', exact: true }).click()
  await expect(page.getByRole('table')).toBeVisible()
  await page.getByRole('button', { name: 'Actions for Review account recovery' }).click()
  await page.getByRole('menuitem', { name: 'Delete task' }).click()
  await expect(page.getByText('No tasks match these filters.')).toBeVisible()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Review account recovery', exact: true }),
  ).toBeVisible()
})

test('settings validate, persist preferences, invite members, and reset demo data', async ({
  page,
}) => {
  await page.goto('/#template/settings')
  const workspaceName = page.getByRole('textbox', { name: 'Workspace name', exact: true })
  await workspaceName.fill('A')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(workspaceName).toHaveAttribute('aria-invalid', 'true')
  await workspaceName.fill('Platform team')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.locator('.template-brand')).toContainText('Platform team')
  await page.getByRole('tab', { name: 'Notifications', exact: true }).click()
  const digest = page.getByRole('switch', { name: 'Weekly digest', exact: true })
  await digest.click()
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'Workspace name' })).toHaveValue('Platform team')
  await page.getByRole('tab', { name: 'Notifications', exact: true }).click()
  await expect(page.getByRole('switch', { name: 'Weekly digest' })).toBeChecked()

  await page.getByRole('tab', { name: 'Members', exact: true }).click()
  await page.getByRole('button', { name: 'Invite member', exact: true }).click()
  const invitation = page.getByRole('dialog', { name: 'Invite a member' })
  await invitation.getByRole('textbox', { name: 'Full name' }).fill('Taylor Smith')
  await invitation.getByRole('textbox', { name: 'Email address' }).fill('taylor@example.com')
  await invitation.getByRole('button', { name: 'Add invitation' }).click()
  await expect(page.getByText('taylor@example.com', { exact: true })).toBeVisible()
  await page.getByRole('combobox', { name: 'Role for Taylor Smith' }).click()
  await page.getByRole('option', { name: 'Admin', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'Role for Taylor Smith' })).toHaveText('Admin')
  await page.getByRole('tab', { name: 'General', exact: true }).click()
  await page.getByRole('button', { name: 'Reset demo workspace' }).click()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Reset workspace', exact: true })
    .click()
  await expect(page.getByRole('textbox', { name: 'Workspace name' })).toHaveValue('Northstar')
})

test('template routes, source viewer, readable responsive layouts, and themes', async ({
  page,
}) => {
  test.setTimeout(120000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const routes = [
    { path: 'templates', title: 'Components in context.' },
    { path: 'template/dashboard', title: 'Workspace overview' },
    { path: 'template/projects', title: 'Project tasks' },
    { path: 'template/settings', title: 'Workspace settings' },
  ]
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of routes) {
      await page.goto(`/#${route.path}`)
      await expect(page.getByRole('heading', { name: route.title, exact: true })).toBeVisible()
      await checkLayout(page)
      if (width === 1440 || width === 390)
        await page.screenshot({
          path: `test-results/${route.path.replace('/', '-')}-${width}.png`,
          fullPage: width === 1440,
        })
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const route of routes) {
    await page.goto(`/#${route.path}`)
    await page.reload()
    await expect(page.getByRole('heading', { name: route.title, exact: true })).toBeVisible()
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(244, 244, 245)')
    const dark = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(dark.violations).toEqual([])
    await page.getByRole('button', { name: 'Switch to light mode' }).click()
    await page.reload()
    await expect(page.getByRole('heading', { name: route.title, exact: true })).toBeVisible()
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(24, 24, 27)')
    const light = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(light.violations).toEqual([])
    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  }
  await page.getByRole('button', { name: 'View source', exact: true }).click()
  await expect(page.getByRole('dialog').locator('pre')).toContainText(
    'export default function Settings',
  )
  expect(errors).toEqual([])
})

test('animations are present for tabs, accordion, sheets, charts, and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/#component/tabs')
  await page.getByRole('tab', { name: 'Activity', exact: true }).click()
  await expect(
    page
      .getByRole('tab', { name: 'Activity', exact: true })
      .locator('[data-slot="tabs-indicator"]'),
  ).toBeVisible()
  await expect(page.getByRole('tabpanel')).toHaveCSS('animation-name', 'ui-panel-in')
  await page.goto('/#component/accordion')
  await page.getByRole('button', { name: 'Can I edit the source?' }).click()
  const accordion = page.locator('[data-slot="accordion-content"][data-state="open"]')
  await expect(accordion).toHaveCSS('animation-name', 'ui-accordion-open')
  await expect(accordion).toHaveCSS('animation-duration', '0.24s')
  await page.goto('/#component/sheet')
  await page.getByRole('button', { name: 'Edit profile', exact: true }).click()
  await expect(page.locator('[data-slot="sheet-content"]')).toHaveCSS(
    'animation-name',
    'ui-sheet-in',
  )
  await page.keyboard.press('Escape')
  await page.goto('/#template/dashboard')
  await expect(page.locator('[data-chart-line="completed"]')).toBeVisible()
  await expect
    .poll(async () =>
      parseFloat(
        (await page.locator('[data-chart-line="completed"]').getAttribute('stroke-dasharray')) ||
          '0',
      ),
    )
    .toBe(1)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#component/accordion')
  await page.getByRole('button', { name: 'Can I edit the source?' }).click()
  const duration = await page
    .locator('[data-slot="accordion-content"][data-state="open"]')
    .evaluate((element) => parseFloat(getComputedStyle(element).animationDuration))
  expect(duration).toBeLessThan(0.001)
  await page.goto('/#template/dashboard')
  await expect(page.locator('[data-chart-line="completed"]')).toBeVisible()
  await expect(page.locator('[data-chart-line="completed"]')).not.toHaveAttribute(
    'stroke-dasharray',
    /0px/,
  )
})
