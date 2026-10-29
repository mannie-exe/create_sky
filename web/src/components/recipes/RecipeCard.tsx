import { memo, useId, useState } from 'react'
import { recipePresentation, safeIcon } from '../../lib/recipe-view.mjs'
import { ingredient } from '../../lib/acquisition.mjs'

export type Catalog = Map<string, any>
export type RecipeState = {
  sections?: Record<string, boolean>
  alternatives?: number
}
export type RecipeProps = {
  recipe: any
  catalog: Catalog
  inspect: (id: string) => void
  state?: RecipeState
  onState?: (state: RecipeState) => void
  typography?: 'semantic'
}

export const ItemSlot = memo(function ItemSlot({
  id,
  catalog,
  inspect,
  count,
  title,
}: {
  id: string
  catalog: Catalog
  inspect: (id: string) => void
  count?: string | number
  title?: string
}) {
  const item = catalog.get(id),
    icon = safeIcon(item?.icon)
  return (
    <button
      className="recipe-item nodrag nopan"
      data-inspect={id}
      title={title || `${item?.name ?? id} · ${id}`}
      onClick={(e) => {
        e.stopPropagation()
        inspect(id)
      }}
    >
      {icon ? (
        <img src={icon} alt="" loading="lazy" />
      ) : (
        <span aria-hidden="true">?</span>
      )}
      <span className="sr-only">{item?.name ?? id}</span>
      {count !== undefined && count !== '' && (
        <b className="recipe-count">{count}</b>
      )}
    </button>
  )
})

