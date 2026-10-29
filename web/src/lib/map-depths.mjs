// Bounds come from the compiled layout. Do not recreate its column/row formula.
export function depthBands(items) {
  const bands = new Map()
  for (const item of items) {
    const key = item.depth === null ? 'none' : String(item.depth)
    if (!bands.has(key))
      bands.set(key, {
        key,
        depth: item.depth,
        x1: item.x,
        x2: item.x + 1,
        items: [],
      })
    const band = bands.get(key)
    band.x1 = Math.min(band.x1, item.x)
    band.x2 = Math.max(band.x2, item.x + 1)
    band.items.push(item)
  }
  return [...bands.values()].sort((a, b) => a.x1 - b.x1)
}
export function depthLabel(depth) {
  return depth === null ? 'No modeled depth' : `Depth ${depth}`
}
export function bandsInView(bands, left, width, cellWidth) {
  return bands.filter(
    (b) => b.x2 * cellWidth > left && b.x1 * cellWidth < left + width,
  )
}

export function familyBands(items) {
  const bands = new Map()
  for (const item of items) {
    const key = item.family ?? 'unresolved'
    if (!bands.has(key))
      bands.set(key, { key, y1: item.y, y2: item.y + 1, items: [] })
    const band = bands.get(key)
    band.y1 = Math.min(band.y1, item.y)
    band.y2 = Math.max(band.y2, item.y + 1)
    band.items.push(item)
  }
  return [...bands.values()].sort((a, b) => a.y1 - b.y1)
}
