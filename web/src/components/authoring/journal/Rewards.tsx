import Field from '../../ui/Field'
import Button from '../../ui/Button'
import Disclosure from '../../ui/Disclosure'
import { useState } from 'react'
import JsonEditor from './JsonEditor'
import { useDrafts } from './Drafts'
const templates: Record<string, any> = {
  item: { item: 'minecraft:iron_ingot', count: 1 },
  experience: { experience: 1, level: false },
  command: { command: '/say Reward claimed', permission_level: 2 },
  loot_table: { loot_table: 'minecraft:chests/simple_dungeon' },
  choice: {
    pick_count: 1,
    choices: [
      { type: 'questlog:item', item: 'minecraft:iron_ingot', count: 1 },
    ],
  },
  random: {
    roll_count: 1,
    empty_weight: 0,
    entries: [
      {
        weight: 1,
        reward: {
          type: 'questlog:item',
          item: 'minecraft:iron_ingot',
          count: 1,
        },
      },
    ],
  },
}
export default function Rewards({
  id,
  rewards,
  onChange,
}: {
  id: string
  rewards: any[]
  onChange: (value: any[]) => void
}) {
  const [kind, setKind] = useState('item')
  const { drafts } = useDrafts()
  const pending = Object.keys(drafts).some((key) =>
    key.startsWith(id + '/reward/'),
  )
  const update = (i: number, patch: any) =>
    onChange(rewards.map((r, n) => (n === i ? { ...r, ...patch } : r)))
  return (
    <section className="content-stack">
      <h3 data-text-role="group-title">Rewards</h3>
      {!rewards.length && <p className="scope">No rewards.</p>}
      {rewards.map((r, i) => (
        <fieldset className="content-stack" key={i}>
          <legend>
            Reward {i + 1} · {r.type}
          </legend>
          {r.type === 'questlog:item' && typeof r.item === 'string' && (
            <>
              <Field label={<>Item ID</>}>
                {(field) => (
                  <input
                    {...field}
                    value={r.item}
                    onChange={(e) => update(i, { item: e.target.value })}
                  />
                )}
              </Field>
              <Field label={<>Count</>}>
                {(field) => (
                  <input
                    {...field}
                    type="number"
                    min={1}
                    value={r.count ?? 1}
                    onChange={(e) =>
                      update(i, { count: Number(e.target.value) })
                    }
                  />
                )}
              </Field>
            </>
          )}
          {r.type === 'questlog:experience' && (
            <>
              <Field label={<>Experience</>}>
                {(field) => (
                  <input
                    {...field}
                    type="number"
                    min={1}
                    value={r.experience}
                    onChange={(e) =>
                      update(i, { experience: Number(e.target.value) })
                    }
                  />
                )}
              </Field>
              <Field label={<>Unit</>}>
                {(field) => (
                  <select
                    {...field}
                    value={r.level ? 'levels' : 'points'}
                    onChange={(e) =>
                      update(i, { level: e.target.value === 'levels' })
                    }
                  >
                    <option value="points">Points</option>
                    <option value="levels">Levels</option>
                  </select>
                )}
              </Field>
            </>
          )}
          {r.type === 'questlog:command' && (
            <>
              <Field label={<>Command</>}>
                {(field) => (
                  <input
                    {...field}
                    value={r.command}
                    onChange={(e) => update(i, { command: e.target.value })}
                  />
                )}
              </Field>
              <Field label={<>Permission level</>}>
                {(field) => (
                  <input
                    {...field}
                    type="number"
                    min={0}
                    max={4}
                    value={r.permission_level ?? 2}
                    onChange={(e) =>
                      update(i, { permission_level: Number(e.target.value) })
                    }
                  />
                )}
              </Field>
            </>
          )}
          {r.type === 'questlog:loot_table' && (
            <Field label={<>Loot table</>}>
              {(field) => (
                <input
                  {...field}
                  value={r.loot_table}
                  onChange={(e) => update(i, { loot_table: e.target.value })}
                />
              )}
            </Field>
          )}
          <Field label={<>Collection</>}>
            {(field) => (
              <select
                {...field}
                value={r.auto_claim ? 'automatic' : 'manual'}
                onChange={(e) =>
                  update(i, { auto_claim: e.target.value === 'automatic' })
                }
              >
                <option value="manual">Player claims</option>
                <option value="automatic">Automatic on completion</option>
              </select>
            )}
          </Field>
          <Disclosure
            summary={
              <>
                Reward properties
                {['questlog:choice', 'questlog:random'].includes(r.type)
                  ? ' and options'
                  : ''}
              </>
            }
          >
            <JsonEditor
              id={`${id}/reward/${i}`}
              label="Reward JSON"
              value={r}
              onApply={(value) => {
                if (!value || typeof value.type !== 'string')
                  throw new Error('A native reward type is required.')
                onChange(rewards.map((old, n) => (n === i ? value : old)))
              }}
            />
          </Disclosure>
          <div className="action-row">
            <Button
              intent="destructive"
              disabled={pending}
              onClick={() => onChange(rewards.filter((_, n) => n !== i))}
            >
              Remove reward {i + 1}
            </Button>
          </div>
        </fieldset>
      ))}
      <div className="control-row">
        <Field label={<>Reward type</>}>
          {(field) => (
            <select
              {...field}
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              {Object.keys(templates).map((k) => (
                <option key={k} value={k}>
                  {k.replace('_', ' ')}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Button
          onClick={() =>
            onChange([
              ...rewards,
              {
                type: 'questlog:' + kind,
                ...structuredClone(templates[kind]),
                auto_claim: false,
              },
            ])
          }
        >
          Add reward
        </Button>
      </div>
    </section>
  )
}
