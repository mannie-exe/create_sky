import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import YAML from 'yaml'
import {
  resourceStack,
  selectionStatus,
} from '../src/lib/resourcepack-stack.mjs'
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const manifest = YAML.parse(read('../../empack.yml'))
const lock = YAML.parse(read('../../empack.lock'))
const options = read('../../overrides/client/options.txt')
const { projects } = JSON.parse(
  read('../data/research/resourcepacks/projects.json'),
)

test('current resource selections match lock, defaults and reviewed artifacts', () => {
  const { stack } = resourceStack(manifest, lock, options, projects)
  assert.equal(Object.keys(stack).length, 17)
  for (const [id, item] of Object.entries(stack)) {
    assert.ok(item.enabled, id)
    assert.ok(item.intentMatches, id)
    assert.ok(item.inspectionMatches, id)
    assert.ok(item.order >= 0, id)
  }
})

test('selection distinguishes disabled files, missing artifacts and shared resource mods', () => {
  const { stack } = resourceStack(
    manifest,
    lock,
    'resourcePacks:["vanilla"]',
    projects,
    {
      patch: {
        present: true,
        filename: 'patch.zip',
        kind: 'Resource pack',
        side: 'Client',
      },
      fixes: {
        present: true,
        filename: 'fixes.jar',
        kind: 'Resource-only mod',
        side: 'Client and server',
      },
      missing: {
        present: false,
        filename: 'gone.zip',
        kind: 'Resource pack',
        side: 'Client',
      },
    },
  )
  assert.equal(
    selectionStatus({ id: 'fresh-animations', status: 'installed' }, stack),
    'available',
  )
  assert.equal(
    selectionStatus({ id: 'patch', status: 'installed' }, stack),
    'available',
  )
  assert.equal(
    selectionStatus({ id: 'fixes', status: 'installed' }, stack),
    'installed',
  )
  assert.equal(
    selectionStatus({ id: 'missing', status: 'installed' }, stack),
    'unselected',
  )
  assert.equal(
    selectionStatus({ id: 'removed', status: 'installed' }, stack),
    'unselected',
  )
  assert.equal(
    selectionStatus({ id: 'candidate', status: 'compare' }, stack),
    'compare',
  )
  assert.equal(stack.fixes.order, -1)
  const changed = structuredClone(lock)
  changed.dependencies['fresh-animations'].files[0].expected.digests.sha512 =
    'changed'
  assert.equal(
    resourceStack(manifest, changed, options, projects).stack[
      'fresh-animations'
    ].inspectionMatches,
    false,
  )
})
