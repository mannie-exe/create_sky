import { test, expect } from '@playwright/test'

async function evidence(page, query) {
  await page.goto('/')
  await page.locator('[data-view="evidence"]').click()
  await page.locator('#evidence-domain').selectOption('recipes')
  await page.locator('#evidence-search').fill(query)
  const record = page.locator('#evidence-list > details').first()
  await record.locator(':scope > summary').click()
  return record.locator('.recipe-card')
}

test('slots remain square, alternatives stay separate, and layout reflows as one unit', async ({
  page,
}) => {
  const card = await evidence(page, '"id":"minecraft:smithing_table"')
  const geometry = () =>
    card.evaluate((card) => {
      const box = (e) => {
        const r = e.getBoundingClientRect()
        return {
          x: r.x,
          y: r.y,
          w: r.width,
          h: r.height,
          cx: r.x + r.width / 2,
          cy: r.y + r.height / 2,
        }
      }
      return {
        slots: [...card.querySelectorAll('.recipe-slot')].map(box),
        grid: box(card.querySelector('.recipe-grid')),
        arrow: box(card.querySelector('.recipe-arrow')),
        output: box(card.querySelector('.recipe-outputs')),
        right: getComputedStyle(card.querySelector('.arrow-right')).display,
        down: getComputedStyle(card.querySelector('.arrow-down')).display,
      }
    })
  const before = await geometry()
  expect(before.slots.every((s) => s.w === 48 && s.h === 48)).toBe(true)
  expect(Math.abs(before.arrow.cy - before.grid.cy)).toBeLessThan(1)
  expect(Math.abs(before.output.cy - before.grid.cy)).toBeLessThan(1)
  await card.locator('.recipe-alternative-link').first().click()
  await expect(card.locator('.recipe-ingredients')).toHaveAttribute('open', '')
  const after = await geometry()
  expect(
    after.slots.map((s) => ({
      w: s.w,
      h: s.h,
      x: s.x - after.grid.x,
      y: s.y - after.grid.y,
    })),
  ).toEqual(
    before.slots.map((s) => ({
      w: s.w,
      h: s.h,
      x: s.x - before.grid.x,
      y: s.y - before.grid.y,
    })),
  )
  await page.setViewportSize({ width: 390, height: 844 })
  const narrow = await geometry()
  expect(narrow.right).toBe('none')
  expect(narrow.down).not.toBe('none')
  expect(narrow.output.y).toBeGreaterThan(narrow.grid.y + narrow.grid.h)
  expect(Math.abs(narrow.arrow.cx - narrow.grid.cx)).toBeLessThan(1)
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true)
})

test('actual trim recipe renders inputs, a derived result and one workstation', async ({
  page,
}) => {
  const card = await evidence(
    page,
    'minecraft:bolt_armor_trim_smithing_template_smithing_trim',
  )
  await expect(card.locator('.recipe-grid .recipe-slot')).toHaveCount(3)
  await expect(card.locator('.recipe-derived')).toBeVisible()
  await expect(card).not.toContainText('No visual adapter')
  await expect(
    card.locator('.recipe-outputs [data-inspect="minecraft:iron_chestplate"]'),
  ).toHaveCount(0)
  await card.locator('.recipe-requirements > summary').click()
  await expect(
    card.locator(
      '.recipe-requirements [data-inspect="minecraft:smithing_table"]',
    ),
  ).toHaveCount(1)
})

test('inspector embeds the route, recipe selection, evidence tabs and back navigation', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await page.locator('#search').fill('reliable_gliders:glider')
  await page.locator('#grid .cell').click()
  await expect(page.locator('.route-preview-canvas')).toHaveAttribute(
    'data-scene-nodes',
    /\d+/,
  )
  await expect(
    page.locator('.route-preview-selection .recipe-grid'),
  ).toBeVisible()
  await expect(page.locator('#graph-view')).toBeHidden()
  await page
    .locator(
      '.route-preview-selection [data-inspect="minecraft:phantom_membrane"]',
    )
    .first()
    .click()
  await expect(page.locator('#detail h2')).toHaveText('Phantom Membrane')
  await page.locator('#item-back').click()
  await expect(page.locator('#detail h2')).toHaveText('Glider')
  await page.locator('[data-detail-tab="evidence"]').click()
  await expect(page.locator('[data-detail-panel="acquisition"]')).toBeHidden()
  await expect(
    page.getByText('Registry and asset provenance', { exact: true }),
  ).toBeVisible()
  await page.locator('[data-detail-tab="acquisition"]').click()
  await expect(page.locator('.route-preview-canvas')).toBeVisible()
  await expect(
    page.locator('.route-preview-selection .recipe-grid'),
  ).toBeVisible()
  expect(errors).toEqual([])
})
