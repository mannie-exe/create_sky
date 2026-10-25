import { recipeMounts } from './recipe-mount'
import { requestJSON as fetchJSON } from './http'
import { scrollNavigation } from './minimap'
import '../styles/recipes.css'
import { recipePresentation, safeIcon } from './recipe-view.mjs'
import { detailBucket } from './graph.mjs'
import { clearRouteData } from './route-data'
import { renderStructureSurvey } from './structures'
import { renderIslandSurvey } from './islands'
import { oreProfile } from './world-profile.mjs'
const detailRecipes = recipeMounts(),
  evidenceRecipes = recipeMounts()
type Node = {
  id: string
  name: string
  mod: string
  kind: string
  icon: string | null
  depth: number | null
  complexity: number
  x: number
  y: number
  recipeCount: number
  usesCount: number
  hasNote: boolean
  status: string
  routeCount: number
}
type RecordData = Record<string, any>
const el = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T
const escape = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  )
const pretty = (value: unknown) =>
  `<pre>${escape(JSON.stringify(value, null, 2))}</pre>`
const nf = new Intl.NumberFormat('en-US')
let nodes: Node[] = [],
  filtered: Node[] = [],
  meta: RecordData = {},
  domainData: RecordData | null = null,
  world: RecordData | null = null
let scale = 1,
  selected = '',
  renderQueued = false,
  editorFiles: RecordData = {},
  domainReady = false
let itemCatalog = new Map<string, Node>()
let inlineRoute: { destroy(): void } | undefined
const inspectorHistory: string[] = []
const detailCache = new Map<string, RecordData>()
const viewport = el('viewport'),
  grid = el('grid'),
  tooltip = el('tooltip')
