import { createRoot } from 'react-dom/client'
import AcquisitionMethods from '../components/map/AcquisitionMethods'
import { requestJSON } from './http'
import { routeData, routeIndex } from './route-data'
export async function mountAcquisition(
  host: HTMLElement,
  items: any[],
  detail: any,
  itemId: string,
  inspect: (id: string) => void,
  openProgression: () => void,
) {
  const [{ routes, recipes }, authored] = await Promise.all([
    routeData(),
    requestJSON('/generated/authored.json'),
  ])
  const roots = authored
    ? [
        ...authored.progression.roots,
        ...authored.acquisition.records.flatMap((r: any) => r.roots ?? []),
      ]
    : []
  if (!host.isConnected) return { destroy() {} }
  const root = createRoot(host)
  root.render(
    <AcquisitionMethods
      policy={
        (document.getElementById('progression-policy') as HTMLSelectElement)
          ?.value ?? 'planned'
      }
      detail={detail}
      roots={roots}
      itemId={itemId}
      index={routeIndex(items, routes)}
      recipes={new Map(recipes.map((r) => [r.id, r]))}
      inspect={inspect}
      openProgression={openProgression}
    />,
  )
  return {
    destroy() {
      root.unmount()
    },
  }
}
