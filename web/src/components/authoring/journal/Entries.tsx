import Field from '../../ui/Field'
import Workbench from '../../ui/Workbench'
import Feedback from '../../ui/Feedback'
import Button from '../../ui/Button'
import Disclosure from '../../ui/Disclosure'
import { useState } from 'react'
import { localeLabel } from '../../../lib/locales'
import {
  chapterList,
  createEntry,
  entryList,
  localeText,
  removeEntry,
  setText,
  updateDefinition,
} from '../../../lib/journal.mjs'
import type { Documents } from './Localization'
import JsonEditor from './JsonEditor'
import Rewards from './Rewards'
export default function Entries({
  documents,
  onChange,
  locale,
  setLocale,
  id,
  setId,
  openStrings,
  openDisclaimers,
}: {
  documents: Documents
  onChange: (docs: Documents) => void
  locale: string
  setLocale: (id: string) => void
  id: string
  setId: (id: string) => void
  openStrings: (key: string) => void
  openDisclaimers: (id?: string) => void
}) {
  const [query, setQuery] = useState(''),
    [creating, setCreating] = useState(false),
    [chapter, setChapter] = useState('travel'),
    [newId, setNewId] = useState(''),
    [title, setTitle] = useState(''),
    [item, setItem] = useState(''),
    [error, setError] = useState('')
  const entries = entryList(documents),
    chapters = chapterList(documents),
    words = localeText(documents, locale),
    entry = entries.find((e) => e.id === id) ?? entries[0],
    text = entry && words.entries[entry.id]
  const locales = Object.keys(documents)
    .filter((p) => p.startsWith('journal/locales/'))
    .map((p) => p.split('/').at(-1)!.slice(0, -5))
  function create() {
    try {
      const next = createEntry(documents, chapter, newId, title, item)
      onChange(next)
      setId(chapter + '/' + newId)
      setLocale('en_us')
      setCreating(false)
      setNewId('')
      setTitle('')
      setItem('')
      setError('')
    } catch (e) {
      setError(String(e))
    }
  }
  function update(definition: any) {
    onChange(updateDefinition(documents, entry.id, definition))
  }
  const updateText = (key: string, value: any) =>
    onChange(setText(documents, locale, ['entries', entry.id, key], value))
  return (
    <Workbench
      browser={
        <>
          <Field label={<>Find entry</>}>
            {(field) => (
              <input
                {...field}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            )}
          </Field>
          <div className="action-row">
            <Button onClick={() => setCreating(!creating)}>New entry</Button>
          </div>
          <nav className="entry-list" aria-label="Journal entries">
            {chapters.map((c) => {
              const found = entries.filter(
                (e) =>
                  e.id.startsWith(c.id + '/') &&
                  `${e.id} ${words.entries[e.id].title} ${words.chapters[c.id]}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
              )
              return (
                found.length > 0 && (
                  <section key={c.id}>
                    <h2>{words.chapters[c.id]}</h2>
                    {found.map((e) => (
                      <Button
                        key={e.id}
                        aria-current={entry?.id === e.id && !creating}
                        onClick={() => {
                          setId(e.id)
                          setCreating(false)
                          setError('')
                        }}
                      >
                        {words.entries[e.id].title}
                      </Button>
                    ))}
                  </section>
                )
              )
            })}
          </nav>
          <p className="scope">{entries.length} entries</p>
        </>
      }
    >
      {creating ? (
        <section className="content-stack">
          <h2 data-text-role="section-title">New entry</h2>
          <Field label={<>Chapter</>}>
            {(field) => (
              <select
                {...field}
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              >
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {words.chapters[c.id]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label={<>Entry ID</>}>
            {(field) => (
              <input
                {...field}
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
              />
            )}
          </Field>
          <Field label={<>English title</>}>
            {(field) => (
              <input
                {...field}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            )}
          </Field>
          <Field label={<>Obtain item ID</>}>
            {(field) => (
              <input
                {...field}
                placeholder="minecraft:iron_ingot"
                value={item}
                onChange={(e) => setItem(e.target.value)}
              />
            )}
          </Field>
          <p className="scope">
            Starts with one inventory objective and no rewards. Edit conditions
            after creation.
          </p>
          <div className="action-row">
            <Button intent="primary" onClick={create}>
              Create entry
            </Button>
            <Button onClick={() => setCreating(false)}>Cancel</Button>
          </div>
          {error && <Feedback tone="error">{error}</Feedback>}
        </section>
      ) : entry ? (
        <section className="content-stack journal-editor">
          <div className="section-heading">
            <div className="content-stack" data-space="control">
              <h2 data-text-role="section-title">{text.title}</h2>
              <code>{entry.id}</code>
            </div>
            <div className="control-row">
              <Field label={<>Text locale</>}>
                {(field) => (
                  <select
                    {...field}
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                  >
                    {locales.map((l) => (
                      <option key={l} value={l}>
                        {localeLabel(l)}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Button
                intent="destructive"
                onClick={() => {
                  if (
                    !confirm(
                      `Delete ${text.title}? This removes its mechanics and translations. Generated files are removed on Generate. Existing player progress is not migrated.`,
                    )
                  )
                    return
                  try {
                    onChange(removeEntry(documents, entry.id))
                    setError('')
                  } catch (e) {
                    setError(String(e))
                  }
                }}
              >
                Delete entry
              </Button>
            </div>
          </div>
          {error && <Feedback tone="error">{error}</Feedback>}
          <div className="journal-entry-columns">
            <div className="content-stack" data-space="section">
              <section className="content-stack">
                <header className="section-heading">
                  <h3 data-text-role="group-title">Objectives</h3>
                </header>
                <ul>
                  {Object.values(text.labels).map((label: any, i) => (
                    <li key={i}>{label}</li>
                  ))}
                </ul>
                <Disclosure summary={<>Edit conditions and entry properties</>}>
                  <JsonEditor
                    id={entry.id + '/definition'}
                    label="Definition JSON"
                    hint="Native Questlog definition. Objective labels follow numbered positions; review them when reordering. IDs remain stable for player progress."
                    value={entry.definition}
                    onApply={update}
                  />
                </Disclosure>
              </section>
              <Rewards
                id={entry.id}
                rewards={entry.definition.rewards || []}
                onChange={(rewards) => update({ ...entry.definition, rewards })}
              />
              <section className="content-stack">
                <Field label={<>Shared disclaimer</>}>
                  {(field) => (
                    <select
                      {...field}
                      value={text.disclaimer || ''}
                      onChange={(e) =>
                        updateText('disclaimer', e.target.value || null)
                      }
                    >
                      <option value="">None</option>
                      {Object.entries(words.shared).map(
                        ([key, message]: any) => (
                          <option key={key} value={key}>
                            {message} ({key})
                          </option>
                        ),
                      )}
                    </select>
                  )}
                </Field>
                <div className="action-row">
                  <Button
                    onClick={() =>
                      openDisclaimers(text.disclaimer || undefined)
                    }
                  >
                    Manage disclaimers
                  </Button>
                </div>
              </section>
            </div>
            <section
              className="content-stack journal-text-preview"
              aria-label="Journal text preview"
            >
              <div className="section-heading">
                <h3 data-text-role="group-title">Text preview · {locale}</h3>
                <Button onClick={() => openStrings(`entries.${entry.id}.`)}>
                  Edit strings
                </Button>
              </div>
              <p className="scope">
                Section order and short labels; game font wrapping is not
                simulated.
              </p>
              <div className="preview-columns">
                <article className="content-stack">
                  <h3 data-text-role="group-title">{text.title}</h3>
                  {[
                    text.flavor,
                    text.requirements,
                    ...text.description,
                    text.disclaimer ? words.shared[text.disclaimer] : '',
                  ]
                    .filter(Boolean)
                    .map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                </article>
                <aside className="content-stack">
                  {Object.values(text.labels).map((label: any, i) => (
                    <p key={i}>{label}</p>
                  ))}
                </aside>
              </div>
              <p className="scope">
                {entry.definition.rewards.length} rewards ·{' '}
                {locale === 'en_us'
                  ? 'English source'
                  : 'Untranslated text uses English'}
              </p>
            </section>
          </div>
        </section>
      ) : (
        <p>No entries. Create one to begin.</p>
      )}
    </Workbench>
  )
}
