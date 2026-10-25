import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Viewport } from '@xyflow/react'
import { GraphCanvas, type CanvasHandle } from './GraphCanvas'
import { RecipeCard, type RecipeState } from '../recipes/RecipeCard'
import { pathScene } from '../../lib/graph-views.mjs'
import { routeData, routeIndex } from '../../lib/route-data'
const sessions = new WeakMap<
  object,
  { selected: string; camera: Viewport; states: Map<string, RecipeState> }
>()
export default function RoutePreview({
  items,
  detail,
  inspect,
}: {
  items: any[]
  detail: any
  inspect: (id: string) => void
}) {
  let session = sessions.get(detail)
  if (!session) {
    session = {
      selected: '',
      camera: { x: 0, y: 0, zoom: 1, fit: true } as Viewport,
      states: new Map(),
    }
    sessions.set(detail, session)
  }
  const [bundle, setBundle] = useState<any>(null),
    [error, setError] = useState(''),
    [selected, setSelected] = useState(session.selected),
    [camera, setCamera] = useState<Viewport>(session.camera)
  session.selected = selected
  session.camera = camera
  const controls = useRef<CanvasHandle | null>(null),
    states = useRef(session.states)
  useEffect(() => {
    let active = true
    void routeData()
      .then(({ routes, recipes }) => {
        if (active)
          setBundle({
            index: routeIndex(items, routes),
            recipes: new Map(recipes.map((r) => [r.id, r])),
          })
      })
      .catch((e) => {
        if (active) setError(String(e))
      })
    return () => {
      active = false
    }
  }, [items])
  const scene = useMemo(
    () => (bundle ? pathScene(bundle.index, detail.path) : null),
    [bundle, detail],
  )
  useEffect(() => {
    if (scene && !scene.nodes.has(selected))
      setSelected(
        [...scene.nodes.values()].filter((n: any) => n.type === 'route').at(-1)
          ?.id ?? '',
      )
  }, [scene])
  const select = useCallback((id: string) => setSelected(id), []),
    edge = useCallback(
      (id: string) => {
        const e = scene?.edges.find((e: any) => e.id === id)
        if (e) setSelected(e.target)
      },
      [scene],
    )
  if (!bundle || !scene) return <p role="status">{error || 'Loading route…'}</p>
  const n = scene.nodes.get(selected),
    recipe = n?.route && bundle.recipes.get(n.route.id)
  return (
    <>
      <div className="route-preview-controls">
        <button onClick={() => controls.current?.fit()}>Fit</button>
        <button
          aria-label="Zoom route in"
          onClick={() => controls.current?.zoom(1.5)}
        >
          +
        </button>
        <button
          aria-label="Zoom route out"
          onClick={() => controls.current?.zoom(1 / 1.5)}
        >
          −
        </button>
      </div>
      <GraphCanvas
        scene={scene}
        catalog={bundle.index.byId}
        recipes={bundle.recipes}
        inspect={inspect}
        selected={selected}
        onSelect={select}
        onEdge={edge}
        viewport={camera}
        onViewport={setCamera}
        controls={controls}
        recipeStates={states.current}
      />
      <label>
        Inspect step
        <select
          aria-label="Inspect route step"
          value={selected}
          onChange={(e) => {
            select(e.target.value)
            controls.current?.reveal(e.target.value)
          }}
        >
          <option value="">Choose a step…</option>
          {[...scene.nodes.values()].map((n: any) => (
            <option key={n.id} value={n.id}>
              {n.label}
            </option>
          ))}
        </select>
      </label>
      <p className="muted">
        {scene.hiddenChoices} other choices in input-group details
        {scene.hiddenSteps
          ? ` · ${scene.hiddenSteps} earlier steps omitted`
          : ''}
        {scene.missingRoutes
          ? ` · ${scene.missingRoutes} missing route records`
          : ''}
      </p>
      <div className="route-preview-selection">
        {n && <h4>{n.route?.id ?? n.label}</h4>}
        {recipe ? (
          <RecipeCard
            recipe={recipe}
            catalog={bundle.index.byId}
            inspect={inspect}
          />
        ) : n?.type === 'group' ? (
          <>
            <p>Choose ONE alternative. ALL input groups are required.</p>
            {n.alternatives.map((id: string) => (
              <button className="relation" key={id} onClick={() => inspect(id)}>
                {bundle.index.byId.get(id)?.name ?? id}
              </button>
            ))}
          </>
        ) : n?.type === 'item' ? (
          <button onClick={() => inspect(n.itemId || n.id)}>
            Item details
          </button>
        ) : null}
        {n?.route && (
          <details>
            <summary>Route conditions and source</summary>
            <pre>{JSON.stringify(n.route, null, 2)}</pre>
          </details>
        )}
      </div>
    </>
  )
}
