import test from 'node:test'
import assert from 'node:assert/strict'
import {
  solveProgression,
  routeCandidate,
  compareLabels,
} from '../src/lib/progression.mjs'
import { enrichRoutes, lootOutcome } from '../src/lib/acquisition-facts.mjs'
import { methodMetrics } from '../src/lib/method-comparison.mjs'
const route = (id, inputs, output, probability = 1, opportunistic = false) => ({
  id,
  kind: 'recipe',
  inputs,
  outputs: [output],
  facts: { opportunistic, outcomes: { [output]: { probability } } },
})
const solve = (rs, policy = 'planned') =>
  solveProgression(
    [
      ...new Set([
        'root',
        ...rs.flatMap((r) => [...r.inputs.flat(), ...r.outputs]),
      ]),
    ],
    ['root'],
    rs,
    policy,
  )
test('planned supply retains shallow loot as an alternative and chooses stable independent witnesses', () => {
  const rs = [
    route('loot', [['root']], 'iron', 0.1, true),
    route('mine', [['root']], 'ore'),
    route('smelt', [['ore']], 'iron'),
    route('pack', [['iron']], 'block'),
    route('unpack', [['block']], 'iron'),
  ]
  const p = solve(rs),
    e = solve(rs, 'earliest')
  assert.equal(p.witnesses.get('iron').route, 'smelt')
  assert.equal(e.witnesses.get('iron').route, 'loot')
  assert.deepEqual(
    [...p.witnesses].sort(),
    [...solve([...rs].reverse()).witnesses].sort(),
  )
  const m = methodMetrics('iron', rs, ['root'])
  assert.equal(m.get('unpack').status, 'target-dependent')
  assert.equal(m.get('smelt').depth, 2)
})
test('unknown odds are not certainty; zero-probability output cannot unlock anything', () => {
  const rs = [
    route('unknown', [['root']], 'target', null),
    route('known', [['root']], 'mid'),
    route('roll', [['mid']], 'target', 0.2),
    route('impossible', [['root']], 'none', 0),
  ]
  const p = solve(rs)
  assert.equal(p.witnesses.get('target').route, 'roll')
  assert.equal(p.labels.has('none'), false)
  assert.equal(
    solve([route('a', [['b']], 'a'), route('b', [['a']], 'b')]).labels.has('a'),
    false,
  )
})
test('shared AND branches retain coherent acyclic witnesses after policy improvements', () => {
  const rs = [
    route('a-fast', [['root']], 'a', 1, true),
    route('a-slow', [['x']], 'a'),
    route('x', [['root']], 'x'),
    route('b', [['a'], ['other']], 'b'),
    route('other', [['root']], 'other', 1, true),
    route('recycle', [['b']], 'a'),
  ]
  const p = solve(rs)
  for (const [id, w] of p.witnesses) {
    const candidate = routeCandidate(
      rs.find((r) => r.id === w.route),
      id,
      p.labels,
    )
    assert.equal(compareLabels(candidate, p.labels.get(id)), 0)
    assert.ok(
      w.inputs.every(
        (input) => compareLabels(p.labels.get(input), p.labels.get(id)) < 0,
      ),
    )
  }
})
test('loot odds include activation, weighted competition and rolls; unsupported predicates stay unknown', () => {
  const table = {
    pools: [
      {
        rolls: 1,
        conditions: [{ condition: 'minecraft:random_chance', chance: 0.025 }],
        entries: ['iron', 'carrot', 'potato'].map((name) => ({
          type: 'minecraft:item',
          name,
        })),
      },
    ],
  }
  const o = lootOutcome(table, 'iron')
  assert.ok(Math.abs(o.probability - 0.025 / 3) < 1e-12)
  table.pools[0].rolls = 2
  assert.ok(
    Math.abs(
      lootOutcome(table, 'iron').probability - 0.025 * (1 - (2 / 3) ** 2),
    ) < 1e-12,
  )
  table.pools[0].entries[0].conditions = [{ condition: 'custom:predicate' }]
  assert.equal(lootOutcome(table, 'iron').probability, null)
  assert.equal(
    lootOutcome(
      {
        pools: [
          {
            rolls: 1,
            entries: [{ type: 'minecraft:loot_table', value: 'nested' }],
          },
        ],
      },
      'iron',
    ).probability,
    null,
  )
})
test('recipe facts retain shaped multiplicity, sequence loops, weights and reusable operating requirements', () => {
  const recipes = [
    {
      id: 'craft',
      json: {
        type: 'minecraft:crafting_shaped',
        pattern: ['AA', ' A'],
        key: { A: { item: 'a' } },
        result: { id: 'b', count: 4 },
      },
    },
    {
      id: 'sequence',
      json: {
        type: 'create:sequenced_assembly',
        ingredient: { item: 'a' },
        loops: 5,
        sequence: [{ ingredients: [{ item: 'workpiece' }, { item: 'part' }] }],
        results: [
          { id: 'good', chance: 3 },
          { id: 'scrap', chance: 1 },
        ],
      },
    },
  ]
  const rs = [
    { id: 'craft', kind: 'recipe', inputs: [['a'], ['table']], outputs: ['b'] },
    {
      id: 'sequence',
      kind: 'recipe',
      inputs: [['a'], ['part'], ['machine']],
      outputs: ['good', 'scrap'],
    },
  ]
  enrichRoutes(rs, recipes, {})
  assert.equal(
    rs[0].facts.quantities.reduce((s, q) => s + q.amount, 0),
    3,
  )
  assert.deepEqual(rs[0].facts.setup, [['table']])
  assert.equal(rs[0].facts.outcomes.b.expectedCount, 4)
  assert.equal(rs[1].facts.quantities[1].amount, 5)
  assert.equal(rs[1].facts.outcomes.good.probability, 0.75)
  assert.equal(rs[1].facts.outcomes.scrap.probability, 0.25)
})
test('sampled high-level trade is conditional access, not a free early unlock', () => {
  const rs = [
    {
      id: 'trade',
      kind: 'trade',
      inputs: [['root']],
      outputs: ['pickaxe'],
      source: {
        profession: 'toolsmith',
        level: 5,
        offer: {
          buy: { id: 'emerald', count: 20 },
          sell: { id: 'pickaxe', count: 1 },
        },
      },
    },
  ]
  enrichRoutes(rs, [], {})
  assert.equal(rs[0].facts.opportunistic, true)
  assert.equal(rs[0].facts.quantities[0].amount, 20)
  assert.equal(rs[0].facts.outcomes.pickaxe.probability, 1)
  assert.match(rs[0].facts.outcomes.pickaxe.assumptions[0], /level 5/)
})

