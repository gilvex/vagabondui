import { expect, test } from '@playwright/test'

test('forms reject invalid data before it can poison the persisted workspace', async ({ page }) => {
  await page.goto('/#template/support')
  await page.getByRole('button', { name: 'New ticket', exact: true }).click()
  const ticket = page.getByRole('dialog', { name: 'Create support ticket' })
  await ticket.getByRole('textbox', { name: 'Customer name' }).fill('Review customer')
  await ticket.getByRole('textbox', { name: 'Customer email' }).fill('customer@localhost')
  await ticket.getByRole('textbox', { name: 'Subject' }).fill('Persistence review')
  await ticket
    .getByRole('textbox', { name: 'Message', exact: true })
    .fill('Keep this ticket across reloads.')
  await ticket.getByRole('button', { name: 'Create ticket', exact: true }).click()
  await expect(ticket.getByRole('alert')).toHaveText('Enter a valid email address.')
  await ticket.getByRole('textbox', { name: 'Customer email' }).fill('review@example.com')
  await ticket.getByRole('button', { name: 'Create ticket', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Persistence review', exact: true })).toBeVisible()

  await page.goto('/#template/hr')
  await page.getByRole('button', { name: 'View Alex Morgan', exact: true }).click()
  const profile = page.getByRole('dialog', { name: 'Employee profile' })
  await profile.getByRole('textbox', { name: 'Job title', exact: true }).fill('   ')
  await profile.getByRole('button', { name: 'Save profile' }).click()
  await expect(profile.getByRole('alert')).toHaveText('Enter a job title.')
  await page.goto('/#template/support')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Persistence review', exact: true })).toBeVisible()
})

test('a failed lazy page shows a recoverable boundary and navigation still works', async ({
  page,
}) => {
  await page.route('**/src/templates/Chat.tsx*', (route) => route.abort('failed'))
  await page.goto('/#template/chat')
  await expect(page.getByRole('heading', { name: 'This page could not be loaded.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reload page' })).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Components', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Components', exact: true, level: 1 }),
  ).toBeVisible()
})
