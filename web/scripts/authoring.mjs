import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { jobs } from './jobs.mjs'
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
  async function filePath(name, creating = false) {
    if (typeof name !== 'string' || !allowed.test(name))
      throw new Error('Unknown authoring file')
    const file = path.join(base, name)
    // Do not allow authored symlinks to turn this editor into an arbitrary file writer.
    if (
      (await fs.realpath(path.dirname(file))) !== path.dirname(file) ||
      ((!creating ||
        (await fs.lstat(file).then(
          () => true,
          (e) => {
            if (e.code === 'ENOENT') return false
            throw e
          },
        ))) &&
        (await fs.realpath(file)) !== file) ||
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
  async function command(name, validation = pack) {
    return (await jobs.run(name, { pack, validation })).stdout
  }
  return {
    async read() {
      const values = await files()
      return {
        files: values,
        revision: revision(values),
        generation: JSON.parse(await command('journal.preview')),
      }
    },
    async audit() {
      return JSON.parse(await command('config.audit'))
    },
    async save(input) {
      const batch = input.changes !== undefined
      if (!batch) await filePath(input.name)
      const before = await files()
      const changes = batch ? input.changes : { [input.name]: input.text }
      if (
        !changes ||
        typeof changes !== 'object' ||
        Array.isArray(changes) ||
        !Object.keys(changes).length ||
        Object.keys(changes).length > 100
      )
        throw new Error('Expected source changes')
      if (
        batch
          ? input.revision !== revision(before)
          : input.revision !== before[input.name]?.revision
      )
        throw new Error('File changed on disk. Reload before saving.')
      const destinations = {}
      for (const [name, text] of Object.entries(changes)) {
        const newLocale = /^journal\/locales\/[a-z0-9_]+\.json$/.test(name)
        if (text === null) {
          if (!newLocale || name.endsWith('/en_us.json') || !before[name])
            throw new Error('Only additional locale files can be deleted')
        } else {
          if (typeof text !== 'string' || Buffer.byteLength(text) > 1000000)
            throw new Error('Invalid source text')
          JSON.parse(text)
        }
        destinations[name] = await filePath(name, newLocale && !before[name])
      }
      const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'sky-journal-'))
      const staged = [],
        applied = []
      try {
        for (const [name, value] of Object.entries({
          ...Object.fromEntries(
            Object.entries(before).map(([name, file]) => [name, file.text]),
          ),
          ...changes,
        })) {
          if (value === null) continue
          const target = path.join(temporary, 'authoring', name)
          await fs.mkdir(path.dirname(target), { recursive: true })
          await fs.writeFile(target, value)
        }
        await fs.mkdir(path.join(temporary, 'scripts'))
        for (const script of ['generate-journal.py', 'audit-changes.py'])
          await fs.copyFile(
            path.join(pack, 'scripts', script),
            path.join(temporary, 'scripts', script),
          )
        await command('journal.validate', temporary)
        await command('config.validate', temporary)
        if (revision(await files()) !== revision(before))
          throw new Error(
            'Source changed during validation. Reload before saving.',
          )
        // Stage all writes before replacing any source. Roll back ordinary I/O
        // failures; this is not a crash-atomic filesystem transaction.
        for (const [name, text] of Object.entries(changes)) {
          await filePath(name, !before[name])
          if (text === null) continue
          const stage = destinations[name] + '.tmp'
          await fs.writeFile(stage, text, { flag: 'wx' })
          staged.push(stage)
        }
        if (revision(await files()) !== revision(before))
          throw new Error(
            'Source changed during validation. Reload before saving.',
          )
        for (const [name, text] of Object.entries(changes)) {
          if (text === null) await fs.unlink(destinations[name])
          else await fs.rename(destinations[name] + '.tmp', destinations[name])
          applied.push(name)
        }
        return {
          revision: batch ? revision(await files()) : digest(input.text),
        }
      } catch (error) {
        for (const name of applied.reverse()) {
          if (before[name])
            await fs.writeFile(destinations[name], before[name].text)
          else await fs.unlink(destinations[name])
        }
        throw error
      } finally {
        for (const stage of staged) await fs.rm(stage, { force: true })
        await fs.rm(temporary, { recursive: true, force: true })
      }
    },
    async generate(input) {
      if (revision(await files()) !== input.revision)
        throw new Error('Source changed on disk. Reload before generating.')
      const output = await command('journal.generate')
      return { output: output.trim() }
    },
  }
}
