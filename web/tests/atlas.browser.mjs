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
  await expect(page.locator('#detail .inline-route select')).toContainText(
    'Phantom Membrane',
  )
  await expect(page.locator('#detail')).toContainText('phantom membranes')
  await page.getByRole('button', { name: 'World & ores', exact: true }).click()
  await expect(page.locator('#island-survey')).toContainText(
    'isolated development samples',
  )
  await expect(page.locator('#island-survey')).toContainText(
    'Zinc observed / estimated',
  )
  await expect(page.locator('#island-survey')).toContainText(
    'Generated resource samples: seed 42',
  )
  const depths = page
    .locator('#island-survey summary')
    .filter({ hasText: 'Ore depth and exposure:' })
    .first()
  await depths.click()
  await expect(depths.locator('..')).toContainText('create:zinc_ore')
  await expect(depths.locator('..')).toContainText('Reference Y band')
  const survey = await (await page.request.get('/generated/world.json')).json()
  await expect(page.locator('#world-provenance')).toContainText(
    survey.provenance ? `Seed ${survey.provenance.seed}` : 'Legacy survey',
  )
  await page.getByRole('button', { name: 'Zinc Ore', exact: true }).click()
  await expect(page.locator('#ore-map')).toHaveValue('create:zinc_ore')
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
  await page.route('**/generated/structures.json', (route) =>
    route.fulfill({ json: null }),
  )
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
  await page
    .getByText('Generation and sampling limits', { exact: true })
    .click()
  await expect(page.locator('#world-notes')).toContainText('pnpm data:world')
  await expect(page.locator('#structure-survey')).toContainText(
    'No village survey',
  )
  expect(errors).toEqual([])
})

test('village survey is independent of terrain data and labels stale results', async ({
  page,
}) => {
  await page.route('**/generated/world.json', (route) =>
    route.fulfill({ json: null }),
  )
  await page.route('**/generated/structures.json', (route) =>
    route.fulfill({
      json: {
        capturedAt: '2026-10-23',
        stale: true,
        limitations: ['No survival travel test.'],
        runs: [
          {
            mode: 'controlled',
            seed: 1,
            placementFailures: [],
            samples: [
              {
                pieces: 37,
                blocks: { 'minecraft:emerald_ore': 11 },
                lootItems: {},
              },
            ],
          },
          {
            mode: 'natural',
            seed: 1,
            placementFailures: [],
            samples: [{ validStart: true, placed: {} }, { validStart: false }],
          },
        ],
      },
    }),
  )
  await page.goto('/')
  await page.getByRole('button', { name: 'World & ores', exact: true }).click()
  const panel = page.locator('#structure-survey')
  await expect(panel).toContainText('Stale inputs')
  await expect(panel.locator('tbody').first().locator('td')).toHaveText([
    '1 / 1',
    '37',
    '0',
    '11',
    '0',
    '0',
  ])
  await expect(panel.locator('tbody').last().locator('td')).toHaveText([
    '1',
    '2',
    '1',
    '1',
    '0',
  ])
  await panel.getByText('Method and limits').click()
  await expect(panel).toContainText('No survival travel test.')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true)
})

test('expanded-world profile exposes its source and keeps high ores in the chart', async ({
  page,
}) => {
  await page.route('**/generated/world.json', (route) =>
    route.fulfill({
      json: {
        regionCount: 1,
        populatedChunks: 10,
        sampledChunks: 1,
        fullChunksSampled: 1,
        errors: [],
        changedRegions: [],
        limitations: [],
        method: 'fixture',
        completedAt: '2026-10-25T00:00:00Z',
        boundsBlocks: {},
        provenance: {
          seed: '-9007199254740993',
          dimensionType: 'create_sky_compat:islands_v1',
          generationIdentity: {
            dimension: { min_y: -128, height: 896 },
            algorithm: 'captured-fixture',
            islands: { advanced: { terrain_overlap_mode: 'overlap' } },
            oceans: { enabled: false },
          },
        },
        regions: [
          {
            x: 0,
            z: 0,
            chunks: 10,
            landFraction: 0.5,
            samples: [{ ores: { 'create:zinc_ore': 20 } }],
          },
        ],
        ores: { 'create:zinc_ore': { estimatedPerChunk: 2 } },
        byY: { 'create:zinc_ore': { '-100': 10, 600: 20 } },
      },
    }),
  )
  await page.goto('/')
  await page.locator('[data-view="world"]').click()
  await expect(page.locator('#world-provenance')).toContainText(
    '-9007199254740993',
  )
  await expect(page.locator('#ore-profile svg')).toHaveAttribute(
    'aria-label',
    /-128 to 767/,
  )
  await expect(page.locator('#ore-profile svg rect')).toHaveCount(2)
  await page
    .getByText('Generation and sampling limits', { exact: true })
    .click()
  await page.getByText('Recorded generation settings', { exact: true }).click()
  await expect(page.locator('#world-notes')).toContainText('captured-fixture')
  await expect(page.locator('#world-notes')).toContainText('overlap')
  await expect(page.locator('#ore-profile')).toContainText(
    'anchor-relative geological depth',
  )
  await page.getByText('Values by Y level', { exact: true }).click()
  await expect(page.locator('#ore-profile tbody')).toContainText('600')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true)
})
