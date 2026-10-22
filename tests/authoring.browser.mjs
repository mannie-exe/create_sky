import { test, expect } from '@playwright/test'

test('real config audit and local write boundaries', async ({
  page,
  request,
}) => {
  await page.goto('/authoring')
  await expect(page.locator('#status')).toHaveText('Source loaded')
  await page.getByRole('button', { name: 'Config audit', exact: true }).click()
  await expect(page.locator('#audit-summary')).toContainText(
    'Unregistered files: none',
  )
  await page.locator('#category').selectOption('worldgen')
  expect(await page.locator('#audit-rows tr').count()).toBeGreaterThan(0)
  await page.locator('#category').selectOption('structures')
  await expect(page.locator('#audit-summary')).toContainText(
    'dedicated tuning pass',
  )
  const data = { name: '../../outside', revision: '', text: '{}' }
  const foreign = await request.post('/__atlas/authoring/save', {
    data,
    headers: { Origin: 'http://example.com' },
  })
  expect(foreign.status()).toBe(403)
  const traversal = await request.post('/__atlas/authoring/save', {
    data,
    headers: { Origin: 'http://127.0.0.1:4322' },
  })
  expect(traversal.status()).toBe(400)
  expect((await traversal.json()).error).toBe('Unknown authoring file')
})

test('journal separates full conditions and short labels; save and generation are explicit', async ({
  page,
}) => {
  const name = 'journal/locales/en_us.json'
  const locale = {
    schema: 1,
    shared: { inventory: 'Containers do not count.' },
    chapters: { travel: 'Travel' },
    entries: {
      'travel/membranes': {
        title: 'Membranes',
        flavor: '',
        requirements: 'Have 2 membranes in inventory.',
        description: [],
        disclaimer: 'inventory',
        labels: { 0: '2 membranes' },
      },
    },
  }
  let text = JSON.stringify(locale),
    saved = false,
    generated = false
  await page.route('**/__atlas/authoring**', async (route) => {
    const url = new URL(route.request().url())
    let response
    if (url.pathname.endsWith('/save')) {
      const input = route.request().postDataJSON()
      expect(input.name).toBe(name)
      text = input.text
      saved = true
      response = { revision: 'saved' }
    } else if (url.pathname.endsWith('/generate')) {
      generated = true
      response = { output: 'Generated' }
    } else
      response = {
        files: { [name]: { text, revision: saved ? 'saved' : 'initial' } },
        revision: 'snapshot',
        generation: { changed: generated ? [] : ['quest.json'], outputs: 1 },
      }
    await route.fulfill({ json: response })
  })
  await page.goto('/authoring')
  await expect(page.locator('#requirements')).toHaveValue(
    'Have 2 membranes in inventory.',
  )
  await expect(page.getByLabel('Objective 0', { exact: true })).toHaveValue(
    '2 membranes',
  )
  await page.locator('#requirements').fill('Have 2 membranes at once.')
  await page
    .locator('#description')
    .fill(
      'First paragraph. Second sentence.\n\nAnother paragraph. Another sentence.',
    )
  await expect(page.locator('#preview')).toContainText(
    'Have 2 membranes at once.',
  )
  await expect(page.locator('#objectives')).toHaveText('2 membranes')
  await expect(page.locator('#generate')).toBeDisabled()
  await page.getByRole('button', { name: 'Save source', exact: true }).click()
  await expect(page.locator('#status')).toContainText('Source saved')
  expect(saved).toBe(true)
  expect(generated).toBe(false)
  expect(JSON.parse(text).entries['travel/membranes'].description).toHaveLength(
    2,
  )
  await page.locator('#generate').click()
  await expect(page.locator('#status')).toContainText(
    'Instances were not changed',
  )
  expect(generated).toBe(true)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true)
})

test('failed save retains editable text and reports the conflict', async ({
  page,
}) => {
  await page.route('**/__atlas/authoring/save', (route) =>
    route.fulfill({
      status: 400,
      json: { error: 'File changed on disk. Reload before saving.' },
    }),
  )
  await page.goto('/authoring')
  await expect(page.locator('#status')).toHaveText('Source loaded')
  await page.locator('#requirements').fill('Unsaved text')
  await page.locator('#save').click()
  await expect(page.locator('#status')).toContainText('File changed on disk')
  await expect(page.locator('#requirements')).toHaveValue('Unsaved text')
  await expect(page.locator('#save')).toBeEnabled()
})
