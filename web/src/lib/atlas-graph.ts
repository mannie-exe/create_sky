import cytoscape, { type Core } from 'cytoscape'
import { detailBucket } from './graph.mjs'
import { recipeHTML, safeIcon } from './recipe-view.mjs'
import { requestJSON } from './http'
import { renderSlice } from './graph-scene.mjs'
import {
  graphIndex,
  systemsScene,
  processingScene,
  coverageScene,
  routeScene,
  pathScene,
} from './graph-views.mjs'
import { createMinimap } from './minimap'

const el = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T
const select = (id: string) => el<HTMLSelectElement>(id)
export function createGraph(inspect: (id: string) => void) {
  const canvas = el('graph-canvas')
  let index: ReturnType<typeof graphIndex>,
    scene: any,
    mode = 'systems',
    itemId = '',
    machineId = '',
    entry: any,
    matches: any[] = [],
    limit = 100,
    selected = '',
    queued = false,
    rebuilding = false
  let drawVersion = 0
  const details = new Map<string, any>()
  let recipes = new Map<string, any>()
  const cameras = new Map<
    string,
    { zoom: number; pan: { x: number; y: number } }
  >()
  const cy: Core = cytoscape({
    container: canvas,
    elements: [],
    layout: { name: 'preset' },
    minZoom: 0.02,
    maxZoom: 2.5,
    pixelRatio: Math.min(devicePixelRatio, 2),
    autoungrabify: true,
    style: [
      {
        selector: 'node',
        style: {
          width: 46,
          height: 46,
          label: 'data(label)',
          'font-size': 12,
          color: '#334155',
          'text-valign': 'bottom',
          'text-margin-y': 7,
          'text-wrap': 'wrap',
          'text-max-width': '170px',
          'background-color': '#e8eef6',
          'border-width': 1,
          'border-color': '#7188a7',
          'min-zoomed-font-size': 6,
        },
      },
      { selector: 'node[type="item"]', style: { shape: 'round-rectangle' } },
      {
        selector: 'node[icon]',
        style: {
          'background-image': 'data(icon)',
          'background-fit': 'contain',
          'background-width': '85%',
          'background-height': '85%',
        },
      },
      {
        selector: 'node[type="system"],node[type="summary"]',
        style: {
          shape: 'round-rectangle',
          width: 170,
          height: 50,
          'text-valign': 'center',
          'text-margin-y': 0,
        },
      },
      {
        selector: 'node[type="route"]',
        style: {
          shape: 'round-rectangle',
          width: 130,
          height: 50,
          'text-valign': 'center',
          'text-margin-y': 0,
          'background-color': '#cbd5e1',
        },
      },
      {
        selector: 'node[type="group"]',
        style: {
          shape: 'diamond',
          width: 30,
          height: 30,
          'background-color': '#e8d7b9',
        },
      },
      {
        selector: 'node[type="capability"]',
        style: { shape: 'hexagon', 'background-color': '#dce4d0' },
      },
      {
        selector: 'node[type="overview"]',
        style: {
          width: 'data(size)',
          height: 'data(size)',
          label: '',
          'border-width': 0,
        },
      },
      {
        selector: 'edge',
        style: {
          width: 1.3,
          'line-color': '#91a3b8',
          'target-arrow-color': '#7188a7',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'arrow-scale': 0.7,
        },
      },
      {
        selector: 'edge[type="summary"]',
        style: {
          label: 'data(label)',
          'font-size': 10,
          'text-background-color': '#fff',
          'text-background-opacity': 0.9,
          'text-background-padding': '2px',
        },
      },
      {
        selector: 'edge[type="alternative"]',
        style: { 'line-style': 'dashed' },
      },
      {
        selector: '.selected',
        style: { 'border-color': '#315dc1', 'border-width': 3 },
      },
    ],
  })
  function center(x: number, y: number, zoom = cy.zoom()) {
    cy.viewport({
      zoom,
      pan: { x: cy.width() / 2 - x * zoom, y: cy.height() / 2 - y * zoom },
    })
  }
  function fit() {
    if (!scene) return
    const b = scene.bounds
    center(
      (b.x1 + b.x2) / 2,
      (b.y1 + b.y2) / 2,
      Math.max(
        0.02,
        Math.min(
          1,
          (cy.width() - 90) / Math.max(1, b.x2 - b.x1),
          (cy.height() - 90) / Math.max(1, b.y2 - b.y1),
        ),
      ),
    )
  }
  function zoom(factor: number) {
    cy.zoom({
      level: Math.max(0.02, Math.min(2.5, cy.zoom() * factor)),
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    })
  }
  function keyboard(e: KeyboardEvent) {
    const moves: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: 100, y: 0 },
      ArrowRight: { x: -100, y: 0 },
      ArrowUp: { x: 0, y: 100 },
      ArrowDown: { x: 0, y: -100 },
    }
    if (moves[e.key]) {
      e.preventDefault()
      cy.panBy(moves[e.key])
    } else if (['+', '=', '-', 'Home'].includes(e.key)) {
      e.preventDefault()
      e.key === 'Home' ? fit() : zoom(e.key === '-' ? 1 / 1.5 : 1.5)
    }
  }
  const mini = createMinimap(
    el<HTMLCanvasElement>('graph-minimap'),
    center,
    keyboard,
  )
  canvas.addEventListener('keydown', keyboard)
  function render() {
    queued = false
    if (!scene || el('graph-view').hidden) return
    const start = performance.now(),
      slice = renderSlice(scene, cy.extent(), cy.zoom())
    const definitions: any[] = slice.nodes.map((n: any) => {
      const icon = safeIcon(n.icon)
      return {
        data: {
          id: n.id,
          type: n.type,
          label: n.label,
          ...(icon ? { icon } : {}),
          ...(n.type === 'overview'
            ? { size: Math.min(18, 4 + Math.sqrt(n.count)) / cy.zoom() }
            : {}),
        },
        position: { x: n.x, y: n.y },
        classes: n.id === selected ? 'selected' : '',
      }
    })
    definitions.push(
      ...slice.edges.map((e: any) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type,
          label: e.label || '',
        },
      })),
    )
    rebuilding = true
    const wanted = new Set(definitions.map((n) => n.data.id))
    cy.batch(() => {
      cy.elements()
        .filter((e) => !wanted.has(e.id()))
        .remove()
      for (const d of definitions) {
        const old = cy.getElementById(d.data.id)
        if (old.empty()) cy.add(d)
        else {
          old.data(d.data)
          if (d.position) old.position(d.position)
        }
        if (d.position)
          cy.getElementById(d.data.id).toggleClass(
            'selected',
            d.data.id === selected,
          )
      }
    })
    rebuilding = false
    Object.assign(canvas.dataset, {
      renderedNodes: String(slice.nodes.length),
      sceneNodes: String(scene.nodes.size),
      renderedEdges: String(slice.edges.length),
      mode: slice.overview ? 'overview' : 'detail',
      view: mode,
      zoom: String(cy.zoom()),
      panX: String(cy.pan().x),
      panY: String(cy.pan().y),
      renderMs: (performance.now() - start).toFixed(1),
    })
    el('graph-rendering').textContent =
      `${slice.nodes.length} visible / ${scene.nodes.size} nodes · ${slice.edges.length} connections${slice.overview ? ' · zoom in for details' : ''}${slice.omittedEdges ? ' · off-screen/dense connections omitted; records remain below' : ''}`
    mini.draw(cy.extent())
  }
  function queue() {
    if (!queued && !rebuilding) {
      queued = true
      requestAnimationFrame(render)
    }
  }
  cy.on('viewport', queue)
  function button(parent: HTMLElement, label: string, action: () => void) {
    const b = document.createElement('button')
    b.textContent = label
    b.addEventListener('click', action)
    parent.append(b)
    return b
  }
  function record(title: string, summary: string, data?: any) {
    el('graph-selection-title').textContent = title
    el('graph-selection-summary').textContent = summary
    el('graph-route-list').replaceChildren()
    el('graph-recipe-preview').replaceChildren()
    el('graph-record').hidden = !data
    el('graph-selection-data').textContent = data
      ? JSON.stringify(data, null, 2)
      : ''
  }
  function showRecipe(route: any) {
    const recipe = route?.kind === 'recipe' && recipes.get(route.id)
    if (recipe)
      el('graph-recipe-preview').innerHTML = recipeHTML(recipe, index.byId)
  }
  el('graph-recipe-preview').addEventListener('click', (event) => {
    const target = (event.target as Element).closest<HTMLElement>(
      '[data-inspect]',
    )
    if (target) inspect(target.dataset.inspect!)
  })
  function showEntries(entries: any[]) {
    const list = el('graph-route-list')
    for (const e of entries.slice(0, 100))
      button(
        list,
        `${e.route.scenario ? 'SCENARIO · ' : ''}${e.route.kind}: ${e.route.id}`,
        () => openRoute(e),
      )
    if (entries.length > 100)
      button(list, `Show ${entries.length - 100} more routes`, () => {
        list.replaceChildren()
        showEntries(entries.slice(100))
      })
  }
  function openRoute(e: any) {
    select('graph-route-view').value = 'single'
    entry = e
    itemId = e.route.outputs.find((id: string) => index.byId.has(id)) || itemId
    select('graph-relation').value = 'acquisition'
    switchMode('routes', false)
    build(false)
    select('graph-recipe').value = String(e.index)
    entry = e
    drawRoute()
    fit()
  }
  function openItem(id: string, path = false) {
    select('graph-route-view').value = path ? 'path' : 'single'
    itemId = id
    entry = undefined
    select('graph-relation').value = 'acquisition'
    switchMode('routes', false)
    build()
  }
  function showNode(n: any) {
    selected = n.id
    if (n.type === 'system') {
      const ns = n.mod
      record(
        ns,
        `${index.items.filter((i: any) => i.mod === ns).length} registered items. Select an item below to trace its routes.`,
      )
      if (mode === 'systems') {
        select('graph-mod').value = ns
        build()
        return
      }
      matches = index.items.filter(
        (i: any) => i.mod === ns && i.status === select('graph-status').value,
      )
      results()
    } else if (n.type === 'item') {
      const id = n.itemId || n.id
      record(
        n.label,
        `${id} · ${n.depth === null ? 'Unresolved' : `Modeled depth ${n.depth}`}. Depth is not elapsed time.`,
      )
      button(el('graph-route-list'), 'Item details', () => inspect(id))
      button(el('graph-route-list'), 'Trace acquisition', () => openItem(id))
    } else if (n.type === 'group') {
      record(
        n.label,
        'Choose ONE alternative in this group. ALL input groups feeding the route are required.',
        { alternatives: n.alternatives },
      )
      for (const id of n.alternatives)
        if (index.byId.has(id))
          button(el('graph-route-list'), index.byId.get(id).name, () =>
            openItem(id),
          )
    } else if (n.type === 'route') {
      record(
        n.route.id,
        'Potential route. Conditions, quantities and probabilities remain in source records.',
        n.route,
      )
      showRecipe(n.route)
    } else if (n.type === 'capability' && n.itemId) {
      record(
        n.label,
        'Modeled capability or environmental requirement. Inspect connected routes for its assumptions and conditions; this is not necessarily an inventory item.',
        { id: n.itemId, environmentalRoot: Boolean(n.root) },
      )
    } else record(n.label, 'Coverage summary, not a gameplay prerequisite.')
    render()
  }
  cy.on('tap', 'node', (e) => {
    const n = scene.nodes.get(e.target.id())
    if (n) showNode(n)
    else if (e.target.data('type') === 'overview') {
      const p = e.target.position()
      center(p.x, p.y, Math.max(0.5, cy.zoom() * 2))
    }
  })
  function showEdge(edge: any) {
    if (edge?.entries) {
      record(
        'Contributing routes',
        `${edge.entries.length} routes mention this connection. OR choices count as possible inputs, not mandatory dependencies.`,
      )
      showEntries(edge.entries)
    } else if (edge) {
      record(
        'Connection',
        edge.type === 'alternative'
          ? 'ONE alternative per input group. The chosen path is only one possibility.'
          : 'ALL input groups are required. This does not imply sufficient quantities or operating conditions.',
        scene.nodes.get(edge.target)?.route ??
          scene.nodes.get(scene.nodes.get(edge.target)?.routeId)?.route ??
          entry?.route,
      )
    }
  }
  cy.on('tap', 'edge', (e) =>
    showEdge(scene.edges.find((n: any) => n.id === e.target.id())),
  )
  el('graph-node').addEventListener('change', () => {
    const n = scene.nodes.get(select('graph-node').value)
    if (n) showNode(n)
  })
  el('graph-edge').addEventListener('change', () =>
    showEdge(scene.edges.find((e: any) => e.id === select('graph-edge').value)),
  )
  function results() {
    const query = el<HTMLInputElement>('graph-search').value.toLowerCase(),
      shown = matches.filter((n) =>
        `${n.id} ${n.name}`.toLowerCase().includes(query),
      )
    const list = el('graph-results')
    list.replaceChildren()
    for (const n of shown.slice(0, limit)) {
      const b = button(list, n.name, () => {
        if (mode === 'processing') {
          machineId = n.id
          build()
        } else openItem(n.id)
      })
      b.dataset.item = n.id
      b.title = n.id
      const icon = safeIcon(n.icon)
      if (icon) {
        const image = document.createElement('img')
        image.src = icon
        image.alt = ''
        image.loading = 'lazy'
        b.prepend(image)
      }
    }
    el('graph-list-count').textContent =
      `${shown.length.toLocaleString()} items${shown.length > limit ? ` · first ${limit}` : ''}`
    el('graph-more').hidden = shown.length <= limit
  }
  function mount(next: any, reset = true) {
    scene = next
    selected = ''
    select('graph-node').replaceChildren(
      new Option('Choose a node…', ''),
      ...[...scene.nodes.values()].map((n: any) => new Option(n.label, n.id)),
    )
    select('graph-edge').replaceChildren(
      new Option('Choose a connection…', ''),
      ...scene.edges.map(
        (e: any) =>
          new Option(
            `${scene.nodes.get(e.source)?.label} → ${scene.nodes.get(e.target)?.label}${e.label ? ` · ${e.label}` : ''}`,
            e.id,
          ),
      ),
    )
    cy.elements().remove()
    mini.setScene(
      scene.bounds,
      [...scene.nodes.values()].map((n: any) => ({ x: n.x, y: n.y })),
    )
    if (reset) fit()
    queue()
  }
  async function drawRoute(reset = true) {
    const version = ++drawVersion
    const path = select('graph-route-view').value === 'path'
    select('graph-relation').disabled = path
    select('graph-recipe').disabled = path || !entry
    if (path) {
      const id = itemId,
        n = index.byId.get(id)
      el('graph-item-title').textContent = n?.name || id
      el('graph-counts').textContent = 'Loading path…'
      try {
        const key = `${n?.mod ?? id.split(':')[0]}/${detailBucket(id)}`
        if (!details.has(key))
          details.set(key, await requestJSON(`/generated/details/${key}.json`))
        if (version !== drawVersion || mode !== 'routes') return
        const detail = details.get(key)[id]
        const next = pathScene(index, detail?.path ?? [])
        mount(next, reset)
        const target = next.nodes.get(id)
        if (reset && target && cy.zoom() < 0.55)
          center(target.x, target.y - 220, 0.65)
        el('graph-counts').textContent = detail?.path?.length
          ? `One minimum-depth path · ${detail.path.length} steps${next.hiddenSteps ? ` · ${next.hiddenSteps} earlier steps omitted` : ''}${next.missingRoutes ? ` · ${next.missingRoutes} route records missing` : ''} · ${next.hiddenChoices} other choices in input-group details`
          : 'No resolved path. Use Single route to inspect candidate routes and unresolved requirements.'
        record(
          n?.name || id,
          'Top to bottom: potential acquisition. ALL groups are required; OR groups retain other choices. Depth is not time, quantities or a production budget.',
          detail?.pathRoutes ?? detail?.coverage,
        )
      } catch (error) {
        if (version !== drawVersion || mode !== 'routes') return
        mount(pathScene(index, []), reset)
        el('graph-counts').textContent = `Path unavailable: ${String(error)}`
      }
      return
    }
    const n = index.byId.get(itemId)
    el('graph-item-title').textContent = n?.name || 'Choose an item'
    const next = routeScene(index, entry)
    mount(next, reset)
    el('graph-counts').textContent = entry
      ? `${entry.route.id}${entry.route.scenario ? ' · authored scenario' : ''}${next.hiddenChoices ? ` · ${next.hiddenChoices} alternatives in input-group details` : ''}${next.hiddenOutputs ? ` · ${next.hiddenOutputs} more outputs in source record` : ''}`
      : 'No modeled route in this direction. This is not proof of unobtainability.'
    record(
      n?.name || 'Item routes',
      'Select an input to trace it; Item details retains full paths, quantities and sources.',
      entry?.route,
    )
    showRecipe(entry?.route)
  }
  function build(reset = true) {
    if (!index) return
    ++drawVersion
    limit = 100
    const cap = Number(select('graph-limit').value),
      mod = select('graph-mod').value,
      status = select('graph-status').value
    el('graph-mod-control').hidden = mode !== 'systems'
    el('graph-status-control').hidden = mode !== 'coverage'
    el('graph-limit-control').hidden = ![
      'systems',
      'coverage',
      'processing',
    ].includes(mode)
    el('graph-route-controls').hidden = mode !== 'routes'
    const questions: Record<string, string> = {
      systems:
        'Which mods supply inputs to this system? Arrows summarize possible cross-mod inputs → outputs; numbers count contributing routes, not mandatory dependencies.',
      processing:
        'What can this machine process? Inputs and outputs summarize separate possible routes, not one combined recipe. Select a connection for its routes; power, heat and plumbing remain separate requirements.',
      routes:
        'How is this item acquired or used? Routes run top to bottom. Dashed inputs are OR choices; ALL input groups are required. A minimum-depth path expands one possible chain, not every alternative.',
      coverage:
        'Where are the mapping gaps? Counts describe this atlas, not confirmed gameplay failures. Select a namespace to review its items.',
    }
    el('graph-question').textContent = questions[mode]
    record('Selection', 'Select a node or connection for its records.')
    if (mode === 'systems') {
      const next = systemsScene(index, mod, cap)
      mount(next, reset)
      matches = index.items.filter((n: any) => n.mod === mod)
      el('graph-counts').textContent =
        `${next.shownNeighbors} / ${next.totalNeighbors} connected mods · ${new Set(index.items.map((n: any) => n.mod)).size} item namespaces available · all ${index.routes.length.toLocaleString()} modeled routes considered`
    } else if (mode === 'coverage') {
      const next = coverageScene(index, status, cap)
      mount(next, reset)
      matches = index.items.filter((n: any) => n.status === status)
      el('graph-counts').textContent =
        `${matches.length.toLocaleString()} ${status} items · ${next.shownNeighbors} / ${next.totalNeighbors} namespaces shown`
    } else if (mode === 'processing') {
      const next = processingScene(index, machineId, Math.ceil(cap / 2))
      mount(next, reset)
      matches = [...index.machines].map((id) => index.byId.get(id))
      el('graph-counts').textContent =
        `${index.byId.get(machineId)?.name || 'No modeled machines'} · ${next.entries.length} routes · ${next.shownInputs}/${next.inputCount} input items · ${next.shownOutputs}/${next.outputCount} output items shown`
      record(
        index.byId.get(machineId)?.name || 'Processing',
        'Machine requirements come from progression.yml. Connections retain their contributing route records.',
      )
      showEntries(next.entries)
    } else {
      matches = index.items
      const entries =
        (select('graph-relation').value === 'uses'
          ? index.byInput
          : index.byOutput
        ).get(itemId) || []
      if (!entries.some((e: any) => e.index === entry?.index))
        entry = entries[0]
      select('graph-recipe').replaceChildren(
        ...entries.map(
          (e: any, i: number) =>
            new Option(
              `${i + 1}/${entries.length} · ${e.route.scenario ? 'SCENARIO · ' : ''}${e.route.kind}: ${e.route.id}`,
              String(e.index),
            ),
        ),
      )
      select('graph-recipe').disabled = !entries.length
      el<HTMLButtonElement>('graph-inspect').disabled = !index.byId.has(itemId)
      if (entry) select('graph-recipe').value = String(entry.index)
      drawRoute(reset)
    }
    el('graph-list-title').textContent =
      mode === 'processing'
        ? 'Machines'
        : mode === 'routes'
          ? 'All items'
          : 'Items in this view'
    results()
  }
  function switchMode(next: string, rebuild = true) {
    cameras.set(mode, { zoom: cy.zoom(), pan: { ...cy.pan() } })
    mode = next
    document
      .querySelectorAll<HTMLElement>('[data-graph]')
      .forEach((b) =>
        b.setAttribute('aria-pressed', String(b.dataset.graph === mode)),
      )
    if (rebuild) {
      build()
      const camera = cameras.get(mode)
      if (camera) {
        cy.viewport(camera)
        queue()
      }
    }
  }
  document
    .querySelectorAll<HTMLElement>('[data-graph]')
    .forEach((b) =>
      b.addEventListener('click', () => switchMode(b.dataset.graph!)),
    )
  for (const id of [
    'graph-mod',
    'graph-status',
    'graph-limit',
    'graph-relation',
    'graph-route-view',
  ])
    el(id).addEventListener('change', () => build())
  el('graph-recipe').addEventListener('change', () => {
    entry = {
      index: Number(select('graph-recipe').value),
      route: index.routes[Number(select('graph-recipe').value)],
    }
    drawRoute()
  })
  el('graph-search').addEventListener('input', () => {
    limit = 100
    results()
  })
  el('graph-search').addEventListener('keydown', (e) => {
    if (e.key === 'Enter')
      el<HTMLButtonElement>('graph-results')
        .querySelector<HTMLButtonElement>('button')
        ?.click()
  })
  el('graph-more').addEventListener('click', () => {
    limit += 100
    results()
  })
  el('graph-inspect').addEventListener('click', () => inspect(itemId))
  el('graph-fit').addEventListener('click', fit)
  el('graph-reset').addEventListener('click', () => {
    el<HTMLInputElement>('graph-search').value = ''
    build()
  })
  el('graph-in').addEventListener('click', () => zoom(1.5))
  el('graph-out').addEventListener('click', () => zoom(1 / 1.5))
  const resize = new ResizeObserver(() => {
    cy.resize()
    queue()
  })
  resize.observe(canvas)
  async function load() {
    const [catalog, routes, authored, recipeData] = await Promise.all([
      requestJSON('/generated/catalog.json'),
      requestJSON('/generated/routes.json'),
      requestJSON('/generated/authored.json'),
      requestJSON('/generated/recipes.json'),
    ])
    recipes = new Map(recipeData.map((recipe: any) => [recipe.id, recipe]))
    details.clear()
    const first = !index
    index = graphIndex(
      catalog.nodes,
      routes,
      authored.progression?.machines || {},
    )
    if (!index.machines.has(machineId))
      machineId = index.machines.has('create:mechanical_press')
        ? 'create:mechanical_press'
        : [...index.machines][0] || ''
    const mods = [
        ...new Set<string>(catalog.nodes.map((n: any) => n.mod)),
      ].sort(),
      previous = select('graph-mod').value
    select('graph-mod').replaceChildren(...mods.map((m) => new Option(m, m)))
    select('graph-mod').value = mods.includes(previous)
      ? previous
      : mods.includes('create')
        ? 'create'
        : mods[0] || ''
    if (!index.byId.has(itemId))
      itemId = index.byId.has('reliable_gliders:glider')
        ? 'reliable_gliders:glider'
        : catalog.nodes[0]?.id || ''
    // Rebind route references after refresh; array indices may have changed.
    entry = entry
      ? routes
          .map((route: any, index: number) => ({ route, index }))
          .find(
            (e: any) =>
              e.route.id === entry.route.id &&
              e.route.kind === entry.route.kind,
          )
      : undefined
    build(first)
  }
  el('graph-reload').addEventListener(
    'click',
    () =>
      void load().catch((e) => {
        el('graph-counts').textContent = String(e)
      }),
  )
  window.addEventListener(
    'pagehide',
    () => {
      resize.disconnect()
      cy.destroy()
    },
    { once: true },
  )
  return {
    load,
    openItem,
    show() {
      cy.resize()
      queue()
    },
  }
}
