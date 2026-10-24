import test from 'node:test'
import assert from 'node:assert/strict'
import { indexScene, renderSlice } from '../src/lib/graph-scene.mjs'
import {
  graphIndex,
  systemsScene,
  processingScene,
  coverageScene,
  routeScene,
  pathScene,
} from '../src/lib/graph-views.mjs'
const items = ['a:ore', 'b:ore', 'c:press', 'd:plate'].map((id, i) => ({
  id,
  name: id,
  mod: id.split(':')[0],
  depth: i,
  status: i === 3 ? 'blocked' : 'mapped',
}))
const routes = [
  {
    id: 'make-plate',
    kind: 'recipe',
    inputs: [['a:ore', 'b:ore'], ['c:press']],
    outputs: ['d:plate'],
    conditions: ['heat'],
    scenario: true,
  },
  { id: 'find-plate', kind: 'loot', inputs: [['a:ore']], outputs: ['d:plate'] },
]

test('one-route views preserve AND slots, OR alternatives and source provenance', () => {
  const index = graphIndex(items, routes),
    before = structuredClone(routes),
    scene = routeScene(index, index.byOutput.get('d:plate')[0])
  assert.equal(
    [...scene.nodes.values()].filter((n) => n.type === 'group').length,
    2,
  )
  assert.equal(scene.edges.filter((e) => e.type === 'required').length, 2)
  assert.equal(scene.edges.filter((e) => e.type === 'alternative').length, 3)
  assert.deepEqual(scene.nodes.get('route:0').route.conditions, ['heat'])
  assert.match(scene.nodes.get('route:0').label, /SCENARIO/)
  assert.equal(index.byOutput.get('d:plate').length, 2)
  assert.deepEqual(routes, before)
})
test('summary connections count each route once per mod pair without asserting AND dependencies', () => {
  const index = graphIndex(items, [
    ...routes,
    {
      id: 'duplicates',
      inputs: [['a:ore'], ['a:ore']],
      outputs: ['d:plate', 'd:plate'],
    },
  ])
  assert.equal(
    index.links.find((l) => l.source === 'a' && l.target === 'd').entries
      .length,
    3,
  )
  const scene = systemsScene(index, 'd', 1)
  assert.equal(scene.shownNeighbors, 1)
  assert.equal(scene.totalNeighbors, 3)
  assert.equal(scene.nodes.size, 2)
  assert.equal(scene.edges[0].entries.length, 3)
  assert.equal(
    coverageScene(index, 'blocked').nodes.get('coverage:d').label,
    'd\n1 items',
  )
  assert.equal(coverageScene(index, 'unmapped').nodes.size, 1)
})
test('processing summarizes machine inputs and outputs with route provenance', () => {
  const index = graphIndex(items, routes, { press: 'c:press' })
  const scene = processingScene(index, 'c:press')
  assert.equal(scene.nodes.size, 4)
  assert.equal(scene.edges.length, 3)
  assert.equal(
    scene.edges.find((e) => e.target === 'output:d:plate').entries[0].route.id,
    'make-plate',
  )
  assert.equal(scene.entries.length, 1)
  assert.equal(scene.inputCount, 2)
})

test('large alternative sets stay bounded and empty groups remain explicit', () => {
  const r = {
    id: 'large',
    kind: 'loot',
    inputs: [Array.from({ length: 500 }, (_, i) => `a:${i}`), []],
    outputs: ['d:plate'],
  }
  const scene = routeScene(graphIndex(items, [r]), { route: r, index: 0 })
  assert.equal(scene.hiddenChoices, 496)
  assert.ok(scene.nodes.size < 12)
  assert.equal(scene.nodes.get('route:0:input:0').alternatives.length, 500)
  assert.equal(scene.nodes.get('route:0:input:1').label, 'EMPTY input')
  assert.equal(routeScene(graphIndex(items, []), undefined).nodes.size, 0)
})
test('viewport culling bounds a large scene and preserves small summary labels at fit scale', () => {
  const scene = indexScene(
    new Map(
      Array.from({ length: 10000 }, (_, i) => [
        String(i),
        {
          id: String(i),
          type: 'item',
          x: (i % 100) * 160,
          y: Math.floor(i / 100) * 120,
        },
      ]),
    ),
    [],
  )
  const overview = renderSlice(scene, scene.bounds, 0.01)
  assert.ok(overview.overview)
  assert.ok(overview.nodes.length <= 1200)
  assert.equal(
    overview.nodes.reduce((s, n) => s + n.count, 0),
    10000,
  )
  assert.ok(
    renderSlice(scene, { x1: 0, y1: 0, x2: 800, y2: 600 }, 1).nodes.length <
      100,
  )
  assert.equal(
    renderSlice(scene, { x1: -1e9, y1: -1e9, x2: -1e8, y2: -1e8 }, 1).nodes
      .length,
    0,
  )
  const small = systemsScene(graphIndex(items, routes), 'd')
  assert.equal(renderSlice(small, small.bounds, 0.3).overview, false)
})

test('vertical paths preserve chosen chains, OR groups and bounded omissions', () => {
  const index = graphIndex(items, routes)
  const path = [
    { id: 'a:ore', depth: 0, root: true },
    { id: 'c:press', depth: 0, root: true },
    {
      id: 'd:plate',
      depth: 1,
      route: 'make-plate',
      inputs: ['a:ore', 'c:press'],
    },
  ]
  const before = structuredClone(path),
    scene = pathScene(index, path)
  const route = scene.nodes.get('path:d:plate:route')
  assert.equal(route.route, routes[0])
  assert.match(route.label, /SCENARIO/)
  assert.ok(scene.nodes.get('a:ore').y < route.y)
  assert.ok(route.y < scene.nodes.get('d:plate').y)
  assert.equal(scene.edges.filter((e) => e.type === 'required').length, 2)
  assert.deepEqual(scene.nodes.get('path:d:plate:route:input:0').alternatives, [
    'a:ore',
    'b:ore',
  ])
  assert.equal(scene.hiddenChoices, 1)
  assert.equal(pathScene(index, path, 1).hiddenSteps, 2)
  assert.equal(
    pathScene(index, [{ id: 'd:plate', route: 'missing' }]).missingRoutes,
    1,
  )
  assert.deepEqual(path, before)
})