const mapNavigation = scrollNavigation(
  viewport,
  el<HTMLCanvasElement>('map-minimap'),
)
function notice(message: string) {
  el('notice').textContent = message
  el('notice').hidden = false
  setTimeout(() => {
    el('notice').hidden = true
  }, 10000)
}
async function loadCatalog() {
  clearRouteData()
  const data = await fetchJSON('/generated/catalog.json')
  nodes = data.nodes
  itemCatalog = new Map(nodes.map((n) => [n.id, n]))
  meta = data.meta
  el('snapshot').textContent =
    `MC ${meta.minecraft} · ${String(meta.capturedAt).slice(0, 10)}\n${String(meta.lockSha256).slice(0, 12)}`
  const select = el<HTMLSelectElement>('mod-filter'),
    previous = select.value
  select.innerHTML =
    '<option value="">All mods</option>' +
    [...new Set(nodes.map((n) => n.mod))]
      .sort()
      .map((mod) => `<option>${escape(mod)}</option>`)
      .join('')
  select.value = previous
  el('coverage-summary').innerHTML = [
    'mapped',
    'blocked',
    'unmapped',
    'excluded',
    'unified',
  ]
    .map(
      (key) =>
        `<button class="subtle" data-coverage="${key}">${nf.format(meta.counts[key] ?? 0)} ${key === 'unmapped' ? 'no adapter' : key === 'excluded' ? 'internal / creative' : key}</button>`,
    )
    .join('')
  el('coverage-summary')
    .querySelectorAll<HTMLElement>('[data-coverage]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        el<HTMLSelectElement>('route-filter').value =
          button.dataset.coverage === 'mapped'
            ? 'known'
            : button.dataset.coverage!
        filter()
      }),
    )
  filter()
}
function filter() {
  const query = el<HTMLInputElement>('search').value.toLowerCase(),
    mod = el<HTMLSelectElement>('mod-filter').value,
    route = el<HTMLSelectElement>('route-filter').value
  filtered = nodes.filter(
    (n) =>
      (!query || `${n.id} ${n.name}`.toLowerCase().includes(query)) &&
      (!mod || n.mod === mod) &&
      (!route ||
        (route === 'known' && n.depth !== null) ||
        (route === 'unknown' && n.depth === null) ||
        (route === 'notes' && n.hasNote) ||
        route === n.status),
  )
  el('counts').textContent =
    `${nf.format(filtered.length)} / ${nf.format(nodes.length)} items · ${nf.format(meta.counts?.recipes ?? 0)} runtime recipes`
  grid.style.width = `${(Math.max(0, ...filtered.map((n) => n.x)) + 1) * 108 * scale}px`
  grid.style.height = `${(Math.max(0, ...filtered.map((n) => n.y)) + 1) * 100 * scale}px`
  grid.style.backgroundSize = `${108 * scale}px ${100 * scale}px`
  if (query || mod || route) {
    const first = filtered[0]
    if (first) {
      viewport.scrollLeft = Math.max(0, first.x * 108 * scale - 25)
      viewport.scrollTop = Math.max(0, first.y * 100 * scale - 25)
    }
  }
  mapNavigation.setScene(
    { x1: 0, y1: 0, x2: grid.offsetWidth, y2: grid.offsetHeight },
    filtered.map((n) => ({
      x: (n.x + 0.5) * 108 * scale,
      y: (n.y + 0.5) * 100 * scale,
      color: n.depth === null ? '#b18645' : n.hasNote ? '#6e9c74' : '#91a8c7',
    })),
  )
  render()
}
function render() {
  renderQueued = false
  mapNavigation.draw()
  const cw = 108 * scale,
    ch = 100 * scale,
    left = viewport.scrollLeft,
    top = viewport.scrollTop
  const visible = filtered.filter(
    (n) =>
      n.x * cw > left - cw &&
      n.x * cw < left + viewport.clientWidth + cw &&
      n.y * ch > top - ch &&
      n.y * ch < top + viewport.clientHeight + ch,
  )
  grid.innerHTML = visible
    .map(
      (n) =>
        `<button class="cell ${n.id === selected ? 'selected' : ''} ${n.hasNote ? 'has-note' : ''}" data-id="${escape(n.id)}" role="gridcell" aria-label="${escape(n.name)}; ${n.depth === null ? 'unresolved route' : `route depth ${n.depth}`}" style="left:${n.x * cw}px;top:${n.y * ch}px;width:${cw}px;height:${ch}px">${safeIcon(n.icon) ? `<img src="${n.icon}" alt="" loading="lazy" style="width:${36 * scale}px;height:${36 * scale}px"/>` : '<span class="fallback">◇</span>'}<span class="caption" style="font-size:${10 * scale}px">${escape(n.name)}</span><span class="namespace" style="font-size:${8 * scale}px">${escape(n.mod)}</span>${n.depth === null || n.hasNote ? '<i class="indicator"></i>' : ''}</button>`,
    )
    .join('')
  el('position').textContent =
    `X ${Math.round(left / cw)} / Y ${Math.round(top / ch)}`
}
function queueRender() {
  if (!renderQueued) {
    renderQueued = true
    requestAnimationFrame(render)
  }
}
viewport.addEventListener('scroll', () => {
  tooltip.hidden = true
  queueRender()
})
viewport.addEventListener(
  'wheel',
  (event) => {
    if (event.shiftKey && event.deltaY) {
      event.preventDefault()
      viewport.scrollLeft += event.deltaY
    }
  },
  { passive: false },
)
new ResizeObserver(queueRender).observe(viewport)
const viewTabs = document.querySelector<HTMLElement>('.view-tabs')!
function positionInspector() {
  el('inspector').style.setProperty(
    '--inspector-top',
    `${Math.max(0, viewTabs.getBoundingClientRect().bottom)}px`,
  )
}
const navigationSize = new ResizeObserver(positionInspector)
navigationSize.observe(viewTabs)
navigationSize.observe(document.querySelector('.topbar')!)
const jobStatus = document.getElementById('job-status')
if (jobStatus) navigationSize.observe(jobStatus)
window.addEventListener('scroll', positionInspector, { passive: true })
positionInspector()
grid.addEventListener('click', (event) => {
  const cell = (event.target as HTMLElement).closest<HTMLElement>('[data-id]')
  if (cell) inspect(cell.dataset.id!)
})
grid.addEventListener('pointerover', (event) => {
  const cell = (event.target as HTMLElement).closest<HTMLElement>('[data-id]')
  if (!cell || !el('inspector').hidden) return
  const node = nodes.find((n) => n.id === cell.dataset.id)
  if (!node) return
  tooltip.textContent = `${node.name}\n${node.id}\n${node.depth === null ? 'Unresolved crafting route' : `Optimistic route depth ${node.depth}`} · ${node.recipeCount} producing recipes · ${node.usesCount} uses\nClick for sources, conditions, drops and configuration.`
  const rect = cell.getBoundingClientRect()
  tooltip.style.left = `${Math.min(rect.right + 8, window.innerWidth - 365)}px`
  tooltip.style.top = `${Math.min(rect.top, window.innerHeight - 160)}px`
  tooltip.hidden = false
})
grid.addEventListener('pointerout', (event) => {
  if (!(event.relatedTarget as HTMLElement)?.closest?.('[data-id]'))
    tooltip.hidden = true
})
for (const id of ['search', 'mod-filter', 'route-filter'])
  el(id).addEventListener('input', filter)
