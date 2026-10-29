import { test, expect } from '@playwright/test'

test('combined axes follow policy, zoom, families and filtered counts', async ({
  page,
}) => {
  await page.goto('/')
  const catalog = await (
    await page.request.get('/generated/catalog.json')
  ).json()
  const iron = catalog.nodes.find((n) => n.id === 'minecraft:iron_ingot')
  const study = page.locator('.map-orientation')
  await expect(
    page.getByLabel('Progression policy', { exact: true }),
  ).toHaveValue('planned')
  await expect(study).toBeVisible()
  await expect(page.getByLabel('Jump to depth', { exact: true })).toBeVisible()
  await page
    .getByLabel('Jump to acquisition band', { exact: true })
    .selectOption('production')
  await expect(page.locator('[data-family-band="production"]')).toHaveAttribute(
    'aria-current',
    'true',
  )
  await page.locator('#search').fill('minecraft:iron_ingot')
  await expect(study).toHaveAttribute(
    'data-current-depth',
    String(iron.progression.planned.depth),
  )
  await expect(
    page.getByLabel('Jump to acquisition band', { exact: true }),
  ).toHaveValue('production')
  const cell = page.locator('[data-id="minecraft:iron_ingot"]')
  await expect(cell).toBeVisible()
  const before = await cell.getAttribute('style')
  await page.locator('#zoom').fill('1.4')
  await expect(cell).not.toHaveAttribute('style', before)
  const alignment = await page.evaluate(() => {
    const cell = document
      .querySelector('[data-id="minecraft:iron_ingot"]')
      .getBoundingClientRect()
    const family = document
      .querySelector('[data-family-band="production"]')
      .getBoundingClientRect()
    return cell.top >= family.top - 1
  })
  expect(alignment).toBe(true)
  const horizontal = await page.evaluate((depth) => {
    const ruler = document
      .querySelector(`[data-depth-band="${depth}"]`)
      .getBoundingClientRect()
    const cell = document
      .querySelector('[data-id="minecraft:iron_ingot"]')
      .getBoundingClientRect()
    return (cell.left - ruler.left) / cell.width
  }, iron.progression.planned.depth)
  expect(Math.abs(horizontal - Math.round(horizontal))).toBeLessThan(0.01)
  await page
    .getByLabel('Progression policy', { exact: true })
    .selectOption('earliest')
  await expect(study).toHaveAttribute(
    'data-current-depth',
    String(iron.progression.earliest.depth),
  )
  await expect(
    page.getByLabel('Jump to acquisition band', { exact: true }),
  ).toHaveValue('exploration')
  await cell.click()
  await expect(page.locator('[data-selected-method]')).toHaveAttribute(
    'data-selected-method',
    iron.progression.earliest.route,
  )
  await page
    .getByRole('button', { name: 'Open item progression', exact: true })
    .click()
  await expect(page.getByLabel('Graph progression policy')).toHaveValue(
    'earliest',
  )
  await page.getByRole('button', { name: 'Item map', exact: true }).click()
  await page.locator('#search').fill('no-such-item-73199')
  await expect(page.locator('#position')).toHaveText('No matching items')
  await expect(
    page.getByLabel('Jump to acquisition band', { exact: true }),
  ).toBeDisabled()
  await page.locator('#search').fill('minecraft:barrier')
  await page.locator('#route-filter').selectOption('excluded')
  await expect(study).toHaveAttribute('data-current-depth', 'none')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true)
})

test('chance view exposes conditional yield without losing method selection', async ({
  page,
}) => {
  await page.goto('/?item=minecraft:iron_ingot')
  await expect(page.locator('[data-selected-method]')).toHaveAttribute(
    'data-selected-method',
    'minecraft:iron_ingot_from_smelting_raw_iron',
  )
  await page.getByLabel('Compare by', { exact: true }).selectOption('chance')
  await page.locator('[data-method-id="mob/minecraft:zombie/1"]').click()
  await page.locator('.method-facts > summary').click()
  await expect(page.locator('.method-facts')).toContainText(
    '0.83% per eligible mob kill',
  )
  await expect(page.locator('.method-facts')).toContainText(
    '120 eligible attempts',
  )
  await expect(page.locator('.method-facts')).toContainText(
    'Killed by a player',
  )
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page
      .locator('#detail')
      .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
  ).toBe(true)
})

test('adopted item links and old review URLs open the normal Atlas', async ({
  page,
}) => {
  await page.goto('/design-preview?example=iron')
  await expect(page).toHaveURL(/\/\?item=minecraft%3Airon_ingot$/)
  await expect(page.locator('#detail h2')).toHaveText('Iron Ingot')
  await expect(
    page.getByRole('button', { name: 'Edit data', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.study-switcher')).toHaveCount(0)
  await page.goto('/design-preview?orientation=ruler')
  await expect(page).toHaveURL(/4322\/$/)
  await expect(page.locator('#map-orientation')).toBeVisible()
  await page.goto('/?item=missing:unknown')
  await expect(page.locator('.toast [role="status"]')).toHaveText(
    'No registered item: missing:unknown',
  )
  await expect(page.locator('#inspector')).toBeHidden()
  await expect(page.locator('#grid .cell').first()).toBeVisible()
})
