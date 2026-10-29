import test from 'node:test'
import assert from 'node:assert/strict'
import { createOperations } from '../scripts/operations.mjs'

test('operations retain complete outcomes independently of read/preview jobs', () => {
  const operations = createOperations()
  const id = operations.begin('POST', '/__atlas/authoring/save')
  assert.equal(
    operations.snapshot({ name: 'journal.validate' }).current.job.name,
    'journal.validate',
  )
  operations.finish('wrong-id', null)
  assert.equal(operations.snapshot().current.id, id)
  operations.finish(id, null)
  assert.equal(operations.begin('GET', '/__atlas/authoring'), null)
  assert.equal(operations.begin('POST', '/__atlas/models/preview'), null)
  assert.equal(operations.snapshot().history[0].id, id)
  assert.equal(operations.snapshot().history[0].state, 'succeeded')
})

test('history is bounded, cancelled differs from failed, and snapshots cannot mutate it', () => {
  const operations = createOperations()
  for (let i = 0; i < 25; i++) {
    const id = operations.begin('POST', '/__atlas/authoring/save')
    operations.finish(id, 'Stopped', i === 24 ? 'cancelled' : 'failed')
  }
  const snapshot = operations.snapshot()
  assert.equal(snapshot.history.length, 20)
  assert.equal(snapshot.history[0].state, 'cancelled')
  assert.equal(snapshot.history[1].state, 'failed')
  snapshot.history[0].message = 'tampered'
  assert.equal(operations.snapshot().history[0].message, 'Stopped')
  assert.notEqual(createOperations().snapshot().session, snapshot.session)
})

test('register saves do not claim journal generation is required', () => {
  const operations = createOperations()
  const id = operations.begin('POST', '/__atlas/authoring/save', {
    changes: { 'changes/client.json': '{}' },
  })
  operations.finish(id, null)
  assert.equal(operations.snapshot().history[0].message, 'Source saved.')
  assert.equal(operations.snapshot().history[0].label, 'Save authoring source')
})
