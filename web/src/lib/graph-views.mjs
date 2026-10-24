import { indexScene } from './graph-scene.mjs'

// These are browsing projections. Routes, groups and conditions remain unchanged.
export function graphIndex(items, routes, machines = {}) {
  const byId = new Map(items.map((n) => [n.id, n])),
    byOutput = new Map(),
    byInput = new Map(),
    links = new Map()
  const add = (map, key, r) => {
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(r)
  }
  routes.forEach((r, index) => {
    const entry = { route: r, index }
    for (const id of new Set(r.outputs)) add(byOutput, id, entry)
    for (const id of new Set(r.inputs.flat())) add(byInput, id, entry)
    const sources = new Set(
        r.inputs
          .flat()
          .map((id) => byId.get(id)?.mod)
          .filter(Boolean),
      ),
      targets = new Set(
        r.outputs.map((id) => byId.get(id)?.mod).filter(Boolean),
      )
    for (const source of sources)
      for (const target of targets) {
        if (source === target) continue
        const key = JSON.stringify([source, target])
        if (!links.has(key)) links.set(key, { source, target, entries: [] })
        links.get(key).entries.push(entry)
      }
  })
  return {
    items,
    routes,
    byRoute: new Map(
      routes.map((route, index) => [route.id, { route, index }]),
    ),
    byId,
    byOutput,
    byInput,
    links: [...links.values()],
    machines: new Set(Object.values(machines).filter((id) => byId.has(id))),
  }
}
const itemNode = (n) => ({ ...n, type: 'item', label: n.name })
function star(center, neighbors, edges) {
  const nodes = new Map([
    [
      center.id,
      {
        ...center,
        x: 420,
        y: Math.max(120, Math.ceil(neighbors.length / 2) * 55),
      },
    ],
  ])
  neighbors.forEach((n, i) =>
    nodes.set(n.id, { ...n, x: i % 2 ? 840 : 0, y: Math.floor(i / 2) * 110 }),
  )
  return indexScene(nodes, edges)
}
export function systemsScene(index, mod, limit = 12) {
  const relations = index.links.filter(
      (e) => e.source === mod || e.target === mod,
    ),
    totals = new Map()
  for (const e of relations) {
    const other = e.source === mod ? e.target : e.source
    totals.set(other, (totals.get(other) || 0) + e.entries.length)
  }
  const ordered = [...totals].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    ),
    shown = new Set(ordered.slice(0, limit).map(([id]) => id))
  const node = (id) => ({
    id: `mod:${id}`,
    label: id,
    type: 'system',
    mod: id,
    count: index.items.filter((n) => n.mod === id).length,
  })
  return {
    ...star(
      node(mod),
      [...shown].map(node),
      relations
        .filter((e) => shown.has(e.source === mod ? e.target : e.source))
        .map((e) => ({
          id: `link:${e.source}:${e.target}`,
          source: `mod:${e.source}`,
          target: `mod:${e.target}`,
          type: 'summary',
          label: String(e.entries.length),
          entries: e.entries,
        })),
    ),
    relations,
    totalNeighbors: ordered.length,
    shownNeighbors: shown.size,
  }
}
export function coverageScene(index, status, limit = 12) {
  const groups = new Map()
  for (const n of index.items.filter((n) => n.status === status)) {
    if (!groups.has(n.mod)) groups.set(n.mod, [])
    groups.get(n.mod).push(n)
  }
  const ordered = [...groups].sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]),
  )
  const root = {
    id: `status:${status}`,
    label: status,
    type: 'summary',
    status,
  }
  const neighbors = ordered.slice(0, limit).map(([mod, items]) => ({
    id: `coverage:${mod}`,
    label: `${mod}\n${items.length} items`,
    type: 'system',
    mod,
    status,
  }))
  return {
    ...star(
      root,
      neighbors,
      neighbors.map((n) => ({
        id: `gap:${n.id}`,
        source: root.id,
        target: n.id,
        type: 'summary',
        label: '',
      })),
    ),
    totalNeighbors: groups.size,
    shownNeighbors: neighbors.length,
  }
}
export function processingScene(index, machine, limit = 6) {
  const entries = index.byInput.get(machine) || [],
    inputs = new Map(),
    outputs = new Map()
  for (const e of entries) {
    for (const id of new Set(e.route.inputs.flat())) {
      if (id === machine || !index.byId.has(id)) continue
      if (!inputs.has(id)) inputs.set(id, [])
      inputs.get(id).push(e)
    }
    for (const id of new Set(e.route.outputs)) {
      if (!index.byId.has(id)) continue
      if (!outputs.has(id)) outputs.set(id, [])
      outputs.get(id).push(e)
    }
  }
  const sorted = (map) =>
    [...map]
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
      .slice(0, limit)
  const left = sorted(inputs),
    right = sorted(outputs),
    rows = Math.max(left.length, right.length, 1),
    nodes = new Map(),
    edges = []
  const root = index.byId.get(machine)
  if (root)
    nodes.set(machine, { ...itemNode(root), x: 420, y: (rows - 1) * 55 })
  for (const [side, values, x] of [
    ['input', left, 0],
    ['output', right, 840],
  ]) {
    values.forEach(([item, records], i) => {
      const id = `${side}:${item}`
      nodes.set(id, {
        ...itemNode(index.byId.get(item)),
        id,
        itemId: item,
        x,
        y: i * 110,
      })
      edges.push({
        id: `processing:${id}`,
        source: side === 'input' ? id : machine,
        target: side === 'input' ? machine : id,
        type: 'summary',
        label: String(records.length),
        entries: records,
      })
    })
  }
  return {
    ...indexScene(nodes, edges),
    entries,
    inputCount: inputs.size,
    outputCount: outputs.size,
    shownInputs: left.length,
    shownOutputs: right.length,
  }
}
export function routeScene(index, entry) {
  if (!entry)
    return { ...indexScene(new Map(), []), hiddenChoices: 0, hiddenOutputs: 0 }
  const { route: r, index: i } = entry,
    nodes = new Map(),
    edges = [],
    routeId = `route:${i}`
  let row = 0,
    hiddenChoices = 0
  r.inputs.forEach((alternatives, slot) => {
    const id = `${routeId}:input:${slot}`,
      unique = [...new Set(alternatives)],
      shown = unique.slice(0, 4),
      height = Math.max(1, shown.length) * 80
    nodes.set(id, {
      id,
      type: 'group',
      label: unique.length
        ? `Input ${slot + 1}${unique.length > 1 ? ` · OR ${unique.length}` : ''}`
        : 'EMPTY input',
      alternatives,
      routeId,
      x: 230,
      y: row + height / 2 - 40,
    })
    shown.forEach((input, j) => {
      // Each slot owns a visual occurrence; the real identifier is retained.
      const item = index.byId.get(input),
        key = `${id}:choice:${j}`
      nodes.set(key, {
        ...(item ? itemNode(item) : { type: 'capability', label: input }),
        id: key,
        itemId: input,
        x: 0,
        y: row + j * 80,
      })
      edges.push({
        id: `${key}:edge`,
        source: key,
        target: id,
        type: 'alternative',
      })
    })
    hiddenChoices += Math.max(0, unique.length - shown.length)
    edges.push({
      id: `${id}:edge`,
      source: id,
      target: routeId,
      type: 'required',
    })
    row += height + 35
  })
  const middle = Math.max(0, row / 2 - 40)
  nodes.set(routeId, {
    id: routeId,
    type: 'route',
    label: `${r.scenario ? 'SCENARIO · ' : ''}${r.kind}\nALL ${r.inputs.length} inputs`,
    route: r,
    x: 460,
    y: middle,
  })
  r.outputs.slice(0, 12).forEach((output, j) => {
    const n = index.byId.get(output),
      id = `${routeId}:output:${j}`
    nodes.set(id, {
      ...(n ? itemNode(n) : { type: 'capability', label: output }),
      id,
      itemId: output,
      x: 700,
      y: middle + (j - (Math.min(r.outputs.length, 12) - 1) / 2) * 80,
    })
    edges.push({
      id: `${id}:edge`,
      source: routeId,
      target: id,
      type: 'output',
    })
  })
  return {
    // Ingredients above the operation, outputs below; keep labels separated.
    ...indexScene(
      new Map(
        [...nodes].map(([id, n]) => [
          id,
          { ...n, x: n.y * 2.4, y: n.x * 0.75 },
        ]),
      ),
      edges,
    ),
    hiddenChoices,
    hiddenOutputs: Math.max(0, r.outputs.length - 12),
  }
}

