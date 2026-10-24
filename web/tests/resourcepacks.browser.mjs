import { test, expect } from '@playwright/test'

// Keep interaction checks independent of external gallery availability.
// Source image URLs are checked separately during each catalog refresh.
test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\//, (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#dce3ef"/></svg>',
    }),
  )
})

test('review filters persist, reset and reveal catalog references', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/resourcepacks?decision=installed')
  await expect(page.locator('[id="3d-ladders"]')).toBeHidden()
  await expect(page.locator('#icons')).toBeHidden()
  await expect(page.locator('#rays-3d-ladders .review-status')).toHaveText(
    'Selected stack',
  )
  await expect(page.locator('[data-candidate]:visible')).toHaveCount(17)
  await page.locator('#pack-search').fill('does not exist')
  await expect(page.locator('#pack-empty')).toBeVisible()
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page.locator('[data-candidate]:visible')).toHaveCount(46)
  await page.locator('#pack-category').selectOption('Connected textures')
  await expect(page).toHaveURL(/scope=Connected/)
  await page.reload()
  await expect(page.locator('#pack-category')).toHaveValue('Connected textures')
  await page.locator('.catalog-screening summary').click()
  await page.locator('#catalog-search').fill("RAY's 3D Ladders")
  await expect(page.locator('[data-catalog-search]:visible')).toHaveCount(1)
  await page.locator('.catalog-screening a[href="#rays-3d-ladders"]').click()
  await expect(page.locator('#rays-3d-ladders')).toBeVisible()
  await expect(page.locator('#pack-category')).toHaveValue('')
  expect(errors).toEqual([])
})

test('gallery selection, keyboard viewer and responsive columns', async ({
  page,
}) => {
  await page.goto('/resourcepacks')
  const card = page.locator('[data-candidate]').first()
  const copy = card.locator('.candidate-copy')
  const gallery = card.locator('[data-gallery]')
  const choices = gallery.locator('[data-image]')
  const before = await gallery.locator('.gallery-main').getAttribute('src')
  await choices.nth(1).click()
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await expect(gallery.locator('.gallery-main')).not.toHaveAttribute(
    'src',
    before,
  )
  await gallery.locator('[data-open-image]').click()
  const viewer = page.getByRole('dialog')
  await expect(viewer).toBeVisible()
  await expect(viewer.locator('[data-viewer-caption]')).toContainText('2 / 4')
  await page.keyboard.press('ArrowRight')
  await expect(viewer.locator('[data-viewer-caption]')).toContainText('3 / 4')
  await page.keyboard.press('ArrowLeft')
  await expect(viewer.locator('[data-viewer-caption]')).toContainText('2 / 4')
  await page.keyboard.press('Escape')
  await expect(viewer).toBeHidden()
  await expect(gallery.locator('[data-open-image]')).toBeFocused()
  let left = await copy.boundingBox(),
    right = await gallery.boundingBox()
  expect(right.x).toBeGreaterThan(left.x + left.width)
  await page.setViewportSize({ width: 390, height: 844 })
  left = await copy.boundingBox()
  right = await gallery.boundingBox()
  expect(right.y).toBeGreaterThan(left.y + left.height)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test('failed remote images retain a source fallback', async ({ page }) => {
  await page.unroute(/^https:\/\//)
  await page.route(/^https:\/\//, (route) => route.abort())
  await page.goto('/resourcepacks')
  const gallery = page.locator('[data-gallery]').first()
  await expect(gallery.locator('[data-image-error]')).toBeVisible()
  await expect(
    gallery.getByRole('link', { name: 'Author’s source gallery' }),
  ).toHaveAttribute('href', /^https:/)
})
