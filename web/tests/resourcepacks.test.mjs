import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import YAML from 'yaml'

const read = (name) =>
  readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8')
const reviews = YAML.parse(read('authored/resourcepacks.yml')).candidates
const { projects } = JSON.parse(read('research/resourcepacks/projects.json'))
const catalog = JSON.parse(read('research/resourcepacks/catalog.json'))

test('resource reviews join to sourced galleries and hash-verified files', () => {
  assert.equal(new Set(reviews.map((r) => r.id)).size, reviews.length)
  assert.deepEqual(
    Object.keys(projects).sort(),
    reviews.map((r) => r.id).sort(),
  )
  for (const review of reviews) {
    for (const field of ['description', 'fit', 'concern', 'nextCheck'])
      assert.ok(review[field]?.trim(), `${review.id}: missing ${field}`)
    assert.ok(
      [
        'try',
        'installed',
        'compare',
        'conditional',
        'defer',
        'reject',
        'replaced',
      ].includes(review.status),
    )
    const project = projects[review.id]
    assert.ok(project.gallery.length > 0, review.id)
    for (const image of project.gallery) {
      assert.ok(image.caption.trim(), review.id)
      for (const key of ['url', 'thumbnail', 'source'])
        assert.equal(new URL(image[key]).protocol, 'https:')
    }
    const file = project.inspection
    if (file) {
      assert.match(file.sha512, /^[a-f0-9]{128}$/)
      assert.equal(file.sha512, file.file.hashes.sha512)
      assert.ok(file.version.game_versions.includes('1.21.1'))
    } else assert.ok(project.fileNote)
  }
})

test('catalog ranks are contiguous per source and review links identify the same project', () => {
  for (const source of catalog.sources) {
    const rows = catalog.entries.filter((row) => row.source === source.id)
    assert.equal(rows.length, 250)
    assert.equal(new Set(rows.map((row) => row.url)).size, 250)
    assert.deepEqual(
      rows.map((row) => row.rank),
      Array.from({ length: 250 }, (_, i) => i + 1),
    )
  }
  const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, '')
  for (const row of catalog.entries.filter((row) => row.candidate)) {
    assert.ok(projects[row.candidate], row.title)
    assert.ok(
      normalize(row.title).startsWith(normalize(projects[row.candidate].title)),
      row.title,
    )
  }
})
