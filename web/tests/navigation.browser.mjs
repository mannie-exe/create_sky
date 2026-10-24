import { test, expect } from '@playwright/test'

test('page navigation has a stable order and identifies the current page', async ({
  page,
}) => {
  const labels = ['Item map', 'Pack authoring', 'Resource packs']
  for (const [index, url] of ['/', '/authoring', '/resourcepacks'].entries()) {
    await page.goto(url)
    const navigation = page.getByRole('navigation', {
      name: 'Atlas pages',
      exact: true,
    })
    await expect(navigation.getByRole('link')).toHaveText(labels)
    await expect(navigation.locator('[aria-current="page"]')).toHaveText(
      labels[index],
    )
    await page.setViewportSize({ width: 390, height: 844 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
})

test('local map views expose their selected state without changing page navigation', async ({
  page,
}) => {
  await page.goto('/')
  const views = page.getByRole('navigation', {
    name: 'Atlas views',
    exact: true,
  })
  await views.getByRole('button', { name: 'Evidence', exact: true }).click()
  await expect(
    views.getByRole('button', { name: 'Evidence', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(
    views.getByRole('button', { name: 'Item map', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false')
  await expect(
    page
      .getByRole('navigation', { name: 'Atlas pages', exact: true })
      .locator('[aria-current="page"]'),
  ).toHaveText('Item map')
  await expect(page.locator('#evidence-view')).toBeVisible()
})
