export {}
type File = { text: string; revision: string }
type Entry = {
  title: string
  flavor: string
  requirements: string
  description: string[]
  disclaimer: string | null
  labels: Record<string, string>
}
type Locale = { shared: Record<string, string>; entries: Record<string, Entry> }
type Snapshot = {
  files: Record<string, File>
  revision: string
  generation: { changed: string[]; outputs: number }
}
type AuditRecord = {
  path: string
  category: string
  status: string
  review: string
  reason: string
  reference: string
}
const element = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T
const select = (id: string) => element<HTMLSelectElement>(id)
const field = (id: string) =>
  element<HTMLInputElement | HTMLTextAreaElement>(id)
const button = (id: string) => element<HTMLButtonElement>(id)
let snapshot: Snapshot,
  locale: Locale,
  mode = 'journal',
  dirty = false,
  busy = false
let records: AuditRecord[] = []
let unregistered: string[] = []
const status = (text: string) => {
  element('status').textContent = text
}
function controls() {
  document
    .querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >('.authoring input, .authoring textarea, .authoring select')
    .forEach((input) => {
      input.disabled = busy || !snapshot
    })
  button('save').disabled = !dirty || busy || mode === 'audit'
  button('generate').disabled =
    dirty || busy || !snapshot || !snapshot.generation.changed.length
  button('reload').disabled = busy
}
function changed() {
  dirty = true
  status('Unsaved source changes')
  controls()
}
function discard() {
  return !dirty || window.confirm('Discard unsaved source changes?')
}
function options(
  id: string,
  values: [string, string][],
  current = select(id).value,
) {
  select(id).replaceChildren(
    ...values.map(([value, label]) => new Option(label, value)),
  )
  if (values.some(([value]) => value === current)) select(id).value = current
}
async function request(url: string, body?: unknown) {
  const response = await fetch(
    '/__atlas/authoring' + url,
    body === undefined
      ? undefined
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
  )
  if (!response.headers.get('content-type')?.includes('application/json'))
    throw new Error(
      'Local authoring requires pnpm dev and a configured pack directory.',
    )
  const value = await response.json()
  if (!response.ok) throw new Error(value.error || 'Request failed')
  return value
}
async function action(work: () => Promise<void>) {
  busy = true
  controls()
  try {
    await work()
  } catch (error) {
    status(error instanceof Error ? error.message : String(error))
  } finally {
    busy = false
    controls()
  }
}
const localeFile = () => 'journal/locales/' + select('locale').value + '.json'
function preview() {
  const entry = locale.entries[select('entry').value]
  const title = document.createElement('h3')
  title.textContent = entry.title
  const paragraphs = [
    entry.flavor,
    entry.requirements,
    ...entry.description,
    entry.disclaimer ? locale.shared[entry.disclaimer] : '',
  ].filter(Boolean)
  element('preview').replaceChildren(
    title,
    ...paragraphs.map((text) => {
      const p = document.createElement('p')
      p.textContent = text
      return p
    }),
  )
  element('objectives').replaceChildren(
    ...Object.values(entry.labels).map((text) => {
      const p = document.createElement('p')
      p.textContent = text
      return p
    }),
  )
}
function renderEntry() {
  const entry = locale.entries[select('entry').value]
  const [chapter, id] = select('entry').value.split('/')
  const source = snapshot.files[`journal/chapters/${chapter}.json`]
  const definition =
    source &&
    JSON.parse(source.text).entries.find(
      (item: { id: string }) => item.id === id,
    )?.definition
  element('conditions').textContent = definition
    ? JSON.stringify(definition.objectives, null, 2)
    : 'Mechanics source unavailable'
  for (const key of ['title', 'flavor', 'requirements'] as const)
    field(key).value = entry[key]
  field('description').value = entry.description.join('\n\n')
  options(
    'disclaimer',
    [['', 'None'], ...Object.entries(locale.shared)],
    entry.disclaimer || '',
  )
  element('labels').replaceChildren(
    ...Object.entries(entry.labels).map(([key, value]) => {
      const label = document.createElement('label'),
        input = document.createElement('input'),
        count = document.createElement('small')
      input.value = value
      input.dataset.objective = key
      input.setAttribute('aria-label', 'Objective ' + key)
      count.textContent = value.length + ' characters'
      input.addEventListener('input', () => {
        entry.labels[key] = input.value
        count.textContent = input.value.length + ' characters'
        changed()
        preview()
      })
      label.append('Objective ' + key, input, count)
      return label
    }),
  )
  preview()
}
function renderLocale() {
  locale = JSON.parse(snapshot.files[localeFile()].text)
  options(
    'entry',
    Object.entries(locale.entries).map(([id, entry]) => [
      id,
      id.split('/')[0] + ' / ' + entry.title,
    ]),
  )
  const empty = Object.values(locale.entries).filter(
    (entry) => !entry.description.length,
  ).length
  element('drafts').textContent = empty + ' entries without descriptions'
  renderEntry()
}
async function load() {
  snapshot = await request('')
  dirty = false
  options(
    'locale',
    Object.keys(snapshot.files)
      .filter((name) => name.startsWith('journal/locales/'))
      .map((name) => {
        const id = name.split('/').pop()!.slice(0, -5)
        return [id, id]
      }),
  )
  options(
    'source-file',
    Object.keys(snapshot.files).map((name) => [name, name]),
  )
  field('source-text').value = snapshot.files[select('source-file').value].text
  renderLocale()
  element('generation-summary').textContent =
    `${snapshot.generation.changed.length} of ${snapshot.generation.outputs} generated files differ`
  element('generation-files').replaceChildren(
    ...snapshot.generation.changed.map((name) => {
      const li = document.createElement('li')
      li.textContent = name
      return li
    }),
  )
  status('Source loaded')
  controls()
}
function renderAudit() {
  const selected = select('category').value
  const visible = records.filter(
    (record) => !selected || record.category === selected,
  )
  element('audit-summary').textContent =
    `${visible.length} files; ${visible.filter((r) => r.status !== 'matched').length} changed or missing; ${visible.filter((r) => r.review === 'inherited').length} inherited. Unregistered files: ${unregistered.length ? unregistered.join(', ') : 'none'}.`
  if (selected)
    element('audit-summary').textContent +=
      ' ' +
      (JSON.parse(snapshot.files[`changes/${selected}.json`].text).note || '')
  element('audit-rows').replaceChildren(
    ...visible.map((record) => {
      const row = document.createElement('tr')
      for (const text of [
        record.path,
        record.status,
        record.review,
        record.reason + '\n' + record.reference,
      ]) {
        const cell = document.createElement('td')
        cell.textContent = text
        row.append(cell)
      }
      return row
    }),
  )
}
async function checkAudit() {
  const report = await request('/audit')
  records = report.records
  unregistered = report.unregistered
  const categories = Object.keys(snapshot.files)
    .filter((name) => name.startsWith('changes/'))
    .map((name) => name.slice(8, -5))
  options('category', [
    ['', 'All categories'],
    ...categories.map((name): [string, string] => [name, name]),
  ])
  renderAudit()
  status('Config files checked')
}
document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((item) =>
  item.addEventListener('click', () => {
    if (busy || !snapshot || !discard()) return
    dirty = false
    mode = item.dataset.mode!
    for (const name of ['journal', 'audit', 'source'])
      element(name + '-panel').hidden = name !== mode
    document
      .querySelectorAll<HTMLButtonElement>('[data-mode]')
      .forEach((tab) => tab.setAttribute('aria-pressed', String(tab === item)))
    renderLocale()
    field('source-text').value =
      snapshot.files[select('source-file').value].text
    controls()
    if (mode === 'audit') void action(checkAudit)
  }),
)
for (const name of ['locale', 'entry', 'source-file']) {
  let previous = ''
  select(name).addEventListener('focus', () => {
    previous = select(name).value
  })
  select(name).addEventListener('change', () => {
    if (busy || !discard()) {
      select(name).value = previous
      return
    }
    dirty = false
    if (name === 'source-file')
      field('source-text').value = snapshot.files[select(name).value].text
    else {
      const selected = select('entry').value
      renderLocale()
      if (name === 'entry') {
        select('entry').value = selected
        renderEntry()
      }
    }
    previous = select(name).value
    controls()
  })
}
for (const key of [
  'title',
  'flavor',
  'requirements',
  'description',
  'disclaimer',
] as const) {
  element(key).addEventListener('input', () => {
    const entry = locale.entries[select('entry').value]
    if (key === 'description')
      entry.description = field(key)
        .value.split(/\n\s*\n/)
        .map((value) => value.trim())
        .filter(Boolean)
    else if (key === 'disclaimer') entry.disclaimer = select(key).value || null
    else entry[key] = field(key).value
    changed()
    preview()
  })
}
field('source-text').addEventListener('input', changed)
button('reload').addEventListener('click', () => {
  if (discard()) void action(load)
})
button('save').addEventListener(
  'click',
  () =>
    void action(async () => {
      const name =
        mode === 'journal' ? localeFile() : select('source-file').value
      const text =
        mode === 'journal'
          ? JSON.stringify(locale, null, 2) + '\n'
          : field('source-text').value
      await request('/save', {
        name,
        text,
        revision: snapshot.files[name].revision,
      })
      await load()
      status('Source saved. Generate to update Questlog files.')
    }),
)
button('generate').addEventListener(
  'click',
  () =>
    void action(async () => {
      const result = await request('/generate', { revision: snapshot.revision })
      await load()
      status(result.output + '. Instances were not changed.')
    }),
)
button('check-audit').addEventListener('click', () => void action(checkAudit))
select('category').addEventListener('change', renderAudit)
window.addEventListener('beforeunload', (event) => {
  if (dirty) {
    event.preventDefault()
  }
})
void action(load)
