import { test, expect } from '@playwright/test'

async function disclaimerFixture(
  page,
  shared = { inventory: 'Containers do not count.' },
) {
  const entry = (title) => ({
    title,
    flavor: '',
    requirements: 'Have the item.',
    description: [],
    disclaimer: shared.inventory ? 'inventory' : null,
    labels: { 0: '1 item' },
  })
  const source = {
    schema: 1,
    shared,
    chapters: { travel: 'Travel' },
    entries: {
      'travel/first': entry('First'),
      'travel/second': entry('Second'),
    },
  }
  const files = Object.fromEntries(
    ['en_us', 'de_de'].map((id) => [
      `journal/locales/${id}.json`,
      { text: JSON.stringify(source), revision: 'initial' },
    ]),
  )
  const state = { files, saves: 0, fail: false }
  await page.route('**/__atlas/authoring**', async (route) => {
    if (new URL(route.request().url()).pathname.endsWith('/save')) {
      if (state.fail)
        return route.fulfill({
          status: 400,
          json: { error: 'File changed on disk. Reload before saving.' },
        })
      const input = route.request().postDataJSON()
      expect(input.revision).toBe(files[input.name].revision)
      state.saves++
      files[input.name] = { text: input.text, revision: `saved-${state.saves}` }
      return route.fulfill({ json: { revision: files[input.name].revision } })
    }
    return route.fulfill({
      json: {
        files,
        revision: 'snapshot',
        generation: { changed: [], outputs: 1 },
      },
    })
  })
  await page.goto('/authoring')
  await expect(page.locator('#status')).toHaveText('Source loaded')
  return state
}

test('shared disclaimers support create, update, references and safe deletion per locale', async ({
  page,
}) => {
  const state = await disclaimerFixture(page)
  const locale = () =>
    JSON.parse(state.files['journal/locales/en_us.json'].text)
  const otherLocale = state.files['journal/locales/de_de.json'].text
  await page.locator('[data-mode="disclaimers"]').click()
  await expect(page.locator('#disclaimer-key')).toHaveValue('inventory')
  await expect(page.locator('#disclaimer-key')).toHaveJSProperty(
    'readOnly',
    true,
  )
  await expect(page.locator('#disclaimer-references li')).toHaveCount(2)
  await expect(page.locator('#delete-disclaimer')).toBeDisabled()
  await page.locator('#disclaimer-message').fill('Shared revised disclaimer.')
  await expect(page.locator('#disclaimer-preview')).toHaveText(
    'Shared revised disclaimer.',
  )
  await page.locator('#save').click()
  await expect(page.locator('#status')).toContainText('Source saved')
  expect(locale().shared.inventory).toBe('Shared revised disclaimer.')
  expect(state.files['journal/locales/de_de.json'].text).toBe(otherLocale)
  await page.locator('[data-mode="journal"]').click()
  await expect(page.locator('#preview')).toContainText(
    'Shared revised disclaimer.',
  )
  await page.locator('[data-entry="travel/second"]').click()
  await expect(page.locator('#preview')).toContainText(
    'Shared revised disclaimer.',
  )
  await expect(page.locator('#requirements')).toHaveValue('Have the item.')
  await expect(page.locator('#objectives')).toHaveText('1 item')
  await page.locator('[data-mode="disclaimers"]').click()
  await page.locator('#new-disclaimer').click()
  await page.locator('#disclaimer-key').fill('inventory')
  await page.locator('#disclaimer-message').fill('Separate message.')
  await expect(page.locator('#disclaimer-error')).toHaveText(
    'This key already exists.',
  )
  await expect(page.locator('#save')).toBeDisabled()
  await page.locator('#disclaimer-key').fill('bad-key')
  await expect(page.locator('#save')).toBeDisabled()
  await page.locator('#disclaimer-key').fill('separate')
  await page.locator('#disclaimer-message').fill(' ')
  await expect(page.locator('#save')).toBeDisabled()
  await page.locator('#disclaimer-message').fill('Separate message.')
  await page.locator('#save').click()
  await expect(page.locator('#status')).toContainText('Source saved')
  expect(locale().shared.separate).toBe('Separate message.')
  await expect(page.locator('#disclaimer-key')).toHaveValue('separate')
  await page.locator('#disclaimer-search').fill('Separate message')
  await expect(page.locator('#disclaimers button')).toHaveCount(1)
  await page.locator('#disclaimer-search').fill('no-match')
  await expect(page.locator('#disclaimer-count')).toHaveText(
    'No matching disclaimers',
  )
  await page.locator('#disclaimer-search').fill('')
  await page.locator('[data-mode="journal"]').click()
  await page.locator('#disclaimer').selectOption('separate')
  await page.locator('#save').click()
  await expect(page.locator('#status')).toContainText('Source saved')
  await expect(page.locator('#preview')).toContainText('Separate message.')
  await page.locator('[data-mode="disclaimers"]').click()
  await expect(page.locator('#delete-disclaimer')).toBeDisabled()
  await expect(page.locator('#disclaimer-references li')).toHaveCount(1)
  await page.locator('[data-mode="journal"]').click()
  await page.locator('#disclaimer').selectOption('')
  await page.locator('#save').click()
  await expect(page.locator('#status')).toContainText('Source saved')
  await page.locator('[data-mode="disclaimers"]').click()
  await page.locator('#delete-disclaimer').click()
  expect(locale().shared.separate).toBe('Separate message.')
  await page.locator('#save').click()
  await expect(page.locator('#status')).toContainText('Source saved')
  expect(locale().shared).not.toHaveProperty('separate')
  await page.locator('#locale').selectOption('de_de')
  await expect(page.locator('#disclaimer-message')).toHaveValue(
    'Containers do not count.',
  )
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true)
})