export const RecipeCard = memo(function RecipeCard({
  recipe,
  catalog,
  inspect,
  state,
  onState,
  typography,
}: RecipeProps) {
  const view = recipePresentation(recipe),
    prefix = useId()
  const [local, setLocal] = useState<RecipeState>({})
  const current = state ?? local
  const update = (next: RecipeState) =>
    onState ? onState(next) : setLocal(next)
  const entries: any[] = [],
    seen = new Map<string, number>()
  const name = (id: string) => catalog.get(id)?.name ?? id
  const slot = (slot: any, role: string, index: number) => {
    if (!slot)
      return (
        <div
          key={index}
          className="recipe-slot empty"
          aria-label="Empty slot"
        />
      )
    if (slot.derived)
      return (
        <div
          key={index}
          className="recipe-slot recipe-derived"
          role="img"
          aria-label="Base armor with trim applied"
        >
          ＝
        </div>
      )
    const value = slot.value ?? {},
      ids: string[] = [
        ...new Set<string>(slot.resolved ?? ingredient(value, {})),
      ]
    const key = JSON.stringify([value, ids, role])
    if (!seen.has(key)) {
      seen.set(key, entries.length)
      entries.push({ value, ids, role })
    }
    const entry = seen.get(key)!,
      count = value.amount ?? value.count ?? 1
    return (
      <div key={index} className="recipe-slot">
        {ids.length ? (
          <ItemSlot
            id={ids[0]}
            catalog={catalog}
            inspect={inspect}
            count={count === 1 ? '' : count}
            title={
              value.tag ? `#${value.tag} · ONE of ${ids.length}` : undefined
            }
          />
        ) : (
          <span title="Unresolved ingredient">?</span>
        )}
        {value.chance !== undefined && (
          <span className="recipe-chance">{Number(value.chance) * 100}%</span>
        )}
        {ids.length > 1 && (
          <button
            className="recipe-alternative-link nodrag nopan"
            aria-label={`Show ${ids.length} ingredient alternatives`}
            onClick={(e) => {
              e.stopPropagation()
              update({
                ...current,
                alternatives: entry,
                sections: { ...current.sections, ingredients: true },
              })
              requestAnimationFrame(() =>
                document
                  .getElementById(`${prefix}-${entry}`)
                  ?.focus({ preventScroll: false }),
              )
            }}
          >
            {ids.length}
          </button>
        )}
      </div>
    )
  }
  const section = (key: string, label: string, content: React.ReactNode) => (
    <details
      open={!!current.sections?.[key]}
      className={`recipe-${key} nodrag nopan nowheel`}
    >
      <summary
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          update({
            ...current,
            sections: { ...current.sections, [key]: !current.sections?.[key] },
          })
        }}
      >
        {label}
      </summary>
      {content}
    </details>
  )
  const inputs = view.inputs.map((v: any, i: number) => slot(v, 'Input', i)),
    outputs = view.outputs.map((v: any, i: number) => slot(v, 'Output', i))
  return (
    <div className="recipe-card" data-recipe={recipe.id}>
      <p className="recipe-type" data-text-role={typography && 'code'}>
        {view.type}
        {recipe.scenario ? ' · SCENARIO' : ''}
      </p>
      {view.supported ? (
        <>
          <div className="recipe-scroll nodrag nopan nowheel">
            <div
              className="recipe-flow"
              style={
                { '--recipe-columns': view.columns } as React.CSSProperties
              }
              data-layout={view.columns > 3 ? 'wide' : 'standard'}
            >
              <span
                className="recipe-caption recipe-input-caption"
                data-text-role={typography && 'caption'}
              >
                {view.shape === 'shaped'
                  ? 'Pattern'
                  : view.shape === 'shapeless'
                    ? 'Shapeless · all slots'
                    : view.type.startsWith('minecraft:smithing_')
                      ? 'Template · base · material'
                      : 'Inputs · all slots'}
              </span>
              <span
                className="recipe-caption recipe-output-caption"
                data-text-role={typography && 'caption'}
              >
                {view.derivedOutput ? 'Modified base' : 'Outputs'}
              </span>
              <div className="recipe-grid">{inputs}</div>
              <span className="recipe-arrow" aria-hidden="true">
                <span className="arrow-right">→</span>
                <span className="arrow-down">↓</span>
              </span>
              <div className="recipe-outputs">{outputs}</div>
            </div>
          </div>
          {view.derivedOutput && (
            <p className="recipe-note">
              Same base armor, with the chosen trim applied; the pattern is not
              previewed. A valid template/material pair is required, and
              reapplying the same trim produces no result.
            </p>
          )}
          {!!view.hiddenOutputs && (
            <p>{view.hiddenOutputs} more outputs in source record.</p>
          )}
        </>
      ) : (
        <p className="muted">
          No visual adapter for this recipe type. Use the source record; custom
          GUI behavior is not simulated.
        </p>
      )}
      {!!entries.length &&
        section(
          'ingredients',
          'Ingredients, alternatives and amounts',
          <div>
            {entries.map(({ value, ids, role }, i) => (
              <section key={i} id={`${prefix}-${i}`} tabIndex={-1}>
                <p>
                  <b>
                    {role} ·{' '}
                    {value.tag
                      ? `#${value.tag}`
                      : ids.length === 1
                        ? name(ids[0])
                        : 'Ingredient group'}
                  </b>
                  {ids.length > 1 ? ` · OR ${ids.length}` : ''} ·{' '}
                  {value.amount !== undefined
                    ? `${value.amount} mB`
                    : `${value.count ?? 1} per slot`}
                  {value.chance !== undefined
                    ? ` · ${Number(value.chance) * 100}% chance`
                    : ''}
                </p>
                <p className="muted">
                  Select an item to inspect it. This does not change the chosen
                  route.
                </p>
                <div className="recipe-choices">
                  {ids.slice(0, 80).map((id: string) => (
                    <span key={id}>
                      <ItemSlot id={id} catalog={catalog} inspect={inspect} />
                      <span>{name(id)}</span>
                    </span>
                  ))}
                </div>
                {ids.length > 80 && (
                  <p>Remaining alternatives in source record.</p>
                )}
                {(value.components || value.type || !ids.length) && (
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                )}
              </section>
            ))}
          </div>,
        )}
      {!!view.requirements.length &&
        section(
          'requirements',
          'Operating requirements · not consumed slots',
          <>
            {view.requirements.map((group: string[], i: number) => (
              <p key={i}>
                {group.length
                  ? group.map((id, j) => (
                      <span key={id}>
                        {j > 0 && ' OR '}
                        <button
                          className="relation nodrag nopan"
                          data-inspect={id}
                          onClick={(e) => {
                            e.stopPropagation()
                            inspect(id)
                          }}
                        >
                          {name(id)}
                        </button>
                      </span>
                    ))
                  : 'Unresolved requirement'}
              </p>
            ))}
          </>,
        )}
      {!!Object.keys(view.conditions).length && (
        <dl className="recipe-conditions">
          {Object.entries(view.conditions).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>
                {typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)}
                {['processing_time', 'processingTime', 'cookingtime'].includes(
                  key,
                )
                  ? ' ticks'
                  : ''}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {section(
        'source',
        'Source record',
        <pre>{JSON.stringify(recipe, null, 2)}</pre>,
      )}
    </div>
  )
})