el<HTMLInputElement>('zoom').addEventListener('input', (event) => {
  const old = scale
  scale = Number((event.target as HTMLInputElement).value)
  viewport.scrollLeft = (viewport.scrollLeft / old) * scale
  viewport.scrollTop = (viewport.scrollTop / old) * scale
  filter()
})
el('reset-map').addEventListener('click', () => {
  viewport.scrollTo(0, 0)
})
el('layout-help').addEventListener('click', () =>
  notice(
    'X advances through minimum modeled acquisition steps. Each stage occupies six columns; rows sort by ingredient-slot complexity and namespace, with a downward stage offset. Gaps preserve stable positions. Unresolved items occupy the final band. Routes retain conditions. Counts, working machinery and travel are not solved.',
  ),
)
el('close-inspector').addEventListener('click', () => {
  el('inspector').hidden = true
  inlineRoute?.destroy()
  inlineRoute = undefined
  selected = ''
  render()
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    el('inspector').hidden = true
    inlineRoute?.destroy()
    inlineRoute = undefined
    tooltip.hidden = true
  }
  if (
    event.key === '/' &&
    !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)
  ) {
    event.preventDefault()
    el(el('graph-view').hidden ? 'search' : 'graph-search').focus()
  }
})
function sourceLinks(sources: unknown[] = []) {
  return sources
    .map((source) =>
      typeof source === 'string' && /^https:\/\//.test(source)
        ? `<a href="${escape(source)}" target="_blank" rel="noopener noreferrer">${escape(source)}</a>`
        : escape(typeof source === 'string' ? source : JSON.stringify(source)),
    )
    .join('<br/>')
}
function recipeHTML(recipe: RecordData, open = false) {
  const view = recipePresentation(recipe)
  const type = view.type.split(':').at(-1).replaceAll('_', ' ')
  const output = view.derivedOutput
    ? 'Armor trim'
    : recipe.output && recipe.output !== 'minecraft:air'
      ? (itemCatalog.get(recipe.output)?.name ?? recipe.id)
      : recipe.id
  return `<details class="record recipe-record"${open ? ' open' : ''}><summary><span>${escape(output)}</span><span class="record-kind">${escape(type)}</span><small>${escape(recipe.id)}</small></summary><div data-recipe-host="${escape(recipe.id)}"></div></details>`
}
function relation(id: string) {
  const node = nodes.find((n) => n.id === id)
  return node
    ? `<button class="relation" data-inspect="${escape(id)}">${escape(node.name)} <small>${escape(id)}</small></button>`
    : `<code>${escape(id)}</code>`
}
function routeHTML(route: RecordData, open = false) {
  return `<details class="record acquisition-record"${open ? ' open' : ''}><summary>${escape(route.title ?? route.kind ?? 'Interaction')}<small>${escape(route.id)}</small></summary><p>${escape(route.detail)}</p>${route.inputs.length ? `<p>${route.inputs.map((g: string[]) => (g.length ? g.map(relation).join(' OR ') : '<b>Unsupported or empty ingredient</b>')).join('<br/>AND ')}</p>` : ''}<details><summary>Conditions and source</summary>${pretty(route)}</details></details>`
}
function pathHTML(detail: RecordData) {
  const c = detail.coverage
  const status =
    c.status === 'unmapped'
      ? 'No acquisition adapter'
      : c.status === 'excluded'
        ? 'Internal / creative'
        : c.status === 'blocked'
          ? 'Blocked dependencies'
          : 'Mapped potential route'
  if (c.status === 'unified')
    return `<h3>Unified variant</h3><p>New production uses ${relation(c.canonical)}. Existing items retain their tags and recipe compatibility.</p>`
  let html = `<div class="detail-section-heading"><h3>${status}</h3><button id="view-item-route">Open full graph</button></div>`
  if (detail.path?.length)
    html += `<p class="muted">Minimum modeled path. ALL input groups are required; OR choices are alternatives. Quantities, chance and travel remain untested.</p><div class="inline-route"></div>`
  else if (c.status === 'excluded')
    html +=
      '<p>Listed in acquisition.yml as an operator, creative or internal item. Not counted as a missing survival route.</p>'
  else if (c.missing?.length)
    html += `<p>${c.routeCount} candidate routes. These prerequisites remain unresolved:</p>${c.missing
      .slice(0, 12)
      .map(
        (r: RecordData) =>
          `<details class="record"><summary>${escape(r.route)} · ${r.missing.length} blocked groups</summary>${r.emptyInput ? '<p>One ingredient is empty or unsupported.</p>' : ''}${r.missing.map((g: string[]) => `<p>${g.map(relation).join(' OR ') || 'Empty ingredient'}</p>`).join('')}</details>`,
      )
      .join(
        '',
      )}${c.missing.length > 12 ? '<p>First 12 shown; full list in Evidence → Coverage gaps.</p>' : ''}`
  else
    html +=
      '<p>No supported producing recipe or acquisition route. This is a map gap, not proof that the item is unobtainable.</p>'
  return html
}
async function inspect(id: string, back = false) {
  const node = nodes.find((n) => n.id === id)
  if (!node) {
    notice(`No registered item: ${id}`)
    return
  }
  if (!back && selected && selected !== id) {
    inspectorHistory.push(selected)
    if (inspectorHistory.length > 30) inspectorHistory.shift()
  }
  inlineRoute?.destroy()
  inlineRoute = undefined
  selected = id
  tooltip.hidden = true
  el('inspector').hidden = false
  detailRecipes.clear()
  el('detail').innerHTML = '<p class="muted">Loading item…</p>'
  render()
  try {
    const key = node.mod + '/' + detailBucket(id)
    if (!detailCache.has(key))
      detailCache.set(key, await fetchJSON(`/generated/details/${key}.json`))
    if (selected !== id) return
    const detail = detailCache.get(key)![id]
    const section = (key: string, label: string, body: string) =>
      `<section data-detail-panel="${key}"${key === 'acquisition' ? '' : ' hidden'} aria-label="${label}">${body}</section>`
    const methods = `<div class="item-methods">
      <h3>Producing recipes · ${detail.recipes.length}</h3>
      ${detail.recipes.length ? detail.recipes.map((r: RecordData, i: number) => recipeHTML(r, i === 0)).join('') : '<p class="muted">No producing recipe is mapped. Other acquisition routes are listed below.</p>'}
      <h3>Other acquisition · ${detail.acquisition.length}</h3>
      ${detail.acquisition.length ? detail.acquisition.map((r: RecordData, i: number) => routeHTML(r, !detail.recipes.length && i === 0)).join('') : '<p class="muted">No other acquisition route is mapped.</p>'}
    </div>`
    const uses = `<h3>Used by · ${detail.uses.length} recipes</h3>
      ${detail.uses
        .slice(0, 80)
        .map((r: RecordData) => recipeHTML(r))
        .join('')}
      ${detail.uses.length > 80 ? '<p class="muted">First 80 shown; Evidence lists all active recipes.</p>' : ''}`
    const evidence = `<h3>Potential drops · ${detail.drops.length} tables</h3>
      ${detail.drops.map((drop: RecordData) => `<details class="record"><summary>${escape(drop.id)}</summary><p class="muted">Conditions and functions determine actual drops.</p>${pretty(drop.json)}</details>`).join('')}
      <details class="record"><summary>Tags & tool requirements</summary>${pretty({ tags: detail.tags, block: detail.block })}</details>
      <details class="record"><summary>Interactions & implementation hooks</summary>${pretty({ transformations: detail.interactions, hooks: detail.hooks })}</details>
      <details class="record"><summary>Native interaction documentation</summary>${Object.keys(detail.ponder).length ? pretty(detail.ponder) : '<p>No matching Ponder text indexed.</p>'}</details>
      <details class="record"><summary>Registry and asset provenance</summary><p class="muted">Extracted icons can differ from custom in-game rendering.</p>${pretty({ components: detail.components, stack: detail.stack, class: detail.class, icon: detail.icon })}</details>
      <button id="edit-item-note">Edit item notes in workspace</button>`
    el('detail').innerHTML = `
      ${inspectorHistory.length ? '<button id="item-back">← Back</button>' : ''}
      <header class="item-heading">
        ${safeIcon(node.icon) ? `<img class="detail-icon" src="${node.icon}" alt=""/>` : ''}
        <div><h2>${escape(node.name)}</h2><div class="id">${escape(id)}</div><span class="badge">${node.depth === null ? 'UNRESOLVED' : `DEPTH ${node.depth}`}</span></div>
      </header>
      ${detail.note ? `<details class="item-notes"><summary>Pack notes</summary><div class="warning">${escape(detail.note.text)}<p>${sourceLinks(detail.note.sources)}</p></div></details>` : ''}
      <nav class="detail-tabs" aria-label="Item information">
        <button data-detail-tab="acquisition" aria-pressed="true">Acquisition</button>
        <button data-detail-tab="uses" aria-pressed="false">Uses · ${detail.uses.length}</button>
        <button data-detail-tab="evidence" aria-pressed="false">Evidence</button>
      </nav>
      ${section('acquisition', 'Acquisition', `<div class="item-acquisition">${methods}<section class="item-route" aria-label="Potential route">${pathHTML(detail)}</section></div>`)}
      ${section('uses', 'Uses', uses)}
      ${section('evidence', 'Evidence', evidence)}`
    el('inspector').scrollTop = 0
    el('detail')
      .querySelectorAll<HTMLElement>('[data-detail-tab]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          el('detail')
            .querySelectorAll<HTMLElement>('[data-detail-tab]')
            .forEach((b) =>
              b.setAttribute('aria-pressed', String(b === button)),
            )
          el('detail')
            .querySelectorAll<HTMLElement>('[data-detail-panel]')
            .forEach(
              (panel) =>
                (panel.hidden =
                  panel.dataset.detailPanel !== button.dataset.detailTab),
            )
        }),
      )
    document.getElementById('item-back')?.addEventListener('click', () => {
      const previous = inspectorHistory.pop()
      if (previous) void inspect(previous, true)
    })
    detailRecipes.mount(
      el('detail'),
      [...detail.recipes, ...detail.uses],
      itemCatalog,
      inspect,
    )
    const routeHost = el('detail').querySelector<HTMLElement>('.inline-route')
    if (routeHost) {
      const { routePreview } = await import('./route-preview')
      if (selected !== id || !routeHost.isConnected || el('inspector').hidden)
        return
      inlineRoute = routePreview(routeHost, nodes, detail, inspect)
    }
    el('detail')
      .querySelectorAll<HTMLElement>('[data-inspect]')
      .forEach((button) =>
        button.addEventListener('click', () =>
          inspect(button.dataset.inspect!),
        ),
      )
    document
      .getElementById('view-item-route')
      ?.addEventListener('click', async () => {
        await showView('graph')
        graph?.openItem(id, true)
      })
    el('edit-item-note').addEventListener('click', () => {
      showView('editor')
      el<HTMLSelectElement>('edit-domain').value = 'items'
      loadEditor('items')
    })
  } catch (error) {
    el('detail').textContent = String(error)
  }
}
async function domains() {
  if (!domainData) domainData = await fetchJSON('/generated/domains.json')
  return domainData!
}
let graph: ReturnType<typeof import('./atlas-graph').createGraph> | undefined
let graphStale = true
async function showView(name: string) {
  document
    .querySelectorAll<HTMLElement>('.view')
    .forEach((view) => (view.hidden = view.id !== name + '-view'))
  document
    .querySelectorAll<HTMLButtonElement>('button[data-view]')
    .forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.view === name)),
    )
  el('inspector').hidden = true
  inlineRoute?.destroy()
  inlineRoute = undefined
  tooltip.hidden = true
  try {
    if (name === 'graph') {
      graph ??= (await import('./atlas-graph')).createGraph(inspect)
      if (graphStale) {
        await graph.load()
        graphStale = false
      }
    }
    if (name === 'world') await loadWorld()
    if (name === 'evidence') await loadEvidence()
    if (name === 'editor') await initEditor()
    if (name === 'map') render()
  } catch (error) {
    notice(String(error))
  }
}
document
  .querySelectorAll<HTMLButtonElement>('button[data-view]')
  .forEach((button) => {
    button.addEventListener('click', () => showView(button.dataset.view!))
    button.disabled = false
  })
