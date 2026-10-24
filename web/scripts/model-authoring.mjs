import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex')

export function modelAuthoring(pack) {
  const file = path.join(pack, 'authoring/model-recipes.json')
  const pins = path.join(pack, 'authoring/resource-patches.json')
  async function source() {
    for (const name of [file, pins])
      if ((await fs.realpath(name)) !== name)
        throw new Error('Model authoring symlinks are not supported')
    const text = await fs.readFile(file, 'utf8')
    const pinText = await fs.readFile(pins, 'utf8')
    return { text, revision: hash(text + '\n' + pinText) }
  }
  function command(script, args = [], document) {
    return new Promise((resolve, reject) => {
      const child = spawn(
        'python3',
        [path.join(pack, 'scripts', script), ...args],
        {
          cwd: pack,
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      )
      let stdout = '',
        stderr = '',
        failure
      const timer = setTimeout(() => {
        failure = new Error('Model generation timed out')
        child.kill('SIGTERM')
      }, 30000)
      const receive = (chunk, error) => {
        if (error) stderr += chunk
        else stdout += chunk
        if (Buffer.byteLength(stdout) + Buffer.byteLength(stderr) > 8e6) {
          failure = new Error('Model preview exceeds output limit')
          child.kill('SIGTERM')
        }
      }
      child.stdout.on('data', (chunk) => receive(chunk, false))
      child.stderr.on('data', (chunk) => receive(chunk, true))
      child.on('error', (error) => {
        clearTimeout(timer)
        reject(error)
      })
      child.on('close', (code) => {
        clearTimeout(timer)
        if (failure || code !== 0)
          reject(
            failure || new Error(stderr.trim() || 'Model generation failed'),
          )
        else resolve(stdout)
      })
      child.stdin.on('error', () => {})
      child.stdin.end(
        document === undefined ? undefined : JSON.stringify(document),
      )
    })
  }
  async function preview(document, validate = false) {
    if (!document || Buffer.byteLength(JSON.stringify(document)) > 1e6)
      throw new Error('Invalid model document')
    return JSON.parse(
      await command(
        'model-workbench.py',
        ['--stdin', ...(validate ? ['--validate'] : [])],
        document,
      ),
    )
  }
  async function expectRevision(revision) {
    const current = await source()
    if (current.revision !== revision)
      throw new Error(
        'Model source or input pins changed. Reload before saving or generating.',
      )
    return current
  }
  return {
    async read() {
      const current = await source()
      const document = JSON.parse(current.text)
      return {
        document,
        revision: current.revision,
        ...(await preview(document)),
      }
    },
    preview,
    async save(input) {
      await expectRevision(input.revision)
      await preview(input.document, true)
      await expectRevision(input.revision)
      const text = JSON.stringify(input.document, null, 2) + '\n'
      await fs.writeFile(file + '.tmp', text, { flag: 'wx' })
      try {
        await fs.rename(file + '.tmp', file)
      } catch (error) {
        await fs.unlink(file + '.tmp')
        throw error
      }
      return { revision: (await source()).revision }
    },
    async generate(input) {
      await expectRevision(input.revision)
      const output = await command('build-resource-patches.py')
      await expectRevision(input.revision)
      return { output: output.trim() }
    },
  }
}
