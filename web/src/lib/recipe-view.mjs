import { fluidState, potionNode, ingredient } from './acquisition.mjs'

export const escapeHTML = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  )
export const safeIcon = (icon) =>
  typeof icon === 'string' && /^\/generated\/icons\/[a-f0-9]+\.png$/.test(icon)
    ? icon
    : null

const cooking = new Set([
  'minecraft:smelting',
  'minecraft:blasting',
  'minecraft:smoking',
  'minecraft:campfire_cooking',
])
const processing = new Set([
  'create:pressing',
  'create:mixing',
  'create:compacting',
  'create:crushing',
  'create:milling',
  'create:cutting',
  'create:splashing',
  'create:haunting',
  'create:filling',
  'create:emptying',
  'create:deploying',
  'create:item_application',
  'create:sandpaper_polishing',
])

// Recipe JSON owns quantities and layout. Resolved groups supply tag alternatives;
// later groups in the atlas can be machinery/capabilities, not consumed slots.
export function recipePresentation(recipe) {
  const json = recipe.json ?? {},
    type = json.type ?? recipe.type
  let raw = [],
    columns = 3,
    shape = 'processing',
    supported = true
  if (
    ['minecraft:crafting_shaped', 'create:mechanical_crafting'].includes(type)
  ) {
    const pattern = json.pattern ?? [],
      keys = Object.keys(json.key ?? {})
    columns = Math.max(1, ...pattern.map((row) => row.length))
    if (!pattern.length || columns > 9 || pattern.length > 9) supported = false
    else
      raw = pattern.flatMap((row) =>
        Array.from({ length: columns }, (_, i) => {
          const key = row[i] ?? ' '
          return key === ' '
            ? null
            : {
                value: json.key?.[key],
                resolved: recipe.ingredients?.[keys.indexOf(key)],
              }
        }),
      )
    shape = 'shaped'
  } else if (type === 'minecraft:crafting_shapeless' || processing.has(type)) {
    raw = (json.ingredients ?? []).map((value, i) => ({
      value,
      resolved: recipe.ingredients?.[i],
    }))
    shape = type === 'minecraft:crafting_shapeless' ? 'shapeless' : 'processing'
  } else if (cooking.has(type) || type === 'minecraft:stonecutting') {
    raw = [{ value: json.ingredient, resolved: recipe.ingredients?.[0] }]
    columns = 1
  } else if (type === 'minecraft:smithing_transform') {
    raw = ['template', 'base', 'addition'].map((key, i) => ({
      value: json[key],
      resolved: recipe.ingredients?.[i],
    }))
  } else supported = false
  if (raw.length > 81) supported = false
  const declaredInputs =
    json.ingredients ??
    (json.ingredient
      ? [json.ingredient]
      : json.key
        ? Object.values(json.key)
        : json.base
          ? [json.template, json.base, json.addition].filter(Boolean)
          : [])
  const requirements = supported
    ? (recipe.ingredients ?? []).slice(declaredInputs.length)
    : []
  const declared = json.results ?? (json.result ? [json.result] : [])
  const outputs = declared.slice(0, 24).map((value) => {
    const stack = typeof value === 'string' ? { id: value } : value
    const id = stack.id ?? stack.item ?? stack.fluid
    return {
      value: stack,
      resolved: id
        ? [
            stack.amount !== undefined
              ? fluidState({ ...stack, id })
              : potionNode({ ...stack, id }),
          ]
        : [],
    }
  })
  return {
    type,
    supported,
    shape,
    columns,
    inputs: supported ? raw : [],
    outputs,
    requirements,
    hiddenOutputs: Math.max(0, declared.length - 24),
    conditions: Object.fromEntries(
      Object.entries(json).filter(([key]) =>
        [
          'heat_requirement',
          'processing_time',
          'processingTime',
          'cookingtime',
          'experience',
          'keep_held_item',
          'accept_mirrored',
          'neoforge:conditions',
        ].includes(key),
      ),
    ),
  }
}

export function recipeHTML(recipe, catalog = new Map()) {
  const view = recipePresentation(recipe),
    esc = escapeHTML
  const item = (id, count = '') => {
    const node = catalog.get(id),
      icon = safeIcon(node?.icon)
    return `<button class="recipe-item" data-inspect="${esc(id)}" title="${esc(node?.name ?? id)} · ${esc(id)}">${icon ? `<img src="${icon}" alt="" loading="lazy"/>` : '<span aria-hidden="true">?</span>'}<span class="sr-only">${esc(node?.name ?? id)}</span>${count !== '' ? `<b class="recipe-count">${esc(count)}</b>` : ''}</button>`
  }
  const slot = (slot) => {
    if (!slot)
      return '<div class="recipe-slot empty" aria-label="Empty slot"></div>'
    const value = slot.value ?? {},
      ids = [...new Set(slot.resolved ?? ingredient(value, {}))]
    const count =
      value.amount !== undefined ? `${value.amount} mB` : (value.count ?? 1)
    const note = value.tag ? `#${value.tag}` : (value.type ?? '')
    return `<div class="recipe-slot">${ids.length ? item(ids[0], count === 1 ? '' : count) : '<span class="recipe-unknown">Unresolved</span>'}${value.chance !== undefined ? `<small>${esc(Number(value.chance) * 100)}%</small>` : ''}${
      ids.length > 1
        ? `<details class="recipe-alternatives"><summary>OR ${ids.length}</summary><div>${ids
            .slice(0, 80)
            .map((id) => item(id))
            .join(
              '',
            )}</div>${ids.length > 80 ? '<p>Remaining alternatives in source record.</p>' : ''}</details>`
        : ''
    }${note ? `<small title="${esc(note)}">${esc(note)}</small>` : ''}${value.components || value.type || !ids.length ? `<details><summary>Ingredient data</summary><pre>${esc(JSON.stringify(value, null, 2))}</pre></details>` : ''}</div>`
  }
  const body = view.supported
    ? `<div class="recipe-flow"><div><span class="recipe-caption">${view.shape === 'shaped' ? 'Pattern' : view.shape === 'shapeless' ? 'Shapeless · all slots' : 'Inputs · all slots'}</span><div class="recipe-grid" style="--recipe-columns:${view.columns}">${view.inputs.map(slot).join('')}</div></div><span class="recipe-arrow" aria-hidden="true">→</span><div><span class="recipe-caption">Outputs</span><div class="recipe-outputs">${view.outputs.map(slot).join('')}</div>${view.hiddenOutputs ? `<p>${view.hiddenOutputs} more outputs in source record.</p>` : ''}</div></div>`
    : '<p class="muted">No visual adapter for this recipe type. Use the source record; custom GUI behavior is not simulated.</p>'
  const requirements = view.requirements.length
    ? `<details><summary>Operating requirements · not consumed slots</summary>${view.requirements.map((resolved) => slot({ resolved })).join('')}</details>`
    : ''
  return `<div class="recipe-card" data-recipe="${esc(recipe.id)}"><p class="recipe-type">${esc(view.type)}${recipe.scenario ? ' · SCENARIO' : ''}</p>${body}${requirements}${
    Object.keys(view.conditions).length
      ? `<dl class="recipe-conditions">${Object.entries(view.conditions)
          .map(
            ([key, value]) =>
              `<dt>${esc(key)}</dt><dd>${esc(typeof value === 'object' ? JSON.stringify(value) : value)}</dd>`,
          )
          .join('')}</dl>`
      : ''
  }<details><summary>Source record</summary><pre>${esc(JSON.stringify(recipe, null, 2))}</pre></details></div>`
}
