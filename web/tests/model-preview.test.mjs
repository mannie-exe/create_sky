import test from 'node:test'
import assert from 'node:assert/strict'
import { faceGeometry } from '../src/lib/model-preview.ts'

test('preview faces point outward on every Minecraft axis', () => {
  const element = { from: [1, 2, 3], to: [4, 6, 8] }
  const directions = {
    north: [0, 0, -1],
    south: [0, 0, 1],
    west: [-1, 0, 0],
    east: [1, 0, 0],
    up: [0, 1, 0],
    down: [0, -1, 0],
  }
  for (const [direction, expected] of Object.entries(directions)) {
    const geometry = faceGeometry(element, direction, { uv: [0, 0, 16, 16] })
    assert.deepEqual(
      Array.from(geometry.getAttribute('normal').array.slice(0, 3)).map(
        (n) => n || 0,
      ),
      expected,
    )
    geometry.dispose()
  }
})

test('UV rotation and model rotation retain face size and texture region', () => {
  const element = {
    from: [0, 0, 0],
    to: [2, 2, 2],
    rotation: { axis: 'y', angle: 90, origin: [0, 0, 0] },
  }
  const geometry = faceGeometry(element, 'south', {
    uv: [0, 0, 8, 8],
    rotation: 90,
  })
  const normal = geometry.getAttribute('normal')
  assert.ok(Math.abs(normal.getX(0) - 1) < 1e-6)
  assert.ok(Math.abs(normal.getZ(0)) < 1e-6)
  assert.deepEqual(
    Array.from(geometry.getAttribute('uv').array),
    [0, 0.5, 0.5, 0.5, 0.5, 1, 0, 1],
  )
  geometry.dispose()
})