// The solver's finite chosen path is a browsing projection, not a recursive plan.
// Full OR groups remain inspectable even when only four alternatives are drawn.
export function pathScene(index, path, maximum = 80) {
  const steps = path.slice(-maximum),
    nodes = new Map(),
    edges = [],
    lanes = new Map()
  let hiddenChoices = 0,
    missingRoutes = 0
  for (const step of steps) {
    const depth = Number.isFinite(step.depth) ? step.depth : 0
    const entry = index.byRoute.get(step.route),
      width = Math.max(240, (entry?.route.inputs.length ?? 1) * 210)
    const x = (lanes.get(depth) ?? 0) + width / 2
    lanes.set(depth, x + width / 2 + 120)
    const item = index.byId.get(step.id)
    nodes.set(step.id, {
      ...(item ? itemNode(item) : { type: 'capability', label: step.id }),
      id: step.id,
      itemId: step.id,
      x,
      y: depth * 450,
      root: step.root,
    })
  }
  for (const step of steps) {
    if (step.root || !step.route) continue
    const entry = index.byRoute.get(step.route),
      output = nodes.get(step.id)
    if (!entry) {
      missingRoutes++
      continue
    }
    const route = entry.route,
      routeId = `path:${step.id}:route`
    nodes.set(routeId, {
      id: routeId,
      type: 'route',
      label: `${route.scenario ? 'SCENARIO · ' : ''}${route.kind}\nALL ${route.inputs.length} inputs`,
      route,
      x: output.x,
      y: output.y - 120,
    })
    edges.push({
      id: `${routeId}:out`,
      source: routeId,
      target: step.id,
      type: 'output',
    })
    route.inputs.forEach((alternatives, slot) => {
      const unique = [...new Set(alternatives)],
        chosen = step.inputs?.[slot]
      const shown = unique.includes(chosen) ? [chosen] : unique.slice(0, 1)
      hiddenChoices += unique.length - shown.length
      const id = `${routeId}:input:${slot}`,
        x = output.x + (slot - (route.inputs.length - 1) / 2) * 210,
        y = output.y - 230
      nodes.set(id, {
        id,
        type: 'group',
        label: unique.length
          ? `Input ${slot + 1}${unique.length > 1 ? ` · OR ${unique.length}` : ''}`
          : 'EMPTY input',
        alternatives,
        routeId,
        x,
        y,
      })
      edges.push({
        id: `${id}:required`,
        source: id,
        target: routeId,
        type: 'required',
      })
      shown.forEach((input, i) => {
        let source = input
        if (!nodes.has(input)) {
          source = `${id}:choice:${i}`
          const item = index.byId.get(input)
          nodes.set(source, {
            ...(item ? itemNode(item) : { type: 'capability', label: input }),
            id: source,
            itemId: input,
            x,
            y: y - 100,
          })
        }
        edges.push({
          id: `${id}:choice:${i}:edge`,
          source,
          target: id,
          type: 'alternative',
          chosen: input === chosen,
        })
      })
    })
  }
  return {
    ...indexScene(nodes, edges),
    hiddenChoices,
    missingRoutes,
    hiddenSteps: Math.max(0, path.length - steps.length),
  }
}
