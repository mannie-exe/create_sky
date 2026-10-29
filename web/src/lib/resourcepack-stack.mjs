// Manifest intent, locked files and default client selection are separate facts.
export function resourceStack(
  manifest,
  lock,
  options,
  inspections,
  localArtifacts = {},
) {
  const line = options
    .split('\n')
    .find((line) => line.startsWith('resourcePacks:'))
  const selected = JSON.parse(line?.slice('resourcePacks:'.length) || '[]')
  /** @type {Record<string, {
   * kind: string, side: string, included: boolean, enabled: boolean, order: number,
   * filename?: string, version?: string, intentMatches?: boolean, inspectionMatches?: boolean,
   * sha512?: string, sha256?: string, source?: string, check?: string, present?: boolean
   * }>} */
  const stack = {}
  for (const [id, dependency] of Object.entries(manifest.dependencies)) {
    if (dependency.type !== 'resource-pack') continue
    const resolved = lock.dependencies[id]
    const file = resolved?.files.find((file) =>
      file.placements.some((place) =>
        place.destination.startsWith('resourcepacks/'),
      ),
    )
    const destination = file?.placements.find((place) =>
      place.destination.startsWith('resourcepacks/'),
    )?.destination
    const key = destination
      ? `file/${destination.slice('resourcepacks/'.length)}`
      : undefined
    stack[id] = {
      kind: 'Resource pack',
      side: 'Client',
      included: true,
      enabled: !!key && selected.includes(key),
      order: key ? selected.indexOf(key) : -1,
      filename: destination?.split('/').at(-1),
      version: resolved?.selection?.selection?.id,
      intentMatches: dependency.pin === resolved?.selection?.selection?.id,
      inspectionMatches:
        !!file &&
        inspections[id]?.inspection?.sha512 === file.expected.digests.sha512,
      sha512: file?.expected.digests.sha512,
    }
  }
  for (const [id, artifact] of Object.entries(localArtifacts)) {
    const key = `file/${artifact.filename}`
    stack[id] = {
      ...artifact,
      included: artifact.present,
      enabled:
        artifact.present &&
        (artifact.kind === 'Resource-only mod' || selected.includes(key)),
      order: artifact.kind === 'Resource-only mod' ? -1 : selected.indexOf(key),
    }
  }
  return { stack, selected }
}

export function selectionStatus(review, stack) {
  const actual = stack[review.id]
  if (actual?.enabled) return 'installed'
  if (actual?.included) return 'available'
  // A stale authored "installed" decision must not imply a current installation.
  return review.status === 'installed' ? 'unselected' : review.status
}
