import { readFile, mkdir, copyFile, realpath } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const manifest = JSON.parse(
  await readFile(
    new URL('../data/research/resourcepacks/local-media.json', import.meta.url),
    'utf8',
  ),
)
const target = fileURLToPath(
  new URL('../public/generated/resource-review/', import.meta.url),
)
const roots = {
  atlas: target,
  harness: fileURLToPath(
    new URL(
      '../../../modpack-testing/projects/create-sky-resources/',
      import.meta.url,
    ),
  ),
}
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
function within(root, relative) {
  if (
    !relative ||
    relative
      .split('/')
      .some((part) => !part || part === '.' || part === '..') ||
    path.isAbsolute(relative) ||
    relative.includes('\\')
  )
    throw new Error(`Invalid media path: ${relative}`)
  return path.join(root, relative)
}
let copied = 0
for (const media of manifest.media) {
  const destination = within(target, media.file)
  const existing = await readFile(destination).catch((error) => {
    if (error.code !== 'ENOENT') throw error
    return null
  })
  if (existing) {
    if (hash(existing) !== media.sha256)
      throw new Error(`Changed capture: ${media.file}`)
    continue
  }
  const [owner, ...parts] = media.source.split('/')
  if (!Object.hasOwn(roots, owner)) throw new Error(`Unknown source: ${owner}`)
  const root = await realpath(roots[owner])
  const source = await realpath(within(root, parts.join('/')))
  if (!source.startsWith(root + path.sep))
    throw new Error('Media source escapes its archive')
  const bytes = await readFile(source)
  if (hash(bytes) !== media.sha256)
    throw new Error(`Changed source: ${media.source}`)
  await mkdir(path.dirname(destination), { recursive: true })
  await copyFile(source, destination)
  copied++
}
console.log(
  `${manifest.media.length} captures verified; ${copied} copied. Existing archives preserved.`,
)