test('disclaimer drafts survive conflicts and cancelled navigation; an empty registry is editable', async ({
  page,
}) => {
  const state = await disclaimerFixture(page, {})
  await page.locator('[data-mode="disclaimers"]').click()
  await expect(page.locator('#disclaimer-empty')).toBeVisible()
  await page.locator('#new-disclaimer').click()
  await page.locator('#disclaimer-key').fill('first')
  await page.locator('#disclaimer-message').fill('First shared message.')
  page.once('dialog', (dialog) => dialog.dismiss())
  await page.locator('[data-mode="journal"]').click()
  await expect(page.locator('#disclaimers-panel')).toBeVisible()
  await expect(page.locator('#disclaimer-message')).toHaveValue(
    'First shared message.',
  )
  state.fail = true
  await page.locator('#save').click()
  await expect(page.locator('#status')).toContainText('File changed on disk')
  await expect(page.locator('#disclaimer-key')).toHaveValue('first')
  await expect(page.locator('#disclaimer-message')).toHaveValue(
    'First shared message.',
  )
  await expect(page.locator('#save')).toBeEnabled()
  state.fail = false
  await page.locator('#save').click()
  await expect(page.locator('#status')).toContainText('Source saved')
  await page.locator('#delete-disclaimer').click()
  await expect(page.locator('#disclaimer-empty')).toBeVisible()
  await page.locator('#save').click()
  await expect(page.locator('#status')).toContainText('Source saved')
  expect(
    JSON.parse(state.files['journal/locales/en_us.json'].text).shared,
  ).toEqual({})
})

test('entry workbench filters, protects drafts and places the preview below fields', async ({
  page,
}) => {
  await page.goto('/authoring')
  await expect(page.locator('#status')).toHaveText('Source loaded')
  await expect(page.locator('#entries button')).toHaveCount(48)
  await expect(page.locator('#drafts')).toHaveText(
    '0 entries without descriptions',
  )
  await page.locator('#entry-search').fill('membranes')
  await expect(page.locator('#entries button')).toHaveCount(1)
  await page.locator('[data-entry="travel/membranes"]').click()
  await expect(page.locator('#entry-id')).toHaveText('travel/membranes')
  await expect(page.locator('#description')).toHaveValue(/Glider recipe/)
  await page.locator('#requirements').fill('Unsaved condition')
  await page.locator('#entry-search').fill('crafters')
  page.once('dialog', (dialog) => dialog.dismiss())
  await page.locator('[data-entry="components/crafters"]').click()
  await expect(page.locator('#entry-id')).toHaveText('travel/membranes')
  await expect(page.locator('#requirements')).toHaveValue('Unsaved condition')
  page.once('dialog', (dialog) => dialog.accept())
  await page.locator('[data-entry="components/crafters"]').click()
  await expect(page.locator('#description')).toHaveValue(/21 crafters/)
  await expect(
    page.locator('#entries button[aria-current="true"]'),
  ).toHaveAttribute('data-entry', 'components/crafters')
  const list = await page.locator('#journal-panel .entry-browser').boundingBox()
  const fields = await page.locator('#entry-form').boundingBox()
  const preview = await page.locator('.preview-columns').boundingBox()
  expect(list.x + list.width).toBeLessThan(fields.x)
  expect(preview.y).toBeGreaterThan(fields.y + fields.height)
  await page.locator('#entry-search').fill('no-such-entry')
  await expect(page.locator('#entry-count')).toHaveText('No matching entries')
  await expect(page.locator('#entry-id')).toHaveText('components/crafters')
  await page.locator('#entry-search').fill('')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page
      .locator('#entries')
      .evaluate((node) => node.scrollHeight > node.clientHeight),
  ).toBe(true)
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true)
})

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
    '0 changed or missing',
  )
  await expect(page.locator('#audit-rows')).toContainText(
    'pack-fixes/data/skyvillages/worldgen/processor_list/house_processor.json',
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
