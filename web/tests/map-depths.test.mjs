import test from 'node:test'
import assert from 'node:assert/strict'
import { depthBands, depthLabel, bandsInView } from '../src/lib/map-depths.mjs'

test('orientation uses actual layout bounds, including depth zero and unranked items', () => {
  const bands = depthBands([
    { id: 'a', depth: 0, x: 3, y: 0 },
    { id: 'b', depth: 0, x: 6, y: 0 },
    { id: 'c', depth: 4, x: 15, y: 8 },
    { id: 'd', depth: null, x: 40, y: 0 },
  ])
  assert.deepEqual(
    bands.map(({ key, x1, x2 }) => ({ key, x1, x2 })),
    [
      { key: '0', x1: 3, x2: 7 },
      { key: '4', x1: 15, x2: 16 },
      { key: 'none', x1: 40, x2: 41 },
    ],
  )
  assert.equal(depthLabel(null), 'No modeled depth')
  assert.equal(depthLabel(0), 'Depth 0')
  assert.deepEqual(bandsInView(bands, 700, 800, 100), [])
  assert.deepEqual(
    bandsInView(bands, 1500, 100, 100).map((b) => b.key),
    ['4'],
  )
})
