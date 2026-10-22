/** Optimistic AND/OR recipe depth. Unresolved cycles are never silently made roots. */
export function depths(ids, roots, routes) {
  const known = new Set(ids),
    result = new Map(roots.filter((id) => known.has(id)).map((id) => [id, 0]))
  let changed = true
  while (changed) {
    changed = false
    for (const route of routes) {
      if (!route.inputs.length || route.inputs.some((group) => !group.length))
        continue
      const costs = route.inputs.map((group) =>
        Math.min(...group.map((id) => result.get(id) ?? Infinity)),
      )
      const cost = Math.max(...costs) + 1
      if (!Number.isFinite(cost)) continue
      for (const output of route.outputs) {
        if (known.has(output) && cost < (result.get(output) ?? Infinity)) {
          result.set(output, cost)
          changed = true
        }
      }
    }
  }
  return result
}

export function recipeOutputs(recipe) {
  const values = recipe.results ?? (recipe.result ? [recipe.result] : [])
  return values
    .map((value) =>
      typeof value === 'string' ? value : (value.id ?? value.item),
    )
    .filter(Boolean)
}

export function recipeInputs(recipe, tags) {
  const resolve = (value) => {
    if (typeof value === 'string')
      return value.startsWith('#') ? (tags[value.slice(1)] ?? []) : [value]
    if (Array.isArray(value)) return value.flatMap(resolve)
    if (value?.item) return [value.item]
    if (value?.tag) return tags[value.tag] ?? []
    return [] // Fluid/custom ingredients remain in full evidence, never guessed.
  }
  return (
    recipe.ingredients ??
    (recipe.ingredient ? [recipe.ingredient] : Object.values(recipe.key ?? {}))
  ).map(resolve)
}

export function layout(nodes) {
  const maximum = Math.max(0, ...nodes.map((n) => n.depth ?? 0))
  const mapped = nodes.filter((n) => n.depth !== null && n.depth !== undefined)
  const minimum = mapped.length ? Math.min(...mapped.map((n) => n.depth)) : 0
  const groups = new Map()
  for (const node of nodes) {
    const stage = node.depth ?? maximum + 2
    if (!groups.has(stage)) groups.set(stage, [])
    groups.get(stage).push(node)
  }
  for (const [stage, group] of groups) {
    group.sort(
      (a, b) =>
        a.complexity - b.complexity ||
        a.mod.localeCompare(b.mod) ||
        a.id.localeCompare(b.id),
    )
    group.forEach((node, index) => {
      node.x = (stage - minimum) * 7 + (index % 6)
      node.y = (stage - minimum) * 3 + Math.floor(index / 6)
    })
  }
  return nodes
}

export function detailBucket(id) {
  return [...id].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0) % 16
}

/** Minimum-depth witnesses and actionable gaps. No cycle becomes a root. */
export function analyzeRoutes(ids, roots, routes, excluded = []) {
  const depth = depths(ids, roots, routes),
    rootSet = new Set(roots),
    excludedSet = new Set(excluded)
  const producing = new Map(),
    consumers = new Map(),
    witnesses = new Map()
  for (const route of routes) {
    for (const id of route.outputs) {
      if (!producing.has(id)) producing.set(id, [])
      producing.get(id).push(route)
    }
    for (const id of new Set(route.inputs.flat())) {
      if (!consumers.has(id)) consumers.set(id, new Set())
      consumers.get(id).add(route.id)
    }
    if (!route.inputs.length || route.inputs.some((g) => !g.length)) continue
    const chosen = route.inputs.map(
      (g) =>
        [...g].sort(
          (a, b) =>
            (depth.get(a) ?? Infinity) - (depth.get(b) ?? Infinity) ||
            a.localeCompare(b),
        )[0],
    )
    const cost = Math.max(...chosen.map((id) => depth.get(id) ?? Infinity)) + 1
    for (const output of route.outputs)
      if (
        Number.isFinite(cost) &&
        cost === depth.get(output) &&
        !rootSet.has(output) &&
        !witnesses.has(output)
      )
        witnesses.set(output, { route: route.id, inputs: chosen })
  }
  const coverage = new Map(
    ids.map((id) => {
      const producers = producing.get(id) ?? []
      const missing = producers.map((r) => ({
        route: r.id,
        emptyInput: r.inputs.some((g) => !g.length),
        missing: r.inputs.filter((g) => !g.some((v) => depth.has(v))),
      }))
      const status = excludedSet.has(id)
        ? 'excluded'
        : depth.has(id)
          ? 'mapped'
          : producers.some((r) => r.inputs.length)
            ? 'blocked'
            : 'unmapped'
      return [
        id,
        {
          id,
          status,
          depth: depth.get(id) ?? null,
          routeCount: producers.length,
          downstream: consumers.get(id)?.size ?? 0,
          missing: depth.has(id) ? [] : missing,
        },
      ]
    }),
  )
  function pathFor(id) {
    const result = [],
      seen = new Set()
    const visit = (key) => {
      if (seen.has(key)) return
      seen.add(key)
      const witness = witnesses.get(key)
      if (witness) for (const input of witness.inputs) visit(input)
      result.push({
        id: key,
        depth: depth.get(key) ?? null,
        root: rootSet.has(key),
        ...witness,
      })
    }
    visit(id)
    return result
  }
  return { depth, coverage, producing, witnesses, pathFor }
}
