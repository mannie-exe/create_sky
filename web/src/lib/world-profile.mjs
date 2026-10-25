// World-space heights come from the captured source, never the current pack preset.
export function oreProfile(world, metric) {
  const totals = new Map()
  const denominator = Number(world.populatedChunks)
  if (!(denominator > 0)) return null
  for (const [id, levels] of Object.entries(world.byY ?? {})) {
    if (metric !== 'land' && id !== metric) continue
    for (const [height, count] of Object.entries(levels)) {
      const y = Number(height),
        value = Number(count) / denominator
      if (Number.isFinite(y) && Number.isFinite(value) && value > 0)
        totals.set(y, (totals.get(y) ?? 0) + value)
    }
  }
  if (!totals.size) return null
  const rows = [...totals].sort(([a], [b]) => a - b)
  const observedMin = rows[0][0],
    observedMax = rows.at(-1)[0]
  const dimension = world.provenance?.generationIdentity?.dimension
  const declaredMin = Number(dimension?.min_y)
  const declaredMax = declaredMin + Number(dimension?.height) - 1
  const recordedBounds =
    Number.isFinite(declaredMin) && declaredMax > declaredMin
  const min = recordedBounds ? Math.min(declaredMin, observedMin) : observedMin
  const max = recordedBounds ? Math.max(declaredMax, observedMax) : observedMax
  const peak = Math.max(...rows.map(([, value]) => value))
  return { rows, min, max, peak, recordedBounds }
}
