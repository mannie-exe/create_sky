import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
const read = async (p) => JSON.parse(await fs.readFile(p, 'utf8'))
const [recipes, items, errors, drops, diagnostics, catalog, coverage] =
  await Promise.all([
    read('data/generated/runtime/recipes.json'),
    read('data/generated/runtime/items.json'),
    read('data/generated/runtime/errors.json'),
    read('data/generated/runtime/patch_checks.json'),
    read('data/generated/diagnostics.json'),
    read('public/generated/catalog.json'),
    read('public/generated/coverage.json'),
  ])
const byRecipe = new Map(recipes.map((r) => [r.id, r])),
  byItem = new Map(items.map((i) => [i.id, i]))
assert.deepEqual(errors, [], 'Exporter errors')
assert(
  !diagnostics.some((line) => line.includes('Parsing error loading recipe')),
  'Recipe loading failure',
)
assert.equal(
  catalog.nodes.length,
  items.length,
  'Every registered item must be on the map',
)
assert(
  byRecipe
    .get('createdeco:placard')
    .ingredients.some((g) => g.includes('minecraft:white_dye')),
)
const chairs = recipes.filter(
  (r) => r.id.startsWith('interiors:') && r.id.includes('_from_other_'),
)
assert.equal(chairs.length, 32)
assert(
  chairs.every((r) =>
    r.ingredients.every((g) => g.length && !g.includes('minecraft:barrier')),
  ),
)
assert(
  byRecipe
    .get('bellsandwhistles:metro/metro_window')
    .ingredients.some((g) => g.includes('minecraft:glass')),
)
assert(
  byItem
    .get('dndecor:industrial_cogwheel')
    .tags.includes('dndecor:industrial_cogwheels'),
)
assert.equal(
  recipes.filter((r) => r.id.includes('pressing/zinc_sheet')).length,
  1,
)
assert.equal(
  byRecipe.get('createdeco:pressing/zinc_sheet').output,
  'createdeco:zinc_sheet',
)
for (const [name, stacks] of Object.entries(drops))
  assert(
    stacks.some((s) => s.id === `createpropulsion:${name}` && s.count === 1),
    name + ' must drop itself',
  )
assert.equal(Object.keys(drops).length, 4)
for (const id of [
  'reliable_gliders:glider',
  'create:precision_mechanism',
  'createpropulsion:turpentine_bucket',
  'createbigcannons:cast_iron_cannon_barrel',
  'powergrid:circuit_schematic',
  'travelersbackpack:bat',
  'travelersbackpack:iron_golem',
])
  assert.equal(
    coverage.find((c) => c.id === id)?.status,
    'mapped',
    id + ' route',
  )
assert.equal(
  coverage.find((c) => c.id === 'minecraft:barrier').status,
  'excluded',
)
assert.equal(
  coverage.find((c) => c.id === 'powergrid:zinc_sheet').status,
  'unified',
)
assert.equal(
  coverage.find((c) => c.id === 'create_factory:spread_bucket').status,
  'blocked',
  'Ecologics-only fluid must not become a free resource',
)
const journal = await read('data/generated/runtime/journal.json')
assert(journal.length > 0, 'Journal definitions missing')
assert(
  journal.every((q) => q.negativeAndPositiveHandlers && q.nbtRoundTrip),
  'Journal handler verification failed',
)
assert(
  new Set(journal.map((q) => q.id)).size === journal.length,
  'Duplicate journal IDs',
)
console.log(
  'Snapshot checks passed:',
  catalog.meta.counts,
  'journal:',
  journal.length,
)

const heat = await read('data/generated/runtime/heat_checks.json')
assert.equal(heat.solidBurnerCold, 'NONE')
assert(heat.coalAccepted > 0 && heat.heatedAtTick > 0)
assert(heat.superheatedAtTick > heat.heatedAtTick)
for (const quest of journal) {
  const visit = (objective) => {
    for (const target of [objective.item, objective.block].filter(Boolean))
      assert.equal(
        coverage.find((c) => c.id === target)?.status,
        'mapped',
        quest.id + ': ' + target,
      )
    for (const child of objective.objectives ?? []) visit(child)
  }
  quest.definition.objectives.forEach(visit)
}
