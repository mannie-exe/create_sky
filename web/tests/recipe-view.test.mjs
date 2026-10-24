import test from 'node:test'
import assert from 'node:assert/strict'
import {
  recipePresentation,
  recipeHTML,
  safeIcon,
} from '../src/lib/recipe-view.mjs'

test('shaped recipes repeat slots and separate operating requirements', () => {
  const recipe = {
    id: 'test:shaped',
    type: 'minecraft:crafting',
    json: {
      type: 'minecraft:crafting_shaped',
      pattern: ['ABA', ' B '],
      key: { B: { tag: 'test:wood' }, A: { item: 'test:iron' } },
      result: { id: 'test:output', count: 3 },
    },
    ingredients: [
      ['test:oak', 'test:birch'],
      ['test:iron'],
      ['minecraft:crafting_table'],
    ],
  }
  const view = recipePresentation(recipe)
  assert.equal(view.columns, 3)
  assert.deepEqual(
    view.inputs.map((v) => v?.resolved ?? null),
    [
      ['test:iron'],
      ['test:oak', 'test:birch'],
      ['test:iron'],
      null,
      ['test:oak', 'test:birch'],
      null,
    ],
  )
  assert.deepEqual(view.requirements, [['minecraft:crafting_table']])
  assert.equal(view.outputs[0].value.count, 3)
  assert.match(recipeHTML(recipe), /OR 2/)
})
test('processing preserves fluids, probabilities, components and conditions', () => {
  const recipe = {
    id: 'test:processing',
    json: {
      type: 'create:mixing',
      ingredients: [{ fluid: 'minecraft:water', amount: 250 }],
      results: [
        {
          id: 'test:item',
          count: 2,
          chance: 0.25,
          components: { 'test:state': 'filled' },
        },
      ],
      heat_requirement: 'heated',
    },
    ingredients: [['fluid:minecraft/water'], ['atlas:heated']],
  }
  const html = recipeHTML(recipe)
  assert.match(html, /250 mB/)
  assert.match(html, /25%/)
  assert.match(html, /heat_requirement/)
  assert.match(html, /test:state/)
  assert.equal(recipePresentation(recipe).inputs.length, 1)
})
test('unsupported types keep source data without inventing a layout', () => {
  const recipe = {
    id: 'test:assembly',
    json: {
      type: 'create:sequenced_assembly',
      loops: 5,
      results: [{ id: 'test:part', chance: 120 }],
    },
  }
  assert.equal(recipePresentation(recipe).supported, false)
  const html = recipeHTML(recipe)
  assert.match(html, /No visual adapter/)
  assert.match(html, /loops/)
  assert.doesNotMatch(html, /12000%/)
})
test('recipe strings and icon URLs cannot introduce markup or script', () => {
  const id = '<img src=x onerror=alert(1)>'
  const recipe = {
    id,
    json: {
      type: 'minecraft:smelting',
      ingredient: { item: id },
      result: { id },
    },
  }
  const html = recipeHTML(
    recipe,
    new Map([[id, { name: id, icon: 'javascript:alert(1)' }]]),
  )
  assert.doesNotMatch(html, /<img|javascript:/)
  assert.match(html, /&lt;img/)
  assert.equal(
    safeIcon('/generated/icons/ab12.png'),
    '/generated/icons/ab12.png',
  )
})
