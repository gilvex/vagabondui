import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const routes = [
  { id: 'chat', title: 'general' },
  { id: 'hr', title: 'People & culture' },
  { id: 'sorting', title: 'Sorting center' },
  { id: 'pickup', title: 'Pickup point' },
  { id: 'support', title: 'Support inbox' },
  { id: 'billing', title: 'Billing & invoices' },
]

async function checkReadable(page: Page) {
  const errors = await page.evaluate(() =>
    [...document.querySelectorAll('body *')].flatMap((element) => {
      const text = [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
      )
      if (!text && !['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) return []
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      if (!rect.width || !rect.height || style.display === 'none' || style.visibility === 'hidden')
        return []
      return parseFloat(style.fontSize) < 14
        ? [`${element.tagName}: ${style.fontSize} ${element.textContent?.slice(0, 60)}`]
        : []
    }),
  )
  expect(errors).toEqual([])
  const layout = await page.evaluate(() => ({
    route: location.hash,
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: [...document.querySelectorAll('main *')]
      .filter((element) => element.getBoundingClientRect().right > innerWidth + 1)
      .slice(0, 12)
      .map((element) => ({
        tag: element.tagName,
        class: element.className,
        right: element.getBoundingClientRect().right,
      })),
  }))
  expect(layout.scrollWidth, JSON.stringify(layout)).toBeLessThanOrEqual(layout.width)
}

test('chat supports sending, pins, reactions, threads, editing, and direct messages', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/#template/chat')
  await page
    .getByRole('textbox', { name: 'Message #general', exact: true })
    .fill('Warehouse handover ready')
  await page.getByRole('textbox', { name: 'Message #general', exact: true }).press('Enter')
  const message = page
    .locator('.chat-message-list [data-message-id]')
    .filter({ hasText: 'Warehouse handover ready' })
  await expect(message).toBeVisible()
  await message.hover()
  await message.getByRole('button', { name: 'Pin message', exact: true }).click()
  await page.getByRole('button', { name: 'Show pinned messages' }).click()
  await expect(message).toBeVisible()
  await message.hover()
  await message.getByRole('button', { name: 'Add reaction', exact: true }).click()
  await page.getByRole('button', { name: 'React 👍', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(message.locator('.message-reactions button')).toHaveAttribute('aria-pressed', 'true')
  await message.hover()
  await message.getByRole('button', { name: 'Reply in thread', exact: true }).click()
  const thread = page.getByRole('dialog', { name: 'Thread', exact: true })
  await thread
    .getByRole('textbox', { name: 'Reply in thread' })
    .fill('Confirmed for the afternoon shift.')
  await thread.getByRole('button', { name: 'Send reply' }).click()
  await expect(
    thread.getByText('Confirmed for the afternoon shift.', { exact: true }),
  ).toBeVisible()
  await thread.getByRole('button', { name: 'Close panel' }).click()
  await expect(thread).not.toBeVisible()
  await expect(message.getByRole('button', { name: /1 reply/ })).toBeVisible()
  await message.hover()
  await message.getByRole('button', { name: 'Message actions' }).click()
  await page.getByRole('menuitem', { name: 'Edit message', exact: true }).click()
  await page.getByRole('textbox', { name: 'Edit message' }).fill('Warehouse handover updated')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.reload()
  await expect(page.getByText('Warehouse handover updated', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Sam Lee', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Message Sam Lee', exact: true })
    .fill('The queue is ready for review.')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('log', { name: 'Message history' })).toContainText(
    'The queue is ready for review.',
  )
  await page
    .getByRole('navigation', { name: 'Chat channels' })
    .getByRole('button', { name: /^general/ })
    .click()
  await expect(page.getByRole('log', { name: 'Message history' })).not.toContainText(
    'The queue is ready for review.',
  )
})

test('HR adds employees, completes onboarding, and reviews leave requests', async ({ page }) => {
  await page.goto('/#template/hr')
  await page.getByRole('button', { name: 'Add employee', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Add an employee' })
  await dialog.getByRole('textbox', { name: 'Full name' }).fill('Casey Nguyen')
  await dialog.getByRole('textbox', { name: 'Work email' }).fill('casey@example.com')
  await dialog.getByRole('textbox', { name: 'Job title' }).fill('Product engineer')
  await dialog.getByRole('button', { name: 'Create employee' }).click()
  await page.getByRole('textbox', { name: 'Search employees' }).fill('Casey')
  await expect(page.getByRole('row').filter({ hasText: 'Casey Nguyen' })).toContainText(
    'Onboarding',
  )
  await page.getByRole('button', { name: 'Grid view' }).click()
  await expect(page.locator('.employee-card')).toHaveCount(1)
  await page.getByRole('tab', { name: 'Onboarding', exact: true }).click()
  for (const step of ['Account provisioned', 'Documents verified', 'Orientation scheduled'])
    await page.getByRole('checkbox', { name: `${step} for Casey Nguyen` }).check()
  const onboarding = page.locator('[data-slot="card"]').filter({ hasText: 'Casey Nguyen' })
  await onboarding.getByRole('button', { name: 'Complete onboarding' }).click()
  await expect(onboarding).not.toBeVisible()
  await page.getByRole('tab', { name: 'Time off', exact: true }).click()
  await page.getByRole('button', { name: 'Approve leave for Alex Morgan' }).click()
  await expect(page.getByRole('row').filter({ hasText: 'Alex Morgan' })).toContainText('Approved')
  await page.getByRole('button', { name: 'Request leave', exact: true }).click()
  const request = page.getByRole('dialog', { name: 'Request time off' })
  await request.getByRole('combobox', { name: 'Employee', exact: true }).click()
  await page.getByRole('option', { name: 'Casey Nguyen', exact: true }).click()
  await request.getByRole('button', { name: 'Submit request' }).click()
  await expect(page.getByRole('row').filter({ hasText: 'Casey Nguyen' })).toContainText('Pending')
  await page.getByRole('button', { name: 'Decline leave for Casey Nguyen' }).click()
  const decline = page.getByRole('dialog', { name: 'Decline leave request' })
  await decline
    .getByRole('textbox', { name: 'Reason' })
    .fill('Please choose dates after orientation.')
  await decline.getByRole('button', { name: 'Decline request', exact: true }).click()
  await expect(page.getByRole('row').filter({ hasText: 'Casey Nguyen' })).toContainText('Declined')
  await page.reload()
  await page.getByRole('textbox', { name: 'Search employees' }).fill('Casey')
  await expect(page.getByRole('row').filter({ hasText: 'Casey Nguyen' })).toContainText('Active')
})

test('parcel completes sorting, dispatch, receipt, and verified pickup across pages', async ({
  page,
}) => {
  await page.goto('/#template/sorting')
  await page.getByRole('textbox', { name: 'Parcel barcode' }).fill('unknown')
  await page.getByRole('button', { name: 'Find parcel', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('No parcel found')
  await page.getByRole('textbox', { name: 'Parcel barcode' }).fill('PKG-1042')
  await page.getByRole('textbox', { name: 'Parcel barcode' }).press('Enter')
  const details = page.getByRole('dialog', { name: 'PKG-1042', exact: true })
  await details.getByRole('button', { name: 'Sort parcel', exact: true }).click()
  await expect(details.locator('[data-slot="badge"]')).toHaveText('Sorted')
  await details.getByRole('button', { name: 'Dispatch parcel', exact: true }).click()
  await expect(details.locator('[data-slot="badge"]')).toHaveText('In transit')
  await details.getByRole('button', { name: 'Close panel' }).click()
  await expect(details).not.toBeVisible()
  await page
    .getByRole('navigation', { name: 'Template navigation' })
    .getByRole('link', { name: 'Pickup point', exact: true })
    .click()
  await page.getByRole('tab', { name: 'Arrivals', exact: true }).click()
  await page.getByRole('button', { name: 'PKG-1042', exact: true }).click()
  const pickup = page.getByRole('dialog', { name: 'PKG-1042', exact: true })
  await pickup.getByRole('combobox', { name: 'Storage shelf' }).click()
  await page.getByRole('option', { name: 'B-01', exact: true }).click()
  await pickup.getByRole('button', { name: 'Receive parcel', exact: true }).click()
  await expect(pickup.locator('[data-slot="badge"]')).toHaveText('Ready for pickup')
  await pickup.getByRole('button', { name: 'Verify collection', exact: true }).click()
  const verify = page.getByRole('dialog', { name: 'Verify parcel collection' })
  await verify.getByRole('textbox', { name: '6-digit collection code' }).fill('111111')
  await verify.getByRole('button', { name: 'Release parcel' }).click()
  await expect(verify.getByRole('alert')).toContainText('does not match')
  await verify.getByRole('textbox', { name: '6-digit collection code' }).fill('641205')
  await verify.getByRole('button', { name: 'Release parcel' }).click()
  await expect(verify).not.toBeVisible()
  await expect(pickup.locator('[data-slot="badge"]')).toHaveText('Collected')
  await page.reload()
  await page.getByRole('tab', { name: 'Collected', exact: true }).click()
  await expect(page.getByRole('button', { name: 'PKG-1042', exact: true })).toBeVisible()
})

test('exceptions and bulk dispatch enforce processing states', async ({ page }) => {
  await page.goto('/#template/sorting')
  await page.getByRole('tab', { name: 'Exceptions', exact: true }).click()
  await page.getByRole('button', { name: 'PKG-1048', exact: true }).click()
  const details = page.getByRole('dialog', { name: 'PKG-1048', exact: true })
  await expect(details.getByRole('button', { name: 'Sort parcel' })).toHaveCount(0)
  await details.getByRole('button', { name: 'Resolve exception' }).click()
  const resolve = page.getByRole('dialog', { name: 'Resolve parcel exception' })
  await resolve
    .getByRole('textbox', { name: 'Resolution note' })
    .fill('Destination verified against the manifest.')
  await resolve.getByRole('button', { name: 'Resolve exception', exact: true }).click()
  await expect(details.locator('[data-slot="badge"]')).toHaveText('Received')
  await details.getByRole('button', { name: 'Sort parcel' }).click()
  await details.getByRole('button', { name: 'Close panel' }).click()
  await expect(details).not.toBeVisible()
  await page.getByRole('tab', { name: 'Ready to dispatch', exact: true }).click()
  await page.getByRole('checkbox', { name: 'Select all dispatchable parcels' }).check()
  await page.getByRole('button', { name: 'Dispatch selected' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Confirm dispatch' }).click()
  await expect(page.getByRole('heading', { name: 'No parcels in this queue' })).toBeVisible()
  await page.getByRole('tab', { name: 'Dispatched', exact: true }).click()
  await expect(page.getByRole('button', { name: 'PKG-1048', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'PKG-1043', exact: true })).toBeVisible()
})

test('support uses internal notes, replies, assignment, and linked orders', async ({ page }) => {
  await page.goto('/#template/support')
  await page.getByRole('tab', { name: 'Internal note', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Internal note', exact: true })
    .fill('Checking the label with the sorting team.')
  await page.getByRole('button', { name: 'Add note', exact: true }).click()
  await expect(page.getByRole('log', { name: 'Ticket conversation' })).toContainText(
    'Checking the label with the sorting team.',
  )
  await page.getByRole('tab', { name: 'Reply', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Reply to customer' })
    .fill('We have located your parcel and are checking its label.')
  await page.getByRole('button', { name: 'Send reply', exact: true }).click()
  await expect(page.getByRole('log', { name: 'Ticket conversation' })).toContainText(
    'We have located your parcel',
  )
  await page.getByRole('button', { name: 'Open parcel' }).click()
  await expect(page.getByRole('dialog', { name: 'PKG-1048', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Close panel' }).click()
  await page.getByRole('button', { name: 'Resolve', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Reopen', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Reopen', exact: true })).toBeVisible()
})

test('billing creates, sends, pays, and exports an invoice', async ({ page }) => {
  await page.goto('/#template/billing')
  await page.getByRole('button', { name: 'Create invoice', exact: true }).click()
  const draft = page.getByRole('dialog', { name: 'Create invoice', exact: true })
  await draft.getByRole('textbox', { name: 'Customer or company' }).fill('Birch Tools')
  await draft.getByRole('textbox', { name: 'Billing email' }).fill('billing@birch.example')
  await draft.getByRole('textbox', { name: 'Description', exact: true }).fill('Workspace renewal')
  await draft.getByRole('spinbutton', { name: 'Amount (USD)' }).fill('120.50')
  await draft.getByRole('button', { name: 'Save draft' }).click()
  await page.getByRole('textbox', { name: 'Search invoices' }).fill('Birch')
  const row = page.getByRole('row').filter({ hasText: 'Birch Tools' })
  await expect(row).toContainText('Draft')
  await row.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Mark selected as sent' }).click()
  await expect(row).toContainText('Sent')
  await row.getByRole('button', { name: /^Actions for/ }).click()
  await page.getByRole('menuitem', { name: 'Record payment' }).click()
  const payment = page.getByRole('dialog', { name: 'Record a payment' })
  await payment.getByRole('textbox', { name: 'Payment reference' }).fill('BANK-TEST-1002')
  await payment.getByRole('button', { name: 'Confirm payment' }).click()
  await expect(row).toContainText('Paid')
  await expect(row).toContainText('$120.50')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export CSV' }).click()
  expect((await download).suggestedFilename()).toBe('invoices.csv')
  await page.reload()
  await page.getByRole('textbox', { name: 'Search invoices' }).fill('Birch')
  await expect(page.getByRole('row').filter({ hasText: 'Birch Tools' })).toContainText('Paid')
})

test('new business pages are responsive, readable, and accessible in both themes', async ({
  page,
}) => {
  test.setTimeout(180000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of routes) {
      await page.goto(`/#template/${route.id}`)
      await expect(
        page.getByRole('heading', { name: route.title, exact: true, level: 1 }),
      ).toBeVisible()
      await checkReadable(page)
      if (width !== 320)
        await page.screenshot({
          path: `test-results/business-${route.id}-${width}.png`,
          fullPage: width === 1440,
        })
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const route of routes) {
    await page.goto(`/#template/${route.id}`)
    await page.reload()
    await expect(
      page.getByRole('heading', { name: route.title, exact: true, level: 1 }),
    ).toBeVisible()
    const dark = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(dark.violations, `Dark ${route.id}`).toEqual([])
    await page.getByRole('button', { name: 'Switch to light mode' }).click()
    await page.reload()
    await expect(
      page.getByRole('heading', { name: route.title, exact: true, level: 1 }),
    ).toBeVisible()
    const light = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(light.violations, `Light ${route.id}`).toEqual([])
    await page.getByRole('button', { name: 'View source' }).click()
    await expect(page.getByRole('dialog').locator('pre')).toContainText('export default function')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  }
  expect(errors).toEqual([])
})

test('mobile chat channels and support inbox are reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#template/chat')
  await page.getByRole('button', { name: 'Open channels' }).click()
  const channels = page.getByRole('dialog', { name: 'Channels', exact: true })
  await channels.getByRole('button', { name: 'design', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'design', exact: true, level: 1 })).toBeVisible()
  await page.getByRole('button', { name: 'Show members' }).click()
  const members = page.getByRole('dialog', { name: 'Members', exact: true })
  await members.getByRole('button', { name: 'Message Sam Lee' }).click()
  await expect(page.getByRole('heading', { name: 'Sam Lee', exact: true, level: 1 })).toBeVisible()
  await page.goto('/#template/support')
  await page.getByRole('button', { name: 'Browse tickets' }).click()
  const inbox = page.getByRole('dialog', { name: 'Support tickets', exact: true })
  await inbox.locator('[data-ticket-id="SUP-202"]').click()
  await expect(
    page.getByRole('heading', { name: 'Change my pickup location', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Show ticket details' }).click()
  await expect(
    page
      .getByRole('dialog', { name: 'Ticket properties' })
      .getByRole('combobox', { name: 'Priority' }),
  ).toBeVisible()
})
