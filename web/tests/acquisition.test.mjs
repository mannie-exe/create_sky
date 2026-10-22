import test from 'node:test'
import fs from 'node:fs'
import YAML from 'yaml'
import assert from 'node:assert/strict'
import {
  ingredient,
  craftingConflicts,
  processingRoute,
  lootEntries,
  miningTool,
  acquisitionRoutes,
  fluidState,
  potionNode,
} from '../src/lib/acquisition.mjs'
import { analyzeRoutes } from '../src/lib/graph.mjs'

test('NeoForge difference and intersection preserve exclusions and empty tags', () => {
  const tags = {
    chests: ['oak', 'trapped'],
    trapped: ['trapped'],
    wood: ['oak', 'plank'],
  }
  assert.deepEqual(
    ingredient(
      {
        type: 'neoforge:difference',
        base: { tag: 'chests' },
        subtracted: { tag: 'trapped' },
      },
      tags,
    ),
    ['oak'],
  )
  assert.deepEqual(
    ingredient(
      {
        type: 'neoforge:intersection',
        children: [{ tag: 'chests' }, { tag: 'wood' }],
      },
      tags,
    ),
    ['oak'],
  )
  assert.deepEqual(
    ingredient(
      {
        type: 'neoforge:intersection',
        children: [{ tag: 'chests' }, { tag: 'absent' }],
      },
      tags,
    ),
    [],
  )
})
test('fluid and potion states do not collapse to their container item', () => {
  const value = {
    type: 'neoforge:components',
    fluids: 'create:potion',
    amount: 250,
    components: {
      'minecraft:potion_contents': { potion: 'minecraft:mundane' },
      'create:potion_fluid_bottle_type': 'regular',
    },
  }
  assert.deepEqual(ingredient(value, {}), [
    'fluid:create/potion/minecraft/mundane/regular',
  ])
  assert.notEqual(
    potionNode({
      id: 'minecraft:potion',
      components: {
        'minecraft:potion_contents': { potion: 'minecraft:water' },
      },
    }),
    potionNode({
      id: 'minecraft:potion',
      components: {
        'minecraft:potion_contents': { potion: 'minecraft:awkward' },
      },
    }),
  )
  assert.equal(
    fluidState({ id: 'minecraft:water', amount: 250 }),
    'fluid:minecraft/water',
  )
})
test('sequenced assembly needs all external ingredients and machinery, not its own incomplete item', () => {
  const recipe = {
    id: 'assembly',
    json: {
      type: 'create:sequenced_assembly',
      ingredient: { item: 'sheet' },
      transitional_item: { id: 'unfinished' },
      loops: 5,
      sequence: [
        {
          type: 'create:deploying',
          ingredients: [
            [{ item: 'unfinished' }, { item: 'sheet' }],
            { item: 'cog' },
          ],
        },
        { type: 'create:pressing', ingredients: [{ item: 'unfinished' }] },
      ],
      results: [
        { id: 'finished', chance: 120 },
        { id: 'scrap', chance: 8 },
      ],
    },
  }
  const r = processingRoute(
    recipe,
    {},
    { 'create:deploying': 'deployer', 'create:pressing': 'press' },
  )
  assert(r.inputs.some((g) => g.includes('cog')))
  assert(r.inputs.some((g) => g.includes('press')))
  assert(!r.inputs.flat().includes('unfinished'))
  const a = analyzeRoutes(
    [
      'sheet',
      'cog',
      'deployer',
      'press',
      'atlas:rotation',
      'finished',
      'unfinished',
      'scrap',
    ],
    ['sheet', 'cog', 'deployer', 'atlas:rotation'],
    [r],
  )
  assert.equal(a.depth.has('finished'), false)
  const b = analyzeRoutes(
    [
      'sheet',
      'cog',
      'deployer',
      'press',
      'atlas:rotation',
      'finished',
      'unfinished',
      'scrap',
    ],
    ['sheet', 'cog', 'deployer', 'press', 'atlas:rotation'],
    [r],
  )
  assert.equal(b.depth.get('finished'), 1)
})
test('smithing and heated mixing retain template, fluid and heat prerequisites', () => {
  const r = processingRoute(
    {
      id: 'smith',
      json: {
        type: 'minecraft:smithing_transform',
        template: { item: 'template' },
        base: { item: 'tool' },
        addition: { item: 'ingot' },
        result: { id: 'upgrade' },
      },
    },
    {},
    {},
  )
  assert.deepEqual(r.inputs, [
    ['template'],
    ['tool'],
    ['ingot'],
    ['minecraft:smithing_table'],
  ])
  const m = processingRoute(
    {
      id: 'mix',
      json: {
        type: 'create:mixing',
        ingredients: [
          { item: 'resin' },
          { type: 'neoforge:single', fluid: 'minecraft:water', amount: 250 },
        ],
        results: [{ id: 'mod:fuel', amount: 250 }],
        heat_requirement: 'superheated',
      },
    },
    {},
    { 'create:mixing': 'create:mechanical_mixer' },
  )
  assert(m.inputs.flat().includes('fluid:minecraft/water'))
  assert(m.inputs.flat().includes('atlas:superheated'))
  assert(!m.inputs.flat().includes('create:blaze_cake'))
  assert.deepEqual(m.outputs, ['fluid:mod/fuel'])
})
test('loot references preserve conditions and function data without infinite recursion', () => {
  const tables = {
    a: {
      pools: [
        {
          conditions: [{ condition: 'player' }],
          entries: [
            { type: 'minecraft:loot_table', value: 'b' },
            { type: 'minecraft:loot_table', value: 'a' },
          ],
        },
      ],
    },
    b: {
      pools: [
        {
          entries: [
            {
              type: 'minecraft:item',
              name: 'drop',
              conditions: [{ condition: 'chance', chance: 0.1 }],
              functions: [{ function: 'set_count', count: 2 }],
            },
          ],
        },
      ],
    },
  }
  const entries = lootEntries('a', tables)
  assert.equal(entries.length, 1)
  assert.equal(entries[0].conditions.length, 2)
  assert.equal(entries[0].functions[0].count, 2)
})
test('block self-drops never create survival roots and mining requires a correct tier', () => {
  const args = {
    items: [{ id: 'test:block' }],
    blocks: [
      {
        id: 'test:block',
        item: 'test:block',
        destroyTime: 1,
        requiresCorrectTool: true,
        tags: ['minecraft:mineable/pickaxe', 'minecraft:needs_iron_tool'],
      },
    ],
    loot: {
      'test:blocks/block': {
        pools: [{ entries: [{ type: 'minecraft:item', name: 'test:block' }] }],
      },
    },
    world: { blocks: {} },
    resources: {},
    chiseling: [],
    brewing: [],
    trades: [],
    authored: { records: [] },
    fluids: [],
  }
  assert.equal(acquisitionRoutes(args).routes.length, 0)
  const tool = miningTool(args.blocks[0])[0]
  assert(!tool.includes('minecraft:stone_pickaxe'))
  assert(tool.includes('minecraft:diamond_pickaxe'))
  args.world.blocks['test:block'] = 1
  const routes = acquisitionRoutes(args).routes
  assert.equal(routes.length, 1)
  assert(routes[0].inputs.some((g) => g.includes('atlas:overworld')))
  assert.equal(
    analyzeRoutes(
      ['test:block', 'atlas:overworld'],
      ['atlas:overworld'],
      routes,
    ).depth.has('test:block'),
    false,
  )
})
test('reachable paths retain AND witnesses; unresolved cycles and missing sources remain distinct', () => {
  const a = analyzeRoutes(
    ['root', 'a', 'b', 'c', 'unknown'],
    ['root'],
    [
      { id: 'make-a', inputs: [['root']], outputs: ['a'] },
      { id: 'make-b', inputs: [['c']], outputs: ['b'] },
      { id: 'make-c', inputs: [['b']], outputs: ['c'] },
    ],
  )
  assert.equal(a.coverage.get('b').status, 'blocked')
  assert.equal(a.coverage.get('unknown').status, 'unmapped')
  assert.deepEqual(
    a.pathFor('a').map((p) => p.id),
    ['root', 'a'],
  )
})
test('Rechiseled groups need both a material seed and the chisel', () => {
  const args = {
    items: [{ id: 'stone' }, { id: 'decor' }, { id: 'rechiseled:chisel' }],
    blocks: [],
    loot: {},
    world: {},
    resources: {},
    chiseling: [
      {
        entries: [
          {
            recipe: 'group',
            variants: [
              { id: 'stone', worth: 1 },
              { id: 'decor', worth: 1 },
            ],
          },
        ],
      },
    ],
    brewing: [],
    trades: [],
    authored: { records: [] },
    fluids: [],
  }
  const r = acquisitionRoutes(args).routes
  assert.equal(
    analyzeRoutes(
      args.items.map((i) => i.id),
      ['rechiseled:chisel'],
      r,
    ).depth.has('decor'),
    false,
  )
  assert.equal(
    analyzeRoutes(
      args.items.map((i) => i.id),
      ['stone', 'rechiseled:chisel'],
      r,
    ).depth.get('decor'),
    1,
  )
})

