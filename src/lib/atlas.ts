import { detailBucket } from './graph.mjs'
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
const fetchJSON = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`${url}: ${response.status}`)
  return response.json()
}
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
const detailCache = new Map<string, RecordData>()
const viewport = el('viewport'),
  grid = el('grid'),
  tooltip = el('tooltip')
function notice(message: string) {
  el('notice').textContent = message
  el('notice').hidden = false
  setTimeout(() => {
    el('notice').hidden = true
  }, 10000)
}
async function loadCatalog() {
  const data = await fetchJSON('/generated/catalog.json')
  nodes = data.nodes
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
  render()
}
function render() {
  renderQueued = false
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
        `<button class="cell ${n.id === selected ? 'selected' : ''} ${n.hasNote ? 'has-note' : ''}" data-id="${escape(n.id)}" role="gridcell" aria-label="${escape(n.name)}; ${n.depth === null ? 'unresolved route' : `route depth ${n.depth}`}" style="left:${n.x * cw}px;top:${n.y * ch}px;width:${cw}px;height:${ch}px">${n.icon ? `<img src="${n.icon}" alt="" loading="lazy" style="width:${36 * scale}px;height:${36 * scale}px"/>` : '<span class="fallback">◇</span>'}<span class="caption" style="font-size:${10 * scale}px">${escape(n.name)}</span><span class="namespace" style="font-size:${8 * scale}px">${escape(n.mod)}</span>${n.depth === null || n.hasNote ? '<i class="indicator"></i>' : ''}</button>`,
    )
    .join('')
  el('position').textContent =
    `X ${Math.round(left / cw)} / Y ${Math.round(top / ch)}`
}
viewport.addEventListener('scroll', () => {
  tooltip.hidden = true
  if (!renderQueued) {
    renderQueued = true
    requestAnimationFrame(render)
  }
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
new ResizeObserver(() => render()).observe(viewport)
grid.addEventListener('click', (event) => {
  const cell = (event.target as HTMLElement).closest<HTMLElement>('[data-id]')
  if (cell) inspect(cell.dataset.id!)
})
grid.addEventListener('pointerover', (event) => {
  const cell = (event.target as HTMLElement).closest<HTMLElement>('[data-id]')
  if (!cell) return
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
  selected = ''
  render()
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    el('inspector').hidden = true
    tooltip.hidden = true
  }
  if (
    event.key === '/' &&
    !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)
  ) {
    event.preventDefault()
    el('search').focus()
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
function recipeHTML(recipe: RecordData) {
  return `<details class="record"><summary><b>${escape(recipe.type)}</b><br/><span class="id">${escape(recipe.id)}</span>${recipe.scenario ? ' <span class="badge">SCENARIO</span>' : ''}</summary><p>${(recipe.ingredients ?? []).map((group: string[]) => group.map((id) => `<button class="relation" data-inspect="${escape(id)}">${escape(id)}</button>`).join(' OR ')).join('<br/>AND ')}</p>${recipe.source?.length ? `<p class="sources">${sourceLinks(recipe.source)}</p>` : ''}${pretty(recipe.json ?? recipe)}</details>`
}
function relation(id: string) {
  const node = nodes.find((n) => n.id === id)
  return node
    ? `<button class="relation" data-inspect="${escape(id)}">${escape(node.name)} <small>${escape(id)}</small></button>`
    : `<code>${escape(id)}</code>`
}
function routeHTML(route: RecordData) {
  return `<details class="record"><summary>${escape(route.kind ?? route.title ?? 'Interaction')} · ${escape(route.id)}</summary><p>${route.inputs.map((g: string[]) => (g.length ? g.map(relation).join(' OR ') : '<b>Unsupported or empty ingredient</b>')).join('<br/>AND ')}</p><p>${escape(route.detail)}</p>${pretty(route)}</details>`
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
  let html = `<h3>${status}</h3>`
  if (detail.path?.length)
    html += `<p class="muted">One minimum-depth path. OR alternatives, quantities, probability and environmental conditions can change the practical route.</p><ol class="route-path">${detail.path.map((step: RecordData) => `<li>${relation(step.id)}${step.root ? ' · environment' : `<details><summary>${escape(step.route)}</summary><p>${step.inputs?.map(relation).join(' + ') ?? ''}</p>${pretty(detail.pathRoutes[step.route])}</details>`}</li>`).join('')}</ol>`
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
async function inspect(id: string) {
  const node = nodes.find((n) => n.id === id)
  if (!node) {
    notice(`No registered item: ${id}`)
    return
  }
  selected = id
  tooltip.hidden = true
  el('inspector').hidden = false
  el('detail').innerHTML = '<p class="muted">Loading item…</p>'
  render()
  try {
    const key = node.mod + '/' + detailBucket(id)
    if (!detailCache.has(key))
      detailCache.set(key, await fetchJSON(`/generated/details/${key}.json`))
    if (selected !== id) return
    const detail = detailCache.get(key)![id]
    el('detail').innerHTML =
      `${node.icon ? `<img class="detail-icon" src="${node.icon}" alt="${escape(node.name)} texture preview"/>` : ''}<h2>${escape(node.name)}</h2><div class="id">${escape(id)}</div><span class="badge">${node.depth === null ? 'UNRESOLVED' : `DEPTH ${node.depth}`}</span><span class="badge">${escape(detail.class.split('.').pop())}</span><p class="muted">Texture preview from game assets; custom and 3D inventory rendering may differ.</p>${detail.note ? `<div class="warning">${escape(detail.note.text)}<p>${sourceLinks(detail.note.sources)}</p></div>` : ''}${pathHTML(detail)}<h3>Acquisition · ${detail.acquisition.length} routes</h3>${detail.acquisition.map(routeHTML).join('')}<h3>Recipes · ${detail.recipes.length}</h3>${detail.recipes.length ? detail.recipes.map(recipeHTML).join('') : '<p class="muted">No producing recipe in RecipeManager. Other routes are listed above.</p>'}<h3>Used by · ${detail.uses.length} recipes</h3>${detail.uses.slice(0, 80).map(recipeHTML).join('')}${detail.uses.length > 80 ? '<p class="muted">First 80 shown here; search All active recipes for the complete set.</p>' : ''}<h3>Potential drops · ${detail.drops.length} tables</h3>${detail.drops.map((drop: RecordData) => `<details class="record"><summary>${escape(drop.id)}</summary><p class="muted">Full conditions and functions below. This is not an unconditional drop rate.</p>${pretty(drop.json)}</details>`).join('')}<h3>Tags & tool requirements</h3>${pretty({ tags: detail.tags, block: detail.block })}<h3>Interactions & implementation hooks</h3>${pretty({ transformations: detail.interactions, hooks: detail.hooks })}<h3>Native interaction documentation</h3>${Object.keys(detail.ponder).length ? pretty(detail.ponder) : '<p class="muted">No matching Ponder text indexed. Arbitrary Java interactions require source review.</p>'}<details class="record"><summary>Registry and asset provenance</summary>${pretty({ components: detail.components, stack: detail.stack, class: detail.class, icon: detail.icon })}</details><button id="edit-item-note">Edit item notes in workspace</button>`
    el('detail')
      .querySelectorAll<HTMLElement>('[data-inspect]')
      .forEach((button) =>
        button.addEventListener('click', () =>
          inspect(button.dataset.inspect!),
        ),
      )
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
async function showView(name: string) {
  document
    .querySelectorAll<HTMLElement>('.view')
    .forEach((view) => (view.hidden = view.id !== name + '-view'))
  document
    .querySelectorAll<HTMLElement>('[data-view]')
    .forEach((button) =>
      button.classList.toggle('active', button.dataset.view === name),
    )
  el('inspector').hidden = true
  tooltip.hidden = true
  try {
    if (name === 'world') await loadWorld()
    if (name === 'evidence') await loadEvidence()
    if (name === 'editor') await initEditor()
    if (name === 'map') render()
  } catch (error) {
    notice(String(error))
  }
}
document
  .querySelectorAll<HTMLElement>('[data-view]')
  .forEach((button) =>
    button.addEventListener('click', () => showView(button.dataset.view!)),
  )
let evidenceLimit = 100
async function loadEvidence(reset = true) {
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
  const matches = rows.filter(
    (row) => !query || JSON.stringify(row).toLowerCase().includes(query),
  )
  el('evidence-count').textContent = `${nf.format(matches.length)} records`
  el('evidence-list').innerHTML = matches
    .slice(0, evidenceLimit)
    .map(
      (row) =>
        `<article class="record"><h3>${escape(row.title ?? row.id ?? row.tag ?? row.path ?? 'Diagnostic')}</h3>${row.status ? `<p>${escape(row.status)} · ${row.downstream} consuming routes</p>` : ''}${row.evidence ? `<span class="badge">${escape(row.evidence)}</span>` : ''}${row.detail ? `<p>${escape(row.detail)}</p>` : ''}${row.sources ? `<p class="sources">${sourceLinks(row.sources)}</p>` : ''}<details><summary>Source data</summary>${pretty(row)}</details></article>`,
    )
    .join('')
  el('more-evidence').hidden = matches.length <= evidenceLimit
}
for (const id of ['evidence-domain', 'evidence-search'])
  el(id).addEventListener('input', () => loadEvidence())
el('more-evidence').addEventListener('click', () => {
  evidenceLimit += 100
  loadEvidence(false)
})
async function loadWorld() {
  if (!world) world = await fetchJSON('/generated/world.json')
  el('world-layout').hidden = !world
  if (!world) {
    el('world-summary').textContent = 'No world survey captured.'
    el('world-notes').textContent =
      'Run pnpm data:world, then pnpm data:compile. Terrain-derived acquisition routes are unavailable until a survey is captured.'
    return
  }
  const w = world!
  el('world-summary').innerHTML = [
    ['Regions', w.regionCount],
    ['Populated chunks', w.populatedChunks],
    ['Sampled chunks', w.sampledChunks],
    ['Read errors', w.errors.length],
  ]
    .map(
      ([label, value]) =>
        `<div class="stat"><strong>${nf.format(value)}</strong><small>${label}</small></div>`,
    )
    .join('')
  const oreSelect = el<HTMLSelectElement>('ore-map')
  if (oreSelect.options.length === 1)
    for (const ore of Object.keys(w.ores).sort())
      oreSelect.add(new Option(ore, ore))
  el('ore-table').innerHTML =
    '<table><thead><tr><th>Ore</th><th>Est. blocks/chunk</th></tr></thead><tbody>' +
    Object.entries(w.ores)
      .sort(
        ([, a], [, b]) =>
          (b as RecordData).estimatedPerChunk -
          (a as RecordData).estimatedPerChunk,
      )
      .map(
        ([id, value]) =>
          `<tr><td>${escape(id.replace('minecraft:', ''))}</td><td>${(value as RecordData).estimatedPerChunk.toFixed(4)}</td></tr>`,
      )
      .join('') +
    '</tbody></table><p class="muted">Area-weighted estimate including void chunks. Not ore per stone block or a guarantee on an individual island. No platinum observed in this pre-addition sample.</p>'
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
    values: Record<string, number> = {}
  for (const [id, levels] of Object.entries(world.byY))
    if (ore === 'land' || id === ore)
      for (const [y, n] of Object.entries(levels as Record<string, number>))
        values[y] = (values[y] ?? 0) + n / world.populatedChunks
  const maximum = Math.max(0.001, ...Object.values(values))
  el('ore-profile').innerHTML =
    `<svg viewBox="0 0 420 150" role="img" aria-label="Estimated ore blocks by Y level"><line x1="26" y1="120" x2="410" y2="120" stroke="#cbd5e5"/>${Object.entries(
      values,
    )
      .map(
        ([y, n]) =>
          `<rect x="${26 + Number(y) + 64}" y="${120 - (n / maximum) * 105}" width="1" height="${(n / maximum) * 105}" fill="#285de0"><title>Y ${y}: ${n.toFixed(5)} estimated blocks per chunk</title></rect>`,
      )
      .join(
        '',
      )}<text x="26" y="140" font-size="10" fill="#64718a">Y −64</text><text x="170" y="140" font-size="10" fill="#64718a">80</text><text x="375" y="140" font-size="10" fill="#64718a">319</text></svg><p class="muted">${ore === 'land' ? 'All observed ores' : escape(ore)} · peak ${maximum.toFixed(4)} estimated blocks/chunk at one Y level. Hover bars for values.</p>`
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
    const text = el<HTMLTextAreaElement>('domain-editor').value,
      response = await fetch(`/__atlas/domain/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, revision: editorFiles[name].revision }),
      }),
      result = await response.json()
    if (!response.ok) throw new Error(result.error)
    editorFiles[name] = { text, revision: result.revision }
    domainData = null
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
    const response = await fetch('/__atlas/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
      result = await response.json()
    if (!response.ok) throw new Error(result.error)
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
    const response = await fetch('/__atlas/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
      result = await response.json()
    if (!response.ok) throw new Error(result.error)
    domainData = null
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
  setInterval(freshness, 30000)
}
