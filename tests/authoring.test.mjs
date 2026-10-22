import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { authoring } from '../scripts/authoring.mjs'

async function fixture(t) {
  const root = await fs.realpath(
    await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-authoring-test-')),
  )
  t.after(() => fs.rm(root, { recursive: true, force: true }))
  for (const folder of [
    'authoring/journal/chapters',
    'authoring/journal/locales',
    'authoring/changes',
    'scripts',
  ])
    await fs.mkdir(path.join(root, folder), { recursive: true })
  await fs.writeFile(
    path.join(root, 'authoring/journal/locales/en_us.json'),
    '{"valid":true}\n',
  )
  await fs.writeFile(
    path.join(root, 'scripts/generate-journal.py'),
    `import json,sys
from pathlib import Path
root=Path(__file__).resolve().parent.parent
assert json.loads((root/'authoring/journal/locales/en_us.json').read_text()).get('valid'), 'Invalid journal'
if '--preview' in sys.argv: print(json.dumps({'changed':['generated.json'],'outputs':1}))
else:
 (root/'generated.json').write_text('{}')
 print('Generated')
`,
  )
  await fs.writeFile(
    path.join(root, 'scripts/audit-changes.py'),
    "print('Valid register')\n",
  )
  return { root, editor: authoring(root), name: 'journal/locales/en_us.json' }
}

test('save validates source without generating; generation checks source revision', async (t) => {
  const { root, editor, name } = await fixture(t)
  const before = await editor.read()
  await editor.save({
    name,
    revision: before.files[name].revision,
    text: '{"valid":true,"text":"edited"}\n',
  })
  assert.equal(
    JSON.parse(await fs.readFile(path.join(root, 'authoring', name), 'utf8'))
      .text,
    'edited',
  )
  await assert.rejects(fs.stat(path.join(root, 'generated.json')), {
    code: 'ENOENT',
  })
  await assert.rejects(
    editor.generate({ revision: before.revision }),
    /Source changed/,
  )
  await editor.generate({ revision: (await editor.read()).revision })
  assert.equal(
    await fs.readFile(path.join(root, 'generated.json'), 'utf8'),
    '{}',
  )
})

test('stale save, malformed JSON and failed validation leave disk unchanged', async (t) => {
  const { root, editor, name } = await fixture(t)
  const before = await editor.read(),
    revision = before.files[name].revision
  await assert.rejects(
    editor.save({ name, revision: 'stale', text: '{}' }),
    /File changed/,
  )
  await assert.rejects(editor.save({ name, revision, text: '{' }))
  await assert.rejects(
    editor.save({ name, revision, text: '{"valid":false}' }),
    /Invalid journal/,
  )
  assert.equal(
    await fs.readFile(path.join(root, 'authoring', name), 'utf8'),
    before.files[name].text,
  )
})

test('arbitrary paths and source symlinks are rejected', async (t) => {
  const { root, editor, name } = await fixture(t)
  for (const invalid of [
    '../../secret',
    'journal/locales/../defaults.json',
    '/etc/passwd',
    'changes/new.txt',
  ])
    await assert.rejects(
      editor.save({ name: invalid, text: '{}', revision: '' }),
      /Unknown authoring file/,
    )
  const target = path.join(root, 'authoring', name)
  await fs.rename(target, path.join(root, 'outside.json'))
  await fs.symlink(path.join(root, 'outside.json'), target)
  await assert.rejects(editor.read(), /symlinks/)
})
