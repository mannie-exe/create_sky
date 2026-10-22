import { requestJSON } from './http'
type File = { text: string; revision: string }
type Entry = {
  title: string
  flavor: string
  requirements: string
  description: string[]
  disclaimer: string | null
  labels: Record<string, string>
}
type Locale = {
  shared: Record<string, string>
  chapters?: Record<string, string>
  entries: Record<string, Entry>
}
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
let activeEntry = ''
let activeDisclaimer = ''
let creatingDisclaimer = false
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
  document
    .querySelectorAll<HTMLButtonElement>('.entry-list button')
    .forEach((item) => {
      item.disabled = busy
    })
  button('save').disabled =
    !dirty ||
    busy ||
    mode === 'audit' ||
    (mode === 'disclaimers' && !!disclaimerError())
  button('new-disclaimer').disabled = busy || !snapshot
  button('delete-disclaimer').disabled =
    busy ||
    !locale ||
    creatingDisclaimer ||
    !activeDisclaimer ||
    disclaimerReferences().length > 0
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
const request = (url: string, body?: unknown) =>
  requestJSON('/__atlas/authoring' + url, body)
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
  const entry = locale.entries[activeEntry]
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
  const entry = locale.entries[activeEntry]
  element('entry-heading').textContent = entry.title
  element('entry-id').textContent = activeEntry
  const [chapter, id] = activeEntry.split('/')
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
    [
      ['', 'None'],
      ...Object.entries(locale.shared).map(([key, text]): [string, string] => [
        key,
        `${key}: ${text}`,
      ]),
    ],
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
function renderEntries() {
  const query = field('entry-search').value.trim().toLowerCase()
  const chapters = new Map<string, [string, Entry][]>()
  const all = Object.entries(locale.entries)
  for (const [id, entry] of all) {
    const chapter = id.split('/')[0]
    if (
      ![id, entry.title, locale.chapters?.[chapter] || chapter]
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
      continue
    if (!chapters.has(chapter)) chapters.set(chapter, [])
    chapters.get(chapter)!.push([id, entry])
  }
  const order = (chapter: string) => {
    const source = snapshot.files[`journal/chapters/${chapter}.json`]
    return source ? (JSON.parse(source.text).chapter.order ?? 0) : 0
  }
  const groups = [...chapters].sort(
    ([a], [b]) => order(a) - order(b) || a.localeCompare(b),
  )
  const scroll = element('entries').scrollTop
  element('entries').replaceChildren(
    ...groups.map(([chapter, entries]) => {
      const source = snapshot.files[`journal/chapters/${chapter}.json`]
      const definitions = source ? JSON.parse(source.text).entries : []
      const entryOrder = (id: string) =>
        definitions.find((item: { id: string }) => item.id === id.split('/')[1])
          ?.definition.sort_order ?? 0
      entries.sort(
        ([a], [b]) => entryOrder(a) - entryOrder(b) || a.localeCompare(b),
      )
      if (!activeEntry) activeEntry = entries[0][0]
      const section = document.createElement('section'),
        heading = document.createElement('h2')
      heading.textContent = locale.chapters?.[chapter] || chapter
      section.append(heading)
      for (const [id, entry] of entries) {
        const item = document.createElement('button')
        item.type = 'button'
        item.dataset.entry = id
        item.textContent = entry.title
        item.setAttribute('aria-current', String(id === activeEntry))
        item.disabled = busy
        if (!entry.description.length) {
          const note = document.createElement('small')
          note.textContent = 'Description missing'
          item.append(note)
        }
        item.addEventListener('click', () => {
          if (busy || id === activeEntry || !discard()) return
          dirty = false
          locale = JSON.parse(snapshot.files[localeFile()].text)
          activeEntry = id
          renderEntry()
          renderEntries()
          document
            .querySelector<HTMLButtonElement>(
              '#entries button[aria-current="true"]',
            )
            ?.focus({ preventScroll: true })
          status('Source loaded')
          controls()
        })
        section.append(item)
      }
      return section
    }),
  )
  element('entries').scrollTop = scroll
  const count = [...chapters.values()].reduce(
    (sum, entries) => sum + entries.length,
    0,
  )
  element('entry-count').textContent = count
    ? `${count} of ${all.length} entries`
    : 'No matching entries'
}
function renderLocale() {
  locale = JSON.parse(snapshot.files[localeFile()].text)
  if (!locale.entries[activeEntry]) activeEntry = ''
  renderEntries()
  if (!activeEntry) activeEntry = Object.keys(locale.entries)[0]
  const empty = Object.values(locale.entries).filter(
    (entry) => !entry.description.length,
  ).length
  element('drafts').textContent = empty + ' entries without descriptions'
  renderEntry()
  creatingDisclaimer = false
  if (!Object.hasOwn(locale.shared, activeDisclaimer))
    activeDisclaimer = Object.keys(locale.shared)[0] || ''
  renderDisclaimers()
  renderDisclaimer()
}
function disclaimerReferences() {
  return Object.entries(locale.entries).filter(
    ([, entry]) => entry.disclaimer === activeDisclaimer,
  )
}
function disclaimerError() {
  if (!creatingDisclaimer && !activeDisclaimer) return ''
  const key = field('disclaimer-key').value
  if (!/^[a-z0-9_]+$/.test(key))
    return 'Use lowercase letters, numbers and underscores for the key.'
  if (creatingDisclaimer && Object.hasOwn(locale.shared, key))
    return 'This key already exists.'
  if (!field('disclaimer-message').value.trim()) return 'Enter a message.'
  return ''
}
function renderDisclaimers() {
  const query = field('disclaimer-search').value.trim().toLowerCase()
  const all = Object.entries(locale.shared).sort(([a], [b]) =>
    a.localeCompare(b),
  )
  const visible = all.filter(([key, text]) =>
    `${key} ${text}`.toLowerCase().includes(query),
  )
  const scroll = element('disclaimers').scrollTop
  element('disclaimers').replaceChildren(
    ...visible.map(([key]) => {
      const item = document.createElement('button')
      item.type = 'button'
      item.textContent = key
      item.dataset.disclaimer = key
      item.setAttribute(
        'aria-current',
        String(!creatingDisclaimer && key === activeDisclaimer),
      )
      item.disabled = busy
      item.addEventListener('click', () => {
        if (
          busy ||
          (!creatingDisclaimer && key === activeDisclaimer) ||
          !discard()
        )
          return
        dirty = false
        activeDisclaimer = key
        renderLocale()
        element('disclaimers')
          .querySelector<HTMLButtonElement>('[aria-current="true"]')
          ?.focus({ preventScroll: true })
        status('Source loaded')
        controls()
      })
      return item
    }),
  )
  element('disclaimers').scrollTop = scroll
  element('disclaimer-count').textContent = visible.length
    ? `${visible.length} of ${all.length} disclaimers`
    : all.length
      ? 'No matching disclaimers'
      : 'No disclaimers'
}
function renderDisclaimer() {
  const empty = !creatingDisclaimer && !activeDisclaimer
  element('disclaimer-empty').hidden = !empty
  element('disclaimer-editor').hidden = empty
  field('disclaimer-key').value = creatingDisclaimer ? '' : activeDisclaimer
  field('disclaimer-key').readOnly = !creatingDisclaimer
  field('disclaimer-message').value = creatingDisclaimer
    ? ''
    : locale.shared[activeDisclaimer] || ''
  element('disclaimer-error').textContent = ''
  element('disclaimer-preview').textContent = field('disclaimer-message').value
  const references = creatingDisclaimer ? [] : disclaimerReferences()
  element('disclaimer-usage').textContent = references.length
    ? `Used by ${references.length} journal entries in this locale. Reassign them before deleting.`
    : 'No journal entries use this message in this locale.'
  element('disclaimer-references').replaceChildren(
    ...references.map(([id, entry]) => {
      const item = document.createElement('li')
      item.textContent = `${entry.title} (${id})`
      return item
    }),
  )
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
    for (const name of ['journal', 'disclaimers', 'audit', 'source'])
      element(name + '-panel').hidden = name !== mode
    element('locale-controls').hidden = !['journal', 'disclaimers'].includes(
      mode,
    )
    element('drafts').hidden = mode !== 'journal'
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
for (const name of ['locale', 'source-file']) {
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
    else renderLocale()
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
    const entry = locale.entries[activeEntry]
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
field('entry-search').addEventListener('input', renderEntries)
field('disclaimer-search').addEventListener('input', renderDisclaimers)
button('new-disclaimer').addEventListener('click', () => {
  if (busy || !discard()) return
  dirty = false
  renderLocale()
  creatingDisclaimer = true
  activeDisclaimer = ''
  renderDisclaimers()
  renderDisclaimer()
  status('Enter a key and message, then save source.')
  controls()
  field('disclaimer-key').focus()
})
for (const id of ['disclaimer-key', 'disclaimer-message']) {
  field(id).addEventListener('input', () => {
    if (!creatingDisclaimer && activeDisclaimer)
      locale.shared[activeDisclaimer] = field('disclaimer-message').value
    element('disclaimer-preview').textContent =
      field('disclaimer-message').value
    element('disclaimer-error').textContent = disclaimerError()
    changed()
  })
}
button('delete-disclaimer').addEventListener('click', () => {
  if (
    busy ||
    creatingDisclaimer ||
    !activeDisclaimer ||
    disclaimerReferences().length
  )
    return
  delete locale.shared[activeDisclaimer]
  activeDisclaimer = Object.keys(locale.shared)[0] || ''
  renderDisclaimers()
  renderDisclaimer()
  changed()
})
button('reload').addEventListener('click', () => {
  if (discard()) void action(load)
})
button('save').addEventListener(
  'click',
  () =>
    void action(async () => {
      if (mode === 'disclaimers' && disclaimerError())
        throw new Error(disclaimerError())
      const localeMode = mode === 'journal' || mode === 'disclaimers'
      const source =
        mode === 'disclaimers' && creatingDisclaimer
          ? {
              ...locale,
              shared: {
                ...locale.shared,
                [field('disclaimer-key').value]:
                  field('disclaimer-message').value,
              },
            }
          : locale
      const name = localeMode ? localeFile() : select('source-file').value
      const text = localeMode
        ? JSON.stringify(source, null, 2) + '\n'
        : field('source-text').value
      await request('/save', {
        name,
        text,
        revision: snapshot.files[name].revision,
      })
      if (mode === 'disclaimers' && creatingDisclaimer)
        activeDisclaimer = field('disclaimer-key').value
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
