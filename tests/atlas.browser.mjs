import { test, expect } from '@playwright/test'

test('real snapshot, virtualized map, item provenance and world profile', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.locator('#counts')).toContainText('runtime recipes')
  expect(await page.locator('.cell').count()).toBeLessThan(250)
  await page.locator('#search').fill('reliable_gliders:glider')
  await page.locator('[data-id="reliable_gliders:glider"]').click()
  await expect(page.locator('#detail h2')).toHaveText('Glider')
  await expect(page.locator('.intro')).toHaveCount(0)
  await expect(page.locator('#detail')).toContainText('Mapped potential route')
  await expect(page.locator('#detail .route-path')).toContainText(
    'Phantom Membrane',
  )
  await expect(page.locator('#detail')).toContainText('phantom membranes')
  await page.getByRole('button', { name: 'World & ores', exact: true }).click()
  await page.locator('#ore-map').selectOption('create:zinc_ore')
  await expect(page.locator('#ore-profile')).toContainText('create:zinc_ore')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true)
  expect(errors).toEqual([])
})

test('workspace presents editable domains and rejects malformed recipe paths', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Edit data', exact: true }).click()
  await expect(page.locator('#domain-editor')).toHaveValue(/schema: 1/)
  const response = await page.evaluate(async () => {
    const workspace = await fetch('/__atlas/workspace').then((r) => r.json())
    const result = await fetch('/__atlas/domain/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        revision: workspace.files.recipes.revision,
        text: 'schema: 1\nchanges: [{id: "bad:../escape", disabled: true}]',
      }),
    })
    return { status: result.status, body: await result.json() }
  })
  expect(response.status).toBe(400)
  expect(response.body.error).toBe('Invalid recipe id')
})

test('coverage filters, blocked routes and editable acquisition domain', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('#coverage-summary')).toContainText('no adapter')
  await page.locator('#route-filter').selectOption('excluded')
  await page.locator('#search').fill('minecraft:barrier')
  await page.locator('[data-id="minecraft:barrier"]').click()
  await expect(page.locator('#detail')).toContainText('Internal / creative')
  await page.getByRole('button', { name: 'Edit data', exact: true }).click()
  await page.locator('#edit-domain').selectOption('acquisition')
  await expect(page.locator('#domain-editor')).toHaveValue(/access\/overworld/)
  await page.getByRole('button', { name: 'Evidence', exact: true }).click()
  await page.locator('#evidence-domain').selectOption('acquisition')
  await page.locator('#evidence-search').fill('chiseling')
  await expect(page.locator('#evidence-list')).toContainText(
    'Runtime Rechiseled group',
  )
})

test('missing world survey has an explicit empty state', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/generated/world.json', (route) =>
    route.fulfill({ json: null }),
  )
  await page.goto('/')
  await page.getByRole('button', { name: 'World & ores', exact: true }).click()
  await expect(page.locator('#world-summary')).toHaveText(
    'No world survey captured.',
  )
  await expect(page.locator('#world-layout')).toBeHidden()
  await expect(page.locator('#world-notes')).toContainText('pnpm data:world')
  expect(errors).toEqual([])
})
