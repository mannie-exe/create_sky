import { test, expect } from '@playwright/test'

test('model workbench previews extrusion and fitting without saving', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/model-authoring')
  await expect(page.locator('#models-status')).toHaveText('Source loaded')
  await expect(page.locator('#model-list button')).toHaveCount(8)
  await expect(page.locator('#model-canvas')).toHaveAttribute(
    'data-ready',
    'industrial-bars-post',
  )
  await page.getByLabel('Depth', { exact: true }).fill('1.5')
  await expect(page.locator('#models-status')).toHaveText(
    'Unsaved changes; preview current',
  )
  await expect(page.locator('#models-save')).toBeEnabled()
  await expect(page.locator('#models-generate')).toBeDisabled()
  await page
    .locator('#model-list button')
    .filter({ hasText: /^Bell lanternfitting/ })
    .click()
  await expect(page.locator('#model-canvas')).toHaveAttribute(
    'data-ready',
    'bell-lantern',
  )
  await page
    .getByRole('combobox', { name: 'Element', exact: true })
    .selectOption('9')
  await page.getByLabel('U start', { exact: true }).fill('2')
  await expect(page.locator('#models-status')).toHaveText(
    'Unsaved changes; preview current',
  )
  const recipe = JSON.parse(await page.locator('#model-json').inputValue())
  const window = recipe.edits.find((edit) => edit.element === 9)
  expect(Object.values(window.faces)[0].uv[0]).toBe(2)
  await page
    .locator('#model-list button')
    .filter({ hasText: /^Industrial iron bars: postextrusion/ })
    .click()
  await expect(page.getByLabel('Depth', { exact: true })).toHaveValue('1.5')
  expect(errors).toEqual([])
  page.on('dialog', (dialog) => dialog.accept())
  await page.locator('#models-reload').click()
  await expect(page.locator('#models-status')).toHaveText('Source loaded')
  await expect(page.getByLabel('Depth', { exact: true })).toHaveValue('2')
})

test('mobile model workbench fits viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 850 })
  await page.goto('/model-authoring')
  await expect(page.locator('#models-status')).toHaveText('Source loaded')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test('unapplied JSON survives recipe switches and cannot be silently generated', async ({
  page,
}) => {
  await page.goto('/model-authoring')
  await expect(page.locator('#models-status')).toHaveText('Source loaded')
  await page.locator('summary').filter({ hasText: 'Recipe JSON' }).click()
  await page.locator('#model-json').fill('{unfinished')
  await page
    .locator('#model-list button')
    .filter({ hasText: /^Bell lanternfitting/ })
    .click()
  await page
    .locator('#model-list button')
    .filter({ hasText: /^Industrial iron bars: postextrusion/ })
    .click()
  await expect(page.locator('#model-json')).toHaveValue('{unfinished')
  await expect(page.locator('#models-generate')).toBeDisabled()
  await page.locator('#model-apply-json').click()
  await expect(page.locator('#model-json')).toHaveValue('{unfinished')
  await expect(page.locator('#models-status')).not.toHaveText('Source loaded')
})
