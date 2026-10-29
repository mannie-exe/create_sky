import { recipePresentation } from './recipe-view.mjs'

const operations = {
  'minecraft:crafting_shaped': 'Craft',
  'minecraft:crafting_shapeless': 'Craft',
  'minecraft:smelting': 'Smelt',
  'minecraft:blasting': 'Blast',
  'create:crushing': 'Crush',
  'create:sequenced_assembly': 'Sequence',
}
const words = (value) =>
  String(value)
    .split(':')
    .pop()
    .split('/')
    .pop()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

function craftPair(recipe) {
  if (
    recipe.special ||
    !['minecraft:crafting_shaped', 'minecraft:crafting_shapeless'].includes(
      recipe.json?.type,
    )
  )
    return null
  const view = recipePresentation(recipe)
  if (Object.keys(view.conditions).length || view.outputs.length !== 1)
    return null
  const slots = view.inputs.filter(Boolean)
  if (!slots.length || slots.some((slot) => slot.resolved?.length !== 1))
    return null
  const inputs = new Set(slots.map((slot) => slot.resolved[0]))
  return inputs.size === 1 ? [recipe.output, [...inputs][0]] : null
}

// Group only demonstrable reverse crafting pairs; this does not infer resource value
// or claim that either recipe is useful at the beginning of progression.
export function acquisitionMethods(itemId, entries, recipes, catalog) {
  const reverse = new Set(
    [...recipes.values()]
      .map(craftPair)
      .filter(Boolean)
      .map((pair) => JSON.stringify(pair)),
  )
  const name = (id) => catalog.get(id)?.name ?? words(id)
  return entries.map(({ route, index }) => {
    const recipe = recipes.get(route.id)
    if (recipe) {
      const view = recipePresentation(recipe),
        pair = craftPair(recipe)
      const secondary = recipe.output !== itemId
      const conversion =
        !secondary && pair && reverse.has(JSON.stringify([pair[1], pair[0]]))
      const group = secondary
        ? 'Secondary outputs'
        : conversion
          ? 'Conversions'
          : 'Crafting and processing'
      const operation = operations[view.type] ?? words(view.type)
      const inputs = [
        ...new Set(
          view.inputs.filter(Boolean).flatMap((slot) => slot.resolved ?? []),
        ),
      ]
      const subject = secondary
        ? name(recipe.output)
        : inputs.length === 1
          ? name(inputs[0])
          : name(itemId)
      return {
        id: route.id,
        route,
        index,
        recipe,
        group,
        type: [
          'minecraft:crafting_shaped',
          'minecraft:crafting_shapeless',
        ].includes(view.type)
          ? 'Crafting'
          : words(view.type),
        label: `${operation} · ${subject}`,
        secondary: Boolean(secondary),
        conversion: Boolean(conversion),
      }
    }
    const group =
      route.kind === 'chest-loot'
        ? 'Chest loot'
        : route.kind === 'mob-drop'
          ? 'Mob drops'
          : 'Other methods'
    return {
      id: route.id,
      route,
      index,
      group,
      type:
        {
          'mob-drop': 'Mob drops',
          'chest-loot': 'Chest loot',
          'block-drop': 'Block drops',
          trade: 'Trading',
          authored: 'Authored routes',
        }[route.kind] ?? words(route.kind).replaceAll('-', ' '),
      label:
        route.title ??
        (route.kind === 'trade' && route.source?.profession
          ? `${words(route.source.profession)} · level ${route.source.level}`
          : words(typeof route.source === 'string' ? route.source : route.id)),
      secondary: false,
      conversion: false,
    }
  })
}
