import { createRoot } from 'react-dom/client'
import RoutePreview from '../components/graph/RoutePreview'
export function routePreview(
  host: HTMLElement,
  items: any[],
  detail: any,
  inspect: (id: string) => void,
) {
  const root = createRoot(host)
  root.render(<RoutePreview items={items} detail={detail} inspect={inspect} />)
  return {
    destroy() {
      root.unmount()
    },
  }
}
