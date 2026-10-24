import { test, expect } from '@playwright/test'

test('local job state exposes real audit results and rejects overlapping preview/read requests', async ({
  page,
}) => {
  await page.goto('/resourcepacks', { waitUntil: 'domcontentloaded' })
  const results = await page.evaluate(async () => {
    const [first, second] = await Promise.all([
      fetch('/__atlas/models'),
      fetch('/__atlas/workspace'),
    ])
    const statuses = [first.status, second.status]
    await Promise.all([first.text(), second.text()])
    const audit = await fetch('/__atlas/authoring/audit')
    const auditStatus = audit.status
    await audit.text()
    const jobs = await fetch('/__atlas/jobs').then((r) => r.json())
    const bad = await fetch('/__atlas/jobs/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'stale', command: 'sh' }),
    })
    return { statuses, auditStatus, jobs, bad: bad.status }
  })
  expect(results.statuses.sort()).toEqual([200, 409])
  expect(results.auditStatus).toBe(200)
  expect(results.jobs.current).toBeNull()
  expect(results.jobs.last.name).toBe('config.audit')
  expect(results.jobs.last.state).toBe('succeeded')
  expect(results.bad).toBe(400)
})

test('job diagnostics are escaped and cancellation sends only the current job ID', async ({
  page,
}) => {
  let cancelled = false
  await page.route('**/__atlas/jobs', (route) =>
    route.fulfill({
      json: {
        current: {
          id: '12',
          name: 'models.preview',
          state: 'running',
          cancellable: true,
          diagnostic: '<img src=x onerror=alert(1)>',
        },
      },
    }),
  )
  await page.route('**/__atlas/jobs/cancel', (route) => {
    expect(route.request().postDataJSON()).toEqual({ id: '12' })
    cancelled = true
    return route.fulfill({ json: {} })
  })
  await page.goto('/resourcepacks', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#job-summary')).toContainText(
    'models.preview: running',
  )
  await page.locator('#job-summary').click()
  await expect(page.locator('#job-diagnostic')).toHaveText(
    '<img src=x onerror=alert(1)>',
  )
  await expect(page.locator('#job-diagnostic img')).toHaveCount(0)
  await page.locator('#cancel-job').click()
  expect(cancelled).toBe(true)
})
