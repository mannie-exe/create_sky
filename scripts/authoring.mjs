import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)
const digest = (value) =>
  crypto.createHash('sha256').update(value).digest('hex')
const allowed =
  /^(journal\/(defaults\.json|(?:chapters|locales)\/[a-z0-9_]+\.json)|changes\/[a-z0-9_]+\.json)$/

export async function configuredPack(root) {
  const defaults = JSON.parse(
    await fs.readFile(path.join(root, 'data/local.example.json'), 'utf8'),
  )
  const local = await fs
    .readFile(path.join(root, 'data/local.json'), 'utf8')
    .catch((error) => {
      if (error.code !== 'ENOENT') throw error
      return '{}'
    })
  const pack = { ...defaults, ...JSON.parse(local) }.pack
  return path.resolve(
    root,
    pack.startsWith('~/') ? path.join(os.homedir(), pack.slice(2)) : pack,
  )
}

export function authoring(pack) {
  const base = path.join(pack, 'authoring')
  async function filePath(name) {
    if (typeof name !== 'string' || !allowed.test(name))
      throw new Error('Unknown authoring file')
    const file = path.join(base, name)
    // Do not allow authored symlinks to turn this editor into an arbitrary file writer.
    if (
      (await fs.realpath(file)) !== file ||
      (await fs.realpath(base)) !== base
    )
      throw new Error('Authoring symlinks are not supported')
    return file
  }
  async function files() {
    const result = {}
    for (const directory of [
      'journal',
      'journal/chapters',
      'journal/locales',
      'changes',
    ]) {
      for (const item of (
        await fs.readdir(path.join(base, directory))
      ).sort()) {
        const name = directory + '/' + item
        if (!allowed.test(name)) continue
        const text = await fs.readFile(await filePath(name), 'utf8')
        result[name] = { text, revision: digest(text) }
      }
    }
    return result
  }
  const revision = (values) => digest(JSON.stringify(values))
  async function command(script, args = [], cwd = pack) {
    return (
      await run('python3', [path.join(cwd, 'scripts', script), ...args], {
        cwd,
        timeout: 30000,
        maxBuffer: 2 * 1024 * 1024,
      })
    ).stdout
  }
  return {
    async read() {
      const values = await files()
      return {
        files: values,
        revision: revision(values),
        generation: JSON.parse(
          await command('generate-journal.py', ['--preview']),
        ),
      }
    },
    async audit() {
      try {
        return JSON.parse(await command('audit-changes.py', ['--json']))
      } catch (error) {
        if (error.code === 1 && error.stdout) return JSON.parse(error.stdout)
        throw error
      }
    },
    async save(input) {
      const destination = await filePath(input.name)
      if (
        typeof input.text !== 'string' ||
        Buffer.byteLength(input.text) > 1000000
      )
        throw new Error('Invalid source text')
      JSON.parse(input.text)
      const before = await files()
      if (before[input.name].revision !== input.revision)
        throw new Error('File changed on disk. Reload before saving.')
      const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'sky-journal-'))
      try {
        for (const [name, value] of Object.entries(before)) {
          const target = path.join(temporary, 'authoring', name)
          await fs.mkdir(path.dirname(target), { recursive: true })
          await fs.writeFile(
            target,
            name === input.name ? input.text : value.text,
          )
        }
        await fs.mkdir(path.join(temporary, 'scripts'))
        for (const script of ['generate-journal.py', 'audit-changes.py'])
          await fs.copyFile(
            path.join(pack, 'scripts', script),
            path.join(temporary, 'scripts', script),
          )
        await command('generate-journal.py', ['--preview'], temporary)
        await command('audit-changes.py', ['--validate'], temporary)
        if (revision(await files()) !== revision(before))
          throw new Error(
            'Source changed during validation. Reload before saving.',
          )
        await filePath(input.name)
        // Exclusive creation avoids following a pre-existing temporary symlink.
        await fs.writeFile(destination + '.tmp', input.text, { flag: 'wx' })
        try {
          await fs.rename(destination + '.tmp', destination)
        } catch (error) {
          await fs.unlink(destination + '.tmp')
          throw error
        }
        return { revision: digest(input.text) }
      } finally {
        await fs.rm(temporary, { recursive: true, force: true })
      }
    },
    async generate(input) {
      if (revision(await files()) !== input.revision)
        throw new Error('Source changed on disk. Reload before generating.')
      const output = await command('generate-journal.py')
      return { output: output.trim() }
    },
  }
}
