import test from 'node:test'
import assert from 'node:assert/strict'
import { depths, recipeInputs, layout } from '../src/lib/graph.mjs'
import { validateDomain } from '../src/lib/domains.mjs'
test('AND prerequisites, OR ingredients, unresolved cycles and machine gates', () => {
  const result = depths(
    ['wood', 'iron', 'plank', 'table', 'machine', 'part', 'cycle-a', 'cycle-b'],
    ['wood'],
    [
      { inputs: [['wood', 'iron']], outputs: ['plank'] },
      { inputs: [['plank']], outputs: ['table'] },
      { inputs: [['plank'], ['machine']], outputs: ['part'] },
      { inputs: [['cycle-a']], outputs: ['cycle-b'] },
      { inputs: [['cycle-b']], outputs: ['cycle-a'] },
    ],
  )
  assert.equal(result.get('table'), 2)
  assert.equal(result.has('part'), false)
  assert.equal(result.has('cycle-a'), false)
})
test('shaped recipe spaces do not become impossible ingredient slots', () => {
  const recipe = {
    key: { '#': { tag: 'c:rods/wooden' }, X: { item: 'minecraft:oak_planks' } },
    pattern: ['XXX', ' # ', ' # '],
  }
  assert.deepEqual(
    recipeInputs(recipe, { 'c:rods/wooden': ['minecraft:stick'] }),
    [['minecraft:stick'], ['minecraft:oak_planks']],
  )
})
test('unresolved tag is not silently removed', () =>
  assert.deepEqual(
    recipeInputs({ ingredients: [{ tag: 'missing:tag' }] }, {}),
    [[]],
  ))
test('stable grid has no colliding cells', () => {
  const nodes = Array.from({ length: 1000 }, (_, i) => ({
    id: String(i),
    mod: 'test',
    depth: i % 3 ? i % 18 : null,
    complexity: i % 6,
  }))
  const positions = layout(nodes)
  assert.equal(new Set(positions.map((n) => `${n.x},${n.y}`)).size, 1000)
  assert.deepEqual(layout(structuredClone(nodes)), positions)
})
test('recipe edits reject traversal, malformed replacements and duplicate IDs', () => {
  for (const changes of [
    [{ id: 'a:../escape', disabled: true }],
    [{ id: 'a:b', json: {} }],
    [
      { id: 'a:b', disabled: true },
      { id: 'a:b', disabled: true },
    ],
  ])
    assert.throws(() =>
      validateDomain('recipes', JSON.stringify({ schema: 1, changes })),
    )
  assert.equal(
    validateDomain(
      'recipes',
      'schema: 1\nchanges: [{id: minecraft:stick, disabled: true}]',
    ).changes.length,
    1,
  )
})
test('domain schema rejects wrong shapes', () => {
  assert.throws(() => validateDomain('items', 'schema: 1\nnotes: []'))
  assert.throws(() =>
    validateDomain('interactions', 'schema: 1\nrecords: [{id: a, title: b}]'),
  )
})

test('virtual environment roots do not leave an empty origin in the item grid', () => {
  const nodes = layout([
    { id: 'first', mod: 'test', depth: 3, complexity: 0 },
    { id: 'later', mod: 'test', depth: 5, complexity: 0 },
  ])
  assert.equal(nodes[0].x, 0)
  assert.equal(nodes[0].y, 0)
  assert.equal(nodes[1].x, 14)
})
