import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { parse } from 'yaml'

// Read the launcher's verified vanilla language metadata; no game launch needed.
const [versionFile, assets] = process.argv.slice(2)
if (!versionFile || !assets)
  throw new Error('Usage: pnpm data:locales <version.json> <assets-directory>')
const pack = parse(
  await fs.readFile(new URL('../../empack.yml', import.meta.url), 'utf8'),
)
const version = JSON.parse(await fs.readFile(versionFile, 'utf8'))
const minecraft = version.id ?? version.version
if (minecraft !== pack.runtime.minecraft)
  throw new Error('Version metadata must match empack.yml runtime.minecraft')
async function verified(file, sha1) {
  const bytes = await fs.readFile(file)
  if (createHash('sha1').update(bytes).digest('hex') !== sha1)
    throw new Error(`Asset checksum mismatch: ${file}`)
  return JSON.parse(bytes.toString('utf8'))
}
const index = await verified(
  path.join(assets, 'indexes', `${version.assetIndex.id}.json`),
  version.assetIndex.sha1,
)
const hash = index.objects['pack.mcmeta'].hash
const metadata = await verified(
  path.join(assets, 'objects', hash.slice(0, 2), hash),
  hash,
)
const languages = Object.fromEntries(
  Object.entries(metadata.language).sort(([a], [b]) =>
    a.localeCompare(b, 'en'),
  ),
)
if (
  !languages.en_us ||
  Object.entries(languages).some(
    ([code, value]) =>
      !/^[a-z0-9_]+$/.test(code) ||
      typeof value.name !== 'string' ||
      typeof value.region !== 'string',
  )
)
  throw new Error('Unexpected Minecraft language metadata')
await fs.writeFile(
  new URL('../src/lib/minecraft-locales.json', import.meta.url),
  JSON.stringify(
    {
      minecraft,
      source: { assetIndex: version.assetIndex.url, packMetadataSha1: hash },
      languages,
    },
    null,
    2,
  ) + '\n',
)
console.log(
  `Updated ${Object.keys(languages).length} Minecraft ${minecraft} locales`,
)
