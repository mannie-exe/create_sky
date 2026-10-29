import { test, expect } from '@playwright/test'

test('source field connects label, help and validation without losing a draft', async ({
  page,
}) => {
  await page.goto('/authoring')
  await expect(
    page.getByRole('status').filter({ hasText: 'Source loaded' }),
  ).toBeVisible()
  await page
    .getByText('Edit conditions and entry properties', { exact: true })
    .click()
  const field = page.getByLabel('Definition JSON', { exact: true })
  const original = await field.inputValue()
  const id = await field.getAttribute('id')
  await page
    .locator('label')
    .filter({ hasText: /^Definition JSON$/ })
    .click()
  await expect(field).toBeFocused()
  await expect(field).toHaveAttribute('aria-describedby', `${id}-hint`)
  await field.fill('{unfinished')
  await page
    .getByRole('button', { name: 'Apply definition json', exact: true })
    .click()
  await expect(field).toHaveAttribute('aria-invalid', 'true')
  await expect(field).toHaveAttribute(
    'aria-describedby',
    `${id}-hint ${id}-error`,
  )
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(field).toHaveCSS('border-top-color', 'rgb(180, 35, 24)')
  await page.getByRole('button', { name: 'Disclaimers', exact: true }).click()
  await page.getByRole('button', { name: 'Entries', exact: true }).click()
  await page
    .getByText('Edit conditions and entry properties', { exact: true })
    .click()
  await expect(field).toHaveValue('{unfinished')
  await page
    .getByRole('button', { name: 'Discard JSON edit', exact: true })
    .click()
  await expect(field).toHaveValue(original)
  await expect(field).not.toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('static and generated model fields have unique, clickable labels', async ({
  page,
}) => {
  await page.goto('/model-authoring')
  await expect(page.locator('#models-status')).toHaveText('Source loaded')
  for (const name of ['Depth', 'U start']) {
    const control = page.getByLabel(name, { exact: true })
    await page
      .locator('label')
      .filter({ hasText: new RegExp(`^${name}$`) })
      .click()
    await expect(control).toBeFocused()
  }
  const ids = await page
    .locator('.field :is(input,select,textarea)')
    .evaluateAll((es) => es.map((e) => e.id))
  expect(ids.every(Boolean)).toBe(true)
  expect(new Set(ids).size).toBe(ids.length)
  await page.getByText('Recipe JSON', { exact: true }).click()
  await expect(
    page.getByLabel('Selected recipe', { exact: true }),
  ).toHaveAttribute('aria-describedby', 'models-status')
})

test('long field text and enlarged spacing retain narrow workbench bounds', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 850 })
  await page.goto('/authoring')
  await expect(
    page.getByRole('status').filter({ hasText: 'Source loaded' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'New entry', exact: true }).click()
  await page
    .getByLabel('English title', { exact: true })
    .fill('A deliberately long journal title '.repeat(12))
  await page.addStyleTag({
    // Astro's development toolbar can cover bottom-edge controls on narrow screens.
    content:
      'astro-dev-toolbar { display: none !important; } :root { --space-tight: 8px; --space-control: 16px; }',
  })
  await expect(page.getByLabel('English title', { exact: true })).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.getByRole('button', { name: 'Localization', exact: true }).click()
  await page.getByLabel('Find key or text').fill('nothing matches this string')
  await expect(
    page.getByText('No matching strings.', { exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test('selection roles propagate independently of action color and survive hover', async ({
  page,
}) => {
  await page.goto('/authoring')
  await expect(
    page.getByRole('status').filter({ hasText: 'Source loaded' }),
  ).toBeVisible()
  await page.addStyleTag({
    content:
      ':root { --ink-selected: rgb(84, 45, 120); --line-selected: rgb(84, 45, 120); }',
  })
  const selected = page.getByRole('button', { name: 'Entries', exact: true })
  await expect(selected).toHaveCSS('color', 'rgb(84, 45, 120)')
  await selected.hover()
  await expect(selected).toHaveCSS('color', 'rgb(84, 45, 120)')
  await expect(
    page.getByRole('button', { name: 'Delete entry', exact: true }),
  ).toHaveCSS('color', 'rgb(180, 35, 24)')
})

test('selected secondary text remains readable on the selected surface', async ({
  page,
}) => {
  await page.goto('/model-authoring')
  await expect(page.locator('#models-status')).toHaveText('Source loaded')
  const row = page.locator('#model-list [aria-current="true"]')
  const ratio = await row.evaluate((el) => {
    const channels = (color) =>
      color
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number)
        .map((n) => n / 255)
        .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4))
    const luminance = (color) => {
      const [r, g, b] = channels(color)
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const a = luminance(getComputedStyle(el.querySelector('small')).color),
      b = luminance(getComputedStyle(el).backgroundColor)
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  })
  expect(ratio).toBeGreaterThanOrEqual(4.5)
})
