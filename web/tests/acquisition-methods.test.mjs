import test from 'node:test'
import assert from 'node:assert/strict'
import { acquisitionMethods } from '../src/lib/acquisition-methods.mjs'

function craft(id, input, output) {
  return {
    id,
    output,
    ingredients: [[input]],
    json: {
      type: 'minecraft:crafting_shapeless',
      ingredients: [{ item: input }],
      result: { id: output },
    },
  }
}
test('conversion grouping requires a concrete reverse recipe; secondary outputs stay separate', () => {
  const recipes = [
    craft('unpack', 'test:block', 'test:ingot'),
    craft('pack', 'test:ingot', 'test:block'),
    craft('salvage', 'test:armor', 'test:ingot'),
    craft('byproduct', 'test:raw', 'test:other'),
  ]
  const entries = recipes
    .filter((r) => r.id !== 'pack')
    .map((r, index) => ({
      index,
      route: { id: r.id, outputs: ['test:ingot'] },
    }))
  const classify = (rs) =>
    acquisitionMethods(
      'test:ingot',
      entries,
      new Map(rs.map((r) => [r.id, r])),
      new Map(),
    )
  const methods = classify(recipes)
  assert.deepEqual(
    methods.map((m) => m.group),
    ['Conversions', 'Crafting and processing', 'Secondary outputs'],
  )
  assert.equal(
    classify(recipes.filter((r) => r.id !== 'pack'))[0].conversion,
    false,
  )
  const conditional = structuredClone(recipes)
  conditional[1].json['neoforge:conditions'] = [
    { type: 'neoforge:mod_loaded', modid: 'test' },
  ]
  assert.equal(classify(conditional)[0].conversion, false)
})

import { methodMetrics, compareMethods } from '../src/lib/method-comparison.mjs'
const route = (id, inputs, outputs) => ({ id, inputs, outputs })
test('method depth preserves AND/OR branches and distinguishes existing supply from missing evidence', () => {
  const routes = [
    route('a', [['root']], ['a']),
    route('b', [['a']], ['b']),
    route('fast', [['a', 'missing'], ['root']], ['target']),
    route('slow', [['b'], ['a']], ['target']),
    route('pack', [['target']], ['block']),
    route('unpack', [['block']], ['target']),
    route('unknown', [['missing']], ['target']),
    route('empty', [[]], ['target']),
    route('no-inputs', [], ['target']),
    route('side', [['root']], ['target', 'side']),
    route('from-side', [['side']], ['target']),
  ]
  const m = methodMetrics('target', routes, ['root'])
  assert.equal(m.get('fast').depth, 2)
  assert.equal(m.get('slow').depth, 3) // max(2,1)+1, not sum+1
  assert.equal(m.get('fast').prerequisites[0].id, 'a')
  assert.equal(m.get('unpack').status, 'target-dependent')
  assert.equal(m.get('unpack').depth, null)
  assert.equal(m.get('unpack').mappedDepth, 3)
  assert.equal(m.get('from-side').status, 'target-dependent')
  for (const id of ['unknown', 'empty', 'no-inputs']) {
    assert.equal(m.get(id).status, 'unresolved')
    assert.equal(m.get(id).depth, null)
  }
  // Independent block acquisition makes unpacking a valid first-supply method.
  const withLoot = methodMetrics(
    'target',
    [...routes, route('block-loot', [['root']], ['block'])],
    ['root'],
  )
  assert.equal(withLoot.get('unpack').depth, 2)
})
test('sorting compares depth within supply groups and keeps unknowns out of the hardest ranking', () => {
  const row = (id, depth, status = 'ranked', mappedDepth = depth) => ({
    id,
    label: id,
    group: 'Recipes',
    type: 'Smelting',
    metrics: { depth, status, mappedDepth },
  })
  const methods = [
    row('deep', 6),
    row('short', 2),
    row('unknown', null, 'unresolved'),
    row('reuse', null, 'target-dependent', 9),
  ]
  assert.deepEqual(
    compareMethods(methods).map((m) => m.id),
    ['short', 'deep', 'reuse', 'unknown'],
  )
  assert.deepEqual(
    compareMethods(methods, { sort: 'most' }).map((m) => m.id),
    ['deep', 'short', 'reuse', 'unknown'],
  )
  assert.deepEqual(
    compareMethods(methods, { tracing: 'target-dependent' }).map((m) => m.id),
    ['reuse'],
  )
  assert.equal(compareMethods(methods, { type: 'Trading' }).length, 0)
  assert.equal(compareMethods(methods, { query: '  SHORT ' })[0].id, 'short')
  assert.equal(
    compareMethods([{ ...methods[0], secondary: true }], { role: 'primary' })
      .length,
    0,
  )
})
