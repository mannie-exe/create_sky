import { createRoot, type Root } from 'react-dom/client'
import {
  RecipeCard,
  type Catalog,
  type RecipeProps,
} from '../components/recipes/RecipeCard'
// Retained HTML record lists own their containers; React owns each recipe body.
export function recipeMounts() {
  const roots = new Map<HTMLElement, Root>()
  return {
    clear() {
      for (const root of roots.values()) root.unmount()
      roots.clear()
    },
    mount(
      host: HTMLElement,
      records: any[],
      catalog: Catalog,
      inspect: (id: string) => void,
      typography?: RecipeProps['typography'],
    ) {
      const byId = new Map(records.map((r) => [r.id, r]))
      for (const target of host.querySelectorAll<HTMLElement>(
        '[data-recipe-host]',
      )) {
        const recipe = byId.get(target.dataset.recipeHost)
        if (!recipe) continue
        const root = createRoot(target)
        roots.set(target, root)
        root.render(
          <RecipeCard
            recipe={recipe}
            catalog={catalog}
            inspect={inspect}
            typography={typography}
          />,
        )
      }
    },
  }
}