test('block-tag recipe ingredients use block registry tags, not an empty item tag', () => {
  assert.deepEqual(
    ingredient(
      { type: 'neoforge:block_tag', tag: 'minecraft:convertable_to_mud' },
      {
        'block@minecraft:convertable_to_mud': [
          'minecraft:dirt',
          'minecraft:coarse_dirt',
        ],
      },
    ),
    ['minecraft:dirt', 'minecraft:coarse_dirt'],
  )
})

test('casting needs molten metal and the matching mould; boring also needs water', () => {
  const args = {
    items: [
      { id: 'test:cast' },
      { id: 'test:shape_cast_mould' },
      { id: 'test:finished' },
    ],
    blocks: [],
    loot: {},
    world: {},
    resources: {},
    chiseling: [],
    brewing: [],
    trades: [],
    authored: { records: [] },
    fluids: [],
    fluidTags: { 'c:metal': ['test:metal'] },
    blockRecipes: [
      {
        type: 'createbigcannons:cannon_casting',
        cast_shape: 'test:shape',
        fluid: { tag: 'c:metal' },
        result: 'test:cast',
      },
      {
        type: 'createbigcannons:drill_boring',
        input: { block: 'test:cast' },
        result: 'test:finished',
      },
    ],
  }
  const r = acquisitionRoutes(args).routes
  assert.deepEqual(r[0].inputs[0], ['fluid:test/metal'])
  assert(r[0].inputs.flat().includes('test:shape_cast_mould'))
  assert(r[1].inputs.flat().includes('fluid:minecraft/water'))
})

