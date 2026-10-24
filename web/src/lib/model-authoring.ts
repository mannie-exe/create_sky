import { requestJSON } from './http'
import { ModelPreview, type Preview, type TextureSource } from './model-preview'

type Binding = { source: string; id: string }
type Plane = {
  axis: string
  center: number
  uv: number[]
  span: number[]
  texture?: Binding
}
type Edit = {
  element: number
  name: string
  from?: number[]
  to?: number[]
  faces: Record<string, { uv?: number[]; rotation?: number }>
}
type Recipe = {
  id: string
  label: string
  enabled: boolean
  output: string
  texture: Binding
} & (
  | { kind: 'extrusion'; depth: number; threshold: number; parts: Plane[] }
  | { kind: 'fitting'; model: Binding; edits: Edit[] }
)
type Document = { schema: number; recipes: Recipe[] }
type Workspace = { document: Document; revision: string; previews: Preview[] }

const element = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T
const input = (id: string) => element<HTMLInputElement>(id)
const select = (id: string) => element<HTMLSelectElement>(id)
const button = (id: string) => element<HTMLButtonElement>(id)
const status = element('models-status')
let workspace: Workspace,
  selected = '',
  dirty = false,
  running = false,
  version = 0
let timer: ReturnType<typeof setTimeout>, view: ModelPreview | undefined
const jsonDrafts = new Map<string, string>()
let textureSource: TextureSource | undefined,
  textureImage: HTMLImageElement | undefined
const textureCanvas = element<HTMLCanvasElement>('model-texture')

const request = (path: string, body?: object) =>
  requestJSON('/__atlas/models' + path, body)