let evidenceLimit = 100,
  evidenceRequest = 0
async function loadEvidence(reset = true) {
  const request = ++evidenceRequest
  if (reset) evidenceLimit = 100
  const data = await domains(),
    kind = el<HTMLSelectElement>('evidence-domain').value,
    query = el<HTMLInputElement>('evidence-search').value.toLowerCase()
  let rows: RecordData[] = []
  if (['recipes', 'loot'].includes(kind)) {
    if (!data[kind]) data[kind] = await fetchJSON(`/generated/${kind}.json`)
    rows = Array.isArray(data[kind])
      ? data[kind]
      : Object.entries(data[kind]).map(([id, json]) => ({ id, json }))
  } else if (kind === 'advancements')
    rows = Object.entries(data.advancements).map(([id, json]) => ({ id, json }))
  else if (kind === 'interactions')
    rows = [...data.authored.interactions.records, ...data.interactions]
  else if (kind === 'acquisition') rows = data.acquisition
  else if (data.authored[kind]?.records) rows = data.authored[kind].records
  else
    rows = (data[kind] ?? []).map((row: unknown) =>
      typeof row === 'string' ? { detail: row } : row,
    )
  if (request !== evidenceRequest) return
  const matches = rows.filter(
    (row) => !query || JSON.stringify(row).toLowerCase().includes(query),
  )
  el('evidence-count').textContent = `${nf.format(matches.length)} records`
  evidenceRecipes.clear()
  el('evidence-list').innerHTML = matches
    .slice(0, evidenceLimit)
    .map((row) =>
      kind === 'recipes'
        ? recipeHTML(row)
        : `<article class="record"><h3>${escape(row.title ?? row.id ?? row.tag ?? row.path ?? 'Diagnostic')}</h3>${row.status ? `<p>${escape(row.status)} · ${row.downstream} consuming routes</p>` : ''}${row.evidence ? `<span class="badge">${escape(row.evidence)}</span>` : ''}${row.detail ? `<p>${escape(row.detail)}</p>` : ''}${row.sources ? `<p class="sources">${sourceLinks(row.sources)}</p>` : ''}<details><summary>Source data</summary>${pretty(row)}</details></article>`,
    )
    .join('')
  if (kind === 'recipes')
    evidenceRecipes.mount(
      el('evidence-list'),
      matches.slice(0, evidenceLimit),
      itemCatalog,
      inspect,
    )
  el('more-evidence').hidden = matches.length <= evidenceLimit
}
el('evidence-list').addEventListener('click', (event) => {
  const target = (event.target as Element).closest<HTMLElement>(
    '[data-inspect]',
  )
  if (target) void inspect(target.dataset.inspect!)
})
for (const id of ['evidence-domain', 'evidence-search'])
  el(id).addEventListener('input', () => loadEvidence())
