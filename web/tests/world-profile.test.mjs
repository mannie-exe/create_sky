import test from 'node:test'
import assert from 'node:assert/strict'
import { oreProfile } from '../src/lib/world-profile.mjs'

test('ore profile retains negative and high island heights without vanilla clipping', () => {
  const world = {
    populatedChunks: 10,
    byY: { 'test:ore': { '-100': 20, 600: 40, 760: 10 } },
    provenance: {
      generationIdentity: { dimension: { min_y: -128, height: 896 } },
    },
  }
  const result = oreProfile(world, 'test:ore')
  assert.equal(result.min, -128)
  assert.equal(result.max, 767)
  assert.deepEqual(result.rows, [
    [-100, 2],
    [600, 4],
    [760, 1],
  ])
  assert.equal(result.peak, 4)
  assert.equal(result.recordedBounds, true)
})

test('legacy profiles use observed heights and empty selections do not invent a range', () => {
  const world = { populatedChunks: 2, byY: { 'test:ore': { 400: 6, 500: 2 } } }
  const result = oreProfile(world, 'land')
  assert.equal(result.min, 400)
  assert.equal(result.max, 500)
  assert.equal(result.recordedBounds, false)
  assert.equal(oreProfile(world, 'test:absent'), null)
  assert.equal(oreProfile({ ...world, populatedChunks: 0 }, 'land'), null)
})
