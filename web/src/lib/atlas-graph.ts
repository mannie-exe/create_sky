// One boundary between the retained Atlas page controller and the React island.
type API = {
  load: (refresh?: boolean) => Promise<void>
  openItem: (id: string, path?: boolean) => void
}
let resolve: (api: API) => void
const ready = new Promise<API>((r) => {
  resolve = r
})
let inspector: (id: string) => void = () => {}
export function registerGraph(api: API) {
  resolve(api)
}
export function inspectGraphItem(id: string) {
  inspector(id)
}
export function createGraph(inspect: (id: string) => void) {
  inspector = inspect
  return {
    load: () => ready.then((api) => api.load()),
    openItem: (id: string, path = false) => {
      void ready.then((api) => api.openItem(id, path))
    },
  }
}
