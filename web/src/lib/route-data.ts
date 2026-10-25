import { requestJSON } from './http'
import { graphIndex } from './graph-views.mjs'
let pending: Promise<{ routes: any[]; recipes: any[] }> | undefined
export function clearRouteData() {
  pending = undefined
}
export function routeData(refresh = false) {
  if (refresh) clearRouteData()
  pending ??= Promise.all([
    requestJSON('/generated/routes.json'),
    requestJSON('/generated/recipes.json'),
  ])
    .then(([routes, recipes]) => ({ routes, recipes }))
    .catch((error) => {
      pending = undefined
      throw error
    })
  return pending
}

// Inline inspectors share the catalog array; avoid rebuilding indexes on each ingredient click.
const indexes = new WeakMap<
  any[],
  { routes: any[]; index: ReturnType<typeof graphIndex> }
>()
export function routeIndex(items: any[], routes: any[]) {
  const cached = indexes.get(items)
  if (cached?.routes === routes) return cached.index
  const index = graphIndex(items, routes)
  indexes.set(items, { routes, index })
  return index
}