function recipe() {
  return workspace.document.recipes.find((r) => r.id === selected)!
}
function preview() {
  return workspace.previews.find((p) => p.id === selected)!
}
function controls() {
  button('models-save').disabled = !dirty || running || jsonDrafts.size > 0
  button('models-generate').disabled =
    dirty || running || !workspace || jsonDrafts.size > 0
  button('models-reload').disabled = running
  for (const field of element('model-editor').querySelectorAll<
    HTMLInputElement | HTMLSelectElement
  >('input, select'))
    field.disabled = jsonDrafts.has(selected)
  button('model-reset-element').disabled = running || jsonDrafts.has(selected)
  button('model-apply-json').disabled = running
  button('model-discard-json').disabled = running || !jsonDrafts.has(selected)
  element('models-drafts').textContent = jsonDrafts.size
    ? `${jsonDrafts.size} unapplied JSON draft${jsonDrafts.size === 1 ? '' : 's'}`
    : ''
}
function changed() {
  dirty = true
  version++
  status.textContent = 'Unsaved changes; updating preview…'
  if (!jsonDrafts.has(selected))
    element<HTMLTextAreaElement>('model-json').value = JSON.stringify(
      recipe(),
      null,
      2,
    )
  controls()
  clearTimeout(timer)
  timer = setTimeout(updatePreview, 250)
}
function options(target: HTMLSelectElement, entries: [string, string][]) {
  const previous = target.value
  target.replaceChildren(
    ...entries.map(([value, text]) => new Option(text, value)),
  )
  if (entries.some(([value]) => value === previous)) target.value = previous
}
function vector(
  id: string,
  labels: string[],
  values: number[],
  update: (v: number[]) => void,
) {
  const root = element(id)
  root.replaceChildren(
    ...labels.map((text, i) => {
      const label = document.createElement('label'),
        field = document.createElement('input')
      label.append(document.createTextNode(text), field)
      field.type = 'number'
      field.step = '0.125'
      field.value = String(values[i])
      field.addEventListener('input', () => {
        if (!field.checkValidity() || !Number.isFinite(field.valueAsNumber))
          return
        values = [...values]
        values[i] = field.valueAsNumber
        update(values)
      })
      return label
    }),
  )
}
function list() {
  const query = input('model-search').value.toLowerCase()
  element('model-list').replaceChildren(
    ...workspace.document.recipes
      .filter((r) => (r.label + ' ' + r.id).toLowerCase().includes(query))
      .map((r) => {
        const item = document.createElement('button'),
          detail = document.createElement('small')
        item.textContent = r.label
        detail.textContent = `${r.kind} · ${r.enabled ? 'included' : 'not included'}`
        item.append(detail)
        item.setAttribute('aria-current', String(selected === r.id))
        item.addEventListener('click', () => {
          selected = r.id
          render()
        })
        return item
      }),
  )
}
function edit(): Edit {
  const r = recipe()
  if (r.kind !== 'fitting') throw new Error('Select a fitting recipe')
  const index = Number(select('model-element').value)
  let result = r.edits.find((e) => e.element === index)
  if (!result) {
    result = {
      element: index,
      name: preview().model.elements[index].name ?? '',
      faces: {},
    }
    r.edits.push(result)
  }
  result.faces ??= {}
  return result
}
function uv() {
  const r = recipe()
  if (r.kind === 'extrusion')
    return r.parts[Number(select('model-plane').value)].uv
  const index = Number(select('model-element').value),
    face = select('model-face').value
  return (
    r.edits.find((e) => e.element === index)?.faces?.[face]?.uv ??
    preview().model.elements[index].faces[face].uv
  )
}
function setUV(value: number[]) {
  const r = recipe()
  if (r.kind === 'extrusion')
    r.parts[Number(select('model-plane').value)].uv = value
  else {
    const e = edit(),
      face = select('model-face').value
    e.faces[face] = { ...e.faces[face], uv: value }
  }
  changed()
  drawTexture()
}
function drawTexture() {
  if (!textureImage || !textureSource) return
  const context = textureCanvas.getContext('2d')!
  context.clearRect(0, 0, 256, 256)
  context.imageSmoothingEnabled = false
  context.drawImage(
    textureImage,
    0,
    0,
    textureSource.width,
    textureSource.frameHeight,
    0,
    0,
    256,
    256,
  )
  const [u0, v0, u1, v1] = uv()
  context.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent')
    .trim()
  context.lineWidth = 2
  context.strokeRect(u0 * 16, v0 * 16, (u1 - u0) * 16, (v1 - v0) * 16)
}
async function showTexture() {
  const r = recipe(),
    p = preview()
  const binding =
    r.kind === 'extrusion'
      ? (r.parts[Number(select('model-plane').value)].texture ?? r.texture)
      : r.texture
  const source = p.textures[binding.id]
  const image = new Image()
  image.src = source.url
  await image.decode()
  if (selected !== r.id) return
  textureSource = source
  textureImage = image
  drawTexture()
}
function fields() {
  const r = recipe(),
    p = preview()
  element('extrusion-fields').hidden = r.kind !== 'extrusion'
  element('fitting-fields').hidden = r.kind !== 'fitting'
  if (r.kind === 'extrusion') {
    input('model-depth').value = String(r.depth)
    input('model-threshold').value = String(r.threshold)
    options(
      select('model-plane'),
      r.parts.map((_, i) => [String(i), `Plane ${i + 1}`]),
    )
    const part = r.parts[Number(select('model-plane').value)]
    select('model-axis').value = part.axis
    input('model-center').value = String(part.center)
    vector(
      'model-span',
      ['Start', 'Bottom', 'End', 'Top'],
      part.span,
      (value) => {
        part.span = value
        changed()
      },
    )
    view?.highlight(-1)
  } else {
    options(
      select('model-element'),
      p.model.elements.map((e, i) => [
        String(i),
        `${i + 1}: ${e.name ?? 'Element'}`,
      ]),
    )
    const index = Number(select('model-element').value),
      model = p.model.elements[index]
    options(
      select('model-face'),
      Object.keys(model.faces).map((name) => [name, name]),
    )
    const change = r.edits.find((e) => e.element === index),
      face = select('model-face').value
    select('model-rotation').value = String(
      change?.faces?.[face]?.rotation ?? model.faces[face].rotation ?? 0,
    )
    vector(
      'model-bounds',
      ['From X', 'From Y', 'From Z', 'To X', 'To Y', 'To Z'],
      [...(change?.from ?? model.from), ...(change?.to ?? model.to)],
      (value) => {
        const current = edit()
        current.from = value.slice(0, 3)
        current.to = value.slice(3)
        changed()
      },
    )
    view?.highlight(index)
  }
  vector('model-uv', ['U start', 'V start', 'U end', 'V end'], [...uv()], setUV)
  showTexture().catch(error)
}
function render() {
  list()
  if (!recipe()) {
    element('model-editor').hidden = true
    return
  }
  element('model-editor').hidden = false
  input('model-label').value = recipe().label
  input('model-enabled').checked = recipe().enabled
  element('model-output').textContent = recipe().output
  element<HTMLTextAreaElement>('model-json').value =
    jsonDrafts.get(selected) ?? JSON.stringify(recipe(), null, 2)
  fields()
  view?.show(preview()).catch(error)
  element('model-statistics').textContent =
    `${preview().elements} elements · ${preview().faces} faces`
  controls()
}
function error(reason: unknown) {
  status.textContent = reason instanceof Error ? reason.message : String(reason)
}
async function updatePreview() {
  if (running) return
  const requested = version
  running = true
  controls()
  try {
    const result = await request('/preview', { document: workspace.document })
    if (requested === version) {
      workspace.previews = result.previews
      view?.show(preview()).catch(error)
      element('model-statistics').textContent =
        `${preview().elements} elements · ${preview().faces} faces`
      status.textContent = 'Unsaved changes; preview current'
      list()
    }
  } catch (reason) {
    error(reason)
  } finally {
    running = false
    controls()
    if (requested !== version) void updatePreview()
  }
}
async function load() {
  if ((dirty || jsonDrafts.size) && !confirm('Discard unsaved model changes?'))
    return
  running = true
  controls()
  try {
    workspace = await request('')
    if (!workspace.document.recipes.some((r) => r.id === selected))
      selected = workspace.document.recipes[0]?.id ?? ''
    dirty = false
    jsonDrafts.clear()
    render()
    status.textContent = 'Source loaded'
  } catch (reason) {
    error(reason)
  } finally {
    running = false
    controls()
  }
}
async function operation(action: 'save' | 'generate') {
  clearTimeout(timer)
  const requested = version
  running = true
  controls()
  try {
    const result = await request('/' + action, {
      revision: workspace.revision,
      document: workspace.document,
    })
    if (action === 'save') {
      workspace.revision = result.revision
      dirty = requested !== version
      status.textContent = dirty
        ? 'Recipes saved; newer edits remain unsaved'
        : 'Recipes saved; generate to update the pack'
    } else status.textContent = result.output
  } catch (reason) {
    error(reason)
  } finally {
    running = false
    controls()
  }
}

