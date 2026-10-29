import Field from '../../ui/Field'
import Workbench from '../../ui/Workbench'
import Feedback from '../../ui/Feedback'
import Button from '../../ui/Button'
import { useState } from 'react'
import { localePath, localeText } from '../../../lib/journal.mjs'
import type { Documents } from './Localization'
export default function Disclaimers({
  documents,
  onChange,
  locale,
  openStrings,
  openEntry,
  id,
  setId,
}: {
  id: string
  setId: (id: string) => void
  documents: Documents
  onChange: (d: Documents) => void
  locale: string
  openStrings: (key: string) => void
  openEntry: (id: string) => void
}) {
  const [query, setQuery] = useState(''),
    [creating, setCreating] = useState(false),
    [key, setKey] = useState(''),
    [message, setMessage] = useState(''),
    [error, setError] = useState('')
  const text = localeText(documents, locale),
    keys = Object.keys(text.shared),
    selected = keys.includes(id) ? id : keys[0]
  const uses = Object.entries(text.entries).filter(
    ([, entry]: any) => entry.disclaimer === selected,
  )
  const referenced = Object.keys(documents)
    .filter((p) => p.startsWith('journal/locales/'))
    .some((p) =>
      Object.values(
        localeText(documents, p.split('/').at(-1)!.slice(0, -5)).entries,
      ).some((e: any) => e.disclaimer === selected),
    )
  function create() {
    if (
      !/^[a-z0-9_]+$/.test(key) ||
      Object.hasOwn(text.shared, key) ||
      !message.trim()
    ) {
      setError('Enter a unique lowercase key and a nonempty English message.')
      return
    }
    const next = structuredClone(documents)
    next[localePath('en_us')].shared[key] = message
    onChange(next)
    setId(key)
    setCreating(false)
    setKey('')
    setMessage('')
    setError('')
  }
  return (
    <Workbench
      browser={
        <>
          <Field label={<>Find disclaimer</>}>
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
            <Button onClick={() => setCreating(!creating)}>
              New disclaimer
            </Button>
          </div>
          <nav className="entry-list" aria-label="Disclaimers">
            {keys
              .filter((k) =>
                `${k} ${text.shared[k]}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((k) => (
                <Button
                  key={k}
                  aria-current={selected === k && !creating}
                  onClick={() => {
                    setId(k)
                    setCreating(false)
                  }}
                >
                  {text.shared[k]}
                  <small>{k}</small>
                </Button>
              ))}
          </nav>
        </>
      }
    >
      {creating ? (
        <section className="content-stack">
          <h2 data-text-role="section-title">New disclaimer</h2>
          <Field label={<>Key</>}>
            {(field) => (
              <input
                {...field}
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            )}
          </Field>
          <Field label={<>English message</>}>
            {(field) => (
              <textarea
                {...field}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            )}
          </Field>
          <div className="action-row">
            <Button intent="primary" onClick={create}>
              Create disclaimer
            </Button>
            <Button onClick={() => setCreating(false)}>Cancel</Button>
          </div>
          {error && <Feedback tone="error">{error}</Feedback>}
        </section>
      ) : selected ? (
        <section className="content-stack">
          <h2 data-text-role="section-title">{selected}</h2>
          <p className="message-preview">{text.shared[selected]}</p>
          <div className="action-row">
            <Button onClick={() => openStrings(`shared.${selected}`)}>
              Edit localized message
            </Button>
            <Button
              intent="destructive"
              disabled={referenced}
              onClick={() => {
                if (
                  !confirm(
                    `Delete unused disclaimer ${selected} in all locales?`,
                  )
                )
                  return
                const next = structuredClone(documents)
                for (const [name, value] of Object.entries(next))
                  if (name.startsWith('journal/locales/'))
                    delete value.shared?.[selected]
                onChange(next)
              }}
            >
              Delete disclaimer
            </Button>
          </div>
          <section className="content-stack">
            <h3 data-text-role="group-title">Used by</h3>
            {uses.length ? (
              <ul className="content-stack" data-space="control">
                {uses.map(([entry, value]: any) => (
                  <li key={entry}>
                    <Button onClick={() => openEntry(entry)}>
                      {value.title}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No entries in this locale.</p>
            )}
            <p className="scope">
              Reassign all references in every locale before deleting a shared
              message.
            </p>
          </section>
        </section>
      ) : (
        <p>No disclaimers. Create one to reuse across entries.</p>
      )}
    </Workbench>
  )
}
