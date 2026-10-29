import { test, expect } from '@playwright/test'
async function openItem(page, id = 'minecraft:iron_ingot') {
  await page.goto('/')
  await page.locator('#search').fill(id)
  await page.locator(`[data-id="${id}"]`).click()
}

test('selected method drives both panels and distinguishes conversions and secondary outputs', async ({
  page,
}) => {
  await openItem(page)
  const diagram = page.locator('[data-selected-method]')
  const detail = page.locator('[data-method-detail]')
  await expect(diagram).toHaveAttribute(
    'data-selected-method',
    'minecraft:iron_ingot_from_smelting_raw_iron',
  )
  for (const id of [
    'minecraft:iron_ingot_from_smelting_raw_iron',
    'minecraft:iron_ingot_from_iron_block',
    'create:sequenced_assembly/precision_mechanism',
    'mob/minecraft:zombie/1',
  ]) {
    await page.locator(`[data-method-id="${id}"]`).click()
    await expect(diagram).toHaveAttribute('data-selected-method', id)
    await expect(detail).toHaveAttribute('data-method-detail', id)
    await expect(page.locator(`[data-method-id="${id}"]`)).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    if (id.includes('iron_block'))
      await expect(diagram.locator('.method-caution')).toContainText(
        'reverse crafting',
      )
    if (id.includes('precision_mechanism'))
      await expect(diagram.locator('.method-caution')).toContainText(
        'secondary output',
      )
  }
  await detail.getByText('Conditions and source', { exact: true }).click()
  await expect(detail.locator('pre')).toContainText(
    'minecraft:killed_by_player',
  )
  await page
    .getByRole('searchbox', { name: 'Find an acquisition method' })
    .fill('nonexistent method')
  await expect(page.locator('.method-list')).toHaveText('No matching methods.')
  await expect(detail).toHaveAttribute(
    'data-method-detail',
    'mob/minecraft:zombie/1',
  )
  await page.setViewportSize({ width: 390, height: 844 })
  await expect
    .poll(() =>
      page
        .locator('#detail')
        .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
    )
    .toBe(true)
})

test('ingredient navigation, back and tabs retain selected method', async ({
  page,
}) => {
  await openItem(page, 'reliable_gliders:glider')
  const diagram = page.locator('[data-selected-method]')
  await expect(diagram).toBeVisible()
  const id = await diagram.getAttribute('data-selected-method')
  const ingredient = page
    .locator('.method-detail [data-inspect="minecraft:leather"]')
    .first()
  await ingredient.click()
  await expect(page.locator('.item-heading h2')).toHaveText('Leather')
  await page.locator('#item-back').click()
  await expect(page.locator('.item-heading h2')).toHaveText('Glider')
  await expect(diagram).toHaveAttribute('data-selected-method', id)
  await page.locator('[data-detail-tab="uses"]').click()
  await expect(diagram).toBeHidden()
  await page.locator('[data-detail-tab="acquisition"]').click()
  await expect(diagram).toBeVisible()
})

test('comparison sorts within supply groups, filters types and keeps a hidden selection explicit', async ({
  page,
}) => {
  await openItem(page)
  const rows = page.locator('[data-method-id]')
  await expect(rows).toHaveCount(38)
  await expect(page.getByLabel('Compare by', { exact: true })).toHaveValue(
    'planned',
  )
  await page.getByLabel('Compare by', { exact: true }).selectOption('fewest')
  await expect(rows.first()).toHaveAttribute('data-method-depth', '2')
  await page
    .locator('[data-method-id="loot/minecraft:chests/abandoned_mineshaft/5"]')
    .click()
  await page.getByLabel('Compare by', { exact: true }).selectOption('most')
  await expect(rows.first()).toContainText('End City Treasure')
  await expect(rows.first()).toHaveAttribute('data-method-depth', '8')
  await page.getByLabel('Method type', { exact: true }).selectOption('Smelting')
  await expect(rows).toHaveCount(4)
  await expect(page.locator('.method-selection-note')).toBeVisible()
  await expect(page.locator('[data-selected-method]')).toHaveAttribute(
    'data-selected-method',
    'loot/minecraft:chests/abandoned_mineshaft/5',
  )
  await page.locator('.method-filters summary').click()
  await page.getByLabel('Prerequisites', { exact: true }).selectOption('ranked')
  await expect(rows).toHaveCount(3)
  const id = 'minecraft:iron_ingot_from_smelting_raw_iron'
  await page.locator(`[data-method-id="${id}"]`).click()
  await expect(page.locator('[data-method-detail]')).toHaveAttribute(
    'data-method-detail',
    id,
  )
  await page.locator('.method-evidence summary').click()
  await expect(page.locator('.method-evidence')).toContainText(
    '7 graph steps deep',
  )
  await page
    .locator('.method-detail [data-inspect="minecraft:raw_iron"]')
    .first()
    .click()
  await page.locator('#item-back').click()
  await expect(page.getByLabel('Compare by', { exact: true })).toHaveValue(
    'most',
  )
  await expect(page.getByLabel('Method type', { exact: true })).toHaveValue(
    'Smelting',
  )
  await expect(rows).toHaveCount(3)
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click()
  await expect(rows).toHaveCount(38)
  await page.getByLabel('Compare by', { exact: true }).selectOption('type')
  await expect(page.locator('.method-list h4').first()).toHaveText(
    'Blasting · 4',
  )
  await page.setViewportSize({ width: 390, height: 844 })
  await expect
    .poll(() =>
      page
        .locator('#detail')
        .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
    )
    .toBe(true)
})

test('unified, internal and missing items retain distinct acquisition states', async ({
  page,
}) => {
  await openItem(page, 'powergrid:zinc_sheet')
  await expect(page.locator('.method-workbench')).toContainText(
    'Unified variant',
  )
  await expect(page.locator('.item-heading .badge')).toHaveText(
    'Unified variant',
  )
  await page.locator('.method-workbench button').click()
  await expect(page.locator('.item-heading .id')).not.toHaveText(
    'powergrid:zinc_sheet',
  )
  await openItem(page, 'minecraft:bedrock')
  await expect(page.locator('.method-workbench')).toContainText(
    'Not counted as a missing survival route',
  )
  await expect(page.locator('.item-heading .badge')).toHaveText(
    'Internal / creative',
  )
  await openItem(page, 'minecraft:suspicious_sand')
  await expect(page.locator('.method-workbench')).toContainText(
    'not proof that the item is unobtainable',
  )
  await expect(page.locator('.item-heading .badge')).toHaveText(
    'No acquisition adapter',
  )
  await openItem(page, 'minecraft:cherry_planks')
  await expect(page.locator('.method-list')).toContainText(
    'Unresolved prerequisites',
  )
})