input('model-search').addEventListener('input', list)
input('model-label').addEventListener('input', () => {
  recipe().label = input('model-label').value
  changed()
  list()
})
input('model-enabled').addEventListener('change', () => {
  recipe().enabled = input('model-enabled').checked
  changed()
})
for (const [id, key] of [
  ['model-depth', 'depth'],
  ['model-threshold', 'threshold'],
] as const)
  input(id).addEventListener('input', () => {
    const r = recipe()
    if (r.kind === 'extrusion') {
      r[key] = input(id).valueAsNumber
      changed()
    }
  })
for (const id of ['model-plane', 'model-element', 'model-face'])
  select(id).addEventListener('change', fields)
select('model-axis').addEventListener('change', () => {
  const r = recipe()
  if (r.kind === 'extrusion') {
    r.parts[Number(select('model-plane').value)].axis =
      select('model-axis').value
    changed()
  }
})
input('model-center').addEventListener('input', () => {
  const r = recipe()
  if (r.kind === 'extrusion') {
    r.parts[Number(select('model-plane').value)].center =
      input('model-center').valueAsNumber
    changed()
  }
})
select('model-rotation').addEventListener('change', () => {
  const current = edit(),
    face = select('model-face').value
  current.faces[face] = {
    ...current.faces[face],
    rotation: Number(select('model-rotation').value),
  }
  changed()
})
button('model-reset-element').addEventListener('click', () => {
  const r = recipe()
  if (r.kind !== 'fitting') return
  r.edits = r.edits.filter(
    (e) => e.element !== Number(select('model-element').value),
  )
  changed()
  // Re-read pristine template through the generator before repainting controls.
  clearTimeout(timer)
  void updatePreview().then(fields)
})
button('model-apply-json').addEventListener('click', async () => {
  const id = selected
  const rawDraft = jsonDrafts.get(id)
  try {
    const value = JSON.parse(element<HTMLTextAreaElement>('model-json').value)
    if (value.id !== selected) throw new Error('Keep the recipe ID unchanged')
    const candidate = structuredClone(workspace.document)
    candidate.recipes[workspace.document.recipes.indexOf(recipe())] = value
    const requested = version
    running = true
    controls()
    const result = await request('/preview', { document: candidate })
    if (requested !== version || jsonDrafts.get(id) !== rawDraft)
      throw new Error(
        'Newer edits exist. Review them before applying JSON again.',
      )
    workspace.document = candidate
    workspace.previews = result.previews
    jsonDrafts.delete(id)
    dirty = true
    version++
    status.textContent = 'Unsaved changes; preview current'
    render()
    controls()
  } catch (reason) {
    error(reason)
  } finally {
    running = false
    controls()
  }
})
element<HTMLTextAreaElement>('model-json').addEventListener('input', () => {
  const text = element<HTMLTextAreaElement>('model-json').value
  if (text === JSON.stringify(recipe(), null, 2)) jsonDrafts.delete(selected)
  else jsonDrafts.set(selected, text)
  status.textContent = jsonDrafts.size
    ? 'Apply or discard JSON edits before saving or generating'
    : dirty
      ? 'Unsaved changes'
      : 'Source loaded'
  controls()
})
button('model-discard-json').addEventListener('click', () => {
  jsonDrafts.delete(selected)
  render()
  status.textContent = dirty ? 'Unsaved changes' : 'Source loaded'
})
button('models-reload').addEventListener('click', () => void load())
button('models-save').addEventListener('click', () => void operation('save'))
button('models-generate').addEventListener(
  'click',
  () => void operation('generate'),
)
button('model-camera').addEventListener('click', () => view?.reset())
input('model-wire').addEventListener('change', () =>
  view?.wire(input('model-wire').checked),
)
let start: number[] | undefined
function point(event: PointerEvent) {
  const rect = textureCanvas.getBoundingClientRect()
  return [
    Math.max(
      0,
      Math.min(16, Math.round(((event.clientX - rect.left) / rect.width) * 16)),
    ),
    Math.max(
      0,
      Math.min(16, Math.round(((event.clientY - rect.top) / rect.height) * 16)),
    ),
  ]
}
textureCanvas.addEventListener('pointerdown', (event) => {
  if (jsonDrafts.has(selected)) return
  start = point(event)
  textureCanvas.setPointerCapture(event.pointerId)
})
textureCanvas.addEventListener('pointerup', (event) => {
  if (!start) return
  const end = point(event)
  if (start[0] !== end[0] && start[1] !== end[1]) {
    setUV([
      Math.min(start[0], end[0]),
      Math.min(start[1], end[1]),
      Math.max(start[0], end[0]),
      Math.max(start[1], end[1]),
    ])
    vector(
      'model-uv',
      ['U start', 'V start', 'U end', 'V end'],
      [...uv()],
      setUV,
    )
  }
  start = undefined
})
window.addEventListener('beforeunload', (event) => {
  if (dirty || jsonDrafts.size) {
    event.preventDefault()
  }
})
window.addEventListener('pagehide', () => view?.dispose(), { once: true })
try {
  view = new ModelPreview(element<HTMLCanvasElement>('model-canvas'))
} catch (reason) {
  error(reason)
}
void load()