test('mining odds distinguish Silk Touch from normal ore drops without pretending Fortune is modeled', () => {
  const condition = {
    condition: 'minecraft:match_tool',
    predicate: {
      predicates: {
        'minecraft:enchantments': [
          { enchantments: 'minecraft:silk_touch', levels: { min: 1 } },
        ],
      },
    },
  }
  const loot = {
    ore: {
      pools: [
        {
          rolls: 1,
          entries: [
            {
              type: 'minecraft:alternatives',
              children: [
                {
                  type: 'minecraft:item',
                  name: 'ore',
                  conditions: [condition],
                },
                {
                  type: 'minecraft:item',
                  name: 'raw',
                  functions: [
                    {
                      function: 'minecraft:apply_bonus',
                      enchantment: 'minecraft:fortune',
                      formula: 'minecraft:ore_drops',
                    },
                    { function: 'minecraft:explosion_decay' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  }
  const rs = [
    {
      id: 'normal',
      kind: 'gathering',
      inputs: [['root'], ['pick']],
      outputs: ['raw'],
      source: 'ore',
    },
    {
      id: 'silk',
      kind: 'gathering',
      inputs: [['root'], ['pick'], ['atlas:silk_touch']],
      outputs: ['ore'],
      source: 'ore',
    },
  ]
  enrichRoutes(rs, [], loot)
  assert.equal(rs[0].facts.outcomes.raw.probability, 1)
  assert.equal(rs[1].facts.outcomes.ore.probability, 1)
  assert.match(rs[0].facts.outcomes.raw.assumptions.join(';'), /No Silk Touch/)
  assert.match(rs[1].facts.outcomes.ore.assumptions.join(';'), /no Fortune/)
})

test('nested loot does not inherit a child table probability as the whole event probability', () => {
  const rs = [
    {
      id: 'loot/root/0',
      kind: 'chest-loot',
      inputs: [['root']],
      outputs: ['item'],
      source: 'child',
    },
  ]
  enrichRoutes(rs, [], {
    root: {
      pools: [
        {
          rolls: 1,
          entries: [{ type: 'minecraft:loot_table', value: 'child' }],
        },
      ],
    },
    child: {
      pools: [
        { rolls: 1, entries: [{ type: 'minecraft:item', name: 'item' }] },
      ],
    },
  })
  assert.equal(rs[0].facts.outcomes.item.probability, null)
})