test('collision analysis ignores empty tags and respects crafting counts', () => {
  const recipes = [
    {
      id: 'one',
      json: {
        type: 'minecraft:crafting_shapeless',
        ingredients: [{ tag: 'missing' }],
        result: { id: 'one' },
      },
    },
    {
      id: 'two',
      json: {
        type: 'minecraft:crafting_shapeless',
        ingredients: [{ tag: 'missing' }],
        result: { id: 'two' },
      },
    },
  ]
  assert.equal(craftingConflicts(recipes, {}).length, 0)
  assert.equal(
    craftingConflicts(recipes, { missing: ['ingredient'] })[0].kind,
    'output-conflict',
  )
  recipes[1].json.ingredients.push({ tag: 'missing' })
  assert.equal(
    craftingConflicts(recipes, { missing: ['ingredient'] }).length,
    0,
  )
})

test('solid burner opens heated processing without a blaze, while fuel and setup remain required', () => {
  const heat = YAML.parse(
    fs.readFileSync(
      new URL('../data/authored/acquisition.yml', import.meta.url),
      'utf8',
    ),
  ).records.filter((r) =>
    [
      'access/blaze-heat',
      'access/blaze-superheat',
      'access/solid-burner-heat',
    ].includes(r.id),
  )
  const mixing = processingRoute(
    {
      id: 'brass',
      json: {
        type: 'create:mixing',
        ingredients: [{ item: 'copper' }, { item: 'zinc' }],
        results: [{ id: 'brass' }],
        heat_requirement: 'heated',
      },
    },
    {},
    { 'create:mixing': 'mixer' },
  )
  const routes = [...heat, mixing]
  const ids = [
    ...new Set(routes.flatMap((r) => [...r.inputs.flat(), ...r.outputs])),
  ]
  const setup = [
    'copper',
    'zinc',
    'mixer',
    'atlas:rotation',
    'create:basin',
    'createpropulsion:solid_burner',
    'minecraft:coal',
  ]
  assert(analyzeRoutes(ids, setup, routes).depth.has('brass'))
  assert(analyzeRoutes(ids, setup, routes).depth.has('atlas:superheated'))
  for (const missing of [
    'minecraft:coal',
    'create:basin',
    'createpropulsion:solid_burner',
  ]) {
    assert(
      !analyzeRoutes(
        ids,
        setup.filter((id) => id !== missing),
        routes,
      ).depth.has('brass'),
      missing,
    )
  }
  const ordinaryBlaze = analyzeRoutes(
    ids,
    ['create:blaze_burner', 'atlas:heat'],
    routes,
  )
  assert(ordinaryBlaze.depth.has('atlas:heated'))
  assert(!ordinaryBlaze.depth.has('atlas:superheated'))
})