el('more-evidence').addEventListener('click', () => {
  evidenceLimit += 100
  loadEvidence(false)
})
async function loadWorld() {
  await renderStructureSurvey()
  await renderIslandSurvey()
  if (!world) world = await fetchJSON('/generated/world.json')
  el('world-layout').hidden = !world
  if (!world) {
    el('world-provenance').textContent = 'No saved-terrain evidence available.'
    el('world-summary').textContent = 'No world survey captured.'
    el('world-notes').textContent =
      'Run pnpm data:world, then pnpm data:compile. Terrain-derived acquisition routes are unavailable until a survey is captured.'
    return
  }
  const w = world!
  const captured = w.completedAt
    ? `Captured ${new Date(w.completedAt).toLocaleDateString('en', { dateStyle: 'medium' })}.`
    : 'Capture date not recorded.'
  el('world-provenance').textContent = w.provenance
    ? `${captured} Seed ${w.provenance.seed ?? 'not recorded'} · ${w.provenance.dimensionType ?? 'unknown dimension'}. ${w.sourceChangedDuringScan ? 'Source metadata changed during this scan.' : 'Recorded source identity; this is not a live view.'}`
    : `${captured} Legacy survey: world identity was not recorded. Do not use it to judge the current world.`
  el('world-summary').innerHTML = [
    ['Regions', w.regionCount],
    ['Populated chunks', w.populatedChunks],
    ['Sampled chunks', w.sampledChunks],
    [
      'Sample coverage',
      `${((100 * w.sampledChunks) / Math.max(1, w.populatedChunks)).toFixed(2)}%`,
    ],
    ['Read errors', w.errors.length],
  ]
    .map(
      ([label, value]) =>
        `<div class="stat"><strong>${typeof value === 'number' ? nf.format(value) : escape(value)}</strong><small>${label}</small></div>`,
    )
    .join('')
  const oreSelect = el<HTMLSelectElement>('ore-map')
  if (oreSelect.options.length === 1)
    for (const ore of Object.keys(w.ores).sort())
      oreSelect.add(new Option(ore, ore))
  el('ore-table').innerHTML =
    '<div class="table-scroll"><table><thead><tr><th>Ore</th><th>Est. blocks/chunk</th><th>Approx. 95% interval</th></tr></thead><tbody>' +
    Object.entries(w.ores)
      .sort(
        ([, a], [, b]) =>
          (b as RecordData).estimatedPerChunk -
          (a as RecordData).estimatedPerChunk,
      )
      .map(([id, value]) => {
        const v = value as RecordData
        return `<tr><td><button class="ore-choice" data-ore="${escape(id)}" title="${escape(id)}">${escape(itemCatalog.get(id)?.name ?? id)}</button></td><td>${v.estimatedPerChunk.toFixed(4)}</td><td>${v.approx95PerChunk?.map((n: number) => n.toFixed(4)).join(' to ') ?? 'Not captured'}</td></tr>`
      })
      .join('') +
    '</tbody></table></div><p class="muted">Area-weighted estimates include void chunks. Intervals reflect sampling variance; sparse samples can miss rare ore entirely. These are not ore per stone block or a guarantee for one island.</p>'
  el('ore-table')
    .querySelectorAll<HTMLButtonElement>('[data-ore]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        oreSelect.value = button.dataset.ore!
        oreSelect.dispatchEvent(new Event('change'))
        el('ore-profile').scrollIntoView({ block: 'nearest' })
      }),
    )
  el('world-notes').innerHTML =
    `<p class="muted">${escape(w.method)}. ${w.fullChunksSampled} sampled chunks have full generation status. ${w.changedRegions.length} regions changed during the read.</p><p class="muted">Snapshot ${escape(w.completedAt)} · Bounds ${escape(JSON.stringify(w.boundsBlocks))}</p>` +
    w.limitations.map((text: string) => `<p>${escape(text)}</p>`).join('') +
    (await domains()).authored.worldgen.records
      .map(
        (row: RecordData) =>
          `<article class="record"><h3>${escape(row.title)}</h3><p>${escape(row.detail)}</p></article>`,
      )
      .join('')
  drawWorld()
  drawProfile()
  travel()
}
let worldGeometry = { minX: 0, minZ: 0, cell: 1, offsetX: 0, offsetY: 0 }
function drawWorld() {
  if (!world) return
  const canvas = el<HTMLCanvasElement>('world-canvas'),
    ctx = canvas.getContext('2d')!,
    regions = world.regions,
    metric = el<HTMLSelectElement>('ore-map').value
  const minX = Math.min(...regions.map((r: RecordData) => r.x)),
    maxX = Math.max(...regions.map((r: RecordData) => r.x)),
    minZ = Math.min(...regions.map((r: RecordData) => r.z)),
    maxZ = Math.max(...regions.map((r: RecordData) => r.z))
  const cell = Math.min(
    (canvas.width - 70) / (maxX - minX + 1),
    (canvas.height - 50) / (maxZ - minZ + 1),
  )
  worldGeometry = { minX, minZ, cell, offsetX: 35, offsetY: 25 }
  ctx.fillStyle = '#f7f9fd'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (const region of regions) {
    const value =
      metric === 'land'
        ? (region.landFraction ?? 0)
        : region.samples.reduce(
            (a: number, s: RecordData) => a + (s.ores[metric] ?? 0),
            0,
          ) / Math.max(1, region.samples.length)
    const intensity =
      metric === 'land' ? Math.sqrt(value) : Math.min(1, Math.log1p(value) / 4)
    ctx.fillStyle = region.samples.length
      ? `hsl(219 ${15 + intensity * 55}% ${95 - intensity * 58}%)`
      : '#e3e5e9'
    ctx.fillRect(
      35 + (region.x - minX) * cell,
      25 + (region.z - minZ) * cell,
      Math.max(1, cell - 0.6),
      Math.max(1, cell - 0.6),
    )
  }
  ctx.fillStyle = '#17233b'
  ctx.font = '11px monospace'
  ctx.fillText('X → / Z ↓', 35, 15)
  ctx.fillStyle = '#dd7a42'
  ctx.fillRect(35 - minX * cell, 25 - minZ * cell, cell, cell)
}
function drawProfile() {
  if (!world) return
  const ore = el<HTMLSelectElement>('ore-map').value,
    profile = oreProfile(world, ore)
  el('ore-table')
    .querySelectorAll<HTMLButtonElement>('[data-ore]')
    .forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.ore === ore)),
    )
  if (!profile) {
    el('ore-profile').textContent = 'No sampled ore heights for this selection.'
    return
  }
  const { rows, min, max, peak, recordedBounds } = profile
  const span = Math.max(1, max - min + 1),
    width = 368 / span
  const x = (y: number) => 34 + ((y - min) / span) * 368
  el('ore-profile').innerHTML =
    `<svg viewBox="0 0 440 170" role="img" aria-label="Estimated ore blocks by Y level from ${min} to ${max}">
    <line x1="34" y1="128" x2="402" y2="128" stroke="var(--line)"/>
    ${rows.map(([y, n]: number[]) => `<rect x="${x(y)}" y="${128 - (n / peak) * 100}" width="${Math.max(0.4, width)}" height="${(n / peak) * 100}" fill="var(--accent)"><title>Y ${y}: ${n.toFixed(5)} estimated blocks per chunk</title></rect>`).join('')}
    ${[min, Math.round((min + max) / 2), max].map((y, i) => `<text x="${x(y)}" y="150" text-anchor="${['start', 'middle', 'end'][i]}" font-size="11" fill="var(--muted)">Y ${y}</text>`).join('')}
    </svg><p class="muted">${ore === 'land' ? 'All observed ores' : escape(ore)} · peak ${peak.toFixed(4)} estimated blocks/chunk at one Y level. ${recordedBounds ? 'Recorded dimension height.' : 'Observed height range; unsampled heights are unknown.'}</p>
    <details><summary>Values by Y level</summary><div class="profile-values table-scroll"><table><thead><tr><th>World Y</th><th>Est. blocks/chunk</th></tr></thead><tbody>${rows.map(([y, n]: number[]) => `<tr><td>${y}</td><td>${n.toFixed(5)}</td></tr>`).join('')}</tbody></table></div></details>`
}
el('ore-map').addEventListener('change', () => {
  drawWorld()
  drawProfile()
})
el('world-canvas').addEventListener('pointermove', (event) => {
  if (!world) return
  const canvas = event.currentTarget as HTMLCanvasElement,
    rect = canvas.getBoundingClientRect(),
    g = worldGeometry
  const x =
      Math.floor(
        (((event.clientX - rect.left) * canvas.width) / rect.width -
          g.offsetX) /
          g.cell,
      ) + g.minX,
    z =
      Math.floor(
        (((event.clientY - rect.top) * canvas.height) / rect.height -
          g.offsetY) /
          g.cell,
      ) + g.minZ
  const region = world.regions.find((r: RecordData) => r.x === x && r.z === z)
  el('world-hover').textContent = region
    ? `r.${x}.${z} · block origin ${x * 512}, ${z * 512} · ${region.chunks} populated chunks · ${region.samples.length} sampled · land columns ${((region.landFraction ?? 0) * 100).toFixed(1)}%`
    : 'Outside scanned regions'
})
function travel() {
  const distance = Number(el<HTMLInputElement>('distance').value),
    speed = Number(el<HTMLInputElement>('speed').value)
  el('travel-result').textContent =
    speed > 0 && distance >= 0
      ? `${(distance / speed / 60).toFixed(1)} minutes in motion · ${(distance / speed).toFixed(0)} seconds`
      : 'Enter a nonnegative distance and positive speed.'
}
for (const id of ['distance', 'speed']) el(id).addEventListener('input', travel)
async function initEditor() {
  if (domainReady) return
  if (!import.meta.env.DEV) {
    el('editor-status').textContent =
      'Static snapshot; edit with pnpm dev on the source machine.'
    for (const id of [
      'save-editor',
      'export-patch',
      'refresh-data',
      'reload-editor',
    ])
      el<HTMLButtonElement>(id).disabled = true
    return
  }
  try {
    const data = await fetchJSON('/__atlas/workspace')
    editorFiles = data.files
    el('edit-domain').innerHTML = Object.keys(editorFiles)
      .map((name) => `<option>${name}</option>`)
      .join('')
    domainReady = true
    loadEditor('items')
  } catch {
    el('editor-status').textContent =
      'Editing requires pnpm dev on this machine. Static previews are read-only.'
    el<HTMLButtonElement>('save-editor').disabled = true
    el<HTMLButtonElement>('export-patch').disabled = true
    el<HTMLButtonElement>('refresh-data').disabled = true
  }
}
function loadEditor(name: string) {
  if (!editorFiles[name]) return
  el<HTMLSelectElement>('edit-domain').value = name
  el<HTMLTextAreaElement>('domain-editor').value = editorFiles[name].text
  el('editor-status').textContent = `data/authored/${name}.yml`
}
el('edit-domain').addEventListener('change', (event) =>
  loadEditor((event.target as HTMLSelectElement).value),
)
el('reload-editor').addEventListener('click', async () => {
  const name = el<HTMLSelectElement>('edit-domain').value
  domainReady = false
  await initEditor()
  loadEditor(name)
})
el('save-editor').addEventListener('click', async () => {
  const name = el<HTMLSelectElement>('edit-domain').value,
    button = el<HTMLButtonElement>('save-editor')
  button.disabled = true
  el('editor-status').textContent = 'Validating and rebuilding…'
  try {
    const text = el<HTMLTextAreaElement>('domain-editor').value
    const result = await fetchJSON(`/__atlas/domain/${name}`, {
      text,
      revision: editorFiles[name].revision,
    })
    editorFiles[name] = { text, revision: result.revision }
    domainData = null
    graphStale = true
    detailCache.clear()
    await loadCatalog()
    el('editor-status').textContent =
      'Saved to disk; map rebuilt. Runtime evidence preserved.'
  } catch (error) {
    el('editor-status').textContent = String(error)
  } finally {
    button.disabled = false
  }
})
el('export-patch').addEventListener('click', async () => {
  try {
    const result = await fetchJSON('/__atlas/export', {})
    const link = document.createElement('a')
    link.href = result.url
    link.download = 'create-sky-atlas-patch.zip'
    link.click()
    notice(
      'Recipe scenario exported. Test it in a disposable instance before applying to a world.',
    )
  } catch (error) {
    notice(String(error))
  }
})
loadCatalog().catch((error) => {
  el('counts').textContent =
    'No generated snapshot. Run pnpm data:refresh against a configured local pack.'
  notice(String(error))
})

async function freshness() {
  try {
    const state = await fetchJSON('/__atlas/status')
    el('snapshot').title = state.stale
      ? 'Source files changed. Refresh implementation in Workspace.'
      : 'Runtime snapshot matches local source file fingerprint.'
    if (state.stale)
      el('snapshot').textContent = 'SOURCE CHANGED · REFRESH NEEDED'
  } catch {
    /* Static deployments have no local filesystem. */
  }
}
el('refresh-data').addEventListener('click', async () => {
  const button = el<HTMLButtonElement>('refresh-data')
  button.disabled = true
  el('editor-status').textContent =
    'Capturing isolated runtime; this can take a minute…'
  try {
    await fetchJSON('/__atlas/refresh', {})
    domainData = null
    graphStale = true
    detailCache.clear()
    await loadCatalog()
    await freshness()
    el('editor-status').textContent =
      'Implementation refreshed. World measurements retain their separate survey date.'
  } catch (error) {
    el('editor-status').textContent = String(error)
  } finally {
    button.disabled = false
  }
})
if (import.meta.env.DEV) {
  setTimeout(freshness, 1500)
  // Refresh is explicit; avoid launching fingerprint processes in the background.
}
